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
                    running: Boolean, check_phase: Boolean, settings: Object, current: Object, check_prods: Boolean
                }
            },

            standardGame: {
                name: 'standard', owner_id: -1, selected: false, server_ids: [], mod_ids: [], running: false,
                // The bot will only try to automatically change phases on games that have 'check_phase' on true
                // So it is not the same as 'running' as phases that are infinite will set 'check_phase' to false.
                check_phase: false,
                // The bot will only check if prodtimers are hit when check_prods is on true
                check_prods: false,
                settings: {
                    channels: [
                        { name: 'mafiachat', guild: '-1', channel: '-1' },
                        { name: 'daychat', guild: '-1', channel: '-1' }
                    ],
                    roles: [
                    /*
                        { name: 'players', role: '-1', guild: '-1', main: true },
                        { name: 'mafia', role: '-1', guild: '-1', main: false }
                    */
                    ],
                    phases: [
                        // Order -1 means it has no automatic order (so has to be triggered by command)
                        // Duration -1 means (almost) infinite ~ requires mod to get use a command to get to continue
                        // The reset flags are all applied at the very start of the phase
                        {   name: 'day',        order: 1,           duration: 1000 * 60 * 60 * 24,
                            reset_prods: true,  reset_votes: true , reset_majority: true
                        },
                        {   name: 'dusk',       order: 2,           duration: -1,
                            reset_prods: false, reset_votes: false, reset_majority: false
                        },
                        {   name: 'night',      order: 3,           duration: 1000 * 60 * 60 * 12,
                            reset_prods: false, reset_votes: false, reset_majority: false
                        },
                        {   name: 'dawn',       order: 4,           duration: -1,
                            reset_prods: false, reset_votes: false, reset_majority: false
                        },
                        {   name: 'pause',      order: -1,          duration: -1,
                            reset_prods: false, reset_votes: false, reset_majority: false
                        }
                    ],
                    // to be implemented - lets hardwire it first :)
                    // Everything that goes like "option1 | option2" means you have to choose one of them
                    // Everything that goes like "undefined | something" can be omitted
                    rules: [
                        /*
                        {
                            type: "phase",
                            phase: "day",
                            actions: [
                                {set_prodtime: duration/2,}
                                "reset_majority",
                                "reset_votes",
                                "reset_all_prod_times",
                                "reload_players",
                                {change_permissions: [
                                    { role: "1234567", channels: [ { channel: "12345", perm: "read" } , { channel: "12351231", perm: "write" } ...] }, ...
                                ]},
                            ]
                        },
                        {
                            type: "phase",
                            phase: "dusk",
                            actions: [
                                {set_global_prod_state: "inactive"}
                                {change_permissions: [
                                    { role: "1234567", channels: [ { channel: "12345", perm: "read" } , { channel: "12351231", perm: "write" } ...] }, ...
                                ]}
                            ]
                        },
                        {
                            type: "phase",
                            phase: "pause",
                            actions: {
                                {set_global_prod_state: "pause"},
                                "reload_players",
                                "pauseChannels"
                            }
                        },
                        ///////////////////////////
                        {
                            type: "onMajority",
                            conditions: []
                            actions: [
                                {change_phase: "next_phase",}
                                {change_DC_roles: [
                                    { type: "remove", role_id: "main_role_id", user_id: "elected" },
                                    { type: "add", role_id: "dead_role__id", user_id: "elected" }
                                ]}
                            ]
                        },
                        {
                            type: "onMajority",
                            conditions: [
                                {and_conditions: [
                                    {has_role: mafia_role_ID}
                                ]}
                            ]
                            actions_true: [
                                {sendMessage: {target: daychat_channel_ID, message: "A mafia member died! Further details will be posted from a mod later on."}
                            ],
                            actions_false: [
                                {sendMessage: {target: daychat_channel_ID, message: "A town member died! Further details will be posted from a mod later on."}
                            ]
                        },
                        ////////////////////////
                        {
                            type: "onMessage",
                            // These conditions are combined with OR
                            conditions: [
                                {and_conditions: [
                                    {user_id: undefined | "1231234123"},
                                    {has_role: undefined | "1231231231231}",
                                    {content_length: undefined | {equality: "longer" | "equal" | "shorter", value: 12}},
                                    {content_matching: undefined | {
                                        type: "startsWith" | "endsWith" | "contains" | "regex",
                                        content: "something to test on here"
                                    }}
                                    {timestamp_math: {solutions: [1,2,3,4], operation: "(2*ts)%5"}}
                                ]}, {and_conditions: [...]}, ...
                            ]
                            actions: [...]
                        }

                        ////// Here the structure of the individual possible rule entries:
                        rule: {type, condition, action}
                        types: ["onMessage"<message>, "onPhaseStart"<phase>, "onMajorty"<player>, "onProdTimeHit"<player>, "onPlayerMessageEdit"<message><player>]
                        conditions: [<empty>, (message) <see above in example>]
                        // all optional - but at least one is needed
                        actions: {
                            change_phase, change_DC_roles, change_permissions, (setting) set_prodtime,
                            (setting) reset_all_prod_times, (player) reset_prod_time, (player) set_prod_state,
                            reset_majorty, reset_votes, reload_players, set_global_prod_state, (player) setVotePower,
                            sendMessage, deleteMessage
                        }
                        change_phase: {phase: "name", actions: [action]}
                        change_DC_roles: [
                            type:   "remove" | "add",
                            role_id: roleID,
                            user_id: userID | (onMessage) "author" | (onMajority) "elected"
                            ]
                        change_permissions: [{
                            role: roleID,
                            channels: [ { channel: channelID, perm: "read" | "write" | "none" } ]
                        }]
                        set_global_prod_state: "active" | "inactive",
                        sendMessage: {target: playerID | channelID | "mods", message: "message to send"}
                        */
                    ]
                },
                current: {
                    phase_index: -1,
                    phase_end: -1,
                    players_alive: [/*{ name: 'name', id: 123, prod_timer: date_number, prod_state: "running", vote_power: 1, roles: []}*/],
                    votes: [/*[{name: 'victim1', id: 123, voters: [...]}]*/],
                    majority: 13333333333337
                }
            }
        };
    }
};
