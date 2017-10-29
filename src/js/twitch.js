var ws = null;

exports.connect = function(pass, nick, channel) {
    if(ws == null){
        ws = new WebSocket('wss://irc-ws.chat.twitch.tv:443');
    }

    ws.onopen = function() {
            this.send("PASS "+pass);
            this.send("NICK "+nick);
            this.send("JOIN #"+channel);
        }
    }

    ws.onmessage = function() {
        logger.out(event.data);
        if(event.data.startsWith("PING")) {
            this.send("PONG :tmi.twitch.tv");
        }
        if(new RegExp(".*(PRIVMSG).*").test(event.data)){
            message = event.data.split(" PRIVMSG ")[1];
            document.getElementById("text").innerText += message;
            uttr.text = message;
            uttr.lang = 'ja-JP';
            speechSynthesis.speak(uttr);
        }
    }
}