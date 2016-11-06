'use strict';

const webpack = require('webpack');
const path = require('path');

const config = {

    entry: {
        'main': path.join(__dirname, 'client/main.ts')
    },

    output: {
        path: path.join(__dirname, 'client/dist'),
        filename: '[name].bundle.js'
    },

    resolve: {
        extensions: ['', '.ts', '.js', '.json']
    },

    loaders: [
        {
            test: /\.ts$/,
            loaders: ['awesome-typescript-loader', 'angular2-template-loader']
        },
        {
            test: /\.html$/,
            loader: 'html'
        },
        {
            test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)$/,
            loader: 'file?name=assets/[name].[hash].[ext]'
        },
        {
            test: /\.css$/,
            loader: 'style!css'
        }
    ]
};

module.exports = config;