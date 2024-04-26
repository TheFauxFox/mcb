import { existsSync, readFileSync, writeFileSync } from 'fs';
import toml from 'toml';

export type IConfig = {
  email: string;
  password: string;
  server: string;
  reconnect?: boolean;
  reconnect_time?: number;
  debug?: boolean;
  logDir?: string;
  historyDir?: string;
  botOwner?: {
    username: string;
    msgRegex: string;
    runOnMsg: boolean;
  };
  runOnJoin?: {
    commands: string[] | { command: string; delay?: number; randDelay?: string }[];
  };
};

export default class Config {
  config: IConfig;
  continue: boolean;

  constructor(path: string) {
    if (!existsSync(path)) {
      this.config = { email: '', password: '', server: '' };
      console.error(`Creating new config at ${path}, please fill in the required fields.`);
      writeFileSync(
        path,
        `email = "minecraft.account@example.com" # Microsoft email for Minecraft account\npassword = "Password123!" # Password for Minecraft account\nserver = "play.example.com" # IP Address of the server\n\n###############################\n# Everything else is optional #\n# Shown args are defaults     #\n###############################\n\nreconnect_delay = 5 # Seconds to wait before reconnecting\nreconnect = false # Should we reconnect after disconnect/kick?\nlogDir = "./logs" # Directory to place logs for this bot\nhistoryDir = "./logs" # Where should we place our .hist file for scrollback\n\ndebug = false # Spam logs with debug info\n\n\n[botOwner] # This is not required, but all args for it are if it's declared\nusername = "Notch" # Username or Displayname of the main account controlling the bot\n# How the server's /msg are formatted. %playername% will match any username in that spot to the owner's username, case sensitive\nmsgRegex = "\\[%playername% -> me\\]"\nrunOnMsg = true # Whether the bot should echo back all commands/messages from the owner\n\n# When the bot connects, what commands should it run?\n[runOnJoin] # This is not required, but all args for it are if it's declared\n# command = ["say Hello world!"] # It can run multiple commands in a list, or:\ncommand = [\n    { command = "say Hello world!", delay = 5000 }, # You can specify a time in milliseconds to wait before executing the command or:\n    { command = "say Hello world!", randDelay = "5000-15000" } # You can specify a time range in milliseconds to randomly wait between before running the command.\n]\n# However, you may only have 1 "command = " listed.`
      );
      this.continue = false;
    } else {
      this.config = toml.parse(readFileSync(path, 'utf8'));
      console.log(JSON.stringify(this.config, null, 2));
      this.continue = true;
    }
  }
}
