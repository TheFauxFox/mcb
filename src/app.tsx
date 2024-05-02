import React from 'react';
import { Text, Box } from 'ink';
import TextInput from 'ink-text-input';

type Props = {
  name: string | undefined;
};

export default function App({ name = 'Stranger' }: Props) {
  return (
    <Box borderStyle="single">
      <Text>
        Hello, <Text color="green">{name}</Text>
      </Text>
      <TextInput
        value="Hello World"
        onChange={(v) => {
          console.log(v);
        }}
      ></TextInput>
    </Box>
  );
}
