/**
 * 开发环境配置:
 *    运行项目指令:
 *      webpack 会将打包结果输出到目标路径
 *      npx webpack-dev-server 只会在内存中打包编译, 没有输出
 */

// resolve用来拼接绝对路径
const { resolve } = require("path");
// HtmlWebpackPlugin 打包html文件
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 提取css成单独文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩css
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");

// 设置nodejs环境变量
process.env.NODE_ENV = "development";

module.exports = {
    // webpack配置
    // 入口起点
    entry: './src/js/index.js',
    // 输出
    output: {
        // 输出文件名
        filename: 'js/built.js',
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
                    // 'style-loader',
                    // 这个loader取代style-loader 作用: 提取js中的css成单独文件
                    MiniCssExtractPlugin.loader,
                    // 将css文件变成commonjs模块加载到js中, 里面内容是样式字符串
                    'css-loader',
                    /**
                     * css兼容性处理: postcss --> postcss-loader postcss-preset-env
                     * 
                     * 帮postcss找到package.json中browserslist里面的配置, 通过配置加载指定的兼容性样式
                     * "browserslist": {
                            // 开发环境 --> 设置nodejs环境变量: process.env.NODE_ENV = "development"
                            "development": [
                            "last 1 chrome version",
                            "last 1 firefox version",
                            "last 1 safari version"
                            ],
                            // 生产环境: 默认是生产环境
                            "production": [
                            ">0.2%",
                            "not dead",
                            "not op_mini all"
                            ]
                        }
                     */
                    // 使用loader的默认配置
                    // 'postcss-loader',
                    // 修改loader的配置
                    {
                        loader: 'postcss-loader',
                        options: {
                            ident: 'postcss',
                            plugins: () => [
                                // postcass的插件
                                require('postcss-preset-env')()
                            ]
                        }
                    }
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
                    name: '[hash:10].[ext]',
                    outputPath: 'imgs'
                }
            },
            {
                test: /\.html$/,
                // 处理HTML文件中img图片(负责引入img, 从而能被url-loader进行打包处理)
                loader: 'html-loader'
            },
            {
                // 打包其他资源(除了html,js,css资源以外的资源)
                exclude: /\.(html|js|css|less|jpg|png|gif)$/,
                loader: 'file-loader',
                options: {
                    name: '[hash:10].[ext]',
                    outputPath: 'media'
                }
            },
            // {
            //     /**
            //      * 语法检查: eslint-loader
            //      *   注意: 只检查自己写的源代码, 第三方库是不用检查的
            //      *         下一行不进行eslint检查 eslint-disable-next-line
            //      *   设置检查规则: 在 package.json-->eslintConfig 中设置
            //      *   推荐使用airbnb --> eslint-config-airbnb-base eslint eslint-plugin-import
            //      *  "eslintConfig": {
            //             "extends": "airbnb-base"
            //         }
            //      */
            //     test: /\.js$/,
            //     exclude: /node_modules/,
            //     loader: 'eslint-loader',
            //     options: {
            //         // 自动修复eslint语法错误
            //         fix: true
            //     }
            // },
            {
                /**
                 * js兼容性处理: babel-loader @babel/core @babel/preset-env core-js
                 */
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    // 预设: 指示babel如何做兼容性处理
                    presets: [
                        [
                            '@babel/preset-env',
                            {
                                // 按需加载
                                useBuiltIns: 'usage',
                                // 指定core-js版本
                                corejs: {
                                    version: 3
                                },
                                // 指定兼容性做到哪个版本浏览器
                                targets: {
                                    chrome: '60',
                                    firefox: '60',
                                    ie: '9',
                                    safari: '10',
                                    edge: '17'
                                }
                            }
                        ]
                    ]
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
            template: './src/index.html',
            // 压缩html
            minify: {
                // 去除空格
                collapseWhitespace: true,
                // 移除注释
                removeComments: true
            }
        }),
        new MiniCssExtractPlugin({
            // 对输出的css文件进行重命名
            filename: 'css/built.css'

        }),
        new OptimizeCssAssetsWebpackPlugin()
    ],
    // 模式
    mode: 'development', //开发模式
    // mode: 'production' //生成环境会自动压缩js代码

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