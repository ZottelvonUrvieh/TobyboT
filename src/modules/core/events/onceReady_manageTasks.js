function run() {

}

module.exports = {
    configs: function () {
        this.eventFunctions = [];
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
