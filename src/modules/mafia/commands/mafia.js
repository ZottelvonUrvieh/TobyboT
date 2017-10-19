let listGames = async function (msg, cmd) {
    let games = await cmd.bot.dbManager.getTableRowsByKey(table, { owner_id: msg.author.id });
    cmd.warn('Current games: ' + games[0]);
    return games;
};
let addGame = async function (msg, args, cmd, settings) {
    let games = await cmd.bot.dbManager.getTableRowsByKey(table, msg.author.id);
    for (let key in games) {
        let game = games[key];
        if (game.name === args[1]) return; // We already have a game with that name - don't want to override!
    }
    games[args[1]] = {owner_id: msg.author.id, name: args[1], settings: settings};
    await cmd.bot.dbManager.setTableRowByKey(table, { owner_id: msg.author.id },
        {owner_id: msg.author.id, });
    cmd.warn('Current games: ' + games);
};
let table = {
    name: 'mafia_game',
    schemaOptions: { owner_id: String, name: Object, settings: Object }
};
module.exports = {
    run: async function (message, args) {
        this.debug(args);
        if (args.length < 1) return new Error('This command requires arguments!');
        if (['new', 'list', 'delete'].indexOf(args[0]) === -1) return new Error('Wrong arguments provided!');
        if (args[0] === 'list') return listGames(message, this);
        // TODO: Replace with fancy emoji-button menue or add naming after showing all through sending a name in a message
        if (args[0] === 'new') {
            let settings = {};
            await addGame(message, args, this, settings);
            return await listGames(message, this);
        }
        if (args[0] === 'delete') {
            null;
        }
    },
    // all settings but cmd and location are optional - the other are just to increase useability
    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Manage Mafia Games';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'mafiaGame';
        // All these will trigger the run function aswell
        this.alias = ['mafiagame', 'mg'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['group', 'text'];
        // Description for the help / menue
        this.description = 'Create, list and delete your Mafia games!';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function () {
            return `New Game: \`${this.bot.configs.prefix}${this.cmd} new nameTheGame\`\n` +
                `List your Games: \`${this.bot.configs.prefix}${this.cmd} list\`\n` +
                `Delete a Game: \`${this.bot.configs.prefix}${this.cmd} delete nameOfTheGame\``;
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = true;
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
