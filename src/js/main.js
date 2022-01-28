const gui = require('nw.gui');
const IRC = require('tmi.js');
const Bouyomi = require('./js/bouyomi.js');
const logger = require('./js/logger.js');
const escRegex = require('regexp.escape');
var bouyomiServer = {};
var conn = false;
var client;
var tray;
var voices;
var speechList = [];
var mainWindow = nw.Window.get();
var uttr = new SpeechSynthesisUtterance();
var channel_chips, chip_data = [];

// メイン画面のDOM読み込み完了後の初期化動作
window.onload = function () {
    if (localStorage.password == null) document.getElementById("connButton").disabled = true;
    if (localStorage.channel != null) {
        try {
            if (typeof JSON.parse(localStorage.channel) == "object") {
                chip_data = JSON.parse(localStorage.channel)
            }
        } catch (e) {
            let ch_spl = localStorage.channel.split(/\s*,\s*/);
            for (ch of ch_spl) {
                chip_data.push({ tag: ch })
            }
        }
    } else {

    }
    M.Chips.init($(".chips-placeholder"), {
        placeholder: 'Channel name',
        secondaryPlaceholder: '+Channels',
        limit: 4,
        onChipAdd: () => { localStorage.channel = JSON.stringify(channel_chips.chipsData) },
        onChipDelete: () => { localStorage.channel = JSON.stringify(channel_chips.chipsData) },
        data: chip_data
    });
    if (localStorage.password != null) {
        // localStorageにOAuthPasswordが存在する場合、Loginボタンを非表示に
        $("#loginTwitch").hide();
        statusUpdate("Already Logged in with Twitch.", 1);
    } else {
        // localStorageにOAuthPasswordが存在しない場合、Connectボタンを非表示に
        $("#connSettings").hide();
        statusUpdate("Please connect with Twitch at first.", -1);
    }

    if (localStorage.replaceList == null) {
        // 初回起動時のデフォルト読み替えリストの設定
        let newList = { replacementwordテスト: "読み替え機能のテストです" };
        localStorage.replaceList = JSON.stringify(newList);
    }
    if (localStorage.replaceListEn == null) {
        // 初回起動時のデフォルト読み替えリストの設定
        let newListEn = { replacementword: "SampleWordOfReplacement" };
        localStorage.replaceListEn = JSON.stringify(newListEn);
    }
    if (localStorage.bouyomiServer == null) {
        // 棒読みちゃんの接続設定初期値
        bouyomiServer.host = '127.0.0.1';
        bouyomiServer.port = '50001';
        localStorage.bouyomiServer = JSON.stringify(bouyomiServer);
    } else {
        bouyomiServer = JSON.parse(localStorage.bouyomiServer);
    }

    if (localStorage.volume == null || localStorage.speed == null || localStorage.pitch == null) {
        // Web Speech APIの音声設定の初期値
        localStorage.volume = localStorage.speed = localStorage.pitch = 1.0;
    }
    // 各チェックボックスの初期化
    if (localStorage.useENvoice == null || localStorage.useENvoice === undefined) localStorage.useENvoice = true;
    if (localStorage.showNotify == null) localStorage.showNotify = false;
    if (localStorage.readName == null) localStorage.readName = false;
    if (localStorage.readCheer == null) localStorage.readCheer = false;
    if (localStorage.readEmotes == null) localStorage.readEmotes = false;
    if (localStorage.voiceType == null) localStorage.voiceType = 'none';
    if (localStorage.voiceJPType == null) localStorage.voiceJPType = 'bouyomi';
    if (localStorage.blockUser == null || JSON.parse(localStorage.blockUser)[0] != undefined) localStorage.blockUser = JSON.stringify({ 'nightbot': false, 'wizebot': false, 'streamelements': false });

    voices = speechSynthesis.getVoices();

    // エモートリストが空の場合、API経由で一覧を取得してリストに保存
    let newOrigListEmotes = {};
    let newRepListEmotes = {};
    let RepListEmotes = {};
    if (localStorage.replaceListEmote != null) JSON.parse(localStorage.replaceListEmote);
    $.ajax({
        url: 'https://api.twitch.tv/helix/chat/emotes/global',
        type: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.password.slice(6)}`,
            'Client-Id': 'wrhsp3sdvz973mf4kg94ftm3cgjrsz'
        },
        dataType: 'json',
        timeout: 2000
    }).done(function (response) {
        let data = response.data
        for (let emote of data) {
            let id = emote['id'];
            let code = emote['name'];
            newOrigListEmotes[id] = code;
            if (RepListEmotes[code] == null) RepListEmotes[code] = code;
        }
        // APIで取得した現在のエモート一覧に存在するエモートのみを、置換エモートリストへコピーする。
        // 削除されたエモート等が破棄されるように。
        for (let key in newOrigListEmotes) {
            if (RepListEmotes[newOrigListEmotes[key]] != null) {
                newRepListEmotes[newOrigListEmotes[key]] = RepListEmotes[newOrigListEmotes[key]];
            }
        }
        localStorage.origListEmote = JSON.stringify(newOrigListEmotes);
        localStorage.replaceListEmote = JSON.stringify(newRepListEmotes);
    });
    if (nw.App.argv[0] == "-log") {
        logger.init(true);
    }
    channel_chips = M.Chips.getInstance($('#channels_name'))
    $('#chips_input')
        .focusout(function () {
            channel_chips.addChip(
                { tag: $('#chips_input').val() }
            )
            $('#chips_input').val("")
        })
        .blur(function () {
            channel_chips.addChip(
                { tag: $('#chips_input').val() }
            )
            $('#chips_input').val("")
        })

    $(document).on('click', '#settingButton', function () {
        voices = speechSynthesis.getVoices();
        sessionStorage.voices = JSON.stringify(voices);
        let date = new Date();
        $('#sideMenu').toggleClass('opened');
    })
    $(document).on('click', '#helpButton', function () {
        showHelp('jp');
    })

};

mainWindow.on('minimize', function () {
    this.hide();
    tray = new gui.Tray({ icon: 'img/icon.png' });
    tray.on('click', function () {
        mainWindow.show();
        this.remove();
        tray = null;
    })
})

mainWindow.on('restore', function () {
    mainWindow.width = 320;
    mainWindow.height = 320;
})

function Connect() {
    logger.out("Connect button pressed.")
    let pass = localStorage.password;
    let name = localStorage.name;
    let channel = [];
    localStorage.channel = JSON.stringify(channel_chips.chipsData);
    let channels = channel_chips.chipsData
    for (let chn in channels) {
        channel[chn] = '#' + channels[chn].tag;
    }
    console.log(channel);

    voices = speechSynthesis.getVoices();

    bouyomiServer = JSON.parse(localStorage.bouyomiServer);
    let tmi_options = {
        connection: {
            reconnect: true
        },
        identity: {
            username: name,
            password: pass
        },
        channels: channel
    };

    if (!conn) {
        logger.out("Try to connect to " + channel + " channel as " + name + " account.");
        client = new IRC.client(tmi_options);
        client.on('chat', (ch, userstate, message, self)=>{sayFunc(ch, userstate, message, channel)});
        if(JSON.parse(localStorage.readCheer)) client.on('cheer', (ch, userstate, message)=>{sayFunc(ch, userstate, message, channel)});
        client.on("resub", (ch, username, months, message, userstate, methods) => {sayFunc(ch, userstate, message, channel)});
        client.connect();
        $("#connButton").html("Disconnect");
        $('#connButton').attr('class', 'col s10 offset-s1 btn waves-effect waves-light btn-large teal darken-2');
        $('#channels_name').prop('disabled', true);
        conn = true;
        logger.out("Connected to Channel.");
        statusUpdate("Connected to " + channel + "'s channel.", 1);
        console.log(conn)
    } else {
        $("#connButton").html("Connect");
        $('#connButton').attr('class', 'col s10 offset-s1 btn waves-effect waves-light btn-large orange darken-3');
        $('#channels_name').prop('disabled', false);
        conn = false;
        client.disconnect();
        logger.out("Disconnected from channel.");
        statusUpdate("Disconnected from " + channel + "'s channel.", -1);
        console.log(conn)
    }
};

function sayFunc(ch, userstate, message, channel) {
    let from = userstate["username"];
    let blockedUserList = JSON.parse(localStorage.blockUser);
    logger.out("message recieved-> from: " + from + " message: " + message);
    if (JSON.parse(localStorage.showNotify)) {
        showNotification(from, message);
        logger.out("Notification popped up.");
    }
    message = replaceURL(message, from);
    if (channel.length == 1) {
        statusUpdate(from + ": " + message, 0);
    } else {
        statusUpdate(from + ' [' + ch + ']' + ": " + message, 0);
    }
    if (!JSON.parse(localStorage.readEmotes)) {
        message = deleteEmote(message);
        logger.out("Emotes were deleted.");
    } else {
        message = replaceMessage(message, JSON.parse(localStorage.replaceListEmote));
        logger.out("Emotes were replaced. -> " + message);
    }
    let nMessage = message;
    if (JSON.parse(localStorage.readName)) nMessage = message + ', ' + from + '';
    logger.out("Readable nMessage was made. -> " + nMessage);
    if (isEnglish(message)) {
        nMessage = replaceMessage(nMessage, JSON.parse(localStorage.replaceListEn));
    } else {
        nMessage = replaceMessage(nMessage, JSON.parse(localStorage.replaceList));
    }
    logger.out("message replaced -> " + nMessage);
    if (blockedUserList[from] === undefined) {
        blockedUserList[from] = true;
        localStorage.blockUser = JSON.stringify(blockedUserList);
    }
    if (JSON.parse(localStorage.blockUser)[from] == true) {
        if (isEnglish(nMessage) && JSON.parse(localStorage.useENvoice)) { // no kana was detected in the message
            logger.out("Message is not Japanese. Try to determine its language.");
            if (isRussian(nMessage)) { // cyrillics were detected in the message
                logger.out("Message is Russian. Try to use Speech API.");
                for (let voice of voices) {
                    if(localStorage.voiceType == voice.name) {
                        uttr.voice = voice;
                    }
                }
                uttr.volume = localStorage.volume;
                uttr.rate = localStorage.speed;
                uttr.pitch = localStorage.pitch;
                uttr.lang = 'ru-RU';
                uttr.text = nMessage;
                speechSynthesis.speak(uttr);
                console.log(uttr);
            }
            else { // no cyrillics were detected in the message... assume the message is in English
                logger.out("Message is English. Try to use Speech API.");
                for (let voice of voices) {
                    if (localStorage.voiceType == voice.name) {
                        uttr.voice = voice;
                    }
                }
                uttr.volume = localStorage.volume;
                uttr.rate = localStorage.speed;
                uttr.pitch = localStorage.pitch;
                uttr.lang = 'en-US';
                uttr.text = nMessage;
                speechSynthesis.speak(uttr);
                console.log(uttr);
            }
        } else { // kana was detected in the message
            logger.out("Message is NOT English. Try to use Bouyomi-chan");
            if (localStorage.voiceJPType == 'bouyomi') {
                Bouyomi.read(bouyomiServer, nMessage);
            } else {
                for (let voice of voices) {
                    if (localStorage.voiceJPType == voice.name) {
                        uttr.voice = voice;
                    }
                }
                uttr.volume = localStorage.volume;
                uttr.rate = localStorage.speed;
                uttr.lang = 'ja-JP';
                uttr.pitch = 100;
                uttr.text = nMessage;
                speechSynthesis.speak(uttr);
                console.log(uttr);
            }
        }
        console.log(speechSynthesis.pending);
    }
};

function loginTwitch() {
    logger.out("Connect with Twitch button pressed.");
    gui.Window.open('https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=wrhsp3sdvz973mf4kg94ftm3cgjrsz&redirect_uri=https://twitchapps.com/tmi/&scope=chat:read+chat:edit+channel:moderate+whispers:read+whispers:edit+channel_editor', {
        width: 640,
        height: 480
    }, function (tmi) {
        tmi.on('loaded', function () {
            let tmiPage = tmi.window.document;
            if (tmiPage.getElementById("tmiPasswordField").value != "") {
                let Password = tmiPage.getElementById("tmiPasswordField").value;
                localStorage.password = Password;
                $("#loginTwitch").hide();
                $("#connSettings").show();
                tmi.close();
                document.getElementById("connButton").disabled = false;
                statusUpdate("Twitch oAuth completed.", 1);
            }
        });
    });
};

function isEnglish(message) {
    return (message.match("^(.*[｡-ﾟ０-９ａ-ｚＡ-Ｚぁ-んァ-ヶ亜-黑一-龠々ー].*)*$")) ? false : true;
};

function isRussian(message) {
    return (/[а-яА-ЯЁё]/.test(message));
};

function deleteEmote(message) {
    let emotes = Object.keys(JSON.parse(localStorage.replaceListEmote));
    for (emote of emotes) {
        message = message.replace(new RegExp(escRegex(emote), 'g'), '');
    }
    return message;
}

function replaceMessage(message, rList) {
    let nMessage = message;
    for (rKey in rList) {
        nMessage = nMessage.replace(new RegExp(escRegex(rKey), 'g'), rList[rKey]);
    }
    return nMessage;
}

function replaceURL(message, sender) {
    let clipurl = new RegExp("(https?)(:\/\/clips\.twitch\.tv\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)", 'g');
    let anyurl = new RegExp("(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)", 'g');
    let replaced = message.replace(clipurl, ' (Twitch Clip URL)').replace(anyurl, ' (webURL) ');
    return replaced;
}

function showNotification(from, message) {
    if ("Notification" in window) {
        let n = new Notification(from, {
            body: message,
            tag: from,
            icon: './img/icon.png',
            silent: true
        });
        setTimeout(n.close.bind(n), 5000);
    }
}

function statusUpdate(message, code) {
    M.Toast.dismissAll();
    let p;
    if (code == 1) {
        p = '<span class="small" style="color:rgb(46, 204, 113);">';
    } else if (code == 0) {
        p = '<span class="small" style="color: rgb(236, 240, 241)">';
    } else if (code == -1) {
        p = '<span class="small" style="color: rgb(231, 76, 60);">';
    }
    let m = p + message + '</p>';

    M.toast({ html: m })
}

$(document).on('dblclick', '.d_text0', function () {
    let block_user = $(this).text().split(':')[0];
    let blocklist = JSON.parse(localStorage.blockUser);
    if (blocklist.indexOf(block_user) == -1) {
        if (confirm(block_user + 'さんを読み上げ対象から除外しますか？')) {
            blocklist.push(block_user)
            localStorage.blockUser = JSON.stringify(blocklist)
            alert(block_user + 'さんを読み上げ対象から除外しました')
        };
    } else {
        if (confirm(block_user + 'さんを読み上げ対象に戻しますか？')) {
            blocklist.splice(blocklist.indexOf(block_user), 1);
            localStorage.blockUser = JSON.stringify(blocklist)
            alert(block_user + 'さんを読み上げ対象に戻しました')
        };
    }
})
