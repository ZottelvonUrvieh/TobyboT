let channelHelper = require('../channelHelper');
module.exports = {
    mManageChannels: async function (msg, cmd, menu, game) {
        menu.newCategory('m_channels', 9, true);
        game.settings = game.settings || {};
        game.settings.channels = game.settings.channels || [];
        menu.setTitle(`Manage channels of ${game.name}`)
            .setDescription('Send a message with all the channels on cmd server you want to add to the game (mention them).\nHere is a list of all the current channels:')
            .setFooter('To remove one just click the corresponding emoji for it under the menu.')
            .addMessageReactionHandler(
                m => (m.author.id === msg.author.id),
                { maxMatches: 1 },
                cmd.channels,
                async function (reactMsg) {
                    await cmd.channels.mAddChannel(reactMsg, msg, cmd, menu, game);
                }
            );

        for (let i = 0; i < game.settings.channels.length; i++) {
            let channel = cmd.bot.guilds.find('id', game.settings.channels[i].guild).channels.get(game.settings.channels[i].channel);
            menu.addOption(`${channel.name} on ${channel.guild.name}`, `<#${channel.id}>ㅤ`, cmd.channels.mRemoveChannel, channel.id, msg, cmd, menu, game);
        }
        menu.update();
    },

    mAddChannel: async function (reactMsg, msg, cmd, menu, game) {
        game = await channelHelper.addChannels(cmd, game, reactMsg);
        menu.up('m_channels', true);
        cmd.channels.mManageChannels(msg, cmd, menu, game);
    },

    mRemoveChannel: async function (channel_id, msg, cmd, menu, game) {
        game.settings.channels = game.settings.channels.filter(channel => channel.channel !== channel_id);
        await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        menu.up('m_channels', true);
        cmd.channels.mManageChannels(msg, cmd, menu, game);
    }
};
