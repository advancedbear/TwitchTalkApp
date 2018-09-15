var gui = require('nw.gui');

var repList = {};
var repListEn = {};
var repListEmote = {};

nw.Window.get().on('loaded', function(){
    if(location.pathname == '/view/replacement.html'){
        repList = JSON.parse(localStorage.replaceList);
        console.log(repList);
        for (key in repList) {
            $("#list_jp").append(createRow(key, repList[key],'jp'));
        }
        repListEn = JSON.parse(localStorage.replaceListEn);
        for (key in repListEn) {
            $("#list_en").append(createRow(key, repListEn[key], 'en'));
        }
        repListEmote = JSON.parse(localStorage.replaceListEmote);
        $.ajax({
            url: 'https://twitchemotes.com/api_cache/v3/global.json',
            type:'GET',
            dataType:'json',
            timeout:2000
        }).done(function(data){
            for(var name in data) {
                let id = data[name]['id'];
                let code = data[name]['code'];
                $("#list_emote").append(createRow2(id, code, repListEmote[code]));
            }
        });
        $('.modal').modal();
        $('.tabs').tabs();
    } else if (location.pathname == '/view/JPsettings.html'){
        speechSynthesis.getVoices();
        var bouyomi_s = JSON.parse(localStorage.bouyomiServer);
        $("#bouyomi_ip").val(bouyomi_s.host);
        $("#bouyomi_port").val(bouyomi_s.port);

        if(localStorage.voiceJPType != 'bouyomi'){
            $("#radio_bouyomi").prop('checked', false);
            $("#radio_sapi5").prop('checked', true);
            $('#bouyomi_ip').prop('disabled',true);
            $('#bouyomi_port').prop('disabled',true);
            $('#voiceType').prop('disabled',false);
        } else {
            $("#radio_bouyomi").prop('checked', true);
            $("#radio_sapi5").prop('checked', false);
            $('#bouyomi_ip').prop('disabled',false);
            $('#bouyomi_port').prop('disabled',false);
            $('#voiceType').prop('disabled',true);
        }
        $('input[name="voice_type"]').on('change', function(){
            console.log($(this).val());
            switch($(this).val()) {
                case 'bouyomi':
                    localStorage.voiceJPType = 'bouyomi';
                    $('#bouyomi_ip').prop('disabled',false);
                    $('#bouyomi_port').prop('disabled',false);
                    $('#voiceType').prop('disabled',true);
                    break;
                case 'sapi5':
                    localStorage.voiceJPType = 'Microsoft Haruka Desktop - Japanese';
                    $('#bouyomi_ip').prop('disabled',true);
                    $('#bouyomi_port').prop('disabled',true);
                    $('#voiceType').prop('disabled',false);
                    break;
            }
        })
        chooseJPVoice()
        $('#bouyomi_submit').on('click', function(){
            bouyomi_s.host = $("#bouyomi_ip").val();
            bouyomi_s.port = $("#bouyomi_port").val();
            localStorage.bouyomiServer = JSON.stringify(bouyomi_s);
            alert("Settings saved.")
        })

    } else if (location.pathname == '/view/ENsettings.html'){
        speechSynthesis.getVoices();
        if(localStorage.volume!=null) $("#volume").val(localStorage.volume);
        if(localStorage.speed!=null) $("#speed").val(localStorage.speed);
        if(localStorage.pitch!=null) $("#pitch").val(localStorage.pitch);
    
        chooseVoice()

        $("#volume_val").text(parseFloat($("#volume").val()).toFixed(1));
        $("#speed_val").text(parseFloat($("#speed").val()).toFixed(1));
        $("#pitch_val").text(parseFloat($("#pitch").val()).toFixed(1));

        $("#voiceType").on('change', function(){
            localStorage.voiceType = $(this).val();
        })
        $('#volume').on('input', function(){
            $("#volume_val").text(parseFloat($(this).val()).toFixed(1));
            localStorage.volume = parseFloat($(this).val());
        })
        $('#speed').on('input', function(){
            $("#speed_val").text(parseFloat($(this).val()).toFixed(1));
            localStorage.speed = parseFloat($(this).val());
        })
        $('#pitch').on('input', function(){
            $("#pitch_val").text(parseFloat($(this).val()).toFixed(1));
            localStorage.pitch = parseFloat($(this).val());
        })
    } else if (location.pathname == '/view/blocklist.html'){
        let blockedUser = JSON.parse(localStorage.blockUser);
        for (key in blockedUser){
            let row = `<tr name="${key}"><td class="center-align">
            <div class="switch">
                <label class="black-text">
                UnRead
                <input type="checkbox" id="${key}" ${blockedUser[key] ? 'checked' : null}>
                <span class="lever"></span>
                Read 　
                </label>
            </div><td>${key}</td></td></tr>`
            $('#blocked_list').append(row);
        }
        $('input[type="checkbox"]').on('change', function(){
            blockedUser[$(this).attr('id')] =  $(this).prop('checked');
            localStorage.blockUser = JSON.stringify(blockedUser);
        });
    }
})

function createRow(key, val, lang){
    key = escapeHTML(key);
    val = escapeHTML(val);
    let row = `<tr id="${key}">
        <td>${key}</td><td>${val}</td><td>
            <a lang="${lang}" onclick="deleteRow(this);return false" class="btn-floating btn-large waves-effect waves-light btn-small red">
                <i class="material-icons">close</i>
            </a>
        </td></tr>`;
    return row;
}

function createRow2(id, code, pron){
    let img = `<img src=\"https://static-cdn.jtvnw.net/emoticons/v1/${id}/1.0\">`
    let row = `<tr id="${id}">
        <td style=\"text-align: center\">${img}</td><td>${code}</td>
            <td><input type=\"text\" class=\"pronInput\" id=\"pron${id}\" value=\"${pron}\"></td>
            <td><a onclick=\"setEmoteReplace(\'${id}\')" class="btn-floating btn-large waves-effect waves-light btn-small teal">
                <i class="material-icons">check</i>
            </a></div></td>
        </tr>`;
    return row;
}

function setEmoteReplace(id){
    let origListEmote = JSON.parse(localStorage.origListEmote);
    let code = origListEmote[id];
    repListEmote[code] = $('#pron'+id).val();
    localStorage.replaceListEmote = JSON.stringify(repListEmote);
}

function deleteRow(obj){
    let delKey = escapeJs(unEscapeHTML($(obj).parent().parent().attr("id")));
    console.log(delKey);
    if($(obj).attr("lang") == 'jp'){
    delete repList[delKey];
    localStorage.replaceList = JSON.stringify(repList);
    } else {
    delete repListEn[delKey];
    localStorage.replaceListEn = JSON.stringify(repListEn);
    }
    $(obj).parent().parent().remove();
}

function addWord(lang){
    if(lang==0){
        let word1 = $("#word1").val();
        let word2 = $("#word2").val();
        if(word1=="" || word2=="") {
            alert("Please enter words.");
            return false;
        }
        $("#word1").val("");
        $("#word2").val("");
        $("#list_jp").append(createRow(word1, word2, 'jp'));
        repList[escapeJs(word1)] = escapeJs(word2);
        localStorage.replaceList = JSON.stringify(repList);
    } else {
        let word3 = $("#word3").val();
        let word4 = $("#word4").val();
        if(word3=="" || word4=="") {
            alert("Please enter words.");
            return false;
        }
        $("#word3").val("");
        $("#word4").val("");
        $("#list_en").append(createRow(word3, word4, 'en'));
        repListEn[escapeJs(word3)] = escapeJs(word4);
        localStorage.replaceListEn = JSON.stringify(repListEn);
    }
}

function chooseVoice(){
    let current = localStorage.voiceType;
    $('#voiceType').empty();
    let voices = speechSynthesis.getVoices()
    for(let voice of voices){
        if(current == voice.name){
            $('#voiceType').append('<option value="'+voice.name+'" selected>'+voice.name+'</option>');
        } else {
            $('#voiceType').append('<option value="'+voice.name+'">'+voice.name+'</option>');
        }
    }
    location.href='#voiceList'
}
function chooseJPVoice(){
    let current = localStorage.voiceJPType;
    $('#voiceType').empty();
    let voices = speechSynthesis.getVoices()
    for(let voice of voices){
        if(current == voice.name){
            $('#voiceType').append('<option value="'+voice.name+'" selected>'+voice.name+'</option>');
        } else {
            $('#voiceType').append('<option value="'+voice.name+'">'+voice.name+'</option>');
        }
    }
    location.href='#voiceList'
    
    $('select').formSelect();
}
function confirmVoice(){
    let val = $('#voiceType').val();
    localStorage.voiceType = val;
}
function confirmJPVoice(){
    let val = $('#voiceType').val();
    if($('input[name="voice_type"]:checked').val() == 'sapi5'){
        localStorage.voiceJPType = val;
    } else {
        localStorage.voiceJPType = 'bouyomi';
        alert("「棒読みちゃん」が選択されています。");
    }
}

function enVoiceTest(){
    if(localStorage.voiceType!='none'){
        let uttr = new SpeechSynthesisUtterance;
        uttr.text="This is the test message. Please check the voice quality.";
        //uttr.lang="en-US";
        let voices = speechSynthesis.getVoices()
        for(let voice of voices){
            if(localStorage.voiceType == voice.name){
                uttr.voice = voice;
            }
        }
        uttr.volume = localStorage.volume;
        uttr.rate = localStorage.speed;
        uttr.pitch = localStorage.pitch;
        speechSynthesis.speak(uttr);
    } else {
        alert('English voice is not used.')
    }
}

var escapeHTML = function (str) {
    return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
};

var unEscapeHTML = function (str) {
    return str
            .replace(/(&lt;)/g, '<')
            .replace(/(&gt;)/g, '>')
            .replace(/(&quot;)/g, '"')
            .replace(/(&#39;)/g, "'")
            .replace(/(&amp;)/g, '&');
};

var escapeJs = function (str) {
    return str
            .replace(/\\/g, '\\\\')
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"')
            .replace(/\//g, '\\/')
            .replace(/</g, '\\x3c')
            .replace(/>/g, '\\x3e')
            .replace(/(0x0D)/g, '\r')
            .replace(/(0x0A)/g, '\n');
};

var unEscapeJs = function (str) {
    return str
            .replace(/\\'/g, "'")
            .replace(/\\"/g, '"')
            .replace(/\\\//g, '/')
            .replace(/\\x3c/g, '<')
            .replace(/\\x3e/g, '>')
            .replace(/\\\\/g, '\\');
};