# TweetDiscordStatus BOT
Discordサーバーを監視し、音声チャンネルへの参加/退出やメンバーのゲーム起動を通知するbotアカウントを動作させるソフトウェアです。  

## 機能
- ボイスチャットサーバーへの参加/退出時にユーザー名とチャンネル名をツイート
- ユーザーのオンライン/オフライン時にツイート
- ゲーム起動時にプレー中のゲームをツイート
- 参加者募集のメッセージをツイート
    - 人数制限がある場合は残り人数を入力可能

## 必要環境
- [Node.js](https://nodejs.org/ja/) （LTS版のみサポート）
- [git](https://git-scm.com/)（あると更新時とかに便利）
- Twitterアカウント
- Discordアカウント
- BOTを動作させるPC（Windows/Linux両対応）

## インストール
### Gitあり
```
$ git clone https://github.com/advancedbear/TweetDiscordStatus.git
$ cd TweetDiscordStatus
$ npm install
$ node index.js
```
### Gitなし
1. 右上の[**Clone or Download**]からZIPファイルをダウンロード
1. ダウンロードしたZIPファイルを解凍
1. TweetDiscordStatus-masterフォルダ内でシェル（コマンドプロンプト）を起動
1. `$ npm install`
1. `$ node index.js`

## セットアップ
1. [Discord My Apps](https://discordapp.com/developers/applications/me)でBOTアカウントを作成する。 => [doc/DiscordBOT.md](doc/DiscordBOT.md)
1. フォルダ内の *config.sample.json* を *config.json* にリネームする
1. *config.json* をテキストエディタで開く
1. 用意したBOTアカウントのClient IDとTokenを、discord節以下のclient_idとtokenに入力する
```
"discord": {
	"client_id": "0123456789abcdefgh",
	"token": "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZzabcdefg"
},
```

## コマンドオプション
### Twitter authorization
`$ node index.js --auth`
- Twitterアカウントとの連携を開始します
- ブラウザでTwitterにログインし、PIN番号を取得します

`$ node index.js --auth <PINnumber>`
- Twitterアカウントとの連携を行います
- 前節で取得したPIN番号を`--auth`オプションの後に入力します。
    - Example: `$ node index.js --auth 0123456`

### Discord authorization
`$ node index.js --join`
- Discordボットをサーバーに参加させます
- ブラウザでDiscordにログインし、サーバーを選びます
    - 権限の無いサーバーには追加できません

## 永続実行
バックグラウンドで実行し続ける場合はforeverかpm2を使うのがオススメです
### forever
```
$ npm install forever -g
$ forever start index.js
```
### pm2
```
$ npm install pm2 -g
$ pm2 start index.js
```

## Discord Command
Discord上のテキストチャット（チャンネル問わず）で特定のコマンドを入力することで各機能の利用や設定が可能です。
```
List of Commands
--help
　このヘルプを表示します。
--status
　通知機能のオン/オフ状態を表示します
--invite [number]
　参加者の募集メッセージをツイートします。
　ゲームをプレイ中の場合、ツイート文にゲーム名が含まれます。
　[number]部に数値を指定すると【@n名】の人数指定が追加されます。
--enable [invite|channel|game|all]
　参加者募集、ボイスチャンネル入退室、ゲーム開始、それぞれの
　通知機能をオンにします。
--disable [invite|channel|game|all]
　参加者募集、ボイスチャンネル入退室、ゲーム開始、それぞれの
　通知機能をオフにします。
--shutdown
　ボットを終了します。サーバー管理者のみ実行可能です。
```

## アップデート
### Gitあり
```
$ git pull
$ npm install
```
### Gitなし
1. インストール時と同じようにZIPをダウンロード
2. config.json以外のファイルを元のフォルダに上書き保存
    - config.jsonを上書きすると設定が消えます