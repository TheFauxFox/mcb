# Minecraft Console Bot
A small terminal based chat client and bot for Minecraft, written in TypeScript.

Used Libraries:
 * [chjj/blessed](https://www.npmjs.com/package/blessed) for a beautiful interface
 * [PrismarineJS/mineflayer](https://www.npmjs.com/package/mineflayer) for a near-seamless Minecraft interface
 * [nodeca/argparse](https://www.npmjs.com/package/argparse) for easy command line parsing
 * [BinaryMuse/toml](https://www.npmjs.com/package/toml) for the bot's config file
 * [yao-pkg/pkg](https://www.npmjs.com/package/@yao-pkg/pkg) to bundle the Node runtime into a single file application
  
# Usage
Download the latest release from [here](https://github.com/TheFauxFox/mcb/releases)  
Place the downloaded file into it's own folder  
Running the file for the first time will create [`bot.toml`](https://github.com/TheFauxFox/mcb/blob/master/bot.example.toml) in the folder  
Change the `email`, `password`, and `server` in the config to allow it to connect to the server  

### Bot Owner
Inside the `bot.toml` file, you're able to assign a `botOwner` (refer to the [example config](https://github.com/TheFauxFox/mcb/blob/master/bot.example.toml))  
You may list as many owners as you'd like, however the username/display name is CaSe SeNsItIvE  
The provided message format is the Essentials default format, change this if your server uses a different format  

### Run On Join
Inside the `bot.toml` file, you're able to enable `runOnJoin` (refer to the [example config](https://github.com/TheFauxFox/mcb/blob/master/bot.example.toml))  
This allows you to run commands as soon as the bot joins the server  
You may also specify a list of command to run after a specified delay, a randomized delay, or no delay if you do not specify `delay` or `randDelay`

### Running multiple bots
If you'd like to run multiple bots, you *DON'T NEED* to download multiple copies of the executable  
All you need to do is have a script that points the bot to different config files  
**REMEMBER**: Specifying `./logs` inside the config means it's relative to where the bot is run from  
To run multiple bots on Windows, follow this file structure:
```
C:\Users\<Username>\Documents\MCB\
 |-MinecraftBot1\
 |  |-logs\
 |  |-bot.toml
 |
 |-MinecraftBot2\
 |  |-logs\
 |  |-bot.toml
 |
 |-MinecraftBot3\
 |  |-logs\
 |  |-bot.toml
 |
 |-MinecraftConsoleBot.exe
 |-run.bat
```
Where `run.bat` looks something similar to this:
```bat
@echo off
cls
REM this is just to make sure we're in the directory the .bat file is in
cd /d %~dp0

start MinecraftConsoleBot.exe -c MinecraftBot1\bot.toml
start MinecraftConsoleBot.exe -c MinecraftBot2\bot.toml
start MinecraftConsoleBot.exe -c MinecraftBot3\bot.toml
```
And each `bot.toml` file's `logDir` and `historyDir` file is set to `./MinecraftBot<number>/logs`  
where `<number>` is the bot's number.
> Apologies for the rough description, I don't know how to make it make more sense!  
> Also, sorry Linux people, I assume you know how to translate this.