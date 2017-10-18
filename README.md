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
    - [x] MongoDB implementation
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
    - [ ] Discord Events
    - [ ] Event System for timed / repeated tasks
- [x] **ErrorHandler**
    - [x] Integrated into the Core Module through events
- [ ] **Configuration manager**
  - [x] Initial config with prefix, bot-token, owners, etc
  - [x] Commands for:
    - [x] Prefix changeing
    - [x] Adding / Removing owners
    - [x] Default permissions
    - [x] General command to update any config that is in the file
  - [ ] Persist config better than currently handled
- [ ] **ModuleManager**
  - [x] Reloading Modules
  - [x] Flexible Permission loading / unloading
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

### **Modules:**
- **Core:**
  - [x] Dynamic generated help for:
      - [x] Bot in general
      - [x] Modules
      - [x] Commands
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
  - [ ] Do I want to have them split up?
  - [x] Ping
  - [x] Tags (mostly to test DB)
    - [x] Personal Tags
    - [x] Guildwide Tags
- **Logging:**
  - [ ] Make a TODO list
- **Mafia:**
  - [ ] Make a TODO list
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
    - [ ] ...
