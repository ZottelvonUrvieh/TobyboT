exports.run = async (message) => {
   message.channel.send(':thinking: Ping').then(msg => {
        msg.edit(`:stopwatch: Pong! \`${msg.createdTimestamp - message.createdTimestamp}ms\``)
            .then(m => m.delete(5000));
    }); 
};