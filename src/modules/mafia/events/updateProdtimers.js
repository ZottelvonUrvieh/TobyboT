module.exports = {
    run: async function (msg) {
        // Get all currently running and active games
        let now = Date.now();
        let games = await self.bot.dbManager.getTableRowsByKey(self.mod.mafiaDBTable, { check_prods: true });
        for (let game of games) {
            let player = game.current.players_alive.find(p => p.id === msg.author.id);
            if (typeof player === 'undefined') continue;
            // TODO: Maybe use one main channel that prod-activiy appies to and not use all channels?
            if (game.settings.channels.findIndex(chan => chan.channel === msg.channel.id) === -1) continue;
            player.prod_timer = now + game.settings.phases[game.current.phase_index].duration / 2;
            await self.bot.dbManager.setTableRowByKey(self.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        }
        // self.debug(`Time to update prods: ${Date.now() - now}`);
    },

    configs: function () {
        // Here you can make an array of functions you want to be repeated every x milliseconds
        // x is a a changable config that is located in the config.cfg but it will influence ALL other modules aswell!
        this.eventFunctions = [
            {object: this.bot, trigger:'on', event: 'message', function: this.run}
        ];
        // Displayname that gets shown in help etc.
        this.name = 'Prod-Update-Handler';
        // Give it a good and unique id - used for e.g. loading/unloading/reloading it at runtime
        // Essencially works the same like the cmd in commands. The bot will inform you if you
        // picked a non unique one on startup.
        this.id = 'produpdate';
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Trackes and handles sending out set reminders.';
        // Gets shown in specific help and depening on setting (one below) if a command throws an error
        this.usage = function() {
            return `Just do: \`${this.bot.configs.prefix}${this.cmd}\``;
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
        // To be able to acces this inside the callback functions
        self = this;
    }
};
let self = null;
