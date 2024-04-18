import mineflayer from "mineflayer";
import { config } from "dotenv";
import { parseChat } from "./lib/parsers";
import Screen from "./screen";

config();

const bot = mineflayer.createBot({
  host: "play.theoasismc.com",
  username: process.env.EMAIL ?? "",
  password: process.env.PASSWORD ?? "",
  auth: "microsoft",
  defaultChatPatterns: false,
});

const screen = new Screen("Minecraft Chat");

bot.on("spawn", () => {
  screen.addChatLine("Logged in!");
  screen.updatePlayerList(bot.players);
});

bot.on("message", async (msg, position) => {
  if (position == "system" || position == "chat") {
    screen.log(JSON.stringify(msg.json));
    screen.addChatLine(await parseChat(msg.json));
  }
});

bot.on("playerJoined", () => {
  screen.updatePlayerList(bot.players);
});

bot.on("playerLeft", () => {
  screen.updatePlayerList(bot.players);
});

bot.on("kicked", screen.addChatLine);
bot.on("error", (err) => {
  screen.log(err.message);
  screen.addChatLine(err.message);
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
