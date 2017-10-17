function run(msg) {
    let cmdMsgArgs = this.componentManager.parseMsgToCommand(msg);
    this.componentManager.runCommand(cmdMsgArgs);
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
        this.description = 'This will be executed everytime the ';
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
    }
};
let self = null;
