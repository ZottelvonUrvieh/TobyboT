let Canvas = require('canvas');
let https = require('https');

module.exports = {
    run: async function (message, args) {
        // Get the stored text + timestamp (if game is running in this channel)
        let guessObj = this.typeIt[message.channel.id];
        if (guessObj) {
            // if we want to skip the current text and generate a new one
            if (args[0] !== 'new') {
                if (guessObj.timestamp === false) {
                    return message.delete();
                }
                if (guessObj.text === message.content) {
                    // We got a winner. Deleting the text to be ready to beginn a new game
                    let seconds = (Date.now() - guessObj.timestamp) / 1000;
                    message.channel.send(`**YAAAAY!** ${message.author} wins!\nIt took ${seconds}s to answer. That are ${Math.round(guessObj.text.length * 100 / seconds) / 100} chars / second!`);
                    return delete this.typeIt[message.channel.id];
                }
                else {
                    // let picLink =
                    let orig = await message.channel.fetchMessage(guessObj.originMsg);
                    // this.warn(msgs.id + ' --  ' + msgs.attachments.array()[0] + ' -- ' + msgs.attachments.size);//.attachments.array()[0].url;
                    return message.channel.send(`**WRONG!**\nYou should write:\n${orig.attachments.array()[0].url}`);
                }
            }
        }
        guessObj = { text: '', timestamp: false, originMsg: null };
        // Get the quote from this url
        const url = 'https://api.forismatic.com/api/1.0/?method=getQuote&format=json&lang=en';
        let canvas = new Canvas(400, 150);
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'white';
        // If we would want to fill the background:
        // ctx.fillRect(0, 0, canvas.width, canvas.height);
        const txtWrapper = require('canvas-text-wrapper');
        function setup(self) {
            https.get(url, res => {
                res.setEncoding('utf8');
                res.on('data', data => {
                    let quote;
                    // If JSON parsing fails repeat fetching of quote
                    try {
                        quote = JSON.parse(data.toString());
                    } catch (e) { self.log(data.toString()); return setup(self); }
                    guessObj.author = !quote.quoteAuthor || quote.quoteAuthor === '' ? 'unknown' : quote.quoteAuthor.trim();
                    guessObj.text = `${self.bot.configs.prefix}${self.cmd} ${quote.quoteText.trim()}`;
                    // For 'testing' (cheating) purposes I leave this in here... :D
                    self.log(guessObj.text);
                    txtWrapper.CanvasTextWrapper(canvas, guessObj.text, {
                        textAlign: 'left',
                        verticalAlign: 'middle',
                        strokeText: true,
                        sizeToFill: true
                    });
                });
            });
        }
        setup(this);

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
                cText = ''; //`Write this:\`\`\`\n${guessObj.text}\n\`\`\`\`${guessObj.author}\``;
                guessObj.timestamp = Date.now();
                // Safe the object in a variable located in the command to access it on later executions of run
                this.typeIt[message.channel.id] = guessObj;
                m.delete();
                let originMsg = await m.channel.send(`Type this quote from **${guessObj.author}**:`,
                    { file: { attachment: canvas.createPNGStream(), name: guessObj.author + '.png' } }
                );
                guessObj.originMsg = originMsg.id;
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
