function run() {
    this.log('Setting maxListeners to 200');
    this.setMaxListeners(300);

}

module.exports = {
    configs: function () {
        this.eventFunctions = [{ object: this.bot, trigger:'once', event: 'ready', function: run }];
        this.name = 'Command parsing & executing';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Executes commands when a message got received.';
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
    }
};
let self = null;
