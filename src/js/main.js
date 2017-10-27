var gui = require('nw.gui');
var IRC = require('twitch-irc-lite');
var notifier = require('node-notifier');
var Bouyomi = require('./js/bouyomi.js');
var bouyomiServer = {};
var conn = false;
var client;
var mainWindow = nw.Window.get();

var uttr = new SpeechSynthesisUtterance();

mainWindow.on('loaded', function(){
    if(localStorage.password==null) document.getElementById("connButton").disabled = true;
    if(localStorage.name!=null) document.getElementById("name").value = localStorage.name;
    if(localStorage.channel!=null) document.getElementById("channel").value = localStorage.channel;
    if(localStorage.password!=null){
        document.getElementById("password").value = localStorage.password;
        $("#loginTwitch img").attr('src', 'img/Loggedin.png');
        $("#loginTwitch").attr('onclick', 'alert(\'You are already logged in\');');
    }

    if(localStorage.replaceList==null){
        let newList ={replacementwordテスト: "読み替え機能のテストです"};
        localStorage.replaceList = JSON.stringify(newList);
    }

    if(localStorage.bouyomiServer==null){
        bouyomiServer.host = '127.0.0.1';
        bouyomiServer.port = '50001';
        localStorage.bouyomiServer = JSON.stringify(bouyomiServer);
    } else {
        bouyomiServer = JSON.parse(localStorage.bouyomiServer);
    }

    if(localStorage.showNotify==null) localStorage.showNotify = false;
    if(localStorage.readName==null) localStorage.readName = false;
});

function Connect(){
    let pass = document.getElementById("password").value;
    let name = document.getElementById("name").value;
    let channel = document.getElementById("channel").value;
    let replacementList = JSON.parse(localStorage.replaceList);
    localStorage.name = name;
    localStorage.channel = channel;

    if(!conn){
        client = new IRC(pass, name);
        client.chatEvents.addListener('message', function(channel, from, message){
            if(JSON.parse(localStorage.showNotify)) showNotification(from, message);
            var uri = "(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)";
            message = message.replace(new RegExp(uri, 'g'), ';webURL;');
            for (rKey in replacementList){
                if(new RegExp(rKey, 'g').test(message)){
                    message = message.replace(new RegExp(rKey, 'g'), replacementList[rKey]);
                }
                if(new RegExp(rKey, 'g').test(from)){
                    from = from.replace(new RegExp(rKey, 'g'), replacementList[rKey]);
                }
                console.log(message+'. '+from)
            }
            let nMessage = message;
            if(JSON.parse(localStorage.readName)) nMessage = message+'. '+from;
            if(isEnglish(message)){
                uttr.text = nMessage;
                uttr.lang = 'en-US';
                speechSynthesis.speak(uttr);
            } else {
                Bouyomi.read(bouyomiServer,nMessage);
            }
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
            let tmiPage = tmi.window.document;
            if(tmiPage.getElementById("tmiPasswordField").value != ""){
                let Password = tmiPage.getElementById("tmiPasswordField").value;
                document.getElementById("password").value = Password;
                localStorage.password = Password;
                tmi.close();
                document.getElementById("connButton").disabled = false;
            }
        });
    });
};

function isEnglish(message){
    return (message.match("^(.*[｡-ﾟ０-９ａ-ｚＡ-Ｚぁ-んァ-ヶ亜-黑一-龠々ー].*)*$")) ? false : true ;
};

function showNotification(from, message){
    notifier.notify({
        title: from,
        message: message,
        sound: false,
        icon: './img/icon.png'
    });
}