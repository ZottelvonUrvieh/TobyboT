const gameHelper = require('../functions/gameHelper');
module.exports = {
    run: async function (msg, args) {
        // TODO: Only let it work on people that are in the same game that you are voting in!
        let games = await gameHelper.getGamesFromContext(this, msg);
        if (!games || games.length === 0) return new Error('No game-context found to apply the vote...\nAre you even someone who is allowed to vote in an actively running game?');
        // TODO: Implement handling on which game to prioritize if ambitious
        if (games.length > 1) return new Error('Ambitious... it is not clear for which game you want to vote... the bot-dev needs to do something to handle that!');
        let game = games[0];
        let response = `__**The prodtimers of ${game.name}:**__`;
        for (let player of game.current.players_alive) {
            let runs_out_in = player.prod_timer - Date.now();
            response += `\n**${player.name}:** In ${this.bot.extensions.core.msToTimeDifferenceString(runs_out_in)}.`;
        }
        msg.channel.send(response);
    },
    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Prodtimers';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'prods';
        // All these will trigger the run function aswell
        this.alias = ['prodtimers'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES (see config.conf for all)
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Shows the time remaining till the players get prodded for inactivity.';
        // Gets shown in specific help and depending on setting (one below) if a command throws an error
        this.usage = function () {
            return `Just do: \`${this.bot.configs.prefix}${this.cmd}\``;
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
