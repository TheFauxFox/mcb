import mineflayer from 'mineflayer';
import chatParser from './lib/parsers';
import Screen from './screen';
import { ArgumentParser } from 'argparse';
import { sleep } from './lib/time';
import { tpsGetter } from './lib/serverHacks';
import { NBTData } from './lib/nbtData';

const parser = new ArgumentParser({
  description: 'Minecraft Console Chat Client',
});

parser.add_argument('-u', '--username', {
  help: 'Minecraft email for Microsoft',
  required: true,
  type: String,
});
parser.add_argument('-p', '--password', {
  help: 'Minecraft password',
  required: true,
  type: String,
});
parser.add_argument('-s', '--server', {
  help: 'Server IP',
  required: true,
  type: String,
});
parser.add_argument('-r', '--reconnect', {
  help: 'Enable autoreconnect',
  required: false,
  type: Boolean,
  default: false,
});
parser.add_argument('-t', '--reconnect-time', {
  help: 'Seconds before reconnecting',
  required: false,
  type: Number,
  default: 3,
});
parser.add_argument('-l', '--log-dir', {
  help: 'Log directory',
  required: false,
  type: String,
  default: './logs',
});
parser.add_argument('-d', '--debug', {
  help: 'Enable debug raw json messages in logs',
  required: false,
  type: Boolean,
  default: false,
});
parser.add_argument('-H', '--history-dir', {
  help: 'Where to place the chat history file (defaults to log directory)',
  required: false,
  type: String,
  default: '',
});

const args = parser.parse_args();
const screen = new Screen('Minecraft Chat', args.log_dir, args.history_dir, args.debug);

const createBot = async () => {
  let bot = null;
  try {
    bot = mineflayer.createBot({
      host: args.server,
      username: args.username,
      password: args.password,
      auth: 'microsoft',
      defaultChatPatterns: false,
      checkTimeoutInterval: 300 * 1000,
    });
    bot.on('error', console.error);
  } catch (e) {
    if (process.env.RECONNECT === 'true') {
      console.log('Reconnecting...');
      await sleep(1000);
      await createBot();
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
    if (args.debug) {
      screen.log(`[DEBUG] ${JSON.stringify(msg)} | ${position}`);
    }
    if (position == 'system' || position == 'chat') {
      if (args.debug) {
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
    if (args.reconnect === 'true') {
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
    if (args.reconnect === 'true') {
      screen.addChatLine(`Disconnected.`);
      screen.addChatLine(`Reconnecting in ${args.reconnect_time} seconds...`);
      await sleep(parseInt(args.reconnect_time ?? '3') * 1000);
      createBot();
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
        createBot();
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
createBot();
