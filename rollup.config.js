// const typescript = require('@rollup/plugin-typescript');
const { nodeResolve } = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');

module.exports = {
    input: 'build/tsc/index.js',
    output: {
        dir: 'build',
        format: 'cjs',
        strict: false
    },
    plugins: [nodeResolve({ preferBuiltins: false }), commonjs(), json()],
};