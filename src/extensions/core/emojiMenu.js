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
    menu: class {
        constructor(context) {
            this.context = context;
            this.allowedIds;
            this.history = [];
            this.currentPrevious = [];
            this.currentNext = [];
            this.current = new context.bot.extensions.core.menuPage();
            this.collector = null;
            this.onEndDefault = {};
            return this;
        }
        newPage() {
            this.history.push(this.current);
            this.current = new this.context.bot.extensions.core.menuPage();
            return this;
        }
        previousPage(updateLastMenu = true, upadateEmojis = true) {
            if (this.history.length === 0) return this;
            this.current = this.history.pop();
            if (updateLastMenu) this.update(upadateEmojis);
            return this;
        }
        firstPage(updateLastMenu = true) {
            if (this.history.length === 0) return this;
            this.current = this.history[0];
            this.history = [];
            if (updateLastMenu) this.updateLast(updateLastMenu);
            return this;
        }
        update(upateEmojis = false) {
            this.collector.message.edit(this.current.emb);
            if (upateEmojis) return this.upateEmojis(); else return this;
        }
        async send(channel) {
            // Send the embed to the channel
            let m = await channel.send(this.current.emb);
            // Collector to create events for when someone reacts with an emoji
            //  Discord.ReactionCollector(m, (_, user) => (user.id !== this.context.bot.user.id) && (typeof this.current.allowedIds === 'undefined' || this.current.allowedIds.indexOf(user.id) !== -1), {time:180000});
            this.collector = new Discord.ReactionCollector(m,
                // Only take the reactions into account that are in allowedIds - or all if allowedIds is not set
                (_, user) => (user.id !== this.context.bot.user.id) && (typeof this.current.allowedIds === 'undefined' || this.current.allowedIds.indexOf(user.id) !== -1),
                // The timeout for the Collector
                { time: 180000 }
            );
            // TODO: Why do I have to set this here again? I have set it in the configs... but it somehow somewhere reset?
            this.context.bot.setMaxListeners(this.context.bot.configs.maxListeners);
            // Every time someone allowed reacts with an emoji
            this.collector.on('collect', function (reaction) {
                // Get the correct option (out of the ones that were added) to the emoji that was reacted with
                // Either it was defined directly in the arguments -> then we can use .find
                // Or we have to find it in the letterEmoji object and get the index of the option that way
                let option = this.current.options.find(o => o.emoji === reaction.emoji.name)
                    || this.current.options[this.context.bot.extensions.core.letterEmojis[reaction.emoji.name]];
                if (!option) return;
                try {
                    // If we do have an option for the reaced emoji -> Call the function with its arguments
                    option.func.apply(this.context, option.args);
                } catch (e) { this.context.error(e, 'Something went wrong in the callback function of the menu!'); }
                // And remove all the reactions from the message but the ones from the bot -- can be skipped if not wanted
                // This looks way nicer than just clear everything and then add the ones required
                // reaction.users.array().forEach(function (user) {
                //     if (user.id !== this.context.bot.user.id)
                //         reaction.remove(user);
                // }, this);
                // We bind 'this' so we have access to the context (cmd/module/event/task) very important for the callback!
            }.bind(this));
            this.collector.on('end', function () {
                this.message.clearReactions();
            });
            // collector.on('cleanup');
            await this.upateEmojis();
            return this;
        }
        async upateEmojis(resetEmojis = true) {
            let m = this.collector.message;
            if (resetEmojis) await m.clearReactions();
            // For each option let the bot react with the correct emoji
            for (let i = 0; i < this.current.reactWith.length; i++) {
                await m.react(this.current.reactWith[i]);
            }
            return this;
        }
        setTitle(title) { this.current.emb.setTitle(title); return this; }
        setDescription(description) { this.current.emb.setDescription(description); return this; }
        setColor(color) { this.current.emb.setColor(color); return this; }
        addAllowedIds(idArray) {
            if (idArray instanceof Array === false) idArray = [idArray];
            if (typeof this.allowedIds === 'undefined') this.allowedIds = [];
            this.allowedIds = this.allowedIds.concat(idArray); return this;
        }
        setAllowedIds(idArray) { this.allowedIds = idArray; return this; }
        addField(title, text, inline = false) { this.current.emb.addField(title, text, inline); return this; }
        setFooter(text, icon) { this.current.emb.setFooter(text, icon); return this; }
        addOption(title, text, emoji, func, ...args) {
            if (title instanceof Array) return this.addOption.apply(this, title);
            if (typeof emoji !== 'string') {
                args = [func, ...args];
                func = emoji;
                emoji = null;
            }
            // Store the emoji and get a default one if none was handed in
            emoji = emoji || this.context.bot.extensions.core.letterEmojis[this.current.reactWith.length];
            if (emoji === '' || emoji === null || typeof emoji === 'undefined') return this;
            if (emoji === 'none') emoji = '';
            else {
                this.current.options.push({title: title, text: text, func: func, args: args, emoji: emoji });
                this.current.reactWith.push(emoji);
                emoji += ' ';
            }
            // Add an inline field to the embed with the emoji as tile and the correct option text
            this.current.emb.addField(emoji + title, text);
            return this;
        }
        /**
         * This will NOT remove the collector or reactions of already sent menues!
         * This is only to be able to reuse the object for later usages!
         */
        resetOptions() { this.emb.fields = []; this.reactWith = []; this.optioins = []; return this; }
        setOnEndFunction(func, args = []) { this.onEnd.func = func; this.onEnd.args = args; return this; }
    },
    menuPage: class {
        constructor() {
            this.options = [];
            this.reactWith = [];
            this.emb = new Discord.RichEmbed();
            this.onEnd = {};
        }
    }
};
