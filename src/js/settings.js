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

    } else if (location.pathname == '/view/JPsettings.html'){
        var bouyomi_s = JSON.parse(localStorage.bouyomiServer);
        $("#bouyomi_ip").val(bouyomi_s.host);
        $("#bouyomi_port").val(bouyomi_s.port);

        $('#bouyomi_submit').on('click', function(){
            bouyomi_s.host = $("#bouyomi_ip").val();
            bouyomi_s.port = $("#bouyomi_port").val();
            localStorage.bouyomiServer = JSON.stringify(bouyomi_s);
            alert("Settings saved.")
        })

    } else if (location.pathname == '/view/ENsettings.html'){
        speechSynthesis.getVoices();
        if(localStorage.useENvoice!=null) //$("#useEnglish").prop('checked', JSON.parse(localStorage.useENvoice));
        if(localStorage.volume!=null) $("#volume").val(localStorage.volume);
        if(localStorage.speed!=null) $("#speed").val(localStorage.speed);
        if(localStorage.pitch!=null) $("#pitch").val(localStorage.pitch);
    
        $("#volume_val").text(parseFloat($("#volume").val()).toFixed(1));
        $("#speed_val").text(parseFloat($("#speed").val()).toFixed(1));
        $("#pitch_val").text(parseFloat($("#pitch").val()).toFixed(1));

        $('#voiceType').click(function(){
            localStorage.useENvoice = JSON.stringify($(this).prop('checked'));
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
    } else if (location.pathname == '/view/help.html'){

    }
})

function createRow(key, val, lang){
    key = escapeHTML(key);
    val = escapeHTML(val);
    let row = '<tr id="'+key+'"><td>'+key+'</td><td>'+val+'</td><td><div class="button_wrapper"><button lang="'+lang+'" onclick="deleteRow(this)" class="delButton">✕</button></div></td></tr>';
    return row;
}

function createRow2(id, code, pron){
    let img = '<img src=\"https://static-cdn.jtvnw.net/emoticons/v1/'+id+'/1.0\">'
    let row = '<tr id="'+id+'"><td style=\"text-align: center\">'+img+'</td><td>'+code+'</td><td><input type=\"text\" class=\"pronInput\" id=\"pron'+id+'\" value=\"'+pron+'\"></td><td><div class="button_wrapper"><button onclick=\"setEmoteReplace(\''+id+'\')" class="setButton">Apply</button></div></td></tr>';
    return row;
}

function setEmoteReplace(id){
    let origListEmote = JSON.parse(localStorage.origListEmote);
    let code = origListEmote[id];
    repListEmote[code] = $('#pron'+id).val();
    localStorage.replaceListEmote = JSON.stringify(repListEmote);
}

function deleteRow(obj){
    let delKey = escapeJs(unEscapeHTML($(obj).parent().parent().parent().attr("id")));
    console.log(delKey);
    if($(obj).attr("lang") == 'jp'){
    delete repList[delKey];
    localStorage.replaceList = JSON.stringify(repList);
    } else {
    delete repListEn[delKey];
    localStorage.replaceListEn = JSON.stringify(repListEn);
    }
    $(obj).parent().parent().parent().remove();
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
    if(current == 'none'){
        $('#voiceType').append('<option value="none" selected>Not Use</option>');
    } else {
        $('#voiceType').append('<option value="none" selected>Not Use</option>');
    }
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

function confirmVoice(){
    let val = $('#voiceType').val();
    localStorage.voiceType = val;
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