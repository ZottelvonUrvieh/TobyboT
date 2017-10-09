module.exports = {
    run: async function (message, args) {
        let command = args[0];
        let text = args.slice(1);
        if (command === 'create') {
            this.bot.dbManager.setGuildDataByKey(message.author, text[0], text.slice(1).join(' '));
            let m = await message.channel.send(`Alright! Your input was saved to ${text[0]} :ok_hand:`);
            m.delete(5000);
            return
        }
        let data = await this.bot.dbManager.getGuildDataByKey(message.author, command);
        if (!data) return;
        message.channel.send(data);
    },

    config: {
        name: 'Personal tags',
        cmd: 'ptag',
        alias: [],
        permissions: [],
        location: 'ALL',
        description: 'Make awesome personal tags!',
        // usage: `Create tags with: \`${this.bot.prefix}ptag create nameOfYourTag This is some cool text.\´\n` +
        //        `Show a tag with: \`${this.bot.prefix}ptag nameOfYourTag\``,
        debugMode: true
    }
};