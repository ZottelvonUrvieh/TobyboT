module.exports = {
    mManageMods: async function (msg, cmd, menu, game) {
        menu.newCategory('m_mods', 9, false, true)
            .setTitle(`Manage mods of ${game.name}`)
            .setDescription('Send a message with all the people you want to mod (mention them).\nHere is a list of all the current mods:')
            .setFooter('To de-mod someone just click the corresponding emoji for them under the menu.')
            .addMessageReactionHandler(
                m => (m.author.id === msg.author.id),
                { maxMatches: 1 },
                cmd.moderators,
                async function (reactMsg) {
                    await cmd.moderators.mAddMod(reactMsg, msg, cmd, menu, game);
                }
            );
        for (let i = 0; i < game.mod_ids.length; i++) {
            let user = await cmd.bot.fetchUser(game.mod_ids[i]);
            menu.addOption(user.username, 'ㅤ', cmd.moderators.mRemoveMod, user.id, msg, cmd, menu, game);
        }
        menu.update();
    },

    mAddMod: async function (reactMsg, msg, cmd, menu, game) {
        let newMods = reactMsg.mentions.users.array().map(u => u.id);
        if (newMods.length > 0) {
            game.mod_ids = Array.from(new Set(game.mod_ids.concat(newMods)));
            await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        }
        menu.up('m_mods', true);
        cmd.moderators.mManageMods(msg, cmd, menu, game);
    },

    mRemoveMod: async function (mod_id, msg, cmd, menu, game) {
        game.mod_ids = game.mod_ids.filter(mod => mod !== mod_id);
        await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        menu.up('m_mods', true);
        cmd.moderators.mManageMods(msg, cmd, menu, game);
    }
};
