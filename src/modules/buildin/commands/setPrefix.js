module.exports = {
    run: async function (message, args){
        const m = await message.channel.send(`Setting the prefix to \`${args[0]}\``);        
        let success = this.bot.configManager.setPrefix(args[0]);
        if (success === true) await m.edit(`Prefix successfully set to \`${args[0]}\`!`);
        else await m.edit(`Was not able to successfully set Prefix to \`${args[0]}\``);
        m.delete(5000);
    },

    config: {
        name: 'Set Prefix',
        cmd: 'setPrefix',
        alias: [],
        permissions: [], 
        location: 'ALL',
        description: 'Description of the command',
        debugMode: true 
    }
};