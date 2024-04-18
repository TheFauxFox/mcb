import mineflayer from "mineflayer";
import blessed from "blessed";
import { mkdirSync } from "fs";
import { appendFile } from "fs/promises";
import path from "path";
import { parseExtras } from "../lib/parsers";

export default class Screen {
  _screen: blessed.Widgets.Screen;
  private defaultOptions: {
    tags: boolean;
    scrollable: boolean;
    scrollbar: { style: { bg: string }; track: { bg: string } };
    border: { type: string };
    style: { fg: string; bg: string; border: { fg: string } };
  };
  chatBox!: blessed.Widgets.ScrollableBoxElement;
  playerList!: blessed.Widgets.ListElement;
  inputBar!: blessed.Widgets.TextboxElement;
  serverInfoBox!: blessed.Widgets.ScrollableBoxElement;
  logDir: string;

  constructor(name: string, logDir: string = "./logs") {
    this._screen = blessed.screen({
      smartCSR: true,
      title: name,
    });
    this.defaultOptions = {
      tags: true,
      scrollable: true,
      scrollbar: { style: { bg: "white" }, track: { bg: "gray" } },
      border: { type: "line" },
      style: { fg: "white", bg: "black", border: { fg: "white" } },
    };
    this.addWidgets();
    this._screen.key(["C-c"], this.exit);
    this.playerList.key(["C-c"], this.exit);
    this.inputBar.key(["C-c"], this.exit);
    this.chatBox.key(["C-c"], this.exit);
    this.inputBar.focus();
    this.logDir = path.resolve(logDir);
    mkdirSync(this.logDir, { recursive: true });
  }

  addWidgets() {
    //@ts-ignore
    this.chatBox = blessed.box({
      top: 0,
      left: 0,
      width: "80%",
      height: "100%-3",
      label: "Chat",
      alwaysScroll: true,
      mouse: true,
      ...this.defaultOptions,
    });

    //@ts-ignore
    this.playerList = blessed.list({
      top: 0,
      left: "80%",
      width: "20%",
      height: "70%",
      label: "Players",
      ...this.defaultOptions,
    });

    //@ts-ignore
    this.serverInfoBox = blessed.box({
      left: "80%",
      top: "70%",
      width: "20%",
      height: "31%",
      label: "Server Info",
      alwaysScroll: true,
      mouse: true,
      ...this.defaultOptions,
    });

    //@ts-ignore
    this.inputBar = blessed.textbox({
      bottom: 0,
      left: 0,
      height: 3,
      width: "80%",
      keys: true,
      mouse: true,
      inputOnFocus: true,
      label: "Send a message",
      ...this.defaultOptions,
    });

    this._screen.append(this.chatBox);
    this._screen.append(this.inputBar);
    this._screen.append(this.serverInfoBox);
    this._screen.append(this.playerList);
  }

  async addChatLine(msg: string) {
    this.chatBox.pushLine(msg);
    this._screen.render();
    this.chatBox.setScrollPerc(100);
    this.log(msg);
  }

  async log(msg: string) {
    await appendFile(
      `${this.logDir}/${new Date().toISOString().split("T")[0]}.txt`,
      `${msg}\r\n`,
      "utf8"
    );
  }

  onMessage(listener: (message: string) => void | Promise<void>) {
    this.inputBar.on("submit", listener);
  }

  exit() {
    this._screen.destroy();
    process.exit(0);
  }

  async updatePlayerList(players: { [username: string]: mineflayer.Player }) {
    this.playerList.clearItems();
    for (const player of Object.values(players)) {
      this.playerList.addItem(await parseExtras(player.displayName.json));
    }
    this.playerList.setLabel(`Players (${Object.values(players).length})`);
  }

  fixTime(time: number): string {
    const ratio = 1000 / 60;
    const t = Math.round((time + 6000) % 24000);
    const hour = Math.floor(t / 1000);
    const minute = Math.round((t % 1000) / ratio);
    return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
  }

  async updateServerInfo(info: { [key: string]: string }) {
    this.serverInfoBox.setLine(0, `Logged in as ${info.username}`);
    this.serverInfoBox.setLine(1, `Version: ${info.version}`);
    this.serverInfoBox.setLine(2, `Ping: ${info.ping}ms`);
    this.serverInfoBox.setLine(3, `Time: ${this.fixTime(parseInt(info.time))}`);
    this.serverInfoBox.setLine(4, `Health: ${info.health}/20`);
    this.serverInfoBox.setLine(5, `Hunger: ${info.hunger}/20`);
  }
}
