const fs = require('fs');
const opener = require("opener");
const twitter = require('twitter');
const PinAuth = require('twitter-pin-auth');
const Discord = require('discord.js');
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

const help = fs.readFileSync("doc/help.txt");

if(process.argv[2] === "--auth"){
    let TwitterPinAuth = new PinAuth(config.twitter.consumer_key, config.twitter.consumer_secret, null, false);
    if(process.argv.length == 3){
    TwitterPinAuth.requestAuthUrl()
        .then((url) => {
            console.log('Twitter login page will open automatically.\nPlease login with your twitter account.');
            console.log(url);
            console.log('Copy PIN code and paste it after "--auth" command.\n(ex. "node index.js --auth <PINcode>")');
            config.twitter._data = TwitterPinAuth._data;
            fs.writeFileSync("config.json", JSON.stringify(config));
            let browser = opener(url,null, (error, stdout, stderr)=>{
                process.exit(0);
            });
        });
    } else if(process.argv.length == 4){
    let pin = Number(process.argv[3]);
    TwitterPinAuth._data = config.twitter._data;
    config.twitter._data = null;
    TwitterPinAuth.authorize(pin)
        .then((data) => {
            config.twitter.access_token_key = data.accessTokenKey;
            config.twitter.access_token_secret = data.accessTokenSecret;
            fs.writeFileSync("config.json", JSON.stringify(config, null, "\t"));
            console.log('*********Authorization finished!*********\nPlease add BotUser to your Discord server. Execute "--join <Client-ID>" command.');
            process.exit(0);
        })
        .catch((err) => {
            console.error('!!!!!!!!!!Authorization failed!!!!!!!!!!\nPlease check PIN number! You need to restart authorization from "--auth".');
            console.error(err);
            process.exit(-1);
        });
    }
} else if(process.argv[2] === "--join"){
    if(process.argv.length == 4){
        let clientId = process.argv[3];
        let botJoinUrl = "https://discordapp.com/oauth2/authorize?scope=bot&client_id="+clientId;
        console.log("BOT adding page will open automatically.\nPlease add BOT account to the server.")
        opener(botJoinUrl, null, (error, stdout, stderr) => {
            process.exit(0);
        })
    }
} else {
    if(config.twitter.access_token_key == ""){
        console.log('Please authorize twitter account at first.\nYou can authorize twitter account by "--auth" option.');
        process.exit(-1);
    }
}

var tClient = new twitter({
    consumer_key: config.twitter.consumer_key,
    consumer_secret: config.twitter.consumer_secret,
    access_token_key: config.twitter.access_token_key,
    access_token_secret: config.twitter.access_token_secret
});

var dClient = new Discord.Client();

var status = config.status;
if(status === "" || status === null) status = {"invite": false, "VCjoin": false, "presence": false};

var getNowTime = function(){
    let date = new Date();
    let y = date.getFullYear();
    let m = ('00'+date.getMonth()).slice(-2);
    let d = ('00'+date.getDay()).slice(-2);
    let hour = ('00'+date.getHours()).slice(-2);
    let min = ('00'+date.getMinutes()).slice(-2);
    let sec = ('00'+date.getSeconds()).slice(-2);
    return y+'-'+m+'-'+d+' '+hour+':'+min+':'+sec;
}

var postTweet = function(message){
    tClient.post('statuses/update', 
        { status: message },
        (error, tweet, response) => {
            if(error) return -1;
            else return 0;
        }
    )
}

var invite = function(sender){
    let title = sender.presence.game;
    let from = sender.user.username;
    let server = sender.guild.name;
    if(title!=null) return from+'さんが'+title+'への参加者を募集しています。 ('+getNowTime()+')';
    else return from+'さんが'+server+'サーバーへの参加者を募集しています。 ('+getNowTime()+')';
}

var getStatus = function(){
    let inviteStatus = "Invitation\t:"+status.invite;
    let VCjoinStatus = "VC join/left\t:"+status.VCjoin;
    let presenceStatus = "Presence\t:"+stauts.presence;
    return "__**TweetDiscordStatusBOT Status**__\n```"
            +inviteStatus+"\n"+VCjoinStatus+"\n"+presenceStatus+"```\n";
}

var setStatus = function(func, bool){
    if(!(func in status)) return -1;
    else {
        status[func] = bool;
        config.status = status;
        fs.writeFileSync("config.json", JSON.stringify(config, null, "\t"));
    }
}

dClient.login(config.discord.token);

dClient.on('ready', () => {
    console.log('BOT ready!');
    postTweet('DiscordStatusBOT on ready! ('+getNowTime()+')');
});

dClient.on('message', (message) => {
    let args = message.content.split(' ');
    console.log(args);
    if(message.content === '--help'){
        message.channel.send(help.toString());
    } else if (message.content === '--status'){
        message.channel.send(JSON.stringify(status, null, "   "));
    } else if (message.content === '--invite'){
        let tweetID = postTweet(invite(message.member));
    } else if (message.content.startsWith('--enable')){
        if( args.length == 2) setStatus(args[1], true);
    } else if (message.content.startsWith('--disable')){
        if( args.length == 2) setStatus(args[1], false);
    } else if (message.content === '--shutdown'){
        if(message.member.permissions.has("MANAGE_CHANNELS")) {
            let mes = 'DiscordStatusBOT has been shutdown by '+message.member.user.username+'.';
            postTweet(mes+' ('+getNowTime()+')');
            message.channel.send(mes).then((message) => {process.exit(0)});
        }
    }
});

dClient.on('presenceUpdate', (oldMember, newMember) => {
    if(status.presence) {
        let newGame = newMember.presence.game;
        let oldGame = oldMember.presence.game;
        let username = newMember.user.username;
        let tweetMessage;
        if(newGame==null) tweetMessage = username +' stopped playing "'+oldGame.name+'". ('+getNowTime()+')';
        else tweetMessage = username +' is now playing "'+newGame.name+'". ('+getNowTime()+')';
        let tweetID = postTweet(tweetMessage);
    }
});

dClient.on('voiceStateUpdate', (oldMember, newMember) => {
    if(status.VCjoin) {
        let username = newMember.user.username;
        let serverName = newMember.guild.name;
        if(oldMember.voiceChannel == null && newMember.voiceChannel != null){
            postTweet(username+'さんが'+serverName+'サーバーの'+newMember.voiceChannel.name+'チャンネルに参加しました。 ('+getNowTime()+')');
        } else if (oldMember.voiceChannel != null && newMember.voiceChannel == null){
            postTweet(username+'さんが'+serverName+'サーバーの'+oldMember.voiceChannel.name+'チャンネルから退出しました。 ('+getNowTime()+')');
        }
    }
});