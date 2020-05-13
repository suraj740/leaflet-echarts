var path = require('path');
var webpack = require('webpack');
var PACKAGE = require('./package.json');
var banner = '\n ' + PACKAGE.name + ' - v' + PACKAGE.version + ' (' + PACKAGE.homepage + ') ' +
    '\n ' + PACKAGE.description + '\n ' +
    '\n ' + PACKAGE.license +
    '\n (c) ' + new Date().getFullYear() + '  ' + PACKAGE.author + '\n';

var pluginFiles = ['./src/leaflet-echarts.js'];

module.exports = [
    {
        mode: "development",
        entry: {
            "leaflet-echarts": pluginFiles,
        },
        output: { filename: '[name].js', path: path.resolve(__dirname, 'dist') },
        plugins: [
            new webpack.BannerPlugin(banner)
        ]
    },
    {
        mode: "production",
        entry: {
            "leaflet-echarts.min": pluginFiles,
        },
        output: { filename: '[name].js', path: path.resolve(__dirname, 'dist') },
        plugins: [
            new webpack.BannerPlugin(banner)
        ]
    }
];