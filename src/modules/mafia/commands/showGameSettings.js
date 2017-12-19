const Discord = require('discord.js');
let embedify = function (obj) {
    let emb = new Discord.RichEmbed();
    for (let key in obj) {
        if (key.startsWith('_')) continue;
        if (obj.hasOwnProperty(key)) {
            if (['settings', 'current'].indexOf(key) === -1) emb.addField(key, obj[key] + 'ㅤ');
            else {
                for (let setting in obj[key]) {
                    if (obj[key][setting] instanceof Array) {
                        emb.addField(setting,obj[key][setting].map(e => JSON.stringify(e)).join('\n') + 'ㅤ');
                    }
                    else emb.addField(setting, obj[key][setting] + 'ㅤ');
                }
            }
        }
    }
    return emb;
};
module.exports = {
    run: async function (msg, args) {
        let game;
        if (args.length === 0)
            game = await this.bot.dbManager.getTableRowsByKey(this.mod.mafiaDBTable, { owner_id: msg.author.id, selected: true });
        else game = await this.bot.dbManager.getTableRowsByKey(this.mod.mafiaDBTable, { owner_id: msg.author.id, name: args.join(' ') });
        if (game && game.length > 0) game = game.pop().toObject();
        if (!game) return new Error('It seems like you don\'t have a selected game / the game you asked for was not found...');
        let emb = embedify(game);
        emb.setTitle(`Settings for ${game.name}`);
        msg.channel.send(emb);
    },
    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Show gamesettings';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'showsettings';
        // All these will trigger the run function aswell
        this.alias = ['show', 'settingsshow'];
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
