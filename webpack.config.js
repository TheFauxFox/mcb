const path = require('path');
const webpack = require('webpack');

module.exports = {
    target: 'node',
    entry: './src/index.ts',
    output: {
        path: path.join(__dirname, 'build'),
        filename: 'bundle.js',
    },
    // optimization: {
    //     minimize: true,
    // },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json', '.mjs', '.cjs', '.wasm'],
    },
    plugins: [
        new webpack.IgnorePlugin({ resourceRegExp: /pty.js/, contextRegExp: /blessed\/lib\/widgets$/ }),
        new webpack.IgnorePlugin({ resourceRegExp: /term.js/, contextRegExp: /blessed\/lib\/widgets$/ })
    ]
};