module.exports = {
    mEditGame: async function (msg, cmd, menu, game) {
        menu.newCategory('edit_game')
            .setTitle(`Editing ${game.selected ? 'selected ':''} game ${game.name}`)
            .setDescription('What do you want to do?')
            .addOption('Manage Mods', 'ㅤ', cmd.moderators.mManageMods, msg, cmd, menu, game)
            .addOption('Manage Roles', 'ㅤ', cmd.roles.mManageRoles, msg, cmd, menu, game)
            .addOption('Manage Channels', 'ㅤ', cmd.channels.mManageChannels, msg, cmd, menu, game)
            .addOption('Manage game Phases', 'Not implementedㅤ', cmd.phases.managePhases, msg, menu, game)
            .addOption('Select', 'ㅤ', cmd.games.mSelectGame, msg, cmd, menu, game)
            .addOption('Duplicate', 'ㅤ', cmd.games.mDuplicateGame, msg, cmd, menu, game)
            .addOption('Delete', 'ㅤ', cmd.games.mDeleteGame, msg, cmd, menu, game)
            .update();
    },

    mListGames: async function (msg, cmd, menu) {
        let games = await cmd.bot.dbManager.getTableRowsByKey(cmd.mod.mafiaDBTable, { owner_id: msg.author.id });
        menu.newCategory('list_games')
            .setTitle('These are all your current Games:')
            .setDescription('You can select one so that every written command you use outside a game channel is applied to this game (if outside of game channels or if multiple games are happening in one channel).');
        games.forEach(function (game) {
            menu.addOption(`${game.name}${game.selected ? ' [x]' : ''}`, 'ㅤ', cmd.games.mEditGame, msg, cmd, menu, game);
        }, this);
        menu.update();
        return games;
    },

    mDuplicateGame: async function (msg, cmd, menu, game) {
        menu.newCategory('duplicate_game')
            .setTitle(`Duplicating ${game.name}`)
            .setDescription('Message a name for the duplication.')
            .addMessageReactionHandler(
                m => m.author.id === msg.author.id,
                { maxMatches: 1 },
                cmd.games,
                async function (message) {
                    let newGame = game.toObject();
                    newGame.name = message.cleanContent;
                    delete newGame._id;
                    await cmd.bot.dbManager.insertTableRows(cmd.mod.mafiaDBTable, [newGame]);
                    menu.up('list_games', true);
                    cmd.games.mListGames(msg, cmd, menu);
                }
            )
            .update();
    },

    mDeleteGame: async function (msg, cmd, menu, game) {
        await cmd.bot.dbManager.deleteTableRowsByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name });
        menu.up('list_games', true);
        cmd.games.mListGames(msg, cmd, menu);
    },

    mCreateGame: async function (msg, cmd, menu) {
        menu.newCategory('create_game');

        let games = await cmd.bot.dbManager.getTableRowsByKey(cmd.mod.mafiaDBTable, { owner_id: msg.author.id });

        menu.setTitle('Write a message with the desired name for the game!')
            .setDescription('These are all your current games... so the new one has to be different than those');

        games.forEach(function (game) {
            menu.addOption(game.name, 'ㅤ', 'none');
        }, this);

        menu.addMessageReactionHandler(
            m => (m.author.id === msg.author.id),
            { maxMatches: 5 },
            this,
            async function (msg, collector) {
                let nameMatches = games.filter(g => g.name === msg.cleanContent);
                if (nameMatches.length > 0) {
                    menu.setDescription(`Sorry, but it seems like you already have a game named ${msg.cleanContent}... try again! (Try ${collector.collected.size}/${collector.options.maxMatches})`)
                        .update();
                    return;
                }
                collector.stop();
                let game = { owner_id: msg.author.id, name: msg.cleanContent, selected: false, server_ids: [], mod_ids: [], settings: {} };
                await cmd.bot.dbManager.insertTableRows(cmd.mod.mafiaDBTable, [game]);
                menu.up('list_games', true);
                await cmd.games.mListGames(msg, cmd, menu, game);
                cmd.games.mEditGame(msg, cmd, menu, game);
            }
        );
        menu.update();
    },

    mSelectGame: async function (msg, cmd, menu, game) {
        let selectedGames = await cmd.bot.dbManager.getTableRowsByKey(cmd.mod.mafiaDBTable, { owner_id: msg.author.id, selected: true });
        while (selectedGames.length > 0) {
            let unselectGame = selectedGames.pop();
            if (unselectGame.name === game.name) return;
            unselectGame.selected = false;
            await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: unselectGame.name }, unselectGame);
        }
        game.selected = true;
        await cmd.bot.dbManager.setTableRowByKey(cmd.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);
        menu.setTitle(`Editing ${game.selected ? 'selected ' : ''} game ${game.name}`)
            .update();
    }
};
