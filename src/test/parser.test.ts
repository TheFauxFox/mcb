import { test, expect } from '@jest/globals';
import chatParser from '../lib/parsers';

const testValues = [
	{
		packet: {
			extra: [
				{
					italic: 0,
					underlined: 0,
					bold: 1,
					color: 'dark_purple',
					obfuscated: 0,
					strikethrough: 0,
					text: '[',
				},
				{ italic: 0, bold: 0, color: 'gold', text: 'Chat' },
				{ italic: 0, color: 'green', text: 'C' },
				{ italic: 0, color: 'aqua', text: 'o' },
				{ italic: 0, color: 'red', text: 'l' },
				{ italic: 0, color: 'light_purple', text: 'o' },
				{ italic: 0, color: 'yellow', text: 'r' },
				{ italic: 0, bold: 1, color: 'dark_purple', text: '] ' },
				{ italic: 0, bold: 0, color: 'yellow', text: 'Your color is currently: ' },
				{
					italic: 0,
					underlined: 0,
					bold: 0,
					color: '#7B68EE',
					obfuscated: 0,
					strikethrough: 0,
					text: 'this',
				},
				{ italic: 0, color: 'yellow', text: '!' },
			],
			text: '',
		},
		output:
			'{bold}{#AA00AA-fg}[{/}{#FFAA00-fg}Chat{/}{#55FF55-fg}C{/}{#55FFFF-fg}o{/}{#FF5555-fg}l{/}{#FF55FF-fg}o{/}{#FFFF55-fg}r{/}{bold}{#AA00AA-fg}] {/}{#FFFF55-fg}Your color is currently: {/}{#7B68EE-fg}this{/}{#FFFF55-fg}!{/}',
	},
	{
		packet: {
			translate: '%s',
			with: [
				{
					extra: [
						{ bold: 1, color: 'gold', text: '[Artisan]' },
						{ '': ' ' },
						{
							color: 'green',
							clickEvent: { action: 'suggest_command', value: '/msg Crash3214 ' },
							hoverEvent: {
								action: 'show_text',
								contents: {
									extra: [
										{ color: 'green', text: 'World: ' },
										{ color: 'gray', text: 'world\n' },
										{ color: 'yellow', text: 'Biome: ' },
										{ color: 'gold', text: 'Stony Shore\n' },
										{ color: 'red', text: 'Health: 20' },
										{ color: 'gray', text: '/20\n' },
										{ color: 'aqua', text: 'Ping: ' },
										{ color: 'yellow', text: '73 ' },
										{ color: 'aqua', text: 'ms' },
									],
									text: '',
								},
							},
							text: 'Crash3214',
						},
						{
							extra: [
								{ bold: 1, color: '#1083FB', text: ' [' },
								{ bold: 1, color: '#269BDC', text: 'N' },
								{ bold: 1, color: '#3BB4BD', text: 'E' },
								{ bold: 1, color: '#51CC9F', text: 'R' },
								{ bold: 1, color: '#66E580', text: 'D' },
								{ bold: 1, color: '#7CFD61', text: ']' },
								{ '': ': ' },
								{ color: 'aqua', text: 'back' },
							],
							text: '',
						},
					],
					text: '',
				},
			],
		},
		output:
			'{white-fg}{bold}{#FFAA00-fg}[Artisan]{/} {#55FF55-fg}Crash3214{/}{bold}{#1083FB-fg} [{/}{bold}{#269BDC-fg}N{/}{bold}{#3BB4BD-fg}E{/}{bold}{#51CC9F-fg}R{/}{bold}{#66E580-fg}D{/}{bold}{#7CFD61-fg}]{/}: {#55FFFF-fg}back{/}{/}',
	},
	{
		packet: { translate: '[%s] %s', with: ['Server', 'hi'] },
		output: '{white-fg}[Server] hi{/}',
	},
	{
		packet: { translate: '<%s> %s', with: ['0x27', { text: 'hi' }] },
		output: '{white-fg}<0x27> {white-fg}hi{/}{/}',
	},
];

test('Chat parser works correctly', async () => {
	for (const testValue of testValues) {
		expect(await chatParser(testValue.packet)).toBe(testValue.output);
	}
});
