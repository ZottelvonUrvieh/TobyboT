const populateLetterEmojis = () => {
    let emojis = '🇦 🇧 🇨 🇩 🇪 🇫 🇬 🇭 🇮 🇯 🇰 🇱 🇲 🇳 🇴 🇵 🇶 🇷 🇸 🇹 🇺 🇻 🇼 🇽 🇾 🇿'.split(' ');
    let abc = 'abcdefghijklmnopqrstuvwxyz';
    let letterEmojis = {};
    // Why all this? Well because it is pretty nice to use now...
    // Now letterEmojis.a === 🇦, letterEmojis[0] === 🇦 and letterEmojis.🇦 = a (or rather letterEmojis['🇦'])
    // So you can easily convert between letters and emojis and use emojis instead of numbers (for options for example)
    for (let i = 0; i < emojis.length; i++) {
        letterEmojis[i] = emojis[i];
        letterEmojis[emojis[i]] = i;
        letterEmojis[abc[i]] = emojis[i];
    }
    return letterEmojis;
};

module.exports = {
    letterEmojis: populateLetterEmojis(),
    punctuationEmojis: { '!': '❗', '!2': '❕', '?': '❓', '?2': '❔', '!!': '‼', '!?': '⁉' },
    numberEmojis: ['0⃣', '1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'],
    optionEmojis: {
        accept: '✅', accept2: '✔', accept3: '☑', deny: '❎', deny2: '✖', deny3: '❌', cancel: '🚫',
        up: '⏫', down: '⏬', left: '⏪', right: '⏩', play: '▶', stop: '⏹', pause: '⏸', playPause: '⏯',
        next: '⏭', previous: '⏮', random: '🔀', repeat: '🔁', repeatOne: '🔂', eject: '⏏',
        reload: '🔄', reload2: '♻', thumbsup: '👍', thumbsdown: '👎',
        email: '📧', email2: '✉', plus: '➕', minus: '➖', save: '📥', save2: '💾', load: '📤', settings: '⚙'
    }
};
