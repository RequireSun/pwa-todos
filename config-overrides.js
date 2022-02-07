const { InjectManifest } = require('workbox-webpack-plugin');

module.exports = function override(config, _env) {
    config.plugins.push(new InjectManifest({
        swSrc: './src/sw.ts',
        swDest: './sw.js',
    }));
    return config;
};

// 最后没抗争过, 还是用了带 path 的版本
// const PUBLIC_PATH = '/';
//
// function findPlugin(plugins, name) {
//     return plugins.find(p => p.constructor.name === name);
// }
// const manifestPlugin = findPlugin(config.plugins, 'WebpackManifestPlugin');
// if (manifestPlugin?.options) {
//     manifestPlugin.options.publicPath = PUBLIC_PATH;
// }
// const interpolateHtmlPlugin = findPlugin(config.plugins, 'InterpolateHtmlPlugin');
// if (interpolateHtmlPlugin?.replacements) {
//     interpolateHtmlPlugin.replacements.PUBLIC_URL = '.';
// }
// config.output.publicPath = PUBLIC_PATH;
