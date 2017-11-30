module.exports = {
    addChannels: async function (component, game, msg) {
        let newChannels = msg.mentions.channels.array();
        newChannels = newChannels.filter(chan => game.settings.channels.map(c => c.channel).indexOf(chan.id) < 0);
        if (newChannels.length > 0) {
            newChannels.forEach(function (addChannel) {
                game.settings.channels.push({ name: addChannel.name, channel: addChannel.id, guild: addChannel.guild.id });
                if (game.server_ids.indexOf(addChannel.guild.id) < 0) game.server_ids.push(addChannel.guild.id);
            }, this);
            await component.bot.dbManager.setTableRowByKey(component.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        }
        return game;
    }
};
