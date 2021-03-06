let game_helper = require('../functions/gameHelper');
module.exports = {
    run: async function (old_msg, new_msg) {
        if (old_msg.author.bot === true) return;
        let games = await game_helper.getGamesFromContext(self, old_msg);

        if (games === null || games.length === 0) return;
        if (games[0].mod_ids.indexOf(old_msg.author.id) > -1) return;
        if (games[0].settings.channels.map(c => c.channel).indexOf(old_msg.channel.id) > -1) {
            // We found a non allowed edit in a gamechannel!
            old_msg.channel.send(`${old_msg.author} you just broke the rule of not editing / deleting messages!\nThis message sent at ${old_msg.createdAt.toUTCString()} got altered:`);
            old_msg.channel.send(old_msg.content);
        }
    },

    configs: function () {
        // Just so you can use 'self' as a reference to 'this'  to make all the settings here accessable (and more)
        self = this;
        // Here you can make an array of functions you want to be repeated every x milliseconds
        // x is a a changable config that is located in the config.cfg but it will influence ALL other modules aswell!
        this.eventFunctions = [
            { object: this.bot, trigger: 'on', event: 'messageDelete', function: this.run },
            { object: this.bot, trigger: 'on', event: 'messageUpdate', function: this.run}
        ];
        // Displayname that gets shown in help etc.
        this.name = 'Reminder-Handler';
        // Give it a good and unique id - used for e.g. loading/unloading/reloading it at runtime
        // Essencially works the same like the cmd in commands. The bot will inform you if you
        // picked a non unique one on startup.
        this.id = 'ping';
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Spams your console :D';
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
let self;
