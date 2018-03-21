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
            console.log('Copy PIN code and paste it after "--auth" command.\n(ex. "node index.js --auth 112233")');
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
            console.log('Authorization finished!');
            process.exit(0);
        })
        .catch((err) => {
            console.error('Authorization failed! Please check PIN number!\nYou need to restart authorization from "--auth".');
            console.error(err);
            process.exit(-1);
        });
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

var status = {"invite": false, "VCjoin": false, "presence": false};

var getNowTime = function(){
    let date = new Date();
    let y = date.getFullYear();
    let m = date.getMonth();
    let d = date.getDay();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();
    return y+'-'+m+'-'+d+' '+hour+':'+min+':'+sec;
}

var postTweet = function(message){
    tClient.post('statuses/update', 
        { status: message },
        (error, tweet, response) => {
            if(error) throw new Error(-1);
            return tweet.id
        }
    );
    return -1;
}

var invite = function(sender){
    let title = sender.presence.game;
    let from = sender.user.username;
    return from+'さんが'+title+'への参加者を募集しています。 ('+getNowTime()+')';
}

var getStatus = function(){
    let inviteStatus = "Invitation\t:"+status.invite;
    let VCjoinStatus = "VC join/left\t:"+status.VCjoin;
    let presenceStatus = "Presence\t:"+stauts.presence;
    return "__**TweetDiscordStatusBOT Status**__\n```"
            +inviteStatus+"\n"+VCjoinStatus+"\n"+presenceStatus+"```\n";
}

var setStatus = function(func, bool){
    if(!status.func) return -1;
    else {
        status.func = bool;
    }
}

dClient.login(config.discord.token);

dClient.on('ready', () => {
    console.log('BOT ready!');
    postTweet('DiscordStatusBOT on ready! ('+getNowTime()+')');
});

dClient.on('message', (message) => {
    let args = message.content.split(' ');
    if(message.content === '--help'){
        message.channel.send(help);
    } else if (message.content === '--status'){
        message.channel.send(status);
    } else if (message.content === '--invite'){
        postTweet(invite(message.member));
    } else if (message.content.startsWith('--enable')){
        if( args.length == 2) setStatus(args[1], true);
    } else if (message.content.startsWith('--disable')){
        if( args.length == 2) setStatus(args[1], false);
    } else if (message.content === '--shutdown'){
        if(message.member.permissions.has("MANAGE_CHANNELS")) {
            let mes = 'DiscordStatusBOT has been shutdown by '+message.member.user.username+'.';
            postTweet(mes);
            message.channel.send(mes).then((message) => {process.exit(0);});
        }
    }
});

dClient.on('presenceUpdate', (oldMember, newMember) => {
    if(status.presence) {
        let title = newMember.presence;
        let username = newMember.user.username;
        let tweetMessage = username +' is now playing "'+title+'". ('+getNowTime()+')';
        let tweetID = postTweet(tweetMessage);
        console.log(tweetID);
    }
});