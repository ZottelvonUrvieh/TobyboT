module.exports = {
    run: async function (message, args) {
        let m = await message.channel.send(':thinking: Ping');
        m = await m.edit(':thinking: Ping...');
        let postingStart = new Date();
        let editText = '';
        if (args.length > 0) {
            await m.react('🔁');
            let postingStop = new Date();
            let reaction = m.reactions.array()[0];
            let removingStart = new Date();
            await reaction.remove();
            let removingStop = new Date();
            editText = `:bulb: **__Pong!__**\nGeneral Ping: **${m.editedTimestamp - m.createdTimestamp}ms**` +
                `\nTime needed to respond to your command: **${m.createdTimestamp - message.createdTimestamp}ms**` +
                `\nAdding emojis: **${postingStop - postingStart}ms**` +
                `\nRemoving emojis: **${removingStop - removingStart}ms**`;
        }
        else {
            editText = `:bulb: **__Pong!__**\nMy responsiness is round about **${m.editedTimestamp - m.createdTimestamp}ms**`;
        }
        await m.edit(editText);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Ping';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'ping';
        // All these will trigger the run function aswell
        this.alias = ['pong'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Gets feedback about the ping of the bot.';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function() {
            return `Just do: \`${this.bot.configs.prefix}${this.cmd}\``;
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = false;
        // Decides where it will be listen in the help menue
        this.category = 'General';
        // Gives some tags in the help menue
        this.tags = ['Core', 'General'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = true;
        // If true the Command is only usable for the configured owners
        this.ownersOnly = false;
        // If this is > 0 the event autoCleanup will delete user messages with this command after these amount of ms
        this.autoDelete = 10000;
    }
};
