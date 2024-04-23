import mineflayer from "mineflayer";
import chatParser from "./lib/parsers";
import Screen from "./screen";
import { ArgumentParser } from "argparse";

const parser = new ArgumentParser({
  description: "Minecraft Console Chat Client",
});

parser.add_argument("-u", "--username", {
  help: "Minecraft email for Microsoft",
  required: true,
  type: String,
});
parser.add_argument("-p", "--password", {
  help: "Minecraft password",
  required: true,
  type: String,
});
parser.add_argument("-s", "--server", {
  help: "Server IP",
  required: true,
  type: String,
});
parser.add_argument("-r", "--reconnect", {
  help: "Enable autoreconnect",
  required: false,
  type: Boolean,
  default: false,
});
parser.add_argument("-t", "--reconnect-time", {
  help: "Seconds before reconnecting",
  required: false,
  type: Number,
  default: 3,
});

const args = parser.parse_args();

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const createBot = async () => {
  let bot = null;
  try {
    bot = mineflayer.createBot({
      host: args.server,
      username: args.username,
      password: args.password,
      auth: "microsoft",
      defaultChatPatterns: false,
      checkTimeoutInterval: 300 * 1000,
    });
    bot.on("error", console.error);
  } catch (e) {
    if (process.env.RECONNECT === "true") {
      console.log("Reconnecting...");
      await sleep(1000);
      await createBot();
      return;
    } else {
      screen.exit();
      console.log(e);
      process.exit(1);
    }
  }

  if (bot == null) {
    screen.exit();
    process.exit(1);
  }

  bot.once("spawn", () => {
    screen.addChatLine("Logged in!");
  });

  bot.on("message", async (msg, position) => {
    if (position == "system" || position == "chat") {
      screen.log(JSON.stringify(msg.json));
      screen.addChatLine(await chatParser(msg.json));
    }
  });

  bot.on("kicked", async (reason) => {
    if (args.reconnect === "true") {
      screen.addChatLine(`Disconnected.`);
      screen.addChatLine(`Reconnecting in ${args.reconnect_time} seconds...`);
      bot.end();
    }
  });

  bot.on("error", async (err) => {
    screen.exit();
    console.error(err);
    process.exit(1);
  });

  bot.on("end", async () => {
    if (args.reconnect === "true") {
      await sleep(parseInt(args.reconnect_time ?? "3") * 1000);
      createBot();
    }
  });

  screen.onMessage(async (text) => {
    if (text.length > 0) {
      if (text.match(/^:exit/i)) {
        bot.quit("Disconnected.");
        screen.exit();
        process.exit(0);
      }
      bot.chat(text);
      screen.inputBar.setValue("");
      screen.inputBar.focus();
    }
  });

  bot.on("time", async () => {
    try {
      await screen.updatePlayerList(bot.players);
      await screen.updateServerInfo({
        username: bot.username,
        ping: bot.player.ping.toString(),
        version: bot.version,
        time: bot.time.timeOfDay.toString(),
        health: bot.health.toString(),
        hunger: bot.food.toString(),
      });
      screen._screen.render();
    } catch (_) {}
  });
};
const screen = new Screen("Minecraft Chat");
createBot();
