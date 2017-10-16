function run(msg) {
    // pretty much the same as in the command section... so go read that if you haven't already...
    // only difference is that access to the eventObject is not 'this' but self
    // this accesses the actual EventEmitter - which in this case is the Discord Client object - named bot in this project
    let cmdMsgArgs = this.commandManager.parseMsgToCommand(msg);
    if (msg.author.id === this.user.id && self.forceMode !== 2 && self.botMsgTime > 0)
        return msg.delete(self.botMsgTime);
    if (!cmdMsgArgs) return;
    if (self.forceMode === 1)
        return msg.delete(self.userCmdTime);
    if (self.forceMode === 0 && cmdMsgArgs.cmd.autoDelete && cmdMsgArgs.cmd.autoDelete > 0)
        return msg.delete(cmdMsgArgs.cmd.autoDelete);
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
        this.name = 'Auto Command & Botmessage cleanup';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Automatically removes Commands and Bot messages after set time';
        this.botMsgTime = 30000;
        this.userCmdTime = 10000;
        this.forceMode = 1; // 0: Do not force to delete messages, 1: Force deleting messages, 2: Force not deleting messages
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
    }
};
let self = null;
