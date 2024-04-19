import colors from "./colors";
import { NBTExtra } from "./nbtExtra";

const sprintf = (str: string, ...args: any[]) => {
  let i = -1;
  return str.replace(/%(s|d|0\d+d)/g, function (x, type) {
    var value = args[i++];
    switch (type) {
      case "s":
        return value;
      case "d":
        return parseInt(value, 10);
      default:
        value = String(parseInt(value, 10));
        var n = Number(type.slice(1, -1));
        return "0".repeat(n).slice(value.length) + value;
    }
  });
};

const parseExtras = async (data: NBTExtra) => {
  let text = "";
  if (data.text) {
    text += data.text;
  } else if (data.translate) {
    text += data.translate;
  } else if (Object.values(data).length == 1) {
    text += Object.values(data)[0];
  }
  if (data.bold) text = `{bold}${text}`;
  if (data.underlined) text = `{underline}${text}`;
  if (data.color) {
    if (Object.keys(colors).includes(data.color)) {
      text = `${(colors as any)[data.color]}${text}`;
    } else if (data.color?.startsWith("#")) {
      text = `{${data.color}-fg}${text}`;
    }
  } else {
    text = `{white-fg}${text}`;
  }
  text += "{/}";
  if (data.extra) {
    for (const extra of data.extra) {
      text += await parseExtras(extra);
    }
  }
  if (data.with) {
    for (const extra of data.with) {
      text += await parseExtras(extra);
    }
  }
  return text;
};

const parseChat = async (msg: any) => {
  if (msg.extra) {
    const built: string[] = [];
    for (const extra of msg.extra) {
      built.push(await parseExtras(extra));
    }
    return built.join("");
  } else if (msg.with) {
    const out: string[] = [];
    for (const data of msg.with) {
      const built: string[] = [];
      if (data.extra) {
        for (const extra of data.extra) {
          built.push(await parseExtras(extra));
        }
      }
      out.push(built.join(""));
    }
    return out.join("");
  } else {
    return await parseExtras(msg);
  }
};

export { parseExtras, parseChat, sprintf };
