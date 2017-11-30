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
            if (!phase) tmpOrder = 1;
            phase = phases.find(phase => phase.order === tmpOrder);
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
        // If phaseEnd should be infinity set the game to not running to reduce
        if (cTime === -1) {
            game.current.phase_end = Number.MAX_SAFE_INTEGER.toString();
            game.check_phase = false;
        }
        else {
            game.current.phase_end = new Date(Date.now() + cTime).toISOString();
            game.running = true;
            game.check_phase = true;
        }
        await component.bot.dbManager.setTableRowByKey(component.mod.mafiaDBTable, { owner_id: game.owner_id, name: game.name }, game);

        // Handle channel locking - or whatever we want to do on a phase end with a channel...
        // Could easily copy this to do specific things for all individual roles as well.
        for (let game_channel of game.settings.channels) {
            // If the game_channel is only the preset that came with the game initialization - do nothing with it.
            if (game_channel.guild === -1 || game_channel.channel === -1) continue;
            let channel = component.bot.guilds.get(game_channel.guild).channels.get(game_channel.channel);
            if (channel) {
                // TODO: This is where rules will come into play later on... for now hardwire daychat and mafiachat
                //if ()
                for (let role_id of game.settings.roles.filter(r => r.guild === channel.guild.id)) {
                    let role = channel.guild.roles.get(role_id);
                    // For now just overwrite the permissions of all roles to be not able to write
                    channel.overwritePermissions(role, {'SEND_MESSAGES': false, 'ATTACH_FILES': false});
                }
                channel.send(`It is now **${phaseName}** till ${game.current.phase_end}`);
            }
        }
    }
};