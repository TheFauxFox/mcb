import mineflayer from "mineflayer";
import { config } from "dotenv";
import chatParser from "./lib/parsers";
import Screen from "./screen";

config();
const screen = new Screen("Minecraft Chat");

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const createBot = async () => {
  let bot = null;
  try {
    bot = mineflayer.createBot({
      host: process.env.SERVER ?? "localhost",
      username: process.env.EMAIL ?? "",
      password: process.env.PASSWORD ?? "",
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
    if (process.env.RECONNECT === "true") {
      screen.addChatLine(`Disconnected.`);
      screen.addChatLine(
        `Reconnecting in ${process.env.RECONNECT_TIME} seconds...`
      );
      bot.end();
    }
  });

  bot.on("error", async (err) => {
    screen.exit();
    console.error(err);
    process.exit(1);
  });

  bot.on("end", async () => {
    if (process.env.RECONNECT === "true") {
      await sleep(parseInt(process.env.RECONNECT_TIME ?? "3") * 1000);
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
  });
};

createBot();
