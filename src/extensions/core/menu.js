const Discord = require('discord.js');
module.exports = {
    Menu: class {
        constructor(component, pageSize = 6, inline = false) {
            // Handle 'overloading' - if it is called like new Menu(this, true)
            if (typeof pageSize === 'boolean' && !inline) pageSize = 6;
            this.component = component;
            this.msg;
            // Whitelist of who can interact with the menu - if empty everyone
            this.allowed_ids = [];
            // This contains all the parents - so it is also our history
            this.current = new Category('root', pageSize, false, inline, null);
            // Here to give options to change to number or letters as option indicator
            this.el = component.bot.extensions.core.letterEmojis;
            this.en = component.bot.extensions.core.numberEmojis;
            this.eo = component.bot.extensions.core.optionEmojis;
            // Standard indication of options is with numbers.
            // Be aware that that means it only can handle 10 options per page!
            this.emojis = {
                up: this.eo.up,
                next: this.eo.next,
                previous: this.eo.previous,
                // slice to have it start with 1 instead of 0
                options: this.en.slice(1)
            };
            return this;
        }

        useNumbersAsIndicators() { this.emojis.options = this.en.slice(1); return this; } // Sliced to start with '1'
        useLettersAsIndicators() { this.emojis.options = this.el; return this; }
        // Lets you move on
        setEmojis(emojiProperty) { this.emojis[emojiProperty] = this.el; return this; }
        newCategory(id, pageSize = this.current.pageSize, inheritEmbSettings = true, inline = this.current.inline,) {
            this.current.collectors.forEach(col => col.stop());
            this.current = new Category(id, pageSize, inheritEmbSettings, inline, this.current);
            return this;
        }
        setAuthor(author) { this.current.tmp_emb.setAuthor(author); return this; }
        setTitle(title) { this.current.tmp_emb.setTitle(title); return this; }
        setDescription(description) { this.current.tmp_emb.setDescription(description); return this; }
        setColor(color) { this.current.tmp_emb.setColor(color); return this; }
        setFooter(footer) { this.current.tmp_emb.setFooter(footer); return this; }
        setTimestamp(timestamp) { this.current.tmp_emb.setTimestamp(timestamp); return this; }

        /**
         * @description Sets a function with arguments that will be executed when leaving the Category (on newCategory() or up())
         * @param {object} obj The object to execute the function on
         * @param {function} func The function to trigger
         * @param {Array} args Array of arguments
         * @returns {Menu} this
         */
        setOnLeaveCategoryFunction(obj, func, ...args) {
            this.current.onLeave.func = func;
            this.current.onLeave.obj = obj;
            this.current.onLeave.args = args;
            return this;
        }
        /**
         * @description Go one category upwards or provide an id where to go up to
         * @param {String} id
         * @returns  this
         */
        up(id, isDeletingThatCategory=false) {
            // If an id was provided and we have arrived at our desired category.
            if (id === this.current.id) {
                if (isDeletingThatCategory === true) {
                    return this.up();
                }
                return this;
            }
            // Execute the leaveCategory function for this Category if one is defined
            if (this.current.onLeave.func)
                this.current.onLeave.func.apply(this.current.onLeave.obj, this.current.onLeave.args);
            // Terminate all collectors that were open for this Category
            // TODO: Maybe change that? Like disable them but store what they did and enable them again on reentering this category?
            this.current.collectors.forEach(col => col.stop());
            // If no id provided just go to the previous category
            if (typeof id === 'undefined' || this.current.parent === null) {
                if (this.current.parent === null) return this;
                this.current = this.current.parent;
                return this;
            }
            // Else go one category up and check again
            this.current = this.current.parent;
            return this.up(id, isDeletingThatCategory);
        }
        previousPage() {
            if (this.current.index > 0) this.current.index--; return this;
        }
        nextPage() {
            if (this.current.options.length - 1 > this.current.index)
                this.current.index++;
            return this;
        }
        // Adds an option with a callback and arguments to the menu
        addOption(title, description, func, ...args) {
            let cur_options = this.current.options;
            let add_index = this.current.pages - 1;
            // If current page full create a new one
            if (cur_options[add_index].length + 1 > this.current.pageSize) {
                cur_options.push([]);
                add_index++;
                this.current.pages++;
            }
            // Add the option to the paged options
            this.current.options[add_index].push({
                title: title, description: description,
                emoji: this.emojis.options[cur_options[add_index].length],
                func: func, args: args
            });
            // Always have the 'up' reaction and all the reactions for the options
            this.current.reactions[add_index] = new Set([this.emojis.up, ...cur_options[add_index].map(op => op.emoji)]);
            // If we are not page one add the 'previous' and 'next' reaction for the correct pages
            if (add_index !== 0) {
                this.current.reactions[add_index].add(this.emojis.previous);
                // If we have more than one page and are not on the last one, add the 'next' reaction to the previous
                this.current.reactions[add_index - 1].add(this.emojis.next);
            }
            // For testing, because adding and removing reactions is so slow lets have the next and previous always
            // be present at the end instead of this
            // this.current.reactions[add_index].add(this.emojis.previous);
            // this.current.reactions[add_index].add(this.emojis.next);

            return this;
        }

        addMessageReactionHandler(filter, options, obj, func, ...args) {
            let collector = this.msg.channel.createMessageCollector(filter, options);
            collector.on('collect', async function (reactMsg) {
                await func.call(obj, reactMsg, collector, ...args);
            });
            this.current.collectors.push(collector);
            return this;
        }
        // Can be handed either one id or an array of ids that will be allowed to interact with the menu
        addAllowedIds(idArray) {
            if (idArray instanceof Array === false) idArray = [idArray];
            this.allowed_ids = this.allowed_ids.concat(idArray);
            return this;
        }

        async send(channel) {
            this.msg = await channel.send(this.current.emb);
            this.updateReactions();
            this.reactionHandling();
            return this;
        }
        // Currently only appends options emojis and moves the next / previous page emoji to make it faster
        async updateReactions() {
            // Nothing to do everything is good
            if (this.msg.reactions.array().length >= this.current.reactions[this.current.index].length)
                return;
            // Remove next and previous
            let next = this.msg.reactions.get(this.emojis.next);
            let previous = this.msg.reactions.get(this.emojis.previous);
            if (next) {
                for (let user of next.users.array()) {
                    await next.remove(user);
                }
            }
            if (previous) {
                for (let user of previous.users.array()) {
                    await previous.remove(user);
                }
            }
            // Add all emojis that are still missing
            let currentReacts = this.msg.reactions.array().map(reac => reac.emoji.name);
            for (let emo of this.current.reactions[this.current.index]) {
                if (currentReacts.indexOf(emo) === -1)
                    await this.msg.react(emo);
            }
            return this;
        }

        // Updates the message with the current options & embed settings
        async update(updateReactions = true) {
            this.msg = await this.msg.edit(this.current.emb);
            if (updateReactions) this.updateReactions();
            return this;
        }

        async reactionHandling() {
            // Collector to create events for when someone reacts with an emoji
            //  Discord.ReactionCollector(m, (_, user) => (user.id !== this.component.bot.user.id) && (typeof this.current.allowedIds === 'undefined' || this.current.allowedIds.indexOf(user.id) !== -1), {time:180000});
            this.collector = new Discord.ReactionCollector(this.msg,
                // Only take the reactions into account that are in allowedIds - or all if allowedIds is not set - owners are always allowed
                (_, user) => (user.id !== this.component.bot.user.id) && (typeof this.allowed_ids === [] || [...this.allowed_ids, ...this.component.bot.configs.owners].indexOf(user.id) !== -1),
                // The timeout for the Collector
                { time: 180000 }
            );
            // TODO: Why do I have to set this here again? I have set it in the configs... but it somehow somewhere reset?
            this.component.bot.setMaxListeners(this.component.bot.configs.maxListeners);

            // Every time someone whoms id is in the allowed_ids reacts, this is triggered
            this.collector.on('collect', function (reaction) {
                // Remove the added reaction/s (leave the reaction of the bot)
                reaction.users.array().forEach(function (user) {
                    if (user.id !== this.msg.author.id) reaction.remove(user);
                }, this);

                let emoji = reaction.emoji.name;
                // If it was a navigation... navigate!
                if (emoji === this.emojis.next)
                    return this.nextPage().update();
                if (emoji === this.emojis.previous)
                    return this.previousPage().update();
                if (emoji === this.emojis.up) {
                    this.up().update();
                    return this;
                }
                // Get the correct option from the emoji reacted with
                let option = this.current.options[this.current.index].find(opt => opt.emoji === emoji);
                if (!option) return;
                try {
                    // If we do have an option for the reacted emoji -> Call the function with its arguments
                    option.func.apply(this.component, option.args);
                } catch (e) { this.component.error(e, 'Something went wrong in the callback function of the menu!'); }
                // We bind 'this' so we have access to the component (cmd/module/event/task) very important for the callback!
            }.bind(this));
            this.collector.on('end', function () {
                this.setAuthor('The menu timed out!')
                    .setFooter('The menu timed out! Everything you did was saved so if you want to continue just run the Mafia-Menu command again.')
                    .update(false);
                this.msg.clearReactions();
            }.bind(this));
        }
    }
};
class Category {
    constructor(id, pageSize, inheritEmbSettings, inline, parent) {
        // Give a id to the category to be able to identify it later
        this.id = id || '';
        // Allow options side by side if they are small enough?
        this.inline = inline;
        // How many options should be listed per page?
        this.pageSize = pageSize;
        // Current index of page
        this.index = 0;
        // Page counter
        this.pages = 1;
        // When set it has the structure: {obj:any, function: ()=>{}:any, args:[]}
        // The function gets executed when the Category is left (on Menu.newCategory() or Menu.up())
        this.onLeave = {};
        // Array of potential collectors for Message reactions
        this.collectors = [];

        // Create a new embed - and if wished to inherit settings from parent do so
        // TODO: Which settings do we want to inherit exactly?
        this.tmp_emb = new Discord.RichEmbed();
        if (inheritEmbSettings) {
            this.tmp_emb.color = parent.tmp_emb.color;
            this.tmp_emb.footer = parent.tmp_emb.footer;
            this.tmp_emb.timestamp = parent.tmp_emb.timestamp;
            this.tmp_emb.thumbnail = parent.tmp_emb.thumbnail;
            this.tmp_emb.url = parent.tmp_emb.url;
        }
        this.parent = parent;
        // Paged options
        this.options = [[]];
        // Paged reactions for selecting the options
        this.reactions = [new Set()];
    }
    get emb() {
        this.tmp_emb.fields = [];
        this.options[this.index].forEach(function(option) {
            this.tmp_emb.addField(option.emoji + ' ' + option.title, option.description, this.inline);
        }, this);
        return this.tmp_emb;
    }
}
