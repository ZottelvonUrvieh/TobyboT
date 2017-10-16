function run(msg) {
    // pretty much the same as in the command section... so go read that if you haven't already...
    // only difference is that access to the eventObject is not 'this' but self
    // this accesses the actual EventEmitter - which in this case is the Discord Client object - named bot in this project
    let cmdMsgArgs = this.commandManager.parseMsgToCommand(msg);
    this.commandManager.runCommand(cmdMsgArgs);
}


module.exports = {
    inject: function () {
        self = this;
        this.bot.on('message', run);
    },
    eject: function () {
        this.bot.removeListener('message', run);
    },
    configs: function () {
        this.name = 'Command parsing & executing';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Executes commands when a message got received.';
        this.forceMode = 1; // 0: Do not force to delete messages, 1: Force deleting messages, 2: Force not deleting messages
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
    }
};
let self = null;
