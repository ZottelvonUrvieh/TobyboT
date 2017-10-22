function run(msg) {
    if (msg.author.id === this.user.id && self.forceMode !== 2 && self.botMsgTime > 0)
        return msg.delete(self.botMsgTime);
    if (msg.author.bot) return;
    let cmdMsgArgs = this.componentManager.parseMsgToCommand(msg);
    if (!cmdMsgArgs) return;
    if (self.forceMode === 1)
        return msg.delete(self.userCmdTime);
    if (self.forceMode === 0 && cmdMsgArgs.cmd.autoDelete && cmdMsgArgs.cmd.autoDelete > 0)
        return msg.delete(cmdMsgArgs.cmd.autoDelete);
}


module.exports = {
    configs: function () {
        this.eventFunctions = [
            { object: this.bot, trigger: 'on', event: 'message', function: run }
        ];
        this.name = 'Auto Command & Botmessage cleanup';
        this.permissions = [];
        this.location = 'ALL';
        this.description = 'Automatically removes Commands and Bot messages after set time';
        this.botMsgTime = 1800000;
        this.userCmdTime = 30000;
        this.forceMode = 0; // 0: Do not force to delete messages, 1: Force deleting messages, 2: Force not deleting messages
        this.debugMode = true;
        this.category = 'Debug';
        this.tags = ['Core', 'Debugging'];
        self = this;
    }
};
let self = null;
