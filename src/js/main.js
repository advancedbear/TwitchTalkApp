var gui = require('nw.gui');
var IRC = require('tmi.js');
var path = require('path');
var Bouyomi = require('./js/bouyomi.js');
var logger = require('./js/logger.js');
var bouyomiServer = {};
var conn = false;
var client;
var tray;
var mainWindow = nw.Window.get();
var uttr = new SpeechSynthesisUtterance();
var follows;

// メイン画面のDOM読み込み完了後の初期化動作
window.onload = function(){
    if(localStorage.password==null) document.getElementById("connButton").disabled = true;
    if(localStorage.channel!=null) document.getElementById("channels_name").value = localStorage.channel;
    if(localStorage.password!=null){
        // localStorageにOAuthPasswordが存在する場合、Loginボタンを非表示に
        $("#loginTwitch").hide();
        statusUpdate("Already Logged in with Twitch.", 1);
    } else {
        // localStorageにOAuthPasswordが存在しない場合、Connectボタンを非表示に
        $("#connSettings").hide();
        statusUpdate("Please connect with Twitch at first.", -1);
    }

    if(localStorage.replaceList==null){
        // 初回起動時のデフォルト読み替えリストの設定
        let newList ={replacementwordテスト: "読み替え機能のテストです"};
        localStorage.replaceList = JSON.stringify(newList);
    }
    if(localStorage.replaceListEn==null){
        // 初回起動時のデフォルト読み替えリストの設定
        let newListEn ={replacementword: "SampleWordOfReplacement"};
        localStorage.replaceListEn = JSON.stringify(newListEn);
    }
    if(localStorage.bouyomiServer==null){
        // 棒読みちゃんの接続設定初期値
        bouyomiServer.host = '127.0.0.1';
        bouyomiServer.port = '50001';
        localStorage.bouyomiServer = JSON.stringify(bouyomiServer);
    } else {
        bouyomiServer = JSON.parse(localStorage.bouyomiServer);
    }

    if(localStorage.volume==null || localStorage.speed==null || localStorage.pitch==null){
        // Web Speech APIの音声設定の初期値
        localStorage.volume = localStorage.speed = localStorage.pitch = 1.0;
    }
    // 各チェックボックスの初期化
    if(localStorage.useENvoice==null||localStorage.useENvoice===undefined) localStorage.useENvoice = true;
    if(localStorage.showNotify==null) localStorage.showNotify = false;
    if(localStorage.readName==null) localStorage.readName = false;
    if(localStorage.readEmotes==null) localStorage.readEmotes = false;
    if(localStorage.voiceType==null) localStorage.voiceType = 'none';
    if(localStorage.voiceJPType==null) localStorage.voiceJPType = 'bouyomi';
    if(localStorage.blockUser==null || JSON.parse(localStorage.blockUser)[0]!=undefined) localStorage.blockUser = JSON.stringify({'Nightbot':false});

    speechSynthesis.getVoices();

    // エモートリストが空の場合、API経由で一覧を取得してリストに保存
    let newOrigListEmotes = {};
    let newRepListEmotes = {};
    let RepListEmotes = {};
    if(localStorage.replaceListEmote!=null) JSON.parse(localStorage.replaceListEmote);
    $.ajax({
        url: 'https://twitchemotes.com/api_cache/v3/global.json',
        type:'GET',
        dataType:'json',
        timeout:2000
    }).done(function(data){
        for(let name in data) {
            let id = data[name]['id'];
            let code = data[name]['code'];
            newOrigListEmotes[id] = code;
            if(RepListEmotes[code]==null) RepListEmotes[code] = code;
        }
        // APIで取得した現在のエモート一覧に存在するエモートのみを、置換エモートリストへコピーする。
        // 削除されたエモート等が破棄されるように。
        for(let key in newOrigListEmotes){
            if(RepListEmotes[newOrigListEmotes[key]]!=null){
                newRepListEmotes[newOrigListEmotes[key]] = RepListEmotes[newOrigListEmotes[key]];
            }
        }
        localStorage.origListEmote = JSON.stringify(newOrigListEmotes);
        localStorage.replaceListEmote = JSON.stringify(newRepListEmotes);
    });
    if(nw.App.argv[0]=="-log"){
        logger.init(true);
    }
    let script = document.createElement("script");
    script.src = "js/ui.js";
    document.head.appendChild(script);

    $(document).on('click','#settingButton', function(){
        voices = speechSynthesis.getVoices();
        sessionStorage.voices = JSON.stringify(voices);
        let date = new Date();
        $('#sideMenu').toggleClass('opened');
    })
    $(document).on('click','#helpButton', function(){
        showHelp('jp');
    })
};

mainWindow.on('minimize', function(){
    this.hide();
    tray = new gui.Tray({icon: 'img/icon.png'});
    tray.on('click', function(){
        mainWindow.show();
        this.remove();
        tray = null;
    })
})

mainWindow.on('restore', function(){
    mainWindow.width = 320;
    mainWindow.height = 320;
})

function Connect(){
    logger.out("Connect button pressed.")
    let pass = localStorage.password;
    let name = localStorage.name;
    let channel = localStorage.channel = document.getElementById("channels_name").value;
    let channels = channel.split(',');
    for(let chn in channels) {
        channels[chn] = '#'+channels[chn];
    }
    console.log(channels);

    var voices = speechSynthesis.getVoices();
    
    bouyomiServer = JSON.parse(localStorage.bouyomiServer);
    let tmi_options = {
        connection: {
            reconnect: true
        },
        identity: {
            username: name,
            password: pass
        },
        channels: channels
    };

    if(!conn){
        logger.out("Try to connect to "+channel+" channel as "+name+" account.");
        client = new IRC.client(tmi_options);
        client.api({
            url: 'https://api.twitch.tv/kraken/users/'+name+'/follows/channels',
            headers: {
                "client-ID": "wrhsp3sdvz973mf4kg94ftm3cgjrsz"
            }
        }, function(err, res, body){
            follows = body.follows;
            console.log(follows);
        })
        client.on('chat', function(ch, userstate, message, self){
            let from = userstate["username"];
            let blockedUserList = JSON.parse(localStorage.blockUser);
            logger.out("message recieved-> from: "+from+" message: "+message);
            if(JSON.parse(localStorage.showNotify)){
                showNotification(from, message);
                logger.out("Notification popped up.");
            }
            message = replaceURL(message, from);
            if(channels.length == 1 ) {
                statusUpdate(from+ ": "+message,0);
            } else {
                statusUpdate(from+' ['+ch+']' + ": "+message,0);
            }
            if(!JSON.parse(localStorage.readEmotes)){
                message = deleteEmote(message);
                logger.out("Emotes were deleted.");
            } else {
                message = replaceMessage(message, JSON.parse(localStorage.replaceListEmote));
                logger.out("Emotes were replaced. -> " +message);
            }
            let nMessage = message;
            if(JSON.parse(localStorage.readName)) nMessage = message+', '+from+'';
            logger.out("Readable nMessage was made. -> "+nMessage);
            if(isEnglish(message)){
                nMessage = replaceMessage(nMessage, JSON.parse(localStorage.replaceListEn));
            } else {
                nMessage = replaceMessage(nMessage, JSON.parse(localStorage.replaceList));
            }
            logger.out("message replaced -> "+nMessage);
            if(blockedUserList[from] === undefined)  {
                blockedUserList[from] = true;
                localStorage.blockUser = JSON.stringify(blockedUserList);
            }
            if(JSON.parse(localStorage.blockUser)[from] == true){
                if(isEnglish(nMessage) && JSON.parse(localStorage.useENvoice)){
                    logger.out("Message is English. Try to use Speech API.");
                    for(let voice of voices){
                        if(localStorage.voiceType == voice.name){
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
                } else {
                    logger.out("Message is Japanese. Try to use Bouyomi-chan");
                    if(localStorage.voiceJPType == 'bouyomi') {
                        Bouyomi.read(bouyomiServer,nMessage);
                    } else {
                        for(let voice of voices){
                            if(localStorage.voiceJPType == voice.name){
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
                M.Toast.dismissAll();
                M.toast({html: `<span class="small">${from}: ${message}</span>`})
            }
        });
        client.connect();
        $("#connButton").html("Disconnect");
        $('#connButton').attr('class', 'col s10 offset-s1 btn waves-effect waves-light btn-large teal darken-2');
        $('#channels_name').prop('disabled', true);
        conn = true;
        logger.out("Connected to Channel.");
        statusUpdate("Connected to "+channel+"'s channel.",1);
        console.log(conn)
    } else {
        $("#connButton").html("Connect");
        $('#connButton').attr('class', 'col s10 offset-s1 btn waves-effect waves-light btn-large orange darken-3');
        $('#channels_name').prop('disabled', false);
        conn = false;
        client.disconnect();
        logger.out("Disconnected from channel.");
        statusUpdate("Disconnected from "+channel+"'s channel.",-1);
        console.log(conn)
    }
};

function loginTwitch() {
    logger.out("Connect with Twitch button pressed.");
    gui.Window.open ('http://www.twitchapps.com/tmi/', {
        width: 640,
        height: 480
      }, function(tmi){
        tmi.on ('loaded', function(){
            let tmiPage = tmi.window.document;
            if(tmiPage.getElementById("tmiPasswordField").value != ""){
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

function isEnglish(message){
    return (message.match("^(.*[｡-ﾟ０-９ａ-ｚＡ-Ｚぁ-んァ-ヶ亜-黑一-龠々ー].*)*$")) ? false : true ;
};

function deleteEmote(message) {
    let emotes = Object.keys(JSON.parse(localStorage.replaceListEmote));
    for(emote of emotes){
        message = message.replace(new RegExp(emote, 'g'), '');
    }
    return message;
}

function replaceMessage(message, rList) {
    let nMessage = message;
    for(rKey in rList){
        nMessage = nMessage.replace(new RegExp(rKey, 'g'), rList[rKey]);
    }
    return nMessage;
}

function replaceURL(message, sender){
    let clipurl = new RegExp("(https?)(:\/\/clips\.twitch\.tv\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)", 'g');
    let anyurl = new RegExp("(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)", 'g');
    let replaced = message.replace(clipurl, ' (Twitch Clip URL)').replace(anyurl, ' (webURL) ');
    return replaced;
}

function showNotification(from, message){
    if("Notification" in window){
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
    let p;
    if(code==1){
        p = '<option style="color:rgb(46, 204, 113);">';
    } else if(code==0){
        p = '<option style="color: rgb(236, 240, 241)" class="d_text0">';
    } else if(code==-1){
        p = '<option style="color: rgb(231, 76, 60);">';
    }
    let m = p+message+'</p>';
    $('#description').append(m+'</option>');
    $('#description').animate({scrollTop: 999999}, 'fast');
}

$(document).on('dblclick', '.d_text0', function(){
    let block_user= $(this).text().split(':')[0];
    let blocklist = JSON.parse(localStorage.blockUser);
    if(blocklist.indexOf(block_user) == -1){ 
        if(confirm(block_user + 'さんを読み上げ対象から除外しますか？')){
            blocklist.push(block_user)
            localStorage.blockUser = JSON.stringify(blocklist)
            alert(block_user + 'さんを読み上げ対象から除外しました')
        };
    } else {
        if(confirm(block_user + 'さんを読み上げ対象に戻しますか？')){
            blocklist.splice(blocklist.indexOf(block_user),1);
            localStorage.blockUser = JSON.stringify(blocklist)
            alert(block_user + 'さんを読み上げ対象に戻しました')
        };
    }
})
