const { GenerateSW } = require('workbox-webpack-plugin');

module.exports = function override(config, _env) {
    config.plugins.push(new GenerateSW());
    return config;
}
