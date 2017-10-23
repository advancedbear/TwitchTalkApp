var gui = require('nw.gui');
var IRC = require('twitch-irc-lite');
var say = require('say');
var Bouyomi = require('./js/bouyomi.js');
var bouyomiServer = {};
    bouyomiServer.host = '127.0.0.1';
    bouyomiServer.port = '50001';
var conn = false;
var client;
var mainWindow = nw.Window.get();

mainWindow.on('loaded', function(){
    console.log(localStorage.password);
    document.getElementById("password").value = localStorage.password;
    document.getElementById("name").value = localStorage.name;
    document.getElementById("channel").value = localStorage.channel;

    if(localStorage.password!=null){
        $("#loginTwitch img").attr('src', 'img/Loggedin.png');
        $("#loginTwitch").attr('onclick', 'alert(\'You are already logged in\');');
    }
});

function Connect(){
    let pass = document.getElementById("password").value;
    let name = document.getElementById("name").value;
    let channel = document.getElementById("channel").value;

    localStorage.name = name;
    localStorage.channel = channel;

    if(!conn){
        client = new IRC(pass, name);
        client.chatEvents.addListener('message', function(channel, from, message){
            console.log(from+': '+message);
            console.log(isEnglish(message));
            isEnglish(message) ? say.speak(message) : Bouyomi.read(bouyomiServer, message);
        });
        document.getElementById("connButton").innerText = "Disconnect";
        conn = true;
        client.join(channel);
    } else {
        document.getElementById("connButton").innerText = "Connect";
        conn = false;
        client.leave();
    }
};

function loginTwitch() {
    gui.Window.open ('http://www.twitchapps.com/tmi/', {
        width: 640,
        height: 480
      }, function(tmi){
        tmi.on ('loaded', function(){
            console.log("loaded!");
            var tmiPage = tmi.window.document;
            if(tmiPage.getElementById("tmiPasswordField").value != ""){
                let Password = tmiPage.getElementById("tmiPasswordField").value;
                document.getElementById("password").value = Password;
                localStorage.password = Password;
                console.log(Password);
                tmi.close();
            }
        });
    });
};

function isEnglish(message){
    return (message.match("^(.*[｡-ﾟ０-９ａ-ｚＡ-Ｚぁ-んァ-ヶ亜-黑一-龠々ー].*)*$")) ? true : false ;
}

function replaceURL(message){
    return message.replace('(http://|https://){1}[\\w\\.\\-/:\\#\\?\\=\\&\\;\\%\\~\\+]+');
}