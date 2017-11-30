module.exports = {
    config: function () {
        return {
            name: 'The Core of the bot',
            description: 'This is the minimum required to operate the bot.',
            tags: ['core'],           // Some tags for the menu
            permissions: ['MANAGE_MESSAGES'],    // Permissions your module requires (eg. MANAGE_MESSAGES)
            debugMode: false,   // weather or not to show the debug messages in the console
            ownersOnly: false   // If true this module is unusable to anyone besides the configured owners
        };
    }
};
