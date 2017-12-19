const gameHelper = require('../functions/gameHelper');
module.exports = {
    run: async function (msg, args) {
        let games;
        let response = '';
        if (args.length === 0 || args[0] === 'own') {
            games = await this.bot.dbManager.getTableRowsByKey(this.mod.mafiaDBTable, { owner_id: msg.author.id });
            if (games.length === 0) response = 'You seem to not have any games... create one!';
        }
        else if (args[0] === 'modding') {
            games = await this.bot.dbManager.getTableRowsByKey(this.mod.mafiaDBTable, { mod_ids: msg.author.id });
            if (games.length === 0) response = 'You are not listed as a mod in any game currently.';
        }
        else if (args[0] === 'here') {
            games = await gameHelper.getGamesFromContext(this, msg);
        }
        else return new Error('Wrong argument... allowed are "own", "modding", "here" and no argument');
        if (games && games.length > 0)
            response = games.map(game => game.name).join('\n');
        else response = games.message || response;
        msg.channel.send(response);
    },
    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'List Mafia Games';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'list';
        // All these will trigger the run function aswell
        this.alias = ['ls'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES (see config.conf for all)
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Can be awesome with awesomeness!';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return  `To do something do this: \`${this.bot.configs.prefix}${this.cmd}`;
        };
        // Makes the bot message how to use the command correctly if you return an error
        this.showUsageOnError = true;
        // Decides where it will be listen in the help menue
        this.category = 'Mafia';
        // Gives some tags in the help menue
        this.tags = ['Mafia', 'Games'];
        // If true the debugmessages of this Command will be displayed in the console
        this.debugMode = true;
        // If true the Command is only usable for the configured owners
        this.ownerOnly = false;
    }
};
