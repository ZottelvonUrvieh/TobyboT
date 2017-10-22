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
     * @param {any} [component=this]
     * @param {boolean} [onlyCmdAuthor=true]
     */
    menu: class {
        constructor(component, pageSize = 5) {
            this.lastEmojis = [];
            this.component = component;
            this.pageSize = pageSize;
            this.allowedIds;
            this.history = [];
            this.current = new component.bot.extensions.core.menuCategory(component.bot );
            this.collector = null;
            this.onEndDefault;
            return this;
        }
        newCategory() {
            this.lastEmojis = this.current.reactWith;
            this.history.push(this.current);
            this.current = new this.component.bot.extensions.core.menuCategory(this.component.bot);
            return this;
        }
        previousCategory() {
            this.lastEmojis = this.current.reactWith;
            if (this.history.length === 0) return this; // TODO: Here could be cleanup / reactioncontain.end
            this.current = this.history.pop();
            return this;
        }
        previousPage() {
            this.lastEmojis = this.current.reactWith;
            if (this.current.index > 0) this.current.index--; return this;
        }
        nextPage() {
            this.lastEmojis = this.current.reactWith;
            if (this.current.options.length > this.current.pageSize * (this.current.index + 1))
                this.current.index++;
            return this;
        }

        update() {
            this.collector.message.edit(this.current.emb);
            this.upateEmojis();
            return this;
        }

        setTitle(title) { this.current.tmp_emb.setTitle(title); return this; }
        setDescription(description) { this.current.tmp_emb.setDescription(description); return this; }
        setColor(color) { this.current.tmp_emb.setColor(color); return this; }

        setAllowedIds(idArray) { this.allowedIds = idArray; return this; }
        addAllowedIds(idArray) {
            if (idArray instanceof Array === false) idArray = [idArray];
            if (typeof this.allowedIds === 'undefined') this.allowedIds = [];
            this.allowedIds = this.allowedIds.concat(idArray); return this;
        }
        setOnEndFunction(func, ...args) { this.current.onEnd.func = func; this.current.onEnd.args = args; return this; }
        setOnEndDefaultFunction(func, ...args) { this.onEnd.func = func; this.onEnd.args = args; return this; }
        async send(channel) {
            // Send the embed to the channel
            let m = await channel.send(this.current.emb);
            // Collector to create events for when someone reacts with an emoji
            //  Discord.ReactionCollector(m, (_, user) => (user.id !== this.component.bot.user.id) && (typeof this.current.allowedIds === 'undefined' || this.current.allowedIds.indexOf(user.id) !== -1), {time:180000});
            this.collector = new Discord.ReactionCollector(m,
                // Only take the reactions into account that are in allowedIds - or all if allowedIds is not set
                (_, user) => (user.id !== this.component.bot.user.id) && (typeof this.current.allowedIds === 'undefined' || this.current.allowedIds.indexOf(user.id) !== -1),
                // The timeout for the Collector
                { time: 180000 }
            );
            // TODO: Why do I have to set this here again? I have set it in the configs... but it somehow somewhere reset?
            this.component.bot.setMaxListeners(this.component.bot.configs.maxListeners);
            // Every time someone allowed reacts with an emoji
            this.collector.on('collect', function (reaction) {
                reaction.users.array().forEach(function(user) {
                    if (user.id !== reaction.message.author.id) reaction.remove(user);
                }, this);
                let emoji = reaction.emoji.name;

                // If it was a navigation... navigate!
                if (emoji === this.current.navEmojis.next)
                    return this.nextPage().update();
                if (emoji === this.current.navEmojis.previous)
                    return this.previousPage().update();
                if (emoji === this.current.navEmojis.up)
                    return this.previousCategory().update();

                // Get the correct option (out of the ones that were added) to the emoji that was reacted with
                // Either it was defined directly in the arguments -> then we can use .find
                // Or we have to find it in the letterEmoji object and get the index of the option that way
                let option = this.current.options.find(o => o.emoji === emoji)
                        || this.current.options[this.component.bot.extensions.core.letterEmojis[emoji]];
                if (!option) return;
                try {
                    // If we do have an option for the reaced emoji -> Call the function with its arguments
                    option.func.apply(this.component, option.args);
                } catch (e) { this.component.error(e, 'Something went wrong in the callback function of the menu!'); }
                // We bind 'this' so we have access to the component (cmd/module/event/task) very important for the callback!
            }.bind(this));
            this.collector.on('end', function () {
                this.collector.message.clearReactions();
                if (this.current.onEnd) this.current.onEnd.apply(this.component, this.current.onEnd.args);
                else if (this.onEndDefault) this.onEndDefault.apply(this.component, this.onEndDefault.args);
            }.bind(this));
            await this.upateEmojis();
            return this;
        }
        async upateEmojis() {
            let addreact = this.current.reactWith.filter(function (e) { return this.lastEmojis.indexOf(e) < 0; }.bind(this));
            let subreact = this.lastEmojis.filter(function (e) { return this.current.reactWith.indexOf(e) < 0; }.bind(this));
            if (addreact.length > 0) {
                subreact.unshift(this.current.navEmojis.next);
                subreact.unshift(this.current.navEmojis.previous);
                if (this.current.reactWith.indexOf(this.current.navEmojis.previous) > 0)
                    addreact.push(this.current.navEmojis.previous);
                if (this.current.reactWith.indexOf(this.current.navEmojis.next) > 0)
                    addreact.push(this.current.navEmojis.next);
            }
            let m = this.collector.message;
            if (subreact.length > 0) {
                let removeReacts = m.reactions.array().filter(reaction => subreact.indexOf(reaction.emoji.name) > -1);
                for (let iReact = removeReacts.length-1; iReact > -1; iReact--) {
                    let users = removeReacts[iReact].users.array();
                    for (let iUser = 0; iUser < users.length; iUser++) {
                        await removeReacts[iReact].remove(users[iUser]);
                    }
                }
            }
            for (let i = 0; i < addreact.length; i++) {
                await m.react(addreact[i]);
            }
            return this;
        }
        // addField(title, text, inline = false) { this.current.tmp_emb.addField(title, text, inline); return this; }
        setFooter(text, icon) { this.current.tmp_emb.setFooter(text, icon); return this; }
        addOption(title, text, emoji, func, ...args) {
            if (title instanceof Array) return this.addOption.apply(this, title);
            if (typeof emoji !== 'string') {
                args = [func, ...args];
                func = emoji;
                emoji = null;
            }
            this.current.options.push({title: title, text: text, func: func, args: args, emoji: emoji });
            return this;
        }
    },
    menuCategory: class {
        constructor(bot, pageSize = 5) {
            this.bot = bot;
            this.pageSize = pageSize;
            this.index = 0;
            this.options = [];
            this.reactWith = [];
            this.navEmojis = { previous: '⏪', next: '⏩', up: '⏫'};
            this.tmp_emb = new Discord.RichEmbed();
            this.onEnd = null;
        }
        get emb() {
            this.tmp_emb.fields = [];
            this.reactWith = [];
            let max = Math.min(this.pageSize * (this.index + 1), this.options.length);
            for (let i = this.index * this.pageSize; i < max; i++) {
                let op = this.options[i];
                // Store the emoji and get a default one if none was handed in
                let emoji = op.emoji || this.bot.extensions.core.letterEmojis[this.reactWith.length];
                if (emoji === '' || emoji === null || typeof emoji === 'undefined') return this;
                if (emoji === 'none') emoji = '';
                this.tmp_emb.addField(emoji && emoji !== '' ? emoji + ' ' + op.title : op.title, op.text);
                if (emoji !== '') this.reactWith.push(emoji);
            }
            // Add the emojis to navigate depending on which are required
            this.addNavReactions();
            return this.tmp_emb;
        }
        addNavReactions() {
            if (this.reactWith.indexOf(this.navEmojis.up) < 0) this.reactWith.unshift(this.navEmojis.up);
            if (this.index > 0 && this.reactWith.indexOf(this.navEmojis.previous) < 0)
                this.reactWith.push(this.navEmojis.previous);
            if (this.options.length > this.pageSize * (this.index + 1) && this.reactWith.indexOf(this.navEmojis.next) < 0)
                this.reactWith.push(this.navEmojis.next);
            return this.reactWith;
        }
    }
};
