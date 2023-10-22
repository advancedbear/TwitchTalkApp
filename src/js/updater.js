var axios = require('axios').default;
var path = require('path');
var fs = require('fs');
var pkg = require('./package.json');
var updater = require('node-webkit-updater');
var upd = new updater(pkg);

upd.checkNewVersion(function(error, newVersionExists, manifest) {
    let script = document.createElement("script");
    script.src = "js/ui.js";
    document.head.appendChild(script);
    $("#webFont").prop("rel", "stylesheet");
    $("#materialIcons").prop("rel", "stylesheet");
    if (!error && newVersionExists) {
        let mes = manifest.description;
        if(confirm(mes)){
            let url="https://blog.advbear.net/2023/10/twitch-talk-app-eol.html"
/*             let url="https://github.com/advancedbear/TwitchTalkApp/releases/latest/download/autoupdater.exe"
            execPath = path.join(path.dirname(process.execPath),"autoupdater.exe");
            $(".indeterminate").prop("class", "determinate");
            axios.get(url, { responseType: 'arraybuffer', timeout: 2000 })
            .then((res)=>{
                data = Buffer.from(res.data, 'binary');
                fs.writeFileSync(path.join(path.dirname(process.execPath),'autoupdater.exe'), data)
                $("#loading_text").text(`100%`);
                $(".determinate").css("width", `100%`);
                setTimeout(()=>{
                    gui.Shell.openExternal(path.join(path.dirname(process.execPath),'autoupdater.exe'));
                    setTimeout(function(){nw.Window.get().close()}, 1000);
                }, 2000);
            }).catch((err)=>{
                alert("ダウンロードに失敗しました。\nTwitchTalkAppを管理者として起動してください。")
                $('.progress').delay(300).fadeOut(200);
                $('#loading_text').delay(500).fadeOut(200);
                $('#loading_text').text("UPDATE SKIPPED!")
                $('.loader').delay(1000).slideUp('slow');
            }) */
            gui.Shell.openExternal(url);
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