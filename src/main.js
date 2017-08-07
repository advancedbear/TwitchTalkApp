const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
  
const path = require('path');
const url = require('url');

var ipc = require('ipc');

// メインウィンドウ
let mainWindow;
  
function createWindow () {
  // メインウィンドウを作成します
  mainWindow = new BrowserWindow({width: 800, height: 600});
  
  // メインウィンドウに表示するURLを指定します
  // （今回はmain.jsと同じディレクトリのindex.html）
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));
  
  // デベロッパーツールの起動
  mainWindow.webContents.openDevTools();
  
  // メインウィンドウが閉じられたときの処理
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}
  
//  初期化が完了した時の処理
app.on('ready', createWindow);
  
// 全てのウィンドウが閉じたときの処理
app.on('window-all-closed', function () {
  // macOSのとき以外はアプリケーションを終了させます
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
// アプリケーションがアクティブになった時の処理(Macだと、Dockがクリックされた時）
app.on('activate', function () {
  /// メインウィンドウが消えている場合は再度メインウィンドウを作成する
  if (mainWindow === null) {
    createWindow();
  }
});

var irc = require('slate-irc');
var net = require('net');

    var stream = net.connect({
      port: 6667,
      host: 'irc.chat.twitch.tv'
    });

  var client = irc(stream);
ipc.on('connection-do', function (event, arg) {
  console.log("arg : " + arg);

  var pass = 

  client.pass('pass');
  client.nick('tobi');
  client.user('tobi', 'Tobi Ferret');

  client.join('#express');
  client.names('#express', function(err, names){
    console.log(names);
  });


  event.sender.send('connection-result', 'asynchronous-message main process.');
});
