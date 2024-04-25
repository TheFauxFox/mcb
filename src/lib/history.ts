import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

export default class HistoryManager {
  private history: string[];
  private index: number;
  private logDir: string;
  private maxHistory: number = 65535;

  constructor(histDir: string) {
    this.history = [];
    this.index = 0;
    this.logDir = histDir;
    mkdirSync(histDir, { recursive: true });
    this.loadHistory();
  }

  loadHistory() {
    if (existsSync(`${this.logDir}/.hist`)) {
      this.history = JSON.parse(readFileSync(`${this.logDir}/.hist`, 'utf8'));
    }
  }

  add(line: string) {
    this.history.push(line);
    this.index = this.history.length;
    while (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    writeFileSync(`${this.logDir}/.hist`, JSON.stringify(this.history), 'utf8');
  }

  back() {
    if (this.index > 0) this.index--;
    return this.history[this.index];
  }

  forward() {
    if (this.index < this.history.length - 1) this.index++;
    else return '';
    return this.history[this.index];
  }
}
