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
        })
        .catch((err) => {
            console.error('!!!!!!!!!!Authorization failed!!!!!!!!!!\nPlease check internet connection or time setting.');
            console.error(err);
            process.exit(-1);
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
                console.info('*********Authorization finished!*********\nPlease add BotUser to your Discord server. Execute "--join <Client-ID>" command.');
                process.exit(0);
            })
            .catch((err) => {
                console.error('!!!!!!!!!!Authorization failed!!!!!!!!!!\nPlease check PIN number and internet connection! You need to restart authorization from "--auth".');
                console.error(err);
                process.exit(-1);
            });
    }
} else if(process.argv[2] === "--join"){
    if(process.argv.length == 3){
        let clientId = config.discord.client_id;
        let botJoinUrl = "https://discordapp.com/oauth2/authorize?scope=bot&client_id="+clientId;
        console.info("BOT adding page will open automatically.\nPlease add BOT account to the server.")
        opener(botJoinUrl, null, (error, stdout, stderr) => {
            process.exit(0);
        })
    }
} else {
    if(config.twitter.access_token_key == ""){
        console.info('Please authorize twitter account at first.\nYou can authorize twitter account by "--auth" option.');
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

if(config.status == "" || config.status == null){
    config.status = {"invite": false, "VCjoin": false, "presence": false};
    fs.writeFileSync("config.json", JSON.stringify(config, null, "\t"));
}

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

var invite = function(sender, num){
    let title = sender.presence.game;
    let from = sender.user.username;
    let server = sender.guild.name;
    num = isNaN(num) ? 0 : num;
    let number = num>0 ? ' 【＠'+num+'人】' : '';
    if(title!=null) return from+'さんが'+title+'への参加者を募集しています。'+number+' ('+getNowTime()+')';
    else return from+'さんが'+server+'サーバーへの参加者を募集しています。'+number+' ('+getNowTime()+')';
}

var getStatus = function(){
    let inviteStatus = "Invitation\t:"+status.invite;
    let VCjoinStatus = "VC join/left\t:"+status.VCjoin;
    let presenceStatus = "Presence\t:"+stauts.presence;
    return "__**TweetDiscordStatusBOT Status**__\n```"
            +inviteStatus+"\n"+VCjoinStatus+"\n"+presenceStatus+"```\n";
}

var setStatus = function(func, bool){
    if(func === 'all') config.status.forEach(element => { config.status[element] = bool });
    else if(!(func in config.status)) return -1;
    else {
        config.status[func] = bool;
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
    } else if (message.content.startsWith('--invite') && config.status.invite){
        if(args.length == 2) {
            postTweet(invite(message.member, args[1]));
            message.channel.send(invite(message.member, args[1]));
        } else {
            postTweet(invite(message.member, 0));
            message.channel.send(invite(message.member, 0));
        }
    } else if (message.content.startsWith('--enable')){
        if(args.length == 2) setStatus(args[1], true);
    } else if (message.content.startsWith('--disable')){
        if(args.length == 2) setStatus(args[1], false);
    } else if (message.content === '--shutdown'){
        if(message.member.permissions.has("MANAGE_CHANNELS")) {
            let mes = 'DiscordStatusBOT has been shutdown by '+message.member.user.username+'.';
            postTweet(mes+' ('+getNowTime()+')');
            message.channel.send(mes).then((message) => {process.exit(0)});
        }
    }
});

dClient.on('presenceUpdate', (oldMember, newMember) => {
    if(config.status.presence) {
        if(newMember.presence.game != null || oldMember.presence.game != null){
            let newGame = newMember.presence.game;
            let oldGame = oldMember.presence.game;
            let username = newMember.user.username;
            let tweetMessage;
            if(newGame==null) tweetMessage = username +' stopped playing "'+oldGame.name+'". ('+getNowTime()+')';
            else tweetMessage = username +' is now playing "'+newGame.name+'". ('+getNowTime()+')';
            postTweet(tweetMessage);
        }else if(oldMember.presence.status === "offline" && newMember.presence.status === "online"){
            postTweet('○'+newMember.user.username + 'is now online. ('+getNowTime()+')');
        } else if (oldMember.presence.status === "online" && newMember.presence.status === "offline"){
            postTweet('×'+newMember.user.username + 'is now offline. ('+getNowTime()+')');
        }
    }
});

dClient.on('voiceStateUpdate', (oldMember, newMember) => {
    if(config.status.VCjoin) {
        let username = newMember.user.username;
        let serverName = newMember.guild.name;
        if(oldMember.voiceChannel == null && newMember.voiceChannel != null){
            postTweet(username+'さんが'+serverName+'サーバーの'+newMember.voiceChannel.name+'チャンネルに参加しました。 ('+getNowTime()+')');
        } else if (oldMember.voiceChannel != null && newMember.voiceChannel == null){
            postTweet(username+'さんが'+serverName+'サーバーの'+oldMember.voiceChannel.name+'チャンネルから退出しました。 ('+getNowTime()+')');
        }
    }
});

dClient.on('error', (error) => {
    console.error(error);
    process.exit(-1);
})