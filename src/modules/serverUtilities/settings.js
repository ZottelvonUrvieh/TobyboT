module.exports = {
    config: function () {
        return {
            name: 'Server-Utilites',
            description: 'Adds some utilities for servers like channel logs, statistics, role management, etc.',
            categories: ['Utility'],           // Some categories for the help (not implemented yet)
            permissions: ['MANAGE_MESSAGES'],    // Permissions your module requires (eg. MANAGE_MESSAGES)
            debugMode: true,   // whether or not to show the debug messages in the console
            ownersOnly: false   // If true this module is unusable to anyone besides the configured owners
        };
    }
};
