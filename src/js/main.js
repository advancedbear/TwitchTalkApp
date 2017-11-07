var gui = require('nw.gui');
var IRC = require('tmi.js');
var notifier = require('node-notifier');
var Bouyomi = require('./js/bouyomi.js');
var logger = require('./js/logger.js');
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
    if(localStorage.readEmotes==null) localStorage.readEmotes = false;
    if(localStorage.useLogger==null) localStorage.useLogger = false;

    logger.init(JSON.parse(localStorage.useLogger));
});

function Connect(){
    logger.out("Connect button pressed.")
    let pass = document.getElementById("password").value;
    let name = document.getElementById("name").value;
    let channel = document.getElementById("channel").value;
    let replacementList = JSON.parse(localStorage.replaceList);
    localStorage.name = name;
    localStorage.channel = channel;

    var tmi_options = {
        connection: {
            reconnect: true
        },
        identity: {
            username: name,
            password: pass
        },
        channels: ["#"+channel]
    };

    if(!conn){
        logger.out("Try to connect to "+channel+" channel as "+name+" account.");
        client = new IRC.client(tmi_options);
        //client.chatEvents.addListener('message', function(channel, from, message){
        client.on('chat', function(ch, userstate, message, self){
            let from = userstate["username"];
            logger.out("message recieved-> from: "+from+" message: "+message);
            if(JSON.parse(localStorage.showNotify)){
                showNotification(from, message);
                logger.out("Notification popped up.");
            }
            var uri = "(https?|ftp)(:\/\/[-_.!~*\'()a-zA-Z0-9;\/?:\@&=+\$,%#]+)";
            message = message.replace(new RegExp(uri, 'g'), ';webURL;');
            logger.out("URL replaced: "+message);
            if(!JSON.parse(localStorage.readEmotes)){
                message = replaceEmote(message);
                logger.out("Emotes were replaced.");
            }
            for (rKey in replacementList){
                if(new RegExp(rKey, 'g').test(message)){
                    message = message.replace(new RegExp(rKey, 'g'), replacementList[rKey]);
                }
                if(new RegExp(rKey, 'g').test(from)){
                    from = from.replace(new RegExp(rKey, 'g'), replacementList[rKey]);
                }
                logger.out("message replaced -> from: "+from+" message: "+message);
            }
            let nMessage = message;
            if(JSON.parse(localStorage.readName)) nMessage = message+'. '+from;
            logger.out("Readable nMessage was made. -> "+nMessage);
            if(isEnglish(message)){
                logger.out("Message is English. Try to use Speech API.");
                uttr.volume = localStorage.volume;
                uttr.rate = localStorage.speed;
                uttr.pitch = localStorage.pitch;
                uttr.text = nMessage;
                uttr.lang = 'en-US';
                speechSynthesis.speak(uttr);
            } else {
                logger.out("Message is Japanese. Try to use Bouyomi-chan");
                Bouyomi.read(bouyomiServer,nMessage);
            }
        });
        document.getElementById("connButton").innerText = "Disconnect";
        conn = true;
        client.connect();
        logger.out("Connected to Channel.");
    } else {
        document.getElementById("connButton").innerText = "Connect";
        conn = false;
        client.disconnect();
        logger.out("Disconnected from channel.");
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

function replaceEmote(message) {
    let emotes = ["4Head","AMPTropPunch","ANELE","ArgieB8","ArigatoNas","ArsonNoSexy","AsianGlow","BCWarrior","BJBlazkowicz","BabyRage","BatChest","BegWan","BibleThump","BigBrother","BigPhish","BlargNaut","BlessRNG","BloodTrail","BrainSlug","BrokeBack","BudStar","BuddhaBar","CarlSmile","ChefFrank","CoolCat","CoolStoryBob","CorgiDerp","CrreamAwk","CurseLit","DAESuppy","DBstyle","DansGame","DatSheffy","DendiFace","DogFace","DoritosChip","DxCat","EleGiggle","EntropyWins","FUNgineer","FailFish","FrankerZ","FreakinStinkin","FunRun","FutureMan","GOWSkull","GingerPower","GivePLZ","GrammarKing","HassaanChop","HassanChop","HeyGuys","HotPokket","HumbleLife","InuyoFace","ItsBoshyTime","JKanStyle","Jebaited","JonCarnage","KAPOW","Kappa","KappaClaus","KappaPride","KappaRoss","KappaWealth","Kappu","Keepo","KevinTurtle","Kippa","KonCha","Kreygasm","MVGame","Mau5","MikeHogu","MingLee","MorphinTime","MrDestructoid","NinjaGrumpy","NomNom","NotATK","NotLikeThis","OSblob","OSfrog","OSkomodo","OSsloth","OhMyDog","OneHand","OpieOP","OptimizePrime","PJSalt","PJSugar","PMSTwin","PRChase","PanicVis","PartyTime","PeoplesChamp","PermaSmug","PicoMause","PipeHype","PogChamp","Poooound","PraiseIt","PrimeMe","PunOko","PunchTrees","QuadDamage","RaccAttack","RalpherZ","RedCoat","ResidentSleeper","RitzMitz","RlyTho","RuleFive","SMOrc","SSSsss","SabaPing","SeemsGood","ShadyLulu","ShazBotstix","SmoocherZ","SoBayed","SoonerLater","Squid1","Squid2","Squid3","Squid4","StinkyCheese","StoneLightning","StrawBeary","SuperVinlin","SwiftRage","TBAngel","TBCrunchy","TBTacoBag","TBTacoProps","TF2John","TPcrunchyroll","TTours","TakeNRG","TearGlove","TehePelo","ThankEgg","TheIlluminati","TheRinger","TheTarFu","TheThing","ThunBeast","TinyFace","TooSpicy","TriHard","TwitchLit","TwitchRPG","TwitchUnity","UWot","UnSane","UncleNox","VaultBoy","VoHiYo","VoteNay","VoteYea","WTRuck","WholeWheat","WutFace","YouDontSay","YouWHY","bleedPurple","cmonBruh","copyThis","duDudu","imGlitch","mcaT","panicBasket","pastaThat","riPepperonis","twitchRaid"];
    for(emote of emotes){
        message = message.replace(new RegExp(emote, 'g'), '');
        console.log(message);
    }
    return message;
}

function showNotification(from, message){
    notifier.notify({
        title: from,
        message: message,
        sound: false,
        icon: './img/icon.png'
    });
}