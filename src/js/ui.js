$(function(){
    $('#ReadName').on('change', function(){
        localStorage.readName = $(this).prop('checked');
    });
    $('#ReadEmotes').on('change', function(){
        localStorage.readEmotes = $(this).prop('checked');
    });
    $('#UseEnglish').on('change', function(){
        localStorage.useENvoice = $(this).prop('checked');
        if(!$('#UseEnglish').is(':checked')){
            $('#ENSettingBtn').css('color','rgba(0,0,0,0.3)')
            $('#ENSettingBtn').attr('onclick','return false')
        } else {
            $('#ENSettingBtn').css('color','')
            $('#ENSettingBtn').attr('onclick','ENSettings();return false')
        }
    });
    $('#UseNotify').on('change', function(){
        localStorage.showNotify = $(this).prop('checked');
    });
})

$(document).ready(function(){
    $('#ReadName').prop('checked', JSON.parse(localStorage.readName));
    $('#ReadEmotes').prop('checked', JSON.parse(localStorage.readEmotes));
    $('#UseEnglish').prop('checked', JSON.parse(localStorage.useENvoice));
    if(!$('#UseEnglish').is(':checked')){
        $('#ENSettingBtn').css('color','rgba(0,0,0,0.3)')
        $('#ENSettingBtn').attr('onclick','return false')
    } else {
        $('#ENSettingBtn').css('color','')
        $('#ENSettingBtn').attr('onclick','ENSettings();return false')
    }
    $('#UseNotify').prop('checked', JSON.parse(localStorage.showNotify));
});

function replaceSettings(){
    gui.Window.open ('view/replacement.html', {
        id: "replacement",
        width: 640,
        max_width: 640,
        min_width: 640,
        height: 480,
        max_height: 480,
        min_height: 480,
        resizable: false
      }, function(tmi){
    });
}

function BlockList(){
    gui.Window.open ('view/blocklist.html', {
        id: "blocklist",
        width: 640,
        max_width: 640,
        min_width: 640,
        height: 480,
        max_height: 480,
        min_height: 480,
        resizable: false
      }, function(tmi){
    });
}

function JPSettings(){
    gui.Window.open ('view/JPsettings.html', {
        id: "JPsettings",
        width: 320,
        max_width: 320,
        min_width: 320,
        height: 320,
        max_height: 320,
        min_height: 320,
        resizable: false
      }, function(tmi){
        let tmiPage = tmi.window.document;
        $(tmiPage).on('click', '#saveJP', function(){
            bouyomiServer.port = tmiPage.getElementById("bouyomi_port").value;
            bouyomiServer.host = tmiPage.getElementById("bouyomi_ip").value;
            if(tmiPage.getElementById("radio_sapi5").checked){
                localStorage.voiceJPType = tmiPage.getElementById("voiceType").value;
            }
            tmi.close();
            localStorage.bouyomiServer = JSON.stringify(bouyomiServer);
        })
    });
}

function ENSettings(){
    gui.Window.open ('view/ENsettings.html', {
        id: "ENsettings",
        width: 320,
        max_width: 320,
        min_width: 320,
        height: 320,
        max_height: 320,
        min_height: 320,
        resizable: false
      }, function(tmi){
        let tmiPage = tmi.window.document;
        $(tmiPage).on('click', '#saveBtn', function(){
            localStorage.voiceType = tmiPage.getElementById("voiceType").value;
            tmi.close();
        })
    });
}

function showHelp(lang){
    let url='view/help_'+lang+'.html';
    gui.Window.open (url, {
        id: "help",
        width: 640,
        max_width: 640,
        min_width: 640,
        height: 480,
        max_height: 480,
        min_height: 480,
        resizable: false
      }, function(tmi){
    });
}

function resetSettings(){
    if(window.confirm('Are you sure?\n設定が全て消去されます、よろしいですか？')){
        localStorage.clear();
        alert("All settings are cleared.\nすべての設定が消去されました。");
        chrome.runtime.reload();
    }
}