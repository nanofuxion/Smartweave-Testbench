const path = require('path');

module.exports = {
    mode: 'development',
    entry: './bin/bench.ts',
    module: {
        rules: [{
            test: /fileInWhichJQueryIsUndefined\.js$/,
            loader: 'string-replace-loader',
            options: {
                search: /export\s+async\s+function\s+handle/gmu,
                replace: 'window.jQuery'
            }
        },
        {
            test: /fileInWhichJQueryIsUndefined\.js$/,
            loader: 'string-replace-loader',
            options: {
                search: /export\s+async\s+function\s+handle/gmu,
                replace: 'window.jQuery'
            }
        }]
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};