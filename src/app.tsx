import React, { useEffect, useState } from 'react';
import { Text, Box, DOMElement, measureElement } from 'ink';
import { getTermSize } from './lib/term.js';
import TextInput from 'ink-text-input';
import { pingParser } from './lib/parsers.js';

export default function App() {
  const [wid, hei] = getTermSize();
  const [chatMessage, setChatMessage] = useState('');
  const playerNameWidth = 16;
  const pingWidth = 4;
  const separatorWidth = 5;
  let chatHeight = hei - 3;
  let playersHeight = Math.floor(hei * 0.6);
  let serverInfoHeight = Math.ceil(hei * 0.4);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [chat, _setChat] = useState<string[]>([
    'Logged In!',
    'Welcome to the server!',
    'Type /help for a list of commands.',
    'Type /list to see who is online.',
  ]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [players, _setPlayers] = useState<string[]>([
    'Player1',
    'Player2',
    'Player3',
    'Player4',
    'Player5',
    'Player6',
    'Player7',
    'Player8',
    'Player9',
    'Player10',
  ]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [serverInfo, _setServerInfo] = useState<string[]>([
    'Server IP:',
    'Server Port:',
    'Server Version:',
    'Server Uptime:',
    'Server TPS:',
  ]);
  const refresh = () => {
    const subSize = 5;
    if (chatboxRef.current !== null) {
      const size = measureElement(chatboxRef.current);
      chatHeight = size.height - subSize;
    }
    if (playersRef.current !== null) {
      const size = measureElement(playersRef.current);
      playersHeight = size.height - subSize;
    }
    if (serverinfoRef.current !== null) {
      const size = measureElement(serverinfoRef.current);
      serverInfoHeight = size.height - subSize;
    }
  };
  useEffect(() => {
    refresh();
  }, [chat, players, serverInfo]);
  const inputRef = React.createRef<DOMElement>();
  const chatboxRef = React.createRef<DOMElement>();
  const playersRef = React.createRef<DOMElement>();
  const serverinfoRef = React.createRef<DOMElement>();

  return (
    <Box width={wid} height={hei}>
      <Box flexDirection={'column'} width={wid - (playerNameWidth + pingWidth + separatorWidth)}>
        <Box
          height={hei}
          flexDirection={'column'}
          borderStyle={'single'}
          flexShrink={5}
          ref={chatboxRef}
          overflowY="hidden"
        >
          <Text color="whiteBright" bold={true} underline={true}>
            {'Chat' + ' '.repeat(wid - 31)}
          </Text>
          {chat.slice(-(chatHeight - 3)).map((line) => (
            <Text>{line}</Text>
          ))}
        </Box>
        <Box minHeight={3} width={'100%'} ref={inputRef} flexGrow={1} borderStyle={'single'}>
          <TextInput
            placeholder="Send a message..."
            value={chatMessage}
            onChange={(value) => {
              if (value.length > 256) return;
              setChatMessage(value);
            }}
            onSubmit={(val: string) => {
              _setChat(chat.concat(val));
              setChatMessage('');
            }}
          />
        </Box>
      </Box>
      <Box flexDirection={'column'}>
        <Box
          flexDirection={'column'}
          borderStyle={'single'}
          width={playerNameWidth + pingWidth + separatorWidth}
          height={playersHeight}
          ref={playersRef}
          overflowY="hidden"
        >
          <Text color="whiteBright" bold={true} underline={true}>
            {'Players' + ' '.repeat(16)}
          </Text>
          {players
            .slice(0, playersHeight - 3)
            .map((player) => pingParser(Math.floor(Math.random() * 200), player))}
        </Box>
        <Box
          flexDirection={'column'}
          borderStyle={'single'}
          width={playerNameWidth + pingWidth + separatorWidth}
          height={serverInfoHeight}
          ref={serverinfoRef}
          overflowY="hidden"
        >
          <Text color="whiteBright" bold={true} underline={true}>
            {'Server Info' + ' '.repeat(12)}
          </Text>
          {serverInfo.slice(0, serverInfoHeight - 3).map((line) => (
            <Text>{line}</Text>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
