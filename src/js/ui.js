$(function(){
    $('#ReadName').on('change', function(){
        localStorage.readName = $(this).prop('checked');
    });
    $('#ReadEmotes').on('change', function(){
        localStorage.readEmotes = $(this).prop('checked');
    });
    $('#UseNotify').on('change', function(){
        localStorage.showNotify = $(this).prop('checked');
    });
    $('#OutLog').on('change', function(){
        localStorage.useLogger = $(this).prop('checked');
    });
})

$(document).ready(function(){    
    $('#ReadName').prop('checked', JSON.parse(localStorage.readName));
    $('#ReadEmotes').prop('checked', JSON.parse(localStorage.readEmotes));
    $('#UseNotify').prop('checked', JSON.parse(localStorage.showNotify));
    $('#OutLog').prop('checked', JSON.parse(localStorage.useLogger));
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

function JPSettings(){
    gui.Window.open ('view/JPsettings.html', {
        id: "JPsettings",
        width: 240,
        max_width: 240,
        min_width: 240,
        height: 160,
        max_height: 160,
        min_height: 160,
        resizable: false
      }, function(tmi){
        let tmiPage = tmi.window.document;
        $(tmiPage).on('click', '#bouyomi_submit', function(){
            bouyomiServer.port = tmiPage.getElementById("bouyomi_port").value;
            bouyomiServer.host = tmiPage.getElementById("bouyomi_ip").value;
            tmi.close();
            localStorage.bouyomiServer = JSON.stringify(bouyomiServer);
        })
    });
}

function ENSettings(){
    gui.Window.open ('view/ENsettings.html', {
        id: "ENsettings",
        width: 240,
        max_width: 240,
        min_width: 240,
        height: 300,
        max_height: 300,
        min_height: 300,
        resizable: false
      }, function(tmi){
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