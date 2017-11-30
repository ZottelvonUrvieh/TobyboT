module.exports = {
    run: async function (msg, args) {
        let data = args.join(' ').replace('\n','');
        data = JSON.parse(data);
        let game = await this.bot.dbManager.getTableRowsByKey(this.mod.mafiaDBTable, { owner_id: msg.author.id, name: data.name });
        if (game && game.length > 0) game = game.pop().toObject();
        if (!game || game.length === 0) return new Error('It seems like you do not own a game with the specified name' + data.name + '...\nOr it could also be that this was invalid JSON...');
        for (let key in data) {
            Object.defineProperty(game, key, {
                value: data[key],
                writable: true,
                enumerable: true,
                configurable: true
            });
        }
        game.owner_id = msg.author.id;
        await this.bot.dbManager.setTableRowByKey(this.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        msg.channel.send('**Settings of \'' + game.name + '\'**\n```JSON\n' + JSON.stringify(data) + '\n```');
    },
    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Set game settings JSON';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'setjson';
        // All these will trigger the run function aswell
        this.alias = ['set', 'jsonset'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES (see config.conf for all)
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description =  'Allows you to change the settings of the currently selected game with a JSON string.\n' +
                            'Can be used to change when the current phase ends, current votes, prod-timers, etc...\n' +
                            'I would recommend to use the showjson-command first and to modify that.\n' +
                            'And don\'t even try... it does NOT allow you to change other peoples games if you insert their ID and game names... those variables are just for internal usage.';
        // Gets shown in specific help and depending on setting (one below) if a command throws an error
        this.usage = function () {
            return 'To completely reset the currently selected game to the preset do: \n' +
                `\`\`\`${this.bot.configs.prefix}${this.cmd} ${JSON.stringify({ 'name': 'GAME_NAME', 'owner_id': 'YOUR_DISCORD_ID', 'selected': true, 'running': false, 'check_phase': false, 'settings': { 'rules': [], 'phases': [{ 'duration': 86400000, 'order': 1, 'name': 'day' }, { 'duration': -1, 'order': 2, 'name': 'dusk' }, { 'duration': 43200000, 'order': 3, 'name': 'night' }, { 'duration': -1, 'order': 4, 'name': 'dawn' }], 'roles': [{ 'guild': -1, 'role': -1, 'name': 'players' }, { 'guild': -1, 'role': -1, 'name': 'mafia' }], 'channels': [{ 'channel': -1, 'guild': -1, 'name': 'mafiachat' }, { 'channel': -1, 'guild': -1, 'name': 'daychat' }] }, 'current': { 'majority': 99999999, 'votes': [], 'players_alive': [], 'phase_end': -1, 'phase_index': -1 }, 'mod_ids': [], 'server_ids': [] }, null, 2)}\n\`\`\``;
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
