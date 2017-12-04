
var pkg = require('./package.json'); // Insert your app's manifest here
var updater = require('node-webkit-updater');
var upd = new updater(pkg);

if(!gui.App.argv.length) {
    upd.checkNewVersion(function(error, newVersionExists, manifest) {
        if (!error && newVersionExists) {
            let mes = "Update is available. Please use the latest version.\n" 
                + "新しいバージョンが利用可能です。最新版をご利用下さい。\n\n"
                + "【更新内容】\n"
                + manifest.description;
            alert(mes)
            gui.Shell.openExternal(path.join(path.dirname(process.execPath),'autoupdater.exe'));
            setTimeout(function(){nw.Window.get().close()}, 1000);
        } else {
            $('.loader').delay(1000).slideUp('slow');
        }
    });
}