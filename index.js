const fs = require('fs');
const twitter = require('twitter');
const Discord = require('discord.js');
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));

const help = fs.readFileSync("doc/help.txt");

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