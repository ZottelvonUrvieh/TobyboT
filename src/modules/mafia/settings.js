module.exports = {
    config: function () {
        return {
            name: 'Mafia Module',
            description: 'Set up and play Mafia - the bot helps you with moderating it!',
            tags: ['Games', 'Fun'],           // Some tags for the menu (not implemented yet)
            permissions: ['MANAGE_MESSAGES'],    // Permissions your module requires (eg. MANAGE_MESSAGES)
            debugMode: false,   // whether or not to show the debug messages in the console
            ownersOnly: false,   // If true this module is unusable to anyone besides the configured owners

            mafiaDBTable: {
                name: 'mafia_game',
                schemaOptions: {
                    owner_id: String, name: String, selected: Boolean, server_ids: Array, mod_ids: Array,
                    running: Boolean, check_phase: Boolean, settings: Object, current: Object
                }
            },

            standardGame: {
                name: 'standard', owner_id: -1, selected: false, server_ids: [], mod_ids: [], running: false,
                // The bot will only try to automatically change phases on games that have 'check_phase' on true
                // So it is not the same as 'running' as phases that are infinite will set 'check_phase' to false.
                check_phase: false,
                settings: {
                    channels: [
                        { name: 'mafiachat', guild: '-1', channel: '-1' },
                        { name: 'daychat', guild: '-1', channel: '-1' }
                    ],
                    roles: [
                        { name: 'players', role: '-1', guild: '-1' },
                        { name: 'mafia', role: '-1', guild: '-1' }
                    ],
                    phases: [
                        // Order -1 means it has no automatic order
                        // Duration -1 means infinite ~ manual through mod to get to next phase
                        { name: 'day',   order: 1, duration: 1000 * 60 * 60 * 24 },
                        { name: 'dusk',  order: 2, duration: -1 },
                        { name: 'night', order: 3, duration: 1000 * 60 * 60 * 12 },
                        { name: 'dawn',  order: 4, duration: -1 }
                    ],
                    // to be implemented - but lets hardwire it first :)
                    rules: []
                },
                current: {
                    phase_index: -1,
                    phase_end: -1,
                    players_alive: [/*{ name: 'name', id: 123, prodtime: date, roles: []}*/],
                    votes: [/*[{name: 'victim1', id: 123, voters: [...]}]*/],
                    majority: 99999999
                }
            }
        };
    }
};
