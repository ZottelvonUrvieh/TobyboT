function run() {
    setInterval(() => self.bot.taskManager.emit('repeat'), self.bot.configs.timeout, );
}

module.exports = {
    configs: function () {
        this.eventFunctions = [{ object: this.bot, trigger:'once', event: 'ready', function: run }];
        this.name = 'Taskmanager';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Manages the execution of repeated functions.';
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
        self = this;
    }
};
let self = null;
