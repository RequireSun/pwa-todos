const { InjectManifest } = require('workbox-webpack-plugin');

// const PUBLIC_PATH = '/';
//
// function findPlugin(plugins, name) {
//     return plugins.find(p => p.constructor.name === name);
// }

module.exports = function override(config, _env) {
    // const manifestPlugin = findPlugin(config.plugins, 'WebpackManifestPlugin');
    // if (manifestPlugin?.options) {
    //     manifestPlugin.options.publicPath = PUBLIC_PATH;
    // }
    // const interpolateHtmlPlugin = findPlugin(config.plugins, 'InterpolateHtmlPlugin');
    // if (interpolateHtmlPlugin?.replacements) {
    //     interpolateHtmlPlugin.replacements.PUBLIC_URL = '.';
    // }
    // config.output.publicPath = PUBLIC_PATH;
    config.plugins.push(new InjectManifest({
        swSrc: './src/sw.js',
        swDest: './sw.js',
        // globDirectory: './dist/',
        // globPatterns: ['**/*.{html,js,css}'],
    }));
    return config;
};
