module.exports = {
    // TODO: Markdown support!
    // This does not care about Markdown! (yet) This will just rip the message in parts that are maximal 1990 chars long...
    sendLarge: async function (channel, text, maxMessageSendingLimit = 10) {
        let limit = 1990;
        let split = text.match(new RegExp(`.{1,${limit}}`, 'g'));
        if (split.length > maxMessageSendingLimit) return false;
        while (split.length) {
            await channel.send('hello #' + split.length);
            split.splice(0,1);
        }
        return true;
    }
};
