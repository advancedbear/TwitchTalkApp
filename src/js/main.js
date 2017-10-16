var IRC = require('twitch-irc-lite');
var say = require('say');
var Bouyomi = require('./js/bouyomi.js');
var conn = false;

function Connect(){
    let pass = document.getElementById("password").value;
    let name = document.getElementById("name").value;
    let channel = document.getElementById("channel").value;

    var client = new IRC(pass, name);
    client.join(channel);
    client.chatEvents.addListener('message', function(channel, from, message){
        console.log(from+': '+message);
        say.speak(message);
        Bouyomi.read(message);
    });
    if(!conn){
        document.getElementById("connButton").value = "Disconnect";
        conn = true;
    } else {
        document.getElementById("connButton").value = "Connect";
        conn = false;
    }
};