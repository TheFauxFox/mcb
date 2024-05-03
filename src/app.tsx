import React, { useState } from 'react';
import { Text, Box, measureElement, DOMElement } from 'ink';
import { getTermSize } from './lib/term.js';
import TextInput from './lib/textInput.js';

// type Props = {
//   name: string | undefined;
// };

export default function App(/*{ name = 'Stranger' }: Props*/) {
  const [wid, hei] = getTermSize();
  const [inputSize, _setInputSize] = useState([0, 3]);
  const [chatMessage, setChatMessage] = useState('');
  const chat = useState<string[]>([]);
  const inputRef = React.createRef<DOMElement>();
  return (
    <Box width={wid} height={hei}>
      <Box flexDirection={'column'} width={wid - 44}>
        <Box height={hei - 1} flexDirection={'column'} borderStyle={'single'}>
          <Text>
            <Text color="cyanBright">Logged in!</Text>
          </Text>
          {chat[0].map((line, ix) => (
            <Text key={ix}>{line}</Text>
          ))}
        </Box>
        <Box height={3} width={'100%'} borderStyle={'single'} ref={inputRef}>
          <TextInput
            placeholder="Type to Chat"
            value={chatMessage}
            size={inputSize}
            onChange={(value) => {
              setChatMessage(value);
              if (inputRef.current) {
                const size = measureElement(inputRef.current);
                _setInputSize([size.width + 7, size.height - 2]);
              }
            }}
            onSubmit={(val: string) => {
              chat[0].push(val);
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
