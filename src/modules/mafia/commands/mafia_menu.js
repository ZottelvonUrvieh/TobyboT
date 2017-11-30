module.exports = {
    run: async function (message) {
        let menu = new this.bot.extensions.core.Menu(this, 6, true);
        menu.setTitle('Manage your Mafia games!')
            .setDescription('What do you want to do?')
            .setFooter('Click on the corresponding emoji to select your choice')
            .addOption('Create Game', 'ㅤ', this.games.mCreateGame, message, this, menu)
            .addOption('List Games', 'ㅤ', this.games.mListGames, message, this, menu)
            .addAllowedIds([message.author.id, ...this.bot.configs.owners])
            .send(message.channel);
    },

    configs: function () {
        this.games = require('../functions/menu/manageGames');
        this.moderators = require('../functions/menu/manageMods');
        this.roles = require('../functions/menu/manageRoles');
        this.channels = require('../functions/menu/manageChannels');
        this.phases = require('../functions/menu/managePhases');
        // Displayname that gets shown in help etc.
        this.name = 'Mafia Games Menu';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'mafiaGame';
        // All these will trigger the run function as well
        this.alias = ['mafiagame', 'mg'];
        // If more needed than in the module already configured e.g. MESSAGE_DELETE
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['group', 'text'];
        // Description for the help / menue
        this.description = 'Create, list and delete your Mafia games!';
        // Gets shown in specific help and depending on setting (one below) if a command throws an error
        this.usage = function () {
            return 'Menu for Managing your Mafia games.' +
                    '\nStructure:' +
                    '\n- Create new Game' +
                    '\n    - Message name to create it' +
                    '\n- Setup your games' +
                    '\n    - Manage game-moderators' +
                    '\n        - Add / Remove' +
                    '\n    - Manage discord-roles' +
                    '\n        - Add / Remove' +
                    '\n    - Manage game-channels' +
                    '\n        - Add / Remove' +
                    '\n    - Select game as current game' +
                    '\n    - Duplicate game with different name' +
                    '\n    - Delete game' +
                    '\n- During game' +
                    '\n    - Prodding' +
                    '\n        - List' +
                    '\n        - Add Prod-Timer' +
                    '\n    - Pause / ' +
                    '\n    - Voting-Power';
        };
        // Makes the bot message how to use the command correctly if you throw an exception
        this.showUsageOnError = true;
        // Decides where it will be listen in the help menue
        this.category = 'Mafia';
        // Gives some tags in the help menue
        this.tags = ['Mafia', 'Games'];
        // If true the debug messages of this Command will be displayed in the console
        this.debugMode = true;
        // If true the Command is only usable for the configured owners
        this.ownerOnly = false;
    }
};
