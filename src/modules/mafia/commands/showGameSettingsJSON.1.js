const Discord = require('discord.js');
// recursive reimplementation of JSON.stringify
let stringifyJSON = function (obj) {

    // null
    if (obj === null) {
        return 'null';
    }

    // unstringifiable - functions and undefined
    if (obj === undefined || obj.constructor === Function) { return; }

    // strings
    if (obj.constructor === String) {
        return '"' + obj + '"';
    }

    // arrays
    if (obj.constructor === Array) {
        if (obj.length) {
            let partialJSON = [];

            for (let i = 0; i < obj.length; i++) {
                partialJSON.push(stringifyJSON(obj[i])); // recursion
            }

            return '[' + partialJSON.join(',') + ']';
        } else {
            return '[]';
        }
    }

    // objects
    if (obj.constructor === Object) {
        let keys = Object.keys(obj);
        if (keys.length) {
            let partialJSON2 = '';

            for (let j = 0; j < keys.length; j++) {
                let key = keys[j];

                if (!key || obj[key] === undefined || typeof key === 'function' || typeof obj[key] === 'function') {

                } else {
                    if (j === keys.length - 1) {
                        partialJSON2 += stringifyJSON(key) + ':' + stringifyJSON(obj[key]); // recursion
                    } else {
                        partialJSON2 += stringifyJSON(key) + ':' + stringifyJSON(obj[key]) + ','; // recursion
                    }
                }
            }
            return '{' + partialJSON2 + '}';
        } else {
            return '{}';
        }
    }

    // everything else (numbers, booleans, etc.)
    return obj.toString();

};

module.exports = {
    run: async function (msg, args) {
        let game;
        if (args.length === 0)
            game = await this.bot.dbManager.getTableRowsByKey(this.mod.mafiaDBTable, { owner_id: msg.author.id, selected: true });
        else game = await this.bot.dbManager.getTableRowsByKey(this.mod.mafiaDBTable, { owner_id: msg.author.id, name: args.join(' ') });
        if (game && game.length > 0) game = game.pop().toObject();
        if (!game) return new Error('It seems like you don\'t have a selected game / the game you asked for was not found...');
        delete game._id;
        delete game.__v;
        const result = stringifyJSON(game);
        msg.channel.send('**Settings of \'' + game.name + '\'**\n```JSON\n' + result + '\n```');
    },
    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Show gamesettings JSON';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'json';
        // All these will trigger the run function aswell
        this.alias = ['showjson', 'settingsjson'];
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
