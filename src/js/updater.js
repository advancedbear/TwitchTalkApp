
var pkg = require('./package.json'); // Insert your app's manifest here
var updater = require('node-webkit-updater');
var upd = new updater(pkg);

if(!gui.App.argv.length) {
    upd.checkNewVersion(function(error, newVersionExists, manifest) {
        if (!error && newVersionExists) {
            alert("Update is available. Please use the latest version.\n新しいバージョンが利用可能です。最新版をご利用下さい。")
            gui.Shell.openExternal('https://advancedbear.github.io/products.html#TwitchTalkApp');
            $('.loader').delay(1000).slideUp('slow');
        } else {
            console.log(error);
            $('.loader').delay(1000).slideUp('slow');
        }
    });
}