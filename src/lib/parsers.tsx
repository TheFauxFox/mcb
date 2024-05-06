import React, { ReactElement } from 'react';
import colors from './colors.js';
import { NBTData } from './nbtData.js';
import { Text } from 'ink';

let translationsMap: Record<string, string> = {};

export default async function chatParser(msg: NBTData, version: string): Promise<string> {
  const isString = (obj: object | string | number) => obj.constructor.name === 'String';
  const colorParser = (data: NBTData, text: string = '') => {
    let str = '';
    if (data.bold) str += '{bold}';
    if (data.underlined) str += '{underlined}';
    if (data.color && data.color in colors) {
      str += `${colors[data.color]}${text}`;
    } else if (data.color?.startsWith('#')) {
      str += `{${data.color}-fg}${text}`;
    } else {
      str += `{white-fg}${text}`;
    }
    return str + '{/}';
  };

  let builder: string = '';
  if (Object.keys(translationsMap).length === 0 || version !== '') {
    const resp = await fetch(
      `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/${version}/assets/minecraft/lang/en_us.json`
    );
    translationsMap = (await resp.json()) as Record<string, string>;
  }

  // translation loop
  if (msg.translate && msg.with) {
    if (msg.translate in translationsMap) {
      const translation = translationsMap[msg.translate] ?? '';
      if (translation.includes('%s')) {
        let translated = translation;
        for (const arg of msg.with) {
          if (isString(arg)) translated = translated.replace('%s', arg as string);
          else translated = translated.replace('%s', await chatParser(arg as NBTData, version));
        }
        builder += colorParser(msg, translated);
      }
    } else if (msg.translate.includes('%s')) {
      let translated = msg.translate;
      for (const arg of msg.with) {
        if (isString(arg)) translated = translated.replace('%s', arg as string);
        else translated = translated.replace('%s', await chatParser(arg as NBTData, version));
      }
      builder += colorParser(msg, translated);
    } else {
      builder += colorParser(msg, msg.translate);
    }
  } else if (msg.translate && !msg.with) {
    if (msg.translate in translationsMap) {
      const translation = translationsMap[msg.translate];
      builder += translation;
    } else {
      builder += msg.translate;
    }
  }

  // default text loop
  if (msg.text) {
    builder += colorParser(msg, msg.text);
  }

  // extras loop
  if (msg.extra) {
    for (const extra of msg.extra) {
      builder += await chatParser(extra, version);
    }
  }

  // blank key loop
  if (msg['']) {
    builder += msg[''];
  }

  return builder;
}

export const pingParser = (ping: number, name: string, separator: string = ' | '): ReactElement => {
  let pingStr = ping.toString();
  const max = 600;
  const red = (ping / max) * 255;
  const green = ((max - ping) / max) * 255;
  let hex = '#' + ((1 << 24) | (red << 16) | (green << 8)).toString(16).slice(1);
  if (ping > max) {
    hex = '#ff0000';
  }
  if (ping >= 10000) {
    pingStr = '9999';
  }
  if (pingStr.length < 4) {
    pingStr = pingStr.padStart(4, ' ');
  }
  return (
    <Text>
      <Text color={hex}>{pingStr}ms</Text>
      <Text>{separator}</Text>
      <Text>{name}</Text>
    </Text>
  );
};

export const cleanChatStr = (str: string): string => {
  return str.replace(/\{(.*?-fg|bold|underlined|\/)\}/gi, '');
};
