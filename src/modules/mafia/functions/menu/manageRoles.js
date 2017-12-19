module.exports = {
    mManageRoles: async function (msg, cmd, menu, game) {
        // TODO: CURRENTLY DOES NOT WORK! WIP
        menu.newCategory('m_roles', 9, false, true);
        game.settings = game.settings || {};
        game.settings.roles = game.settings.roles || [];
        menu.setTitle(`Manage Discord-Roles of ${game.name}`)
            .setDescription('Send a message with all the roles on cmd server you want to add to the game (mention them). (You can change what they do later on)\nTo remove one just klick the corresponding emoji for it under the menu.\nHere is a list of all the current roles:')
            .addMessageReactionHandler(
                m => (m.author.id === msg.author.id),
                { maxMatches: 1 },
                cmd.moderators,
                async function (reactMsg) {
                    await cmd.roles.mAddRole(reactMsg, msg, cmd, menu, game);
                }
            );
        for (let i = 0; i < game.settings.roles.length; i++) {
            let role = cmd.bot.guilds.find('id', game.settings.roles[i].guild).roles.get(game.settings.roles[i].role);
            menu.addOption(`@${role.name} on ${role.guild.name}`, 'ㅤ', cmd.roles.mRemoveRole, role.id, msg, cmd, menu, game);
        }
        menu.update();
    },

    mAddRole: async function (reactMsg, msg, cmd, menu, game) {
        let newRoles = reactMsg.mentions.roles.array();
        if (newRoles.length > 0) {
            newRoles = newRoles.filter(rol => game.settings.roles.map(r => r.role).indexOf(rol.id) < 0);
            newRoles.forEach(function (addRole) {
                game.settings.roles.push({ name: 'unnamed', role: addRole.id, guild: addRole.guild.id });
                if (game.server_ids.indexOf(addRole.guild.id) < 0) game.server_ids.push(addRole.guild.id);
            }, this);
            await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
            menu.up('m_roles', true);
            cmd.roles.mManageRoles(msg, cmd, menu, game);
        }
    },

    mRemoveRole: async function (role_id, msg, cmd, menu, game) {
        game.settings.roles = game.settings.roles.filter(role => role.role !== role_id);
        await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        menu.up('m_roles', true);
        cmd.roles.mManageRoles(msg, cmd, menu, game);
    }
};
