'use strict';

var net = require('net');

var client = new net.Socket();
exports.read = function(message){
    client.connect('50001', 'localhost', function(){
        console.log('client-> connected to server');
        var iCommand = new Buffer(2);
        iCommand.writeInt16LE(1, 0);  //コマンド（ 0:メッセージ読み上げ）
        console.log('iCommand', iCommand);
        client.write(iCommand);

        var iSpeed = new Buffer(2);
        iSpeed.writeInt16LE(-1, 0);   //速度   （-1:棒読みちゃん画面上の設定）
        console.log('iSpeed', iSpeed);
        client.write(iSpeed);

        var iTone = new Buffer(2);
        iTone.writeInt16LE(-1, 0);    //音程   （-1:棒読みちゃん画面上の設定）
        console.log('iTone', iTone);
        client.write(iTone);

        var iVolume = new Buffer(2);
        iVolume.writeInt16LE(-1, 0);  //音量   （-1:棒読みちゃん画面上の設定）
        console.log('iVolume', iVolume);
        client.write(iVolume);

        var iVoice = new Buffer(2);
        iVoice.writeInt16LE(1, 0);    //声質   （ 1:女性)
        console.log('iVoice', iVoice);
        client.write(iVoice);

        var bCode = new Buffer(1);
        bCode.writeInt8(0, 0);        //文字列のbyte配列の文字コード(0:UTF-8, 1:Unicode, 2:Shift-JIS)
        console.log('bCode', bCode);
        client.write(bCode);

        var bMessage = new Buffer(message, 'utf8'); //文字列のbyte配列
        var iLength = new Buffer(4);
        iLength.writeInt32LE(bMessage.length, 0); //文字列のbyte配列の長さ
        console.log('iLength', iLength);
        client.write(iLength);
        client.write(bMessage);
        console.log('bMessage', bMessage);

        client.end();
    });
}

client.on('close', function(){
    console.log('client-> connection is closed');
});