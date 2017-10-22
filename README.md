# **TobyboT**
## **Some quick disclaimers:**
> This is a Discord bot that I purely created for my own entertainment - for learning and fun.

> This project is based on [Voidbot](https://github.com/abyssvi/Voidbot) from [Abyss](https://github.com/abyssvi).
A lot of ideas, folder structure of the project and even some code is taken from there.
But I started completely fresh and rewrote everything from scratch so that is why it is not a fork...<br>
*For example how the commands are structured, how some of the different Managers/Handlers are intended to work, etc...*

> I honestly don't know if this bot works on Windows **at all** - never tested there
---

## **General Idea was to create a Bot skeletton that is:**
- Easy to use
- Extendable through Modules
- Easy to develop Modules for
- Multi purpose with Commands, Events and periodic Tasks
- Flexible with reloading Modules / Commands etc

## **TODOS:**
- [x] **DBManager**
  - [x] Interface
    - [x] Get an idea of a structure that I like
    - [x] Check for correct stucture of implemented Methods
  - [ ] Implementation
    - [ ] MongoDB implementation
      - [ ] Make it possible to use querries
      - [x] Creating Tables
      - [x] Inserting Documents
      - [x] deleteTable / setTableRows
      - [x] Move config to file so noone can use the DB access :) (now also in config.cfg)
    - [ ] LowDB implementation as fallback
- [x] **Logging**
  - [x] Different console log/debug/warnings/errors for:
    - [x] CoreBot
    - [x] Module
    - [x] Command
    - [x] Discord Events
    - [ ] Event System for timed / repeated tasks
- [x] **ErrorHandler**
    - [x] Integrated into the Core Module through events
- [ ] **Configuration manager**
  - [x] Initial config with prefix, bot-token, owners, etc
  - [x] Commands for:
    - [x] Prefix changeing
    - [x] Adding / Removing owners
    - [x] Default permissions
    - [x] General function to update any config that is in the file
    - [ ] Make a command that accepts two arguments to use that general function
  - [ ] Persist config better than currently handled (Is that neccessary?)
- [ ] **ModuleManager**
  - [x] Reloading Modules
  - [x] Flexible Permission loading / unloading
  - [ ] Code cleaning
- [ ] **ComponentManager**
  - [x] Parsing Message into Command / Args
  - [x] Checking for several things before Command execution:
    - [x] From bot?
    - [x] Valid Command?
    - [x] OwnersOnly Mode for this Command / Module enabled? Owner?
    - [x] Channel location correct?
  - [x] Possility to enable showCommandUsage on returning Error
  - [x] Reloading Commands
  - [x] Flexible Permission loading / unloading
  - [x] Manage duplicate cmd's / aliases
  - [ ] Code cleaning
  - [ ] Run command from Help?

### **Modules/Extensions:**
- **Core:**
  - [x] Dynamic generated help for:
      - [x] Bot in general
      - [x] Modules
      - [x] Commands
      - [ ] Make it automatically page when too much options
  - [x] Prefix changeing
  - [x] Reloading
      - [x] Commands
      - [x] Modules
      - [x] Events
        - [x] On Discord login
        - [x] On Module load
        - [x] On Module unload
        - [x] On Message received (tiwce actually - one for command handling one for automated deletion of messages)
        - [ ] On Discord disconnect ~~does not fire somehow...~~
- **Core Additions:**
  - [x] Do I want to have them split up?
  - [x] Ping
  - [x] Tags (mostly to test DB)
    - [x] Personal Tags
    - [x] Guildwide Tags
- **Logging:**
  - [ ] Make a TODO list
- **Mafia:**
  - Manage / set up your games:
    - [ ] New game
    - [ ] List your games (and maybe list games you are mod in?)
      - [ ] Select current game (all written commands will then be applied to that game when outside of a game channel or two games are going on in one channel)
      - [ ] Delete a game
    - [ ] Set game channel (the main chat channel)
    - [ ] Set mafia channel
    - [ ] Add/Remove/List Mods to the game
    - [ ] Setting roles
  - Functions for during the game:
    - [ ] Votes
      - [ ] Vote + Majority + Lynch + Channel-locking
      - [ ] Votecount
      - [ ] Day/Night timer + Channel-locking
      - [ ] Timeleft
      - [ ] Message Edits
    - Prodtimers-Tracking:
      - [ ] Command for listing all prodtimers for mods
      - [ ] Command for setting the prodtimer of someone to x
      - [ ] Message to mods on time up
      - [ ] Rresetting timers on daystarts and message sent
      - [ ] Tracking of PlayerRole to add/remove Prodtimers on player replacements
  - Personal Ideas / random thoughts:
    - [ ] Game-Pause/Resume Command
    - [ ] Preposting of daystart message - if done the bot will automatically send it out and start the day when the time is up ~ How to handle wills tho? If they would be updated till then... or someone changes their nightaction...
    - [ ] Resending of original message content on message edits
    - Notifications:
      - DM bot you want to get notified if someone gets voted on (all, or specified persons)
      - Specify you want to get notified x amount of time before your prodtimer runs out
      - Specify you want to get notified x amount of time before the day / night ends
      - [ ] Menu for sending out Night results
      - [ ] Whispers send to the bot in DM and depending on the settings of them they will be handled differently:
      - [ ] Acknowlegement through mod - after they will be forwarded
      - [ ] Forwarding to Spectator-Chat
      - [ ] Forwarding to Game-Chat 'X Messaged Y'
      - [ ] Forwarding to possible Power Roles
    - [ ] Setting up game types (role lists) and auto-rolling
    - [ ] Assigning Persons their roles (only bot intern - not Discord-Roles)
    - [ ] Showing results and / or sending out rolecards with or without notifying mods who is who
    - [ ] DMing Mafia / Other Roles the invites of other Servers
    - [ ] Sending Bot wills -> Auto messages on daystart / lynches
    - [ ] Sending Bot nightactions -> Auto night resolving / Suggesting of night results / Full game automation
    - [ ] Night-skip voting
- **Scores:**
  - [ ] Make a TODO list
- **Moderation:**
  - [ ] Make a TODO list
- **Utilities:**
  - **Commands:**
    - [ ] Timezones
      - [ ] Register own timezone
      - [ ] Show time for other people
  - **Pure Utility for other Modules:**
    - [ ] Send multiple messages without killing formating
    - [x] Menu Extension for easy to create and consistent menus throught the whole bot
    - [ ] ...
