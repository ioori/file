var config = require('./config/mibbit.json');
var Client = require('tennu').Client;
var tennu = Client(config);
var fs = require('fs');

Array.prototype.contains = function(element){
    return this.indexOf(element) > -1;
};

Array.prototype.remove = function(what){
    for(var i = this.length; i >= 0; i--){
        if (this[i] === what) {
            this.splice(i, 1);
        }
    } 
    return this;
};

String.prototype.beginsWith = function (string) {
    return(this.indexOf(string) === 0);
};

Array.prototype.append = function(array) {
    this.push.apply(this, array)
}

// ######################################
// ########## Other functs ########## {{{
// ######################################
tennu.on('privmsg', function (privmsg) {
    if(/dies/i.test(privmsg.message) &&
        privmsg.nick.search(/r3/i) !== -1) {
            tennu.say(privmsg.channel, "Stop dying r3!");
            tennu.act(privmsg.channel, "brings r3 back to life");
        }
});

tennu.on('privmsg', function (privmsg) {
    if(/facepalms/i.test(privmsg.message)) { 
        tennu.act(privmsg.channel, "palmfaces");
    }
});

tennu.on('!show', function(command) {
});

// ################################ }}}
// ########## Admin-only ########## {{{
// ####################################

tennu.on('privmsg', function (msg) { 
    channel = msg.channel;
    //tennu.say(channel, "Msg: " + msg.args[1]);
    if (RegExp(config.ownerID).test(msg.sender) ) {      
        if(msg.args[1] == "" || msg.args[1] == null) {
            tennu.say(msg.channel, "This command needs an argument");
        } else if(msg.args[1].substring(0,5) == '@join') {
            newMsg = msg.args[1].trim().split(' ');
            tennu.join(newMsg[1]);
        } else if(msg.args[1].substring(0,5) == '@part') {
            newMsg = msg.args[1].trim().split(' ');
            tennu.part(newMsg[1]);
        } else if(msg.args[1].substring(0,5) == '@nick') {
            newMsg = msg.args[1].substring(5).split(' ');
            tennu.raw("NICK " + newMsg[1]);
        } else if(msg.args[1].substring(0,5) == '@serv') {
            newMsg = msg.args[1].substring(5).trim();
            tennu.raw(newMsg);
        } else if(msg.args[1].substring(0,8) == '@addsafe') {
            newMsg = msg.args[1].substring(8).trim().split(" ");
            fs.readFile("./config/mibbit.json", 'utf8', function (err, data) {
                if (err) { console.log('Error: ' + err); return; } 

                data = JSON.parse(data);
                data.safeList.push(newMsg[0].toLowerCase());

                fs.writeFile("./config/mibbit.json", JSON.stringify(data, null, 4));
            });
        } else if(msg.args[1].substring(0,8) == '@remsafe') {
            newMsg = msg.args[1].substring(8).trim().split(" ");
            fs.readFile("./config/mibbit.json", 'utf8', function (err, data) {
                if (err) { console.log('Error: ' + err); return; }

                data = JSON.parse(data);
                data.safeList.remove(newMsg[0].toLowerCase());

                fs.writeFile("./config/mibbit.json", JSON.stringify(data, null, 4));
            });
        }
    }
});

// ################################ }}}
// ########### Greeting ########### {{{
// ####################################

tennu.on('privmsg', function (privmsg) {
    for(ix = 0; ix < greetings.length; ix++) {
        if((RegExp('\\b' + greetings[ix] + '\\b', 'i').test(privmsg.message)) 
            && (RegExp('\\b' + tennu.nick() + '\\b', 'i').test(privmsg.message))) { 
                tennu.say(privmsg.channel, (greetings[Math.floor(Math.random()*greetings.length)]) + " " + privmsg.nick);
            }
    }
});

var greetings = [
'Aloha',
    'Bonjour',
    'Buenos dias',
    'Ciao',
    'Hei',
    'Hi',
    'Hello',
    'Hey',
    'Hey there',
    'Hiya',
    'Hola',
    'Howdy',
    'Shalom'
    ]

    tennu.on('join', function (message) { // reads from the config each time in case it was changed
        fs.readFile("./config/mibbit.json", 'utf8', function (err, data) {
            if (err) { console.log('Error: ' + err); return; }

            data = JSON.parse(data);

            if(message.actor != tennu.nick() &&  !data.safeList.contains(message.actor.toLowerCase()) && message.channel == "#mytest") {
                tennu.raw("KICK " + message.channel + " " + message.actor);
            } else if(message.actor != tennu.nick()) {
                if(message.channel != "#havvy") {
                    tennu.say(message.channel, "Welcome " + message.actor + "!");
                }
            }
        });
    });

// ################################ }}}

tennu.connect();
