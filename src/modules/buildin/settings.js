module.exports = {
    config: function () {
        return {
            name: 'Buildin',
            description: 'Description of the Module',
            permissions: ['VIEW_CHANNEL', 'SEND_MESSAGES'], // Permissions your module requires (eg. MANAGE_MESSAGES)
            debug: true // This makes it unusable to anyone besides the configured owners
        };
    }
}
