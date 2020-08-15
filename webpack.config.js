/**
 * webpack.config.js webpack的配置文件
 *  作用: 指示 webpack 干哪些活 (当你运行 webpack 指令时, 会加载里面的配置)
 *  
 *  所有的构建工具都是基于node.js平台运行的, 模块化默认采用CommonJs.
 * 
 *  loader: 1. 下载   2. 使用(配置loader)
 *  plugins: 1. 下载   2.引入  3.使用
 */

// resolve用来拼接绝对路径
const { resolve } = require("path");
// HtmlWebpackPlugin 打包html文件
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
    // webpack配置
    // 入口起点
    entry: './src/index.js',
    // 输出
    output: {
        // 输出文件名
        filename: 'built.js',
        // 输出路径
        // __dirname 是node.js的变量, 代表当前文件所在目录的绝对路径
        path: resolve(__dirname, 'build')
    },
    // loader的配置
    module: {
        rules: [
            // 详细loader配置
            // 不同文件必须配置不同loader处理
            {
                // 匹配哪些文件
                test: /\.css$/,
                // 使用哪些loader进行处理
                use: [
                    // use 数组中loader执行顺序: 先执行 css-loader 后执行 style-loader
                    // 创建style标签, 将js中的样式资源放进去, 并添加到head中生效
                    'style-loader',
                    // 将css文件变成commonjs模块加载到js中, 里面内容是样式字符串
                    'css-loader'
                ]
            },
            {
                test: /\.less$/,
                use: [
                    'style-loader',
                    'css-loader',
                    // 将less文件编译成css文件
                    // 需要下载less和less-loader
                    'less-loader'
                ]
            },
            {
                // 问题: 默认处理不了html中的图片
                // 处理图片资源
                test: /\.(jpg|png|gif)$/,
                // 只用到一个loader时, 不需要写 use 数组
                // 需下载 url-loader 和 file-loader
                loader: 'url-loader',
                options: {
                    /**
                     * 图片小于8kb, 就会被base64处理
                     * 优点: 减少请求数量(减轻服务器压力)
                     * 缺点: 图片体积会变大(文件请求速度变慢)
                     */
                    limit: 8 * 1024,
                    // 如果解析时会出问题: [object Module] (使用npm@6.14.6下载的loader没有这个问题)
                    // 原因: 因为url-loader默认使用ES6语法解析, 而html-loader引入图片是使用CommonJs语法
                    // esModule: false,
                    // 给图片进行重命名 [hash:10] 表示取图片哈希值前10位, [ext] 表示图片的扩展名
                    name: '[hash:10].[ext]'
                }
            },
            {
                test: /\.html$/,
                // 处理HTML文件中img图片(负责引入img, 从而能被url-loader进行打包处理)
                loader: 'html-loader'
            },
            {
                // 打包其他资源(除了html,js,css资源以外的资源)
                exclude: /\.(css|js|html|less)$/,
                loader: 'file-loader',
                options: {
                    name: '[hash:10].[ext]'
                }
            }
        ]
    },
    // plugins的配置
    plugins: [
        // 详细plugins的配置
        /**
         * html-webpack-plugin 功能:
         *  new HtmlWebpackPlugin() 默认创建一个空html, 并引入打包输出的所有资源(js,css等)
         *  template: 在给定模板的基础上创建html, 并引入打包输出的所有资源(js,css等)
         */
        new HtmlWebpackPlugin({
            // 复制 ./src/index.html 文件到目标路径, 并引入打包输出的所有资源(js,css等)
            template: './src/index.html'
        })
    ],
    // 模式
    mode: 'development', //开发模式
    // mode: 'production'

    // 开发服务器 devServer: 用来自动化 (自动编译, 自动打开浏览器, 自动刷新浏览器)
    // 特点: 只会在内存中编译打包, 不会有任何输出
    // 启动devServer指令: npx webpack-dev-server (需下载该插件)
    devServer: {
        // 项目构建后的路径
        contentBase: resolve(__dirname, 'build'),
        // 启动gzip压缩
        compress: true,
        // 端口号
        port: 3000,
        // 自动打开浏览器
        open: true
    }

}