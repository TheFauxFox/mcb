import colors from "./colors";
import { NBTData } from "./nbtData";
import translations from "./translations";

export default async function chatParser(msg: NBTData): Promise<string> {
  const colorParser = (data: NBTData, text: string = "") => {
    let str = "";
    if (data.bold) str += "{bold}";
    if (data.underlined) str += "{underlined}";
    if (data.color && data.color in colors) {
      str += `${colors[data.color]}${text}`;
    } else if (data.color?.startsWith("#")) {
      str += `{${data.color}-fg}${text}`;
    } else {
      str += `{white-fg}${text}`;
    }
    return str + "{/}";
  };

  let builder: string = "";

  // translation loop
  if (msg.translate && msg.with) {
    if (msg.translate in translations) {
      const translation = translations[msg.translate];
      if (translation.includes("%s")) {
        let translated = translation;
        for (const arg of msg.with) {
          translated = translated.replace("%s", await chatParser(arg));
        }
        builder += translated;
      }
    } else if (msg.translate.includes("%s")) {
      let translated = msg.translate;
      for (const arg of msg.with) {
        translated = translated.replace("%s", await chatParser(arg));
      }
      builder += translated;
    } else {
      builder += msg.translate;
    }
  } else if (msg.translate && !msg.with) {
    if (msg.translate in translations) {
      const translation = translations[msg.translate];
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
      builder += await chatParser(extra);
    }
  }

  // blank key loop
  if (Object.values(msg).length === 1) {
    builder += Object.values(msg)[0].toString();
  }

  return builder;
}
