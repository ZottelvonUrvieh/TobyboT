function run(msg) {
    let cmdMsgArgs = this.componentManager.parseMsgToCommand(msg);
    this.componentManager.runCommand(cmdMsgArgs);
}

module.exports = {
    configs: function () {
        this.eventFunctions = [
            { object: this.bot, trigger: 'on', event: 'message', function: run}
        ];
        this.name = 'Command parsing & executing';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Executes commands when a message got received.';
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
    }
};
