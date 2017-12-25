const gameHelper = require('../functions/gameHelper');
module.exports = {
    run: async function (msg, args) {
        // TODO: Only let it work on people that are in the same game that you are voting in!
        let games = await gameHelper.getGamesFromContext(this, msg);
        if (!games || games.length === 0) return new Error('No game-context found to apply the vote...\nVotes have to be casted in the main game channel!');
        // TODO: Implement handling on which game to prioritize if ambitious
        if (games.length > 1) return new Error('Ambitious... it is not clear for which game you want to vote... the bot-dev needs to do something to handle that!');
        let game = games[0];
        let voter = game.current.players_alive.find(player => player.id === msg.author.id);
        if (typeof voter === 'undefined') return new Error('Only active and actually alive players are allowed to cast a vote.');
        if (msg.mentions.users.length === 0) return new Error('You have to mention a player in the vote command! ~~Unvoting will be implemented soon :)~~');
        let victim = game.current.players_alive.find(player => player.id === msg.mentions.users.first().id);
        if (typeof victim === 'undefined') return new Error('You can not vote for people that are not alive players...');
        let c_votes = game.current.votes || [];
        // Removing all eventual previous vote(s)
        for (let vote of c_votes) {
            for (let voter of vote.voters) {
                if (voter.id === msg.author.id) {
                    vote.voters = vote.voters.filter(f_voter => f_voter.id !== msg.author.id);
                }
            }
        }
        // Remove persons from votetable if they don't have votes on them anymore
        c_votes = c_votes.filter(vote => vote.voters.length > 0);
        // Checking + logging if voted person already exists in the vote table
        let is_voted = false;
        for (let vote of c_votes) {
            if (vote.id === victim.id) {
                is_voted = true;
            }
        }
        // Add Person to vote table if not already voted
        if (is_voted === false) {
            c_votes.push({
                name: victim.name,
                id: victim.id,
                voters: [{ name: voter.name, id: voter.id, vote_power: voter.vote_power }]
            });
        }
        // Else add vote to the other ones
        else {
            let index = c_votes.findIndex(vote => vote.id === victim.id);
            c_votes[index].voters.push({
                name: voter.name, id: voter.id,
                vote_power: voter.vote_power
            });
        }
        // Update the game with the correct votes
        game.current.votes = c_votes;
        await this.bot.dbManager.setTableRowByKey(
            this.mod.mafiaDBTable,
            { owner_id: game.owner_id, name: game.name },
            game
        );
        // Send new vote count table to channel
        gameHelper.sendVoteCount(msg, game);
        for (let vote of c_votes) {
            if (vote.voters.reduce((sum, voter) => sum + voter.vote_power, 0) >= game.current.majority) {
                require('../functions/startPhase').startPhase(game, this, []);
            }
        }


    },
    configs: function () {
        // Displayname that gets shown in help etc.
        this.name = 'Vote-Command';
        // Command that will be used to trigger the bot to execute the run function
        this.cmd = 'vote';
        // All these will trigger the run function aswell
        this.alias = ['v'];
        // If more needed than in the module already configured e.g. MANAGE_MESSAGES (see config.conf for all)
        this.permissions = [];
        // 'dm', 'group', 'text', 'voice' - where the command can be triggered. 'text' is in guild channels
        this.location = ['dm', 'group', 'text'];
        // Description for the help / menue
        this.description = 'Allows you to vote for someone in a running mafia-game.';
        // Gets shown in specific help and depending on setting (one below) if a command throws an error
        this.usage = function () {
            return `To vote do: \`${this.bot.configs.prefix}${this.cmd} @someone\`\n` +
                   'You can also put in more text. Simply the first mention is taken as on whom you want to vote on.';
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
