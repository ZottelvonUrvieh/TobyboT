module.exports = {
    run: async function (message, args) {
        let command = args[0];
        let text = args.slice(1);
        if (command === 'create') {
            this.bot.dbManager.setGuildDataByKey(message.guild, text[0], text.slice(1).join(' '));
            let m = await message.channel.send(`Alright! Your input was saved to ${text[0]} :ok_hand:`);
            m.delete(5000);
            return
        }
        let data = await this.bot.dbManager.getGuildDataByKey(message.guild, command);
        if (!data) return;
        message.channel.send(data);
    },

    config: {
        name: 'Guildwide tags',
        cmd: 'tag',
        alias: [],
        permissions: [],
        location: 'GUILD',
        description: 'Make awesome guild tags!',
        // usage: `Create tags with: \`${this.bot.prefix}tag create nameOfYourTag This is some cool text.\´\n` +
            //    `Show a tag with: \`${this.bot.prefix}tag nameOfYourTag\``,
        debugMode: true
    }
};