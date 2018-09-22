var https = require('https');
var path = require('path');
var fs = require('fs');
var pkg = require('./package.json');
var updater = require('node-webkit-updater');
var upd = new updater(pkg);

upd.checkNewVersion(function(error, newVersionExists, manifest) {
    $("#webFont").prop("rel", "stylesheet");
    $("#materialIcons").prop("rel", "stylesheet");
    if (!error && newVersionExists) {
        let script = document.createElement("script");
        script.src = "js/ui.js";
        document.head.appendChild(script);
        let mes = `Update is available. Please use the latest version.\n
            新しいバージョンが利用可能です。OKを押すとアップデートが開始されます。\n\n
            【更新内容】\n
            ${manifest.description}`;
        if(confirm(mes)){
            let url="https://www.advbear.cf/TwitchTalkApp/autoupdater.exe"
            let execPath = path.join(path.dirname(process.execPath),"autoupdater.exe");
            let cws = fs.createWriteStream(execPath);
            https.get(url, (res)=>{
                res.pipe(cws);
                res.on('end', ()=>{
                    cws.end();
                    setTimeout(()=>{
                        gui.Shell.openExternal(path.join(path.dirname(process.execPath),'autoupdater.exe'));
                        setTimeout(function(){nw.Window.get().close()}, 1000);
                    }, 2000);
                })
            })
        } else {
            $('.progress').delay(300).fadeOut(200);
            $('#loading_text').delay(500).fadeOut(200);
            $('#loading_text').text("UPDATE SKIPPED!")
            $('.loader').delay(1000).slideUp('slow');
        }
    } else if(error){
        $('.progress').delay(300).fadeOut(200);
        $('#loading_text').delay(500).fadeOut(200);
        $('#loading_text').text("DONE!")
        $('.loader').delay(1000).slideUp('slow');;
        alert("バージョン確認に失敗しました。\nエラーコード: "+error);
    } else {
        $('.progress').delay(300).fadeOut(200);
        $('#loading_text').delay(500).fadeOut(200);
        $('#loading_text').text("DONE!")
        $('.loader').delay(1000).slideUp('slow');
    }
});