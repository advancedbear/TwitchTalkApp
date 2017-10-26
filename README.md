# TwitchTalkApp
ゲーマー向けストリーミングサービス[Twitch.tv](https://www.twitch.tv/)に投稿されたコメントを、Text-To-Speechアプリケーションで再生可能にします。

## 対応するText-To-Speech
- 棒読みちゃん
    - 和文コメントは棒読みちゃんで読み上げされます
- Web Speech API
    - 英文コメントはWebSpeechAPIを介してOS標準音声で読み上げされます

## 主な機能
- コメント読み上げ機能
    - 和文・英文を判別し、適切な音声で読み上げを行います。
- 文字列置換機能
    - 棒読みちゃんの置換機能とは別に、文字列の読み替えが可能です。  
    英文の場合にも読み替えが可能になります。
- コメント通知機能
    - コメントが投稿された際に、OS標準の通知ポップアップを用いて通知が可能です。  
    フルスクリーン時以外は、通知でコメント文を見ることが出来ます。
- アップデート通知機能
    - 新バージョンが利用できる場合、起動時に通知を行います。


## 使い方
1. 以下のページより、最新版をダウンロードします。
    - [ダウンロード](https://advancedbear.github.io/products.html#TwitchTalkApp)
1. TwitchTalkApp.zipを任意の展開ソフトで展開します。
1. TwitchTalkApp.exeを起動します。
1. 起動画面上の「Help」から、詳細な使用方法を閲覧できます。

## 動作要件
- Google Chromeが動作するPC
    - Chromeのインストールは不要ですが、Chromeが動作しないPCでは動作を保証できません。

## ライセンス
本アプリケーションは**GPL3.0ライセンス**のもと配布しています。  

### 利用モジュール等
- [NW.js](https://github.com/nwjs/nw.js)
- [node-notifier](https://github.com/mikaelbr/node-notifier)
- [node-webkit-updater](https://github.com/edjafarov/node-webkit-updater)
- [twitch-irc-lite](https://github.com/idflores/twitch-irc-lite)
- [node_bouyomiConnect](https://github.com/thakyuu/node_bouyomiConnect)
