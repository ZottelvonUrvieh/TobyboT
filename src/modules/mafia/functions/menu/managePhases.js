module.exports = {
    mManagePhases: async function (msg, cmd, menu, game) {
        menu.newCategory('m_phases', 9, false, true);
        game.settings = game.settings || {};
        game.settings.phases = game.settings.phases || [];
        menu.setTitle(`Manage the game-phases of ${game.name}`)
            .setDescription('Add / Remove Phases of the game.\nYou can change what they do, their order and stuff like that later on.\nThere is a high chance you won\'t need to change anything here ever!')
            .addMessageReactionHandler(
                m => (m.author.id === msg.author.id),
                { maxMatches: 1 },
                cmd.moderators,
                async function (reactMsg) {
                    await cmd.moderators.mAddPhase(reactMsg, msg, cmd, menu, game);
                }
            );
        for (let i = 0; i < game.settings.phases.length; i++) {
            let phase = game.settings.phases[i];
            menu.addOption(phase.name, 'ㅤ', cmd.moderators.mRemovePhase,phase.name, msg, cmd, menu, game);
        }
        menu.update();
    },

    mAddPhase: async function (reactMsg, msg, cmd, menu, game) {
        game.settings.phases = Array.from(new Set(game.settings.phases.concat(reactMsg.cleanContent())));
        await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        menu.up();
        cmd.moderators.mManagePhases(msg, cmd, menu, game);
    },

    mRemovePhase: async function (mod_id, msg, cmd, menu, game) {
        game.settings.phases = game.settings.phases.filter(mod => mod !== mod_id);
        await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        cmd.moderators.mManagePhases(msg, cmd, menu, game);
    }
};

