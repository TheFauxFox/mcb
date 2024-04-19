import colors from "./lib/colors";
import translations from "./lib/translations";
import { NBTData } from "./lib/nbtData";

const msg: NBTData = {
  translate: "%s",
  with: [
    {
      extra: [
        { color: "light_purple", text: "♀ " },
        { bold: 1, color: "dark_gray", text: "[Scribe]" },
        { "": " " },
        {
          extra: [
            { color: "#C610EA", text: "A" },
            { color: "#D11DDA", text: "s" },
            { color: "#DD2ACA", text: "h" },
            { color: "#E836BA", text: "l" },
            { color: "#F343AA", text: "e" },
            { color: "#FF4F9A", text: "y" },
          ],
          clickEvent: {
            action: "suggest_command",
            value: "/msg BlockFever54 ",
          },
          hoverEvent: {
            action: "show_text",
            contents: {
              extra: [
                { color: "green", text: "World: " },
                { color: "gray", text: "world\n" },
                { color: "yellow", text: "Biome: " },
                { color: "gold", text: "Mushroom Fields\n" },
                { color: "red", text: "Health: 20" },
                { color: "gray", text: "/20\n" },
                { color: "aqua", text: "Ping: " },
                { color: "yellow", text: "72 " },
                { color: "aqua", text: "ms" },
              ],
              text: "",
            },
          },
          text: "",
        },
        {
          extra: [
            { bold: 1, color: "#F386EF", text: " [" },
            { bold: 1, color: "#E871EC", text: "C" },
            { bold: 1, color: "#DD5CEA", text: "a" },
            { bold: 1, color: "#D146E7", text: "t" },
            { bold: 1, color: "#C631E4", text: "g" },
            { bold: 1, color: "#BB33E0", text: "i" },
            { bold: 1, color: "#AB2ADA", text: "r" },
            { bold: 1, color: "#9B21D4", text: "l" },
            { bold: 1, color: "#8B18CE", text: "]" },
            { "": ": " },
            { color: "#FFA6EF", text: "danke" },
          ],
          text: "",
        },
      ],
      text: "",
    },
  ],
};

const msg2: NBTData = {
  italic: 1,
  color: "gray",
  with: [{ "": "Server" }, { translate: "commands.save.success" }],
  translate: "chat.type.admin",
};

const msg3: NBTData = {
  with: [
    {
      extra: [
        {
          extra: [{ insertion: "RiseDucky1214", text: "RiseDucky1214" }],
          clickEvent: {
            action: "suggest_command",
            value: "/tell RiseDucky1214 ",
          },
          hoverEvent: {
            action: "show_entity",
            contents: {
              type: "minecraft:player",
              id: "34dc8b40c89b42ec9f340918951bce0e",
              name: "RiseDucky1214",
            },
          },
          text: "",
        },
      ],
      text: "",
    },
    {
      color: "green",
      with: [
        {
          extra: [
            {
              hoverEvent: {
                action: "show_text",
                contents: {
                  color: "green",
                  extra: [
                    { "": "\n" },
                    {
                      translate:
                        "advancements.husbandry.silk_touch_nest.description",
                    },
                  ],
                  translate: "advancements.husbandry.silk_touch_nest.title",
                },
              },
              translate: "advancements.husbandry.silk_touch_nest.title",
            },
          ],
          text: "",
        },
      ],
      translate: "chat.square_brackets",
    },
  ],
  translate: "chat.type.advancement.task",
};

const msg4: NBTData = {
  translate: "%s",
  with: [
    {
      extra: [
        { bold: 1, color: "#9C59D1", text: "⚲ " },
        { bold: 1, color: "dark_gray", text: "[Scribe]" },
        { "": " " },
        {
          extra: [
            { color: "#1657FD", text: "Y" },
            { color: "#3C4DD9", text: "r" },
            { color: "#6344B5", text: "e" },
            { color: "#893A91", text: "n" },
          ],
          clickEvent: { action: "suggest_command", value: "/msg Yren " },
          hoverEvent: {
            action: "show_text",
            contents: {
              extra: [
                { color: "green", text: "World: " },
                { color: "gray", text: "world\n" },
                { color: "yellow", text: "Biome: " },
                { color: "gold", text: "Cherry Grove\n" },
                { color: "red", text: "Health: 20" },
                { color: "gray", text: "/20\n" },
                { color: "aqua", text: "Ping: " },
                { color: "green", text: "44 " },
                { color: "aqua", text: "ms" },
              ],
              text: "",
            },
          },
          text: "",
        },
        {
          extra: [{ color: "white", text: "check disc, I'll show ya lol" }],
          text: ": ",
        },
      ],
      text: "",
    },
  ],
};

const msg5: NBTData = { translate: "<%s> %s", with: ["0x27", { text: "hi" }] };

const chatParser = async (msg: NBTData): Promise<string> => {
  const isString = (obj: any) => obj.constructor.name === "String";
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
  let hadWith = false;

  // translation loop
  if (msg.translate && msg.with) {
    if (msg.translate in translations) {
      const translation = translations[msg.translate];
      if (translation.includes("%s")) {
        let translated = translation;
        for (const arg of msg.with) {
          if (isString(arg)) translated = translated.replace("%s", arg);
          else translated = translated.replace("%s", await chatParser(arg));
          hadWith = true;
        }
        builder += translated;
      }
    } else if (msg.translate.includes("%s")) {
      let translated = msg.translate;
      for (const arg of msg.with) {
        if (isString(arg)) translated = translated.replace("%s", arg);
        else translated = translated.replace("%s", await chatParser(arg));
        hadWith = true;
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
  if (msg.text && !hadWith) {
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
};

// Parser(msg).then(console.log);
// Parser(msg2).then(console.log);
// Parser(msg3).then(console.log);
// Parser(msg4).then(console.log);
chatParser(msg5).then(console.log);
