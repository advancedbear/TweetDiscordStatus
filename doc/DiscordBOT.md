# How to make Discord BOT user
1. [Discord My Apps](https://discordapp.com/developers/applications/me) にアクセスする
1. Discordのログイン画面が表示されるので**普段使用しているアカウント**でログインをしてください  
![ログイン画面](https://gist.github.com/advancedbear/1feda466fc8b00d2ae0b863ac7226bd3/raw/b58c6f2f98836edd6428b15ce8d42b1084b14732/discord1.png)
1. My Appsページが表示されるので、**New App**を選択して新しいBOTアプリを作成してください  
![My Appsページ](https://gist.github.com/advancedbear/1feda466fc8b00d2ae0b863ac7226bd3/raw/b58c6f2f98836edd6428b15ce8d42b1084b14732/discord2.png)
1. 必須項目は「**APP NAME**」欄だけですが、必要に応じて他の項目も入力してください  
![New Appページ](https://gist.github.com/advancedbear/1feda466fc8b00d2ae0b863ac7226bd3/raw/b58c6f2f98836edd6428b15ce8d42b1084b14732/discord3.png)  
1. 作成が終了すると情報ページへ遷移するので、「**Create a Bot User**」をクリックして、BOTユーザーを作成して下さい  
![CreateUser](https://gist.github.com/advancedbear/1feda466fc8b00d2ae0b863ac7226bd3/raw/47f52bbb267e46e7f8dfb54850edad3394d20997/discord6.png)  
1. 赤枠の「**ClientID**」と「**Token**」を用意してください。Tokenは「click to reveal」を押すと表示されます  
![情報ページ](https://gist.github.com/advancedbear/1feda466fc8b00d2ae0b863ac7226bd3/raw/47f52bbb267e46e7f8dfb54850edad3394d20997/discord4.png)
1. 先程のClientIDとTokenを、config.jsonにそれぞれ入力してください
```
{
 "twitter": {
    ~
  },
  "discord": {
    "client_id": "Input Client ID here!",
    "token": "Input Token here!"
  },
  "status": {
    ~
  }
}
```