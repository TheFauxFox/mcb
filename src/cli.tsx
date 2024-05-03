#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
// import { ArgumentParser } from 'argparse';
import App from './app.js';

// const parser = new ArgumentParser({
//   description: 'Minecraft Console Chat Client',
// });

// parser.add_argument('-c', '--config', {
//   help: 'Path to config file',
//   required: false,
//   type: String,
//   default: './bot.toml',
// });

// const args = parser.parse_args();

// render(<App name={args.config} />);
render(<App />);
