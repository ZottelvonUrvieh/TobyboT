let Discord = require('discord.js');
module.exports = {
    sendVoteCount: async function (msg, game) {
        let emb = new Discord.RichEmbed();
        emb.setTitle(':ballot_box: __** Current Votes **__:ballot_box:');
        game.current.votes.forEach(vote => {
            let field_name = `\n**Voting ${vote.name} (${vote.voters.reduce((sum, voter) => sum + voter.vote_power, 0)}/${game.current.majority}):**`;
            let field_value = '';
            vote.voters.forEach(voter => field_value += `\n${voter.name} x ${voter.vote_power}`);
            emb.addField(field_name || 'ㅤ', field_value || 'ㅤ');
        });
        emb.setFooter(`Current Majority: ${game.current.majority}`);
        msg.channel.send(emb);
    },

    getGamesFromContext: async function (component, msg) {
        // All games that are going on in this channel
        let games = await component.bot.dbManager.getTableRowsByKey(component.mod.mafiaDBTable, { 'settings.channels': { $elemMatch: { channel: { $eq: msg.channel.id } } } });
        // If no games in this channel then use your selected game
        if (!games || games.length === 0)
            games = await component.bot.dbManager.getTableRowsByKey(component.mod.mafiaDBTable, { owner_id: msg.author.id, selected: true });
        if (!games || games.length === 0) {
            let er = new Error('Was unable to find any game to apply the command to... no game in this channel and no own selected game...');
            // msg.channel.send(er.message);
            return null;
        }
        return games;
    }
};
