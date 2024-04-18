import mineflayer from "mineflayer";
import { config } from "dotenv";
import blessed from "blessed";
import { appendFileSync } from "fs";

config();

type ExtraType = {
  italic?: boolean;
  underlined?: boolean;
  bold?: boolean;
  color?: string;
  obfuscated?: boolean;
  strikethrough?: boolean;
  text: string;
  extra?: ExtraType[];
};

const colors = {
  dark_red: "{#AA0000-fg}",
  red: "{#FF5555-fg}",
  gold: "{#FFAA00-fg}",
  yellow: "{#FFFF55-fg}",
  dark_green: "{#00AA00-fg}",
  green: "{#55FF55-fg}",
  aqua: "{#55FFFF-fg}",
  dark_aqua: "{#00AAAA-fg}",
  dark_blue: "{#0000AA-fg}",
  blue: "{#5555FF-fg}",
  light_purple: "{#FF55FF-fg}",
  dark_purple: "{#AA00AA-fg}",
  white: "{#FFFFFF-fg}",
  gray: "{#AAAAAA-fg}",
  dark_gray: "{#555555-fg}",
  black: "{#000000-fg}",
};

function parseExtras(data: ExtraType) {
  let text = "";
  if (data.text) {
    text += data.text;
  } else if (Object.values(data).length == 1) {
    text += Object.values(data)[0];
  }
  if (data.bold) text = `{bold}${text}`;
  if (data.underlined) text = `{underline}${text}`;
  if (data.color) {
    if (Object.keys(colors).includes(data.color)) {
      text = `${(colors as any)[data.color]}${text}`;
    } else if (data.color?.startsWith("#")) {
      text = `{${data.color}-fg}${text}`;
    }
  } else {
    text = `{white-fg}${text}`;
  }
  text += "{/}";
  if (data.extra) {
    for (const extra of data.extra) {
      text += parseExtras(extra);
    }
  }
  return text;
}

const bot = mineflayer.createBot({
  host: "play.theoasismc.com",
  username: process.env.EMAIL ?? "",
  password: process.env.PASSWORD ?? "",
  auth: "microsoft",
  defaultChatPatterns: false,
});

function log(text: string, render: boolean = true) {
  appendFileSync("log.txt", `${text}\n`);
  if (render) {
    chatBox.pushLine(`${text}`);
    screen.render();
    chatBox.setScrollPerc(100);
  }
}

function updatePlayerList() {
  playerList.clearItems();
  Object.values(bot.players).forEach((player) => {
    // log(JSON.stringify(player.displayName.json), false);
    playerList.addItem(parseExtras(player.displayName.json));
  });
}

bot.once("inject_allowed", () => {
  global.console.log = log;
  global.console.error = log;
});

bot.on("spawn", () => {
  log("Logged in!");
  updatePlayerList();
});

function parseChat(msg: any) {
  if (msg.extra) {
    const built: string[] = [];
    msg.extra.forEach((data: ExtraType) => {
      built.push(parseExtras(data));
    });
    return built.join("");
  } else if (msg.with) {
    const out: string[] = [];
    msg.with.forEach((data: ExtraType) => {
      const built: string[] = [];
      if (data.extra) {
        data.extra.forEach((data: ExtraType) => {
          built.push(parseExtras(data));
        });
      }
      out.push(built.join(""));
    });
    return out.join("");
  } else {
    return msg.text;
  }
}

bot.on("message", (msg, position) => {
  if (position == "system" || position == "chat") {
    log(JSON.stringify(msg.json), false);
    log(parseChat(msg.json));
  }
});

bot.on("playerJoined", (player) => {
  updatePlayerList();
});
bot.on("playerLeft", (player) => {
  updatePlayerList();
});

bot.on("kicked", log);
bot.on("error", console.error);

const screen = blessed.screen({
  smartCSR: true,
  title: "Minecraft Chat Client",
});

var chatBox = blessed.box({
  top: 0,
  left: 0,
  width: "80%",
  height: "100%-3",
  tags: true,
  label: "Chat",
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  scrollbar: {
    style: {
      bg: "white",
    },
    track: {
      bg: "gray",
    },
  },
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "white",
    },
  },
});

var playerList = blessed.list({
  top: 0,
  left: "80%",
  width: "20%",
  height: "100%",
  tags: true,
  label: "Players",
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "white",
    },
  },
});

var inputBar = blessed.textbox({
  bottom: 0,
  left: 0,
  height: 3,
  width: "80%",
  keys: true,
  mouse: true,
  inputOnFocus: true,
  label: "Send a message",
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "white",
    },
  },
});

screen.append(chatBox);
screen.append(playerList);
screen.append(inputBar);

inputBar.on("submit", (text: string) => {
  if (text.length > 0) {
    if (text.match(/^:exit/i)) {
      bot.quit("Disconnected.");
      screen.destroy();
      process.exit(0);
    }
    bot.chat(text);
    inputBar.setValue("");
    inputBar.focus();
  }
});
screen.key(["C-c"], () => process.exit(0));

inputBar.focus();
