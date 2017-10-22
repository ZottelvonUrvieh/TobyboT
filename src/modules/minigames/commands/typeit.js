// utility function for returning a promise that resolves after a delay
function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t);
    });
}

Promise.delay = function (fn, t) {
    // fn is an optional argument
    if (!t) {
        t = fn;
        fn = function () {};
    }
    return delay(t).then(fn);
};

Promise.prototype.delay = function (fn, t) {
    // return chained promise
    return this.then(function () {
        return Promise.delay(fn, t);
    });

};

let http = require('http');

module.exports = {
    run: async function (message, args) {
        // Get the stored text + timestamp (if game is running in this channel)
        let guessObj = this.typeIt[message.channel.id];
        if (guessObj) {
            // if we want to skip the current text and generate a new one
            if (args[0] !== 'new') {
                if (guessObj.timestamp === false) return message.delete();
                if (guessObj.text === message.content) {
                    // We got a winner. Deleting the text to be ready to beginn a new game
                    let seconds = (Date.now() - guessObj.timestamp) / 1000;
                    message.channel.send(`**YAAAAY!** ${message.author} wins!\nIt took ${seconds}s to answer. That are ${Math.round(guessObj.text.length * 100 / seconds) / 100} chars / second!`);
                    return delete this.typeIt[message.channel.id];
                }
                else return message.channel.send(`**WRONG!**\You should write:\`\`\`${guessObj.text}\`\`\``);
            }
        }
        guessObj = { text: '', timestamp: false };
        // Get the quote
        const url =
        'http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=1';
        http.get(url, res => {
            res.setEncoding('utf8');
            res.on('data', data => {
                guessObj.author = JSON.parse(data.toString('utf8'))[0].title;
                guessObj.text = `${this.bot.configs.prefix}${this.cmd} ${JSON.parse(data.toString('utf8'))[0].content.slice(3, -5).trim().replace('’', '\'').replace('&#8217;','\'')}`;
            });
        });
        this.typeIt[message.channel.id] = guessObj;

        // Send initial message
        let text = `You can already type \`${this.bot.configs.prefix}${this.cmd} \` as that is what the text will start with ;)\nRound will start in `;
        let timer = 3;
        let cText = `${text} ${timer}...`;
        let m = await message.channel.send(cText);
        let edit = async function ()  {
            timer--;
            if (timer > -1)
                cText = `${text} ${timer}...`;
            else {
                // This is the quote text + author --- The race starts :)
                cText =  `Write this:\`\`\`\n${guessObj.text}\n\`\`\`\`${guessObj.author}\``;
                guessObj.timestamp = Date.now();
                // Safe the object in a variable located in the command to access it on later executions of run
                this.typeIt[message.channel.id] = guessObj;
            }
            return await m.edit(cText);
        }.bind(this);

        // Make the timer tick 4 times
        Promise.delay(edit, 1000).delay(edit, 1000).delay(edit, 1000).delay(edit, 1000);
    },
    // all settings but cmd and location are optional - the other are 'just' to increase useability
    configs: function () {
        // Variable to store the text channel specific
        this.typeIt =  {};
        // Displayname that gets shown in help etc.
        this.name = 'Type It!';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'type';
        // All these will trigger the run function aswell
        this.alias = ['typeit', 'typeIt'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES (see config.conf for all)
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Retype what the bot is saying!';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return  `To start just do: \`${this.bot.configs.prefix}${this.cmd}\``;
        };
        // Makes the bot message how to use the command correctly if you return an error
        this.showUsageOnError = false;
        // Decides where it will be listen in the help menue
        this.category = 'General';
        // Gives some tags in the help menue
        this.tags = ['Core', 'General'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = true;
        // If true the Command is only usable for the configured owners
        this.ownerOnly = false;
    }
};
