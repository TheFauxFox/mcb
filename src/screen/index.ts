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
    this._screen.key(["C-c"], () => process.exit(0));
    this.playerList.key(["C-c"], () => process.exit(0));
    this.inputBar.key(["C-c"], () => process.exit(0));
    this.chatBox.key(["C-c"], () => process.exit(0));
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
      height: "100%",
      label: "Players",
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
    Object.values(players).forEach(async (player) => {
      this.playerList.addItem(await parseExtras(player.displayName.json));
    });
  }
}
