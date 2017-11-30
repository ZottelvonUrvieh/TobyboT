const startPhase = require('../functions/startPhase');
module.exports = {
    run: async function () {
        // It is no problem doing that all the time (at least with the mongodb implementation) as does caching
        let now = new Date();
        let games = await self.bot.dbManager.getTableRowsByKey(self.mod.mafiaDBTable, { check_phase: true });
        for (let i = 0; i < games.length; i++) {
            let settings = games[i].settings;
            let current = games[i].current;
            if (now > new Date(current.phase_end)) {
                if (current.phase_index > -1)
                    self.debug(`${games[i].name}'s current phase '${settings.phases[current.phase_index].name}' ended.`);
                else self.debug(`${games[i].name}'s just started. Starting phase '${settings.phases[0].name}'.`);

                // Do the logic for starting the next phase (this modifies the games[i] object!)
                startPhase.startPhase(games[i], self, []);

                // It is a single row so we probably don't have to use await as it should
                // handle those atomically - but it doesn't make a really noticeable difference in speed
                // and this way I can ensure that this there won't be any problems that the phasechanging
                // function will be executed multiple times or something like that
                await self.bot.dbManager.setTableRowByKey(self.mod.mafiaDBTable, { owner_id: games[i].owner_id, name: games[i].name }, games[i]);
            }
        }
        // To look at performances...
        // With 1000 games running and check_phase on true it only took 3 seconds to get them all initially
        // and then it was able to run it in about average 220 ms
        // let after = new Date();
        // self.debug('It took so long to get the games: ' + new Date(after - now).valueOf());
    },

    configs: function () {
        // Here you can make an array of functions you want to be repeated every x milliseconds
        // x is a a changeable config that is located in the config.cfg but it will influence ALL other modules as well!
        this.repeatFunctions = [
            {object: this.bot.taskManager, trigger:'on', event: 'repeat', function: this.run}
        ];
        // Displayname that gets shown in help etc.
        this.name = 'Phase-Cycling';
        // Give it a good and unique id - used for e.g. loading/unloading/reloading it at runtime
        // Essentially works the same like the cmd in commands. The bot will inform you if you
        // picked a non unique one on startup.
        this.id = 'phase_cycling';
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Changes Phases when the time is up';
        // Gets shown in specific help and depending on setting (one below) if a command throws an error
        this.usage = function() {
            return '';
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
        // To be able to access this inside the callback functions
        self = this;
    }
};
let self = null;
