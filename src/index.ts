import mineflayer from "mineflayer";
import { config } from "dotenv";
import { parseChat } from "./lib/parsers";
import Screen from "./screen";

config();
const screen = new Screen("Minecraft Chat");

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

const bot = mineflayer.createBot({
  host: process.env.SERVER ?? "localhost",
  username: process.env.EMAIL ?? "",
  password: process.env.PASSWORD ?? "",
  auth: "microsoft",
  defaultChatPatterns: false,
});

bot.on("spawn", () => {
  screen.addChatLine("Logged in!");
});

bot.on("message", async (msg, position) => {
  if (position == "system" || position == "chat") {
    screen.log(JSON.stringify(msg.json));
    screen.addChatLine(await parseChat(msg.json));
  }
});

// bot.on("messagestr", async (msg, position, json) => {
//   if (position == "system" || position == "chat") {
//     screen.log(JSON.stringify(json));
//     screen.addChatLine(msg);
//   }
// });

bot.on("kicked", async (msg) => {
  screen.addChatLine(msg);
  if (process.env.RECONNECT === "true") {
    await sleep(parseInt(process.env.RECONNECT_TIME ?? "3") * 1000);
    bot.connect({
      host: "play.theoasismc.com",
      username: process.env.EMAIL ?? "",
      password: process.env.PASSWORD ?? "",
      auth: "microsoft",
      defaultChatPatterns: false,
    });
  }
});

bot.on("error", async (err) => {
  screen.exit();
  bot.end(err.message);
  console.error(err);
});

screen.onMessage(async (text) => {
  if (text.length > 0) {
    if (text.match(/^:exit/i)) {
      bot.quit("Disconnected.");
      screen.exit();
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
