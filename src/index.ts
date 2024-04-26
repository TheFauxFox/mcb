import mineflayer from 'mineflayer';
import chatParser from './lib/parsers';
import Screen from './screen';
import { ArgumentParser } from 'argparse';
import { sleep } from './lib/time';
import { tpsGetter } from './lib/serverHacks';
import { NBTData } from './lib/nbtData';
import Config from './lib/config';

const parser = new ArgumentParser({
  description: 'Minecraft Console Chat Client',
});

parser.add_argument('-c', '--config', {
  help: 'Path to config file',
  required: false,
  type: String,
  default: './bot.toml',
});

const args = parser.parse_args();

const cfg = new Config(args.config);

const createBot = async (screen: Screen) => {
  let bot = null;
  try {
    bot = mineflayer.createBot({
      host: cfg.config.server,
      username: cfg.config.email,
      password: cfg.config.password,
      auth: 'microsoft',
      defaultChatPatterns: false,
      checkTimeoutInterval: 300 * 1000,
    });
    bot.on('error', console.error);
  } catch (e) {
    if (process.env.RECONNECT === 'true') {
      console.log('Reconnecting...');
      await sleep(1000);
      await createBot(screen);
      return;
    } else {
      screen.exit();
      console.log(e);
      process.exit(1);
    }
  }
  const tps = new tpsGetter();

  if (bot == null) {
    screen.exit();
    process.exit(1);
  }

  bot.once('spawn', () => {
    screen.addChatLine('Logged in!');
  });

  bot.on('message', async (msg, position) => {
    if (cfg.config.debug) {
      screen.log(`[DEBUG] ${JSON.stringify(msg)} | ${position}`);
    }
    if (position == 'system' || position == 'chat') {
      if (cfg.config.debug) {
        screen.log(JSON.stringify(msg.json));
      }
      if ('unsigned' in msg) {
        screen.addChatLine(
          await chatParser(
            (msg as { unsigned: { json: NBTData } }).unsigned.json as NBTData,
            bot.version
          )
        );
      } else {
        screen.addChatLine(await chatParser(msg.json, bot.version));
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
      screen.addChatLine(`Reconnecting in ${cfg.config.reconnect_time} seconds...`);
      await sleep(cfg.config.reconnect_time ?? 3000);
      createBot(screen);
    }
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
        health: bot.health.toString(),
        hunger: bot.food.toString(),
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
