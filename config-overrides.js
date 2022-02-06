const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = function override(config, _env) {
    config.plugins.push(new InjectManifest({
        swSrc: './src/sw.js',
        swDest: './sw.js',
        // globDirectory: './dist/',
        // globPatterns: ['**/*.{html,js,css}'],
    }));
    return config;
}
