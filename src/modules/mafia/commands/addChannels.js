const addChannelsFuc = require('../functions/channelHelper');
module.exports = {
    run: async function (msg, args) {
        if (msg.mentions.channels.size === 0) return new Error('You have to mention a channel you want to add to the game...');
        let game = await this.bot.dbManager.getTableRowsByKey(this.mod.mafiaDBTable, { owner_id: msg.author.id, selected: true });
        if (game && game.length > 0) game = game.pop();
        addChannelsFuc.addChannels(this, game, msg);
    },

    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Add channels';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'addchannels';
        // All these will trigger the run function aswell
        this.alias = ['addchannel', 'ac', 'addc', 'addch', 'ach'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES (see config.conf for all)
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Add one or multiple channels to your currently selected mafia-game.';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return `Just mention some channels: \`${this.bot.configs.prefix}${this.cmd} #channel1 #channel2\`\n`;
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
