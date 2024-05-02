import { existsSync, readFileSync, writeFileSync } from 'fs';
import toml from 'toml';

export type IConfig = {
  email: string;
  password: string;
  server: string;
  reconnect?: boolean;
  reconnectDelay?: number;
  debug?: boolean;
  logDir?: string;
  historyDir?: string;
  botOwner?: {
    usernames: string[];
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
        `email = "minecraft.account@example.com" # Microsoft email for Minecraft account\npassword = "Password123!"               # Password for Minecraft account\nserver = "play.example.com"             # IP Address of the server\n\n###############################\n# Everything else is optional #\n# Shown args are defaults     #\n###############################\n\nreconnectDelay = 5    # Seconds to wait before reconnecting\nreconnect = false     # Should we reconnect after disconnect/kick?\nlogDir = "./logs"     # Directory to place logs for this bot\nhistoryDir = "./logs" # Where should we place our .hist file for scrollback\ndebug = false         # Spam logs with debug info`
      );
      this.continue = false;
    } else {
      this.config = toml.parse(readFileSync(path, 'utf8'));
      this.continue = true;
    }
  }
}
