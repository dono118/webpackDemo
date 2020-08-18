/**
 * 使用dll技术对某些库(第三方库: 如 jquery react vue)进行单独打包
 * 运行webpack, 默认使用的配置文件是 webpack.config.js
 * --config 可以指定配置文件
 *   --> webpack --config webpack.dll.js
 */
const { resolve } = require('path');
const Webpack = require('webpack');

module.exports = {
    entry: {
        // 最终打包生成的[name] --> jquery
        // ['jquery'] --> 要打包的库是jquery
        jquery: ['jquery']
    },
    output: {
        filename: '[name].js',
        path: resolve(__dirname, 'dll'),
        library: '[name]_[hash:10]', // 打包的库里面向外暴露出去的内容的名称
    },
    plugins: [
        // 打包生成一个 manifest.json --> 提供和jquery的映射关系
        new Webpack.DllPlugin({
            name: '[name]_[hash:10]', // 映射库所暴露内容的名称
            path: resolve(__dirname, 'dll/manifest.json') // 输出文件路径和名称
        })
    ],
    mode: 'production'
}