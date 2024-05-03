import React, { useState } from 'react';
import { Text, Box } from 'ink';
import { getTermWidth } from './lib/term.js';
import TextInput from './lib/textInput.js';

// type Props = {
//   name: string | undefined;
// };

export default function App(/*{ name = 'Stranger' }: Props*/) {
  const [wid, hei] = getTermWidth();
  const [chatMessage, setChatMessage] = useState('');
  const [chat, _setChat] = useState<string[]>([]);
  return (
    <Box width={wid} height={hei}>
      <Box flexDirection={'column'} width={wid - 44}>
        <Box height={hei - 1} flexDirection={'column'} borderStyle={'single'}>
          <Text>
            <Text color="cyanBright">Logged in!</Text>
          </Text>
          {chat.map((line, ix) => (
            <Text key={ix}>{line}</Text>
          ))}
        </Box>
        <Box height={3} borderStyle={'single'}>
          <TextInput
            placeholder="Type to Chat"
            value={chatMessage}
            onChange={setChatMessage}
            onSubmit={(val) => {
              chat.push(val);
              setChatMessage('');
            }}
          />
        </Box>
      </Box>
      <Box flexDirection={'column'}>
        <Box flexDirection={'column'} borderStyle={'single'} width={44} height={'70%'}>
          <Text>Hello</Text>
          <Text>world</Text>
          <Text>!</Text>
        </Box>
        <Box flexDirection={'column'} borderStyle={'single'} width={44} height={'30%'}>
          <Text>Hello</Text>
          <Text>world</Text>
          <Text>!</Text>
        </Box>
      </Box>
    </Box>
  );
}
