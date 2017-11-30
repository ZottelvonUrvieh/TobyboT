module.exports = {
    run: async function (msg, args) {
        if (args.length < 1) return new Error('You have to provide a name for the game!');
        let games = await this.bot.dbManager.getTableRowsByKey(this.mod.mafiaDBTable, { owner_id: msg.author.id, name: args.join(' ') });
        if (games.length > 0) return new Error('You already have a game with this name!');
        let game = Object.assign({}, this.mod.configs.standardGame);
        game.name = args.join(' ');
        game.owner_id = msg.author.id;
        await this.bot.dbManager.insertTableRows(this.mod.mafiaDBTable, [game]);
    },
    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Create Mafia Game';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'create';
        // All these will trigger the run function aswell
        this.alias = ['cmg', 'createMafiaGame', 'creategame', 'createGame'];
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
