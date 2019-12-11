const Discord = require('discord.js');
const auth = require('./auth.json');
const fs = require('fs');
const fetchComments = require('youtube-comment-api');

const client = new Discord.Client();

const ascii_gnome = '⣿⠿⠋⠉⠄⠄⠄⠄⠄⠉⠙⢻⣿\n⣿⣿⣿⣿⣿⣿⢋⠄⠐⠄⠐⠄⠠⠈⠄⠂⠠⠄⠈⣿\n⣿⣿⣿⣿⣿⡟⠄⠄⠄⠁⢀⠈⠄⠐⠈⠄⠠⠄⠁⠈⠹\n⣿⣿⣿⣿⣿⣀⡀⡖⣖⢯⢮⢯⡫⡯⢯⡫⡧⣳⡣⣗⣼\n⣿⣿⣿⣿⣷⣕⢱⢻⢮⢯⢯⡣⣃⣉⢪⡪⣊⣀⢯⣺⣺\n⣿⣿⣿⣿⣿⣷⡝⣜⣗⢽⢜⢎⢧⡳⡕⡵⡱⣕⡕⡮⣾\n⣿⣿⣿⣿⣿⡿⠓⣕⢯⢮⡳⣝⣕⢗⡭⣎⢭⠮⣞⣽⡺\n⣿⣿⣿⡿⠋⠄⠄⠸⣝⣗⢯⣳⢕⣗⡲⣰⡢⡯⣳⣳⣫\n⣿⣿⠋⠄⠄⠄⠄⠄⠘⢮⣻⣺⢽⣺⣺⣳⡽⣽⣳⣳⠏⠛⠛⠛⢿\n⣿⠇⠄⢁⠄⠄⠄⠁⠄⠈⠳⢽⢽⣺⢞⡾⣽⣺⣞⠞⠄⠄⠈⢄⢎⡟⣏⢯⢝⢛⠿\n⡇⠄⡧⣣⢢⢔⢤⢢⢄⠂⠄⠄⠁⠉⠙⠙⠓⠉⠈⢀⠄⠄⠄⠑⢃⣗⢕⣕⢥⡣⣫⢽\n⣯⠄⢽⢸⡪⡪⡣⠲⢤⠄⠄⠂⠄⠄⠄⡀⠄⠠⠐⠄⣶⣤⣬⣴⣿⣿⣷⡹⣿⣿⣾⣿\n⣿⣶⣾⣵⢱⠕⡕⡱⠔⠄⠁⢀⠠⠄⠄⢀⠄⠄⢀⣾\n⣿⣿⣿⣿⡷⡗⠬⡘⠂⠄⠈⠄⠄⠄⠈⠄⠄⠄⢸\n⣿⣿⣿⣿⣿⣿⣇⠄⢀⠄⡀⢁⠄⠐⠈⢀⠠⠐⡀⣶\n⣿⣿⣿⣿⣿⣿⣇⠄⢀⠄⡀⢁⠄⠐⠈⢀⠠⠐⡀⣶\n⣿⣿⣿⣿⣿⣿⣧⢁⠂⠔⠠⠈⣾⠄⠂⠄⡁⢲\n⣿⣿⣿⣿⣿⣿⠿⠠⠈⠌⠨⢐⡉⠄⠁⡂⠔⠼\n⣿⣿⣿⣿⣿⣿⡆⠈⠈⠈⠄⠂⣆⠄⠄⠄⠄⣼\n⣿⣿⣿⣿⣿⣿⣿⠄⠁⠈⠄⣾⡿⠄⠄⠂⢸\n⣿⣿⣿⣿⣿⣿⡟⠄⠄⠁⠄⠻⠇⠄⠐⠄⠄⠈⠙⢻\n⣿⣿⣿⣿⣿⣿⡇⡀⠄⠂⠁⢀⠐⠄⣥⡀⠁⢀⠄⣿';


client.on('ready', function (evt) {
    log(`Client connected.\nLogged in as: ${getUserNameID(client.user)}`);
});


client.on('message', info => {
    if (info.author.id === client.user.id){
        return;
    }
    if (info.author.id === '187034695941357568' && info.content.startsWith('gnottem')) {
        let matches = info.content.match('[0-9]+');

        if (matches) {
            let id = matches[0];
            let channel = client.channels.find(x => x.id == id);

            printMessage(info);
            woo(channel);
        }


        return;
    }

    if (!info.guild) return;

    let idMatches = info.content.match('([A-Za-z0-9]|-|_){11}');
    if (idMatches) {
        analyseVideoComments(idMatches[0]).then(result => {
            if (result){
                info.channel.send('Warning!!! This video may contain gnomes!');

                printMessage(info);

                log(`${getUserNameID(info.author)} triggered a gnome warning.`);
            }else{
                log('This video does not contain any gnomes.');
            }
        });

        return;
    }

    let message = info.content;
    if (message.toLowerCase() === 'hello me ol chum') {
        if (info.member.voice.channel) {
            woo(info.member.voice.channel);
        } else {
            info.reply('you are not in a voice channel!');
        }

        printMessage(info);
    } else if (message.toLowerCase().includes('gnome')) {
        info.channel.send(ascii_gnome);
        printMessage(info);
    }
    else if (message.toLowerCase() === "gnot a gnelf") { //adds a command to trigger the tactical woo
        if (info.member.voice.channel) {
            tactiWoo(info.member.voice.channel);
        } else {
            info.reply('you are not in a voice channel!');
        }
    }
});


async function analyseVideoComments(id) {

    let commentPage = await fetchComments(id);

    while (commentPage) {
        for(let comment of commentPage.comments){
            let str = comment.text;
            let matches = str.match('([Gg]\s*[Nn]\s*[Oo]\s*[Mm]\s*[Ee])');
            
            if (matches && matches.length > 0) {
                return true;
            }
        }

        if (commentPage.nextPageToken) {
            commentPage = await fetchComments(id, commentPage.nextPageToken);
        } else {
            break;
        }
    }
    return false;
}


// Called when anything about a user's voice state changes (i.e. mute, unmute, join,leave,change channel, etc.)
client.on('voiceStateUpdate', (os, ns) => {
    if (!ns.channel) return;
    let member = ns.member;

    if (member.user.id === client.user.id) return;

    if (Math.random() > 0.04) return;

    if (os.channelID === ns.channelID) return;

    log(`${getUserNameID(member.user)} joined channel: ${getChannelNameID(ns.channel)})`);

    if (Math.random() > 0.10) { //any random woo has a 10% chance to become a tactiwoo
        woo(member.voice.channel);
    }
    else {
        tactiWoo(member.voice.channel);
    }

    
});


async function woo(channel) { // vs = voice state

    if (channel === undefined) {
        log('Channel undefined!');
        return;
    }

    channel.join()
        .then(connection => {
            console.log(`\nJoined voice channel: ${getChannelNameID(channel)})`);
            const dispatcher = connection.play(
                fs.createReadStream('gnome_quick.ogg'), {
                    highWaterMark: 1
                });

            dispatcher.on('start', () => {
                console.log('Started voice.');
                connection.player.streamingData.pausedTime = 0;
            });

            dispatcher.on('finish', () => {
                console.log('Finished voice.');
                dispatcher.destroy();
                connection.disconnect();
            });

            dispatcher.on('error', e => {
                console.log('An error occured.');
                console.log(e);
                dispatcher.destroy();
                connection.disconnect();
            });
        })
        .catch(console.log);
}

async function tactiWoo(channel) { //runs the woo command three times on a voice channel
    //burst-fire gnomes
    if (channel === undefined) {
        log('channgel undefined');
        return;
    }

    woo(channel);
    await sleep(100); //hooray for async functions
    woo(channel); //since woo is also async, sleeping tactiwoo shouldn't affect it
    await sleep(100);
    woo(channel);
    //achieve tactical superiority
}




function getUserNameID(user) {
    return `${user.username} (${user.id})`;
}

function getChannelNameID(channel) {
    return `${channel.name} (${channel.id})`;
}


function printMessage(message) {
    let user = getUserNameID(message.author);
    let server = message.guild ? `${message.guild.name} (${message.guild.id})` : 'none';
    let channel = server === 'none' ? message.channel.id : getChannelNameID(message.channel);
    log(`Message (${message.id}):\n\tUser: ${user}\n\tServer: ${server}\n\tChannel: ${channel}\n\tContent: ${message.content}`);
}


function log(message) {
    let d = new Date();
    console.log(`\nTimestamp: ${d.toUTCString()}\n${message}`);
}


client.login(auth.token);