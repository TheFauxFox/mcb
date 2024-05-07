import mineflayer from 'mineflayer';
import chatParser, { cleanChatStr } from './lib/parsers';
import Screen from './lib/screen';
import { ArgumentParser } from 'argparse';
import { sleep } from './lib/time';
import { pinger, tpsGetter } from './lib/serverHacks';
import { NBTData } from './lib/nbtData';
import Config from './lib/config';
import { version } from '../package.json';

const parser = new ArgumentParser({
  description: 'Minecraft Console Chat Client',
});

parser.add_argument('-c', '--config', {
  help: 'Path to config file',
  required: false,
  type: String,
  default: './bot.toml',
});

parser.add_argument('-v', '--version', { action: 'version', version });

const args = parser.parse_args();

const cfg = new Config(args.config);

const createBot = async (screen: Screen) => {
  screen.addChatLine(`Pinging ${cfg.config.server}...`);
  const ping = await pinger(cfg.config.server, 10_000, 9999999, (inx) => {
    screen.addChatLine(`Attepmt ${inx + 1} failed.\nRetrying...`);
  });
  if (!ping) {
    screen.addChatLine(`Could not ping ${cfg.config.server}`);
    screen.exit();
    return;
  }
  const bot = mineflayer.createBot({
    host: cfg.config.server,
    username: cfg.config.email,
    password: cfg.config.password,
    auth: 'microsoft',
    defaultChatPatterns: false,
    checkTimeoutInterval: 300 * 1000,
  });
  const tps = new tpsGetter();

  if (bot == null) {
    screen.exit();
    process.exit(1);
  }

  bot.once('spawn', async () => {
    screen.addChatLine('Logged in!');
    screen.setTitle(`MCB v${version} | ${cfg.config.server} | ${bot.username}`);
    if (cfg.config.runOnJoin) {
      if (Array.isArray(cfg.config.runOnJoin.commands)) {
        for (const command of cfg.config.runOnJoin.commands) {
          if (typeof command === 'string') {
            const cmd = command.startsWith('/') ? command : `/${command}`;
            bot.chat(cmd);
          } else {
            if (command.delay) {
              await sleep(command.delay);
            } else if (command.randDelay) {
              const [min, max] = command.randDelay.split('-').map(Number);
              await sleep(Math.floor(Math.random() * ((max ?? 0) - (min ?? 0) + 1) + (min ?? 0)));
            }
            const cmd = command.command.startsWith('/') ? command.command : `/${command.command}`;
            bot.chat(cmd);
          }
        }
      }
    }
  });

  bot.on('message', async (msg, position) => {
    if (cfg.config.debug) {
      screen.log(`[DEBUG] ${JSON.stringify(msg)} | ${position}`);
    }
    if (position == 'system' || position == 'chat') {
      if (cfg.config.debug) {
        screen.log(JSON.stringify(msg.json));
      }
      let str = '';
      if ('unsigned' in msg) {
        str = await chatParser(
          (msg as { unsigned: { json: NBTData } }).unsigned.json as NBTData,
          bot.version
        );
      } else {
        str = await chatParser(msg.json, bot.version);
      }
      screen.addChatLine(str);
      const cleanStr = cleanChatStr(str);
      if (cfg.config.botOwner && cfg.config.botOwner.runOnMsg) {
        for (const user of cfg.config.botOwner.usernames) {
          const chatMatcher = new RegExp(
            cfg.config.botOwner.msgRegex.replace('%playername%', user)
          );
          if (chatMatcher.test(cleanStr)) {
            const cmd = cleanStr.replace(chatMatcher, '').trimStart();
            bot.chat(cmd);
          }
        }
      }
    }
  });

  bot.on('kicked', async () => {
    if (cfg.config.reconnect) {
      screen.addChatLine(`{green-fg}You've been kicked!{/}`);
      bot.end();
    }
  });

  bot.on('error', async (err) => {
    screen.exit();
    console.error(err);
    process.exit(1);
  });

  bot.on('end', async () => {
    if (cfg.config.reconnect) {
      screen.addChatLine(`Disconnected.`);
      screen.addChatLine(`Reconnecting in ${cfg.config.reconnectDelay} seconds...`);
      await sleep((cfg.config.reconnectDelay ?? 3) * 1000);
      createBot(screen);
    }
  });

  bot.on('error', async (err) => {
    screen.log(`ERR: ${JSON.stringify(err)}`);
    bot.end();
  });

  screen.onMessage(async (text) => {
    if (text.length > 0) {
      screen.history.add(text);
      if (text.match(/^:exit/i)) {
        bot.quit('Disconnected.');
        screen.exit();
        process.exit(0);
      } else if (text.match(/^:reco/i)) {
        bot.quit('Reconnecting');
        screen.addChatLine('{red-fg}Reconnecting...{/}');
        createBot(screen);
      } else {
        bot.chat(text);
      }
      screen.inputBar.setValue('');
      screen.inputBar.focus();
    }
  });

  bot.on('time', async () => {
    tps.tickIngameTime(bot.time.age);
    try {
      await screen.updatePlayerList(bot.players);
      await screen.updateServerInfo({
        username: bot.username,
        ping: bot.player.ping.toString(),
        version: bot.version,
        time: bot.time.timeOfDay.toString(),
        health: Math.round(bot.health).toString(),
        hunger: Math.round(bot.food).toString(),
        tps: tps.getTps().toString(),
      });
      screen._screen.render();
    } catch (_) {
      /* empty */
    }
  });
};

if (cfg.continue) {
  const screen = new Screen('Minecraft Chat', cfg.config);
  createBot(screen);
}
