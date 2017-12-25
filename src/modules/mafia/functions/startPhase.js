module.exports = {
    startPhase: async function (game, component, args) {
        let phases = game.settings.phases;
        let cTime;
        let phaseName;
        // Handle different argument combinations (looking for number (time) at the end)
        // TODO: Make this accept reasonable time formats
        if (args.length > 0) {
            cTime = args.pop();
            if (isNaN(cTime)) {
                args.push(cTime);
                cTime = null;
            }
            else cTime = +cTime;
            phaseName = args.join(' ');
        }
        let phaseIndex;
        // The game is just starting - initialize the phase_index to 0
        if (game.current.phase_index === -1) phaseIndex = 0;
        else if (typeof phaseName === 'undefined' || phaseName === '' || phaseName === ' ') {
            let tmpOrder;
            tmpOrder = phases[game.current.phase_index].order + 1;
            let phase = phases.find(phase => phase.order === tmpOrder);
            if (!phase) {
                tmpOrder = 1;
                phase = phases.find(phase => phase.order === tmpOrder);
            }
            phaseIndex = phases.indexOf(phase);
            phaseName = phase.name;
        }
        else {
            let phase = phases.find(phase => phase.name === phaseName);
            phaseIndex = phases.indexOf(phase);
        }
        if (isNaN(phaseIndex) || phaseIndex === -1) return new Error(`The phase to be started for ${game.name} could not be determined...`);
        if (!cTime) cTime = phases[phaseIndex].duration;
        game.current.phase_index = phaseIndex;
        // If phaseEnd should be infinity set the game to not running to reduce bot load
        if (cTime === -1) {
            game.current.phase_end = Number.MAX_SAFE_INTEGER.toString();
            game.check_phase = false;
        }
        else {
            game.current.phase_end = new Date(Date.now() + cTime).toISOString();
            game.running = true;
            game.check_phase = true;
            // TODO: WIP (change majority)
            // Resetting votes
            if (phases[phaseIndex].reset_votes === true) {
                game.current.votes = [];
            }

            let now = Date.now();
            let main_role = game.settings.roles.find(ro => ro.main === true);
            if (main_role) {
                let guild_role = component.bot.guilds.get(main_role.guild).roles.get(main_role.role);
                // Resetting list of alive players
                game.current.players_alive = game.current.players_alive.filter(player =>
                    typeof guild_role.members.get(player.id) !== 'undefined');

                // Adding all new people that got the role but were not added to the game yet
                let new_players = guild_role.members.filterArray(member => game.current.players_alive.findIndex(player => player.id === member.id) === -1);
                game.current.players_alive.push(...
                    new_players.map(player => {
                        return {
                            name: player.displayName, id: player.id, vote_power: 1,
                            prod_timer: now + phases[phaseIndex].duration / 2,
                            roles: []
                        };
                    })
                );
            }
            // Resetting prod timers
            if (phases[phaseIndex].reset_prods === true) {
                game.current.players_alive.map(player => {
                    player.prod_timer = now + phases[phaseIndex].duration / 2;
                    return player;
                });
            }
            // Changing majority to be votes/2 rounded up // TODO: Add this as a rule aswell
            if (phases[phaseIndex].reset_majority === true) {
                if (game.current.players_alive.length > 0)
                    game.current.majority = Math.ceil(game.current.players_alive.reduce((sum, player) => sum + player.vote_power, 0) / 2);
                else game.current.majority = 13333333333337;
            }
        }
        await component.bot.dbManager.setTableRowByKey(component.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);

        // Handle channel locking - or whatever we want to do on a phase end with a channel...
        // Could easily modify this to do specific things for all individual roles as well.
        for (let game_channel of game.settings.channels) {
            // If the game_channel is only the preset that came with the game initialization - do nothing with it.
            // Only double equals on purpose! We want to compare numbers to strings aswell!
            if (game_channel.guild == -1 || game_channel.channel == -1) continue;
            let channel = component.bot.guilds.get(game_channel.guild).channels.get(game_channel.channel);
            if (channel) {
                // TODO: This is where rules will come into play later on... for now hardwire daychat and mafiachat
                //if ()
                // for (let role of game.settings.roles.filter(rol => rol.guild === channel.guild.id)) {
                //     role = channel.guild.roles.get(role.role);
                //     // For now just overwrite the permissions of all game roles to be not able to write to test if it works
                //     channel.overwritePermissions(role, { 'SEND_MESSAGES': false });
                // }
                let d = new Date(game.current.phase_end);
                channel.send(`It is now **${phaseName}** till ${game.current.phase_end == Number.MAX_SAFE_INTEGER ? 'a mod decides to do something :D' : d.toLocaleString('en-US', { timeZone: 'UTC', timeZoneName: 'short'})}`);
            }
        }
    }
};
