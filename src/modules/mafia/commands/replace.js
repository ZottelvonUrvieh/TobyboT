const gameHelper = require('../functions/gameHelper');
module.exports = {
    run: async function (msg, args) {
        // TODO: Only let it work on people that are in the same game that you are voting in!
        let games = await gameHelper.getGamesFromContext(this, msg);
        if (!games || games.length === 0) return new Error('No game-context found to apply the vote...\nAre you even someone who is allowed to vote in an actively running game?');
        // TODO: Implement handling on which game to prioritize if ambitious
        if (games.length > 1) return new Error('Ambitious... it is not clear for which game you want to vote... the bot-dev needs to do something to handle that!');
        let game = games[0];
        if (msg.mentions.users.array().length !== 2) return new Error('You have to mention a player and a non player for this to work...');
        let to_be_replaced = game.current.players_alive.find(player => typeof msg.mentions.users.get(player.id) !== 'undefined');
        let replacement = msg.mentions.users.array().find(user => game.current.players_alive.findIndex(player => player.id === user.id) === -1);
        if (typeof to_be_replaced === 'undefined' || typeof replacement === 'undefined')
            return new Error('You have to mention a player and a non player for this to work...\nYou apparently chose two of the same kind...');

        // Replace the player with the replacement in the playerlist and reset their prodtimer
        // Keep all other settings for that person
        game.current.players_alive = game.current.players_alive.map(player => {
            if (player.id !== to_be_replaced.id) return player;
            let new_player = Object.assign({}, player);
            // TODO: Fix usage of username instead of displayname? (Would require to fetch that person as a guild member as we only have them as plain user...)
            new_player.name       = replacement.username;
            new_player.id         = replacement.id;
            new_player.prod_timer = Date.now() + game.settings.phases[game.current.phase_index].duration / 2;
            return new_player;
        });

        // Replace all occurrences of the to be replaced person in votes
        // with the one that gets swapped in.
        game.current.votes = game.current.votes.map(vote => {
            if (vote.id === to_be_replaced.id) {
                vote.id   = replacement.id;
                vote.name = replacement.username;
            }
            vote.voters = vote.voters.map(voter => {
                if (voter.id === to_be_replaced.id) {
                    voter.id   = replacement.id;
                    voter.name = replacement.username;
                }
                return voter;
            });
            return vote;
        });
        // Save the game with the new player
        await this.bot.dbManager.setTableRowByKey(this.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        // Announce the replacement happend
        for (let game_channel of game.settings.channels) {
            // If the game_channel is only the preset that came with the game initialization - do nothing with it.
            // Only double equals on purpose! We want to compare numbers to strings aswell!
            if (game_channel.guild == -1 || game_channel.channel == -1) continue;
            let channel = this.bot.guilds.get(game_channel.guild).channels.get(game_channel.channel);
            if (channel) {
                channel.send(`**A replacement happend!**\n**${to_be_replaced.name}** got replaced by **${replacement.username}**!\nGive them some time to catch up.\nAll existing votes on or from ${to_be_replaced.name} got changed to now be on or from ${replacement.username}!`);
            }
        }
    },
    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Replace-Player-Command';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'replace';
        // All these will trigger the run function aswell
        this.alias = [];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES (see config.conf for all)
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Replaces a player with a non player in a running game.';
        // Gets shown in specific help and depending on setting (one below) if a command throws an error
        this.usage = function () {
            return `Just do: \`${this.bot.configs.prefix}${this.cmd} @ToBeReplaced @ToBePlayer\``;
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
