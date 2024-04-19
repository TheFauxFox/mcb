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
  const bot = mineflayer.createBot({
    host: process.env.SERVER ?? "localhost",
    username: process.env.EMAIL ?? "",
    password: process.env.PASSWORD ?? "",
    auth: "microsoft",
    defaultChatPatterns: false,
  });

  bot.once("spawn", () => {
    screen.addChatLine("Logged in!");
  });

  bot.on("message", async (msg, position) => {
    if (position == "system" || position == "chat") {
      screen.log(JSON.stringify(msg.json));
      screen.addChatLine(await chatParser(msg.json));
    }
  });

  bot.on("kicked", async () => {
    if (process.env.RECONNECT === "true") {
      bot.end();
      await sleep(parseInt(process.env.RECONNECT_TIME ?? "3") * 1000);
      createBot();
    }
  });

  bot.on("error", async (err) => {
    screen.exit();
    bot.end(err.message);
    console.error(err);
  });

  bot.on("end", async () => {
    if (process.env.RECONNECT === "true") {
      bot.end();
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
