const Discord = require('discord.js');

const populateLetterEmojis = () => {
    let emojis = '🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿'.split(' ');
    let abc = 'abcdefghijklmnopqrstuvwxyz';
    let letterEmojis = {};
    for (let i = 0; i < emojis.length; i++) {
        let emoji = emojis[i];
        letterEmojis[i] = emoji;
        letterEmojis[emoji] = i;
        letterEmojis[abc[i]] = emoji;
    }
    return letterEmojis;
};
// TODO: Implement!
module.exports = {
    letterEmojis: populateLetterEmojis(),
    numberEmojis: ['0⃣', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'],
    optionEmojis: {
        accept: '✅', accept2: '✔', accept3: '☑', deny: '❎', deny2: '✖', deny3: '❌', cancel: '🚫',
        up: '⏫', down: '⏬', left: '⏪', right: '⏩', play: '▶', stop: '⏹', pause: '⏸', playpause: '⏯',
        next: '⏭', previous: '⏮', random: '🔀', repeat: '🔁', repeatone: '🔂', eject: '⏏',
        reload: '🔄', reload2: '♻', thumbsup: '👍', thumbsdown: '👎',
        email: '📧', email2: '✉', plus: '➕', minus: '➖', save: '📥', save2: '💾', load: '📤', settings: '⚙'
    },
    /**
     * Creates a menu that you can execute callback functions depending on which option is chosen using reactions.
     * Times out after 180 seconds
     *
     * @param {Discord.Message} msg The message that
     * @param {String} title Will fill the 'Author.name' of the embed with this. (Looks better than 'title')
     * @param {any} description The description of the menu
     * @param {any} options This should have the structure:
     * [{text: 'Option one is this', function: functionToCallOnOptionOne, args: [funcArg1, funcArg2, ...]},
     *  {text: 'Option two is this', function: functionToCallOnOptionTwo, args: [funcArg1, funcArg2, ...]}, ...]
     * @param {any} [context=this]
     * @param {boolean} [onlyCmdAuthor=true]
     */
    optionMenu: class {
        constructor(context) {
            this.context = context,
            this.options = [];
            this.allowedIds;
            this.onEnd = {};
            this.collector = null;
            this.emb = new Discord.RichEmbed();
        }

        setTitle(title) { this.emb.setTitle(title); return this;}
        setDescription(description) { this.emb.setDescription(description); return this;}
        addAllowedIds(idArray) {
            if (idArray instanceof Array === false) idArray = [idArray];
            if (typeof this.allowedIds === 'undefined') this.allowedIds = [];
            this.allowedIds = this.allowedIds.concat(idArray); return this;
        }
        setAllowedIds(idArray) { this.allowedIds = idArray; return this; }
        addOption(text, func, args, emoji) {
            // Make overloading possible - so if args is a string it is meant to be the emoji
            args = (args instanceof Array === false) && !emoji && args instanceof String ? emoji = args : args;
            this.options.push({ text: text, func: func, args: args, emoji: emoji }); return this;
        }
        setOnEndFunction(func, args = []) { this.onEnd.func = func; this.onEnd.args = args; return this;}

        async send(channel) {
            let reactWith = [];
            // For each option that was added
            for (let i = 0; i < this.options.length; i++) {
                // Store the emoji for each option and get a default one if noone provided
                let emoji = this.options[i].emoji || this.context.bot.extensions.core.letterEmojis[i];
                if (emoji === '' || emoji === null || typeof emoji === 'undefined') continue;
                reactWith.push(emoji);
                // Add an inline field to the embed with the emoji as tile and the correct option text
                this.emb.addField(emoji, this.options[i].text, true);
            }
            // Send the embed to the channel
            let m = await channel.send(this.emb);
            // Collector to create events for when someone reacts with an emoji
            this.collector = m.createReactionCollector(
                // Only take the reactions into account that are in allowedIds - or all if allowedIds is not set
                (_, user) => (user.id !== this.context.bot.user.id) && (typeof this.allowedIds === 'undefined' || this.allowedIds.indexOf(user.id) !== -1),
                // The timeout for the Collector
                { time: 180000 }
            );
            // Every time someone allowed reacts with an emoji
            this.collector.on('collect', function (reaction) {
                // Get the correct option (out of the ones that were added) to the emoji that was reacted with
                // Either it was defined directly in the arguments -> then we can use .find
                // Or we have to find it in the letterEmoji object and get the index of the option that way
                let option = this.options.find(o => o.emoji === reaction.emoji.name)
                        || this.options[this.context.bot.extensions.core.letterEmojis[reaction.emoji.name]];
                if (!option) return;
                try {
                    // If we do have an option for the reaced emoji -> Call the function with its arguments
                    option.func.call(this.context, option.args);
                } catch (e) { this.context.error(e, 'Something went wrong in the callback function of the menu!');}
                // And remove all the reactions from the message but the ones from the bot -- can be skipped if not wanted
                // reaction.users.array().forEach(function (user) {
                //     if (user.id !== this.context.bot.user.id)
                //         reaction.remove(user);
                // }, this);
            // We bind 'this' so we have access to this.context very important for the callback!
            }.bind(this));
            this.collector.on('end', function (a, b, c) {

            });
            // collector.on('cleanup');

            // For each option let the bot react with the correct emoji
            while (reactWith.length) {
                let emoji = reactWith.splice(0, 1)[0];
                await m.react(emoji);
            }
        }
    }
};
