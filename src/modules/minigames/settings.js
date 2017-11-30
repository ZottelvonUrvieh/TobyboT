module.exports = {
    config: function () {
        return {
            name: 'Minigames Module',
            description: 'Some minigames - for example for Survivior!',
            tags: ['Games', 'Fun'],           // Some tags for the menu
            permissions: ['MANAGE_MESSAGES'],    // Permissions your module requires (eg. MANAGE_MESSAGES)
            debugMode: false,   // whether or not to show the debug messages in the console
            ownersOnly: false   // If true this module is unusable to anyone besides the configured owners
        };
    }
};
