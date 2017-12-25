module.exports = {
    mManageRoles: async function (msg, cmd, menu, game) {
        menu.newCategory('m_roles', 9, false, true);
        game.settings = game.settings || {};
        game.settings.roles = game.settings.roles || [];
        menu.setTitle(`Manage Discord-Roles of ${game.name}`)
            .setDescription('Send a message mentioning all the roles on this server you want to add to the game.\n(You can change what they specifically do later on)\nHere is a list of all the current roles:')
            .setFooter('To edit a role just klick the corresponding emoji for it under the menu.')
            .addMessageReactionHandler(
                m => (m.author.id === msg.author.id),
                { maxMatches: 1 },
                cmd.moderators,
                async function (reactMsg) {
                    await cmd.roles.mAddRoles(reactMsg, msg, cmd, menu, game);
                }
            );
        for (let i = 0; i < game.settings.roles.length; i++) {
            let guild = cmd.bot.guilds.get(game.settings.roles[i].guild);
            if (typeof guild === 'undefined') {
                continue;
            }
            let role = guild.roles.get(game.settings.roles[i].role);
            menu.addOption(`"${role.name}" on ${role.guild.name}`, 'ㅤ', cmd.roles.mEditRole, role, msg, cmd, menu, game);
        }
        menu.update();
    },

    mEditRole: async function (role, msg, cmd, menu, game) {
        menu.newCategory('m_edit_role', 9, false, true)
            .setTitle(`Editing role "${role.name}" on "${role.guild.name}"`)
            .setDescription('Here you can set this role to be the main role (the role which indicates who is currently alive in the game) or delete it.\n(More is not implemented yet.)')
            .addOption('Make this the main role!', 'ㅤ', cmd.roles.mSelectAsMainRole, role, msg, cmd, menu, game)
            .addOption('Delete this role', 'ㅤ', cmd.roles.mRemoveRole, role.id, msg, cmd, menu, game)
            .update();
    },

    mSelectAsMainRole: async function (role, msg, cmd, menu, game) {
        game.settings.roles.map(r => r.main = role.id === r.role);
        await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        menu.up('m_roles', true);
        cmd.roles.mManageRoles(msg, cmd, menu, game);
    },

    mAddRoles: async function (reactMsg, msg, cmd, menu, game) {
        let newRoles = reactMsg.mentions.roles.array();
        // Ensure no duplicates
        newRoles = newRoles.filter(rol => game.settings.roles.map(r => r.role).indexOf(rol.id) < 0);
        if (newRoles.length === 0) return;
        // Add them - first one added will be the main role by default (can be changed later)
        newRoles.forEach(function (addRole) {
            game.settings.roles.push({ name: addRole.name, role: addRole.id, guild: addRole.guild.id, main: false});
            if (game.server_ids.indexOf(addRole.guild.id) < 0) {
                game.server_ids.push(addRole.guild.id);
            }
        }, this);
        // Update db
        await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        // Overwrite the current menu that is showing the roles in this game
        menu.up('m_roles', true);
        cmd.roles.mManageRoles(msg, cmd, menu, game);

    },

    mRemoveRole: async function (role_id, msg, cmd, menu, game) {
        // TODO: If we implement rules we have to remove the rules that contain the to be removed role!
        game.settings.roles = game.settings.roles.filter(role => role.role !== role_id);
        await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        menu.up('m_roles', true);
        cmd.roles.mManageRoles(msg, cmd, menu, game);
    }
};
