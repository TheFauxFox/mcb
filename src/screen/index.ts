import { cleanChatStr, pingParser } from './../lib/parsers';
import mineflayer from 'mineflayer';
import blessed from 'blessed';
import { mkdirSync } from 'fs';
import { appendFile } from 'fs/promises';
import path from 'path';
import chatParser from '../lib/parsers';
import { getDateStamp, getTimeStamp, mcTimeToHRT } from '../lib/time';
import HistoryManager from '../lib/history';
import { IConfig } from '../lib/config';

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
  playerBoxWidth: number;
  debug: boolean;
  history: HistoryManager;

  constructor(name: string, config: IConfig) {
    this._screen = blessed.screen({
      smartCSR: true,
      title: name,
      terminal: 'xterm-256color',
      ignoreLocked: ['C-c'],
    });
    this.defaultOptions = {
      tags: true,
      scrollable: true,
      scrollbar: { style: { bg: 'white' }, track: { bg: 'gray' } },
      border: { type: 'line' },
      style: { fg: 'white', bg: 'black', border: { fg: 'white' } },
    };

    this.playerBoxWidth = 44;

    this.addWidgets();
    this.inputBar.focus();
    this._screen.key(['C-c'], () => this.exit());
    this.inputBar.key(['up', 'down', 'escape'], (ch, key) => this.handleKeys(ch, key));
    this.logDir = path.resolve(config.logDir ?? './logs');
    this.debug = config.debug ?? false;
    this.history = new HistoryManager(config.historyDir ?? this.logDir);
    mkdirSync(this.logDir, { recursive: true });
    this._screen.render();
  }

  addWidgets() {
    // @ts-expect-error Falsely claims that types will fail, but it doesn't.
    this.chatBox = blessed.box({
      top: 0,
      left: 0,
      width: `100%-${this.playerBoxWidth}`,
      height: '100%-3',
      label: 'Chat',
      alwaysScroll: true,
      mouse: true,
      ...this.defaultOptions,
    });

    // @ts-expect-error Falsely claims that types will fail, but it doesn't.
    this.playerList = blessed.list({
      top: 0,
      left: `100%-${this.playerBoxWidth}`,
      width: this.playerBoxWidth,
      height: '70%',
      label: 'Players',
      ...this.defaultOptions,
    });

    // @ts-expect-error Falsely claims that types will fail, but it doesn't.
    this.serverInfoBox = blessed.box({
      left: `100%-${this.playerBoxWidth}`,
      top: '70%',
      width: this.playerBoxWidth,
      height: '31%',
      label: 'Server Info',
      alwaysScroll: true,
      mouse: true,
      ...this.defaultOptions,
    });

    // @ts-expect-error Falsely claims that types will fail, but it doesn't.
    this.inputBar = blessed.textbox({
      bottom: 0,
      left: 0,
      height: 3,
      width: `100%-${this.playerBoxWidth}`,
      keys: true,
      mouse: true,
      inputOnFocus: true,
      ignoreLocked: ['up', 'down'],
      label: 'Send a message',
      ...this.defaultOptions,
    });

    this._screen.append(this.chatBox);
    this._screen.append(this.inputBar);
    this._screen.append(this.serverInfoBox);
    this._screen.append(this.playerList);
  }

  handleKeys(ch: string, key: blessed.Widgets.Events.IKeyEventArg) {
    switch (key.name) {
      case 'up':
        this.inputBar.setValue(this.history.back());
        break;
      case 'down':
        this.inputBar.setValue(this.history.forward());
        break;
      case 'escape':
        if (this.history.isInHistory()) this.inputBar.setValue('');
        break;
    }
    this._screen.render();
  }

  async addChatLine(msg: string) {
    this.chatBox.pushLine(msg);
    this.chatBox.setScrollPerc(100);
    this._screen.render();
    this.log(this.debug ? msg : cleanChatStr(msg));
  }

  async log(msg: string) {
    await appendFile(
      `${this.logDir}/${getDateStamp()}.txt`,
      `[${getTimeStamp()}] ${msg}\r\n`,
      'utf8'
    );
  }

  onMessage(listener: (message: string) => void | Promise<void>) {
    this.inputBar.on('submit', listener);
  }

  exit() {
    this._screen.destroy();
    process.exit(0);
  }

  async updatePlayerList(players: { [username: string]: mineflayer.Player }) {
    this.playerList.clearItems();
    for (const player of Object.values(players)) {
      this.playerList.addItem(
        `${pingParser(player.ping)} | ${await chatParser(player.displayName.json, '')}`
      );
    }
    this.playerList.setLabel(`Players (${Object.values(players).length})`);
  }

  async updateServerInfo(info: { [key: string]: string }) {
    let i = -1;
    this.serverInfoBox.setLine(i++, `Logged in as ${info.username}`);
    this.serverInfoBox.setLine(i++, `Version: ${info.version}`);
    this.serverInfoBox.setLine(i++, `TPS: ${info.tps}`);
    this.serverInfoBox.setLine(i++, `Ping: ${info.ping}ms`);
    this.serverInfoBox.setLine(i++, `Time: ${mcTimeToHRT(parseInt(info.time))}`);
    this.serverInfoBox.setLine(i++, `Health: ${info.health}/20`);
    this.serverInfoBox.setLine(i++, `Hunger: ${info.hunger}/20`);
  }
}
