module.exports = {
    getGamesFromContext: async function (component, msg) {
        // All games that are going on in this channel
        let games = await component.bot.dbManager.getTableRowsByKey(component.mod.mafiaDBTable, { 'settings.channels': { $elemMatch: { channel: { $eq: msg.channel.id } } } });
        // If no games in this channel then use your selected game
        if (!games || games.length === 0)
            games  = await component.bot.dbManager.getTableRowsByKey(component.mod.mafiaDBTable, { owner_id: msg.author.id, selected: true });
        if (!games || games.length === 0) {
            let er = new Error('Was unable to find any game to apply the command to... no game in this channel and no own selected game...');
            msg.channel.send(er.message);
            return er;
        }
        return games;
    }
};
