import blessed from "blessed";

const screen = blessed.screen({
  smartCSR: true,
  title: "Minecraft Chat Client",
});

var chatBox = blessed.box({
  top: 0,
  left: 0,
  width: "80%",
  height: "100%-3",
  tags: true,
  label: "Chat",
  scrollable: true,
  alwaysScroll: true,
  mouse: true,
  scrollbar: {
    style: {
      bg: "white",
    },
    track: {
      bg: "gray",
    },
  },
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "white",
    },
  },
});

var playerList = blessed.list({
  top: 0,
  left: "80%",
  width: "20%",
  height: "100%",
  tags: true,
  label: "Players",
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "white",
    },
  },
});

var inputBar = blessed.textbox({
  bottom: 0,
  left: 0,
  height: 3,
  width: "80%",
  keys: true,
  mouse: true,
  inputOnFocus: true,
  label: "Send a message",
  border: {
    type: "line",
  },
  style: {
    fg: "white",
    bg: "black",
    border: {
      fg: "white",
    },
  },
});

screen.append(chatBox);
screen.append(playerList);
screen.append(inputBar);

function log(text: string) {
  chatBox.pushLine(text);
  screen.render();
}

screen.key(["q"], () => process.exit(0));

let num = 0;

setInterval(() => {
  log("{brightred-fg}just{/brightred-fg} displaying some stuff " + num++);
  chatBox.setScrollPerc(100);
}, 100);
