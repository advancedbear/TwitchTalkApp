
var pkg = require('../package.json'); // Insert your app's manifest here
var updater = require('node-webkit-updater');
var upd = new updater(pkg);
var copyPath, execPath;

// Args passed when new app is launched from temp dir during update
if(gui.App.argv.length) {
    // ------------- Step 5 -------------
    copyPath = gui.App.argv[0];
    execPath = gui.App.argv[1];

    // Replace old app, Run updated app from original location and close temp instance
    upd.install(copyPath, function(err) {
        if(!err) {
            alert('Update will start automatically.\nアップデートを実行中です。')
            // ------------- Step 6 -------------
            upd.run(execPath, null);
            gui.App.quit();
        }
    });
}
else { // if no arguments were passed to the app

    // ------------- Step 1 -------------
    upd.checkNewVersion(function(error, newVersionExists, manifest) {
        if (!error && newVersionExists) {
            alert("Update is available.\n新しいバージョンが利用可能です。")
            // ------------- Step 2 -------------
            upd.download(function(error, filename) {
                if (!error) {

                    // ------------- Step 3 -------------
                    upd.unpack(filename, function(error, newAppPath) {
                        if (!error) {
                            alert("Application will restart to update.\nアップデートのため、アプリを再起動します。")
                            // ------------- Step 4 -------------
                            upd.runInstaller(newAppPath, [upd.getAppPath(), upd.getAppExec()],{});
                            gui.App.quit();
                        }
                    }, manifest);
                } else {
                    alert("Download failed.\n更新ファイルのダウンロードに失敗しました。")
                }
            }, manifest);
        }
    });
}