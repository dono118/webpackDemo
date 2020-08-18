/**
 * 优化生产环境配置
 * 1. 使用oneOf
 * 2. 缓存:
 *      babel缓存
 *        cacheDirectory: true
 *        --> 让第二次打包构建速度更快 
 *      资源文件缓存
 *        hash webpack每次打包都会生成一个唯一的hash值
 *        chunkhash 根据chunk生成, 又因为js中引入了css文件
 *            它们同属于一个chunk 所以它们的chunkhash是一样的
 *        问题: 因为js和css使用同一个hash值, 所以在修改其中一个文件后重新打包时,
 *              会导致所有缓存失效, 这样不太好
 *        解决方案: 使用contenthash 它是根据文件的内容生成的 不同文件的hash值一定不同
 *        --> 让代码上线运行缓存更好使用
 * 
 * 3. tree shaking: 去除无用的代码
 *      前提: 1)必须使用ES6模块化  2)开启production环境
 *      作用: 减小代码体积
 *      
 *      在package.json中配置
 *          "sideEffects": false 意味着去除任何代码都没有副作用(都可以进行tree shaking)
 *              问题: 会去除js中引入的css,less,@babel/polyfill等文件
 *          "sideEffects": ["*.css","*.less"] 保留引入的css,less文件
 * 
 * 4. code split: 代码分割
 *      1)多入口文件
 *          entry: {
                index: './src/js/index.js',
                test: './src/js/test.js'
            },
        2) 配置optimization
            optimization: {
                splitChunks: {
                    chunks: 'all'
                }
            },
        3) 使用import动态导入语法引入的js文件, 会被单独打包成一个chunk
            import(/* webpackChunkName: 'test' *\/'./test').then(...).catch(...)
 * 
 * 5. lazy loading 
 *      正常加载: 并行加载(同时加载多个文件)
 *      懒加载: 当文件需要时才加载
 *      预加载(prefetch): 等其他资源加载完成后, 利用空闲时间提前加载好
 *      $('#btn').click(() => {
 *          import(/* webpackChunkName: 'test', webpackPrefetch: true *\/'./test')
 *              .then(...).catch(...)
 *      })
 * 
 * 6. PWA(Progressive web apps, 渐进式 Web 应用)
 *      workbox -->workbox-webpack-plugin
 *      sw代码必须运行在服务器上
 *          1) 用 nodejs 自己写一个服务器
 *          2) 安装一个 npm i serve -g --> serve -s build 启动服务器 根目录为build
 * 
 */

// resolve用来拼接绝对路径
const { resolve } = require("path");
// HtmlWebpackPlugin 打包html文件
const HtmlWebpackPlugin = require("html-webpack-plugin");
// 提取css成单独文件
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩css
const OptimizeCssAssetsWebpackPlugin = require("optimize-css-assets-webpack-plugin");
// pwa
const WorkboxWebpackPlugin = require("workbox-webpack-plugin");

// 设置nodejs环境变量
process.env.NODE_ENV = "production";//生产环境

// 复用 loader
const CommonCssLoader = [
    // 创建style标签, 将js中的样式资源放进去, 并添加到head中生效
    // 'style-loader',
    // 这个loader取代style-loader 作用: 提取js中的css成单独文件
    {
        loader: MiniCssExtractPlugin.loader,
        options: {
            // 解决css文件里背景图片路径不对的问题
            publicPath: '../'
        }
    },
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

module.exports = {
    // webpack配置
    // 入口起点 单入口
    entry: './src/js/index.js',
    // 多入口
    // entry: {
    //     index: './src/js/index.js',
    //     test: './src/js/test.js'
    // },
    // 输出
    output: {
        // 输出文件名
        filename: 'js/[name].[contenthash:10].js',
        // 输出路径
        // __dirname 是node.js的变量, 代表当前文件所在目录的绝对路径
        path: resolve(__dirname, 'build')
    },
    // loader的配置
    module: {
        rules: [
            {
                /**
                 * 语法检查: eslint-loader
                 *   注意: 只检查自己写的源代码, 第三方库是不用检查的
                 *   设置检查规则: 在 package.json-->eslintConfig 中设置
                 *   推荐使用airbnb --> eslint-config-airbnb-base eslint eslint-plugin-import
                 *  "eslintConfig": {
                        "extends": "airbnb-base",
                        "parser": "babel-eslint", // 解决各种 Parsing error 报错
                        "env": {
                            "browser": true //支持浏览器端全局变量window,document等
                        }
                    },
                 */
                test: /\.js$/,
                exclude: /node_modules/,
                // 优先执行
                enforce: 'pre',
                loader: 'eslint-loader',
                options: {
                    // 自动修复eslint语法错误
                    fix: true
                }
            },
            {
                /**
                 * oneOf: 只会去匹配数组中的一个loader, 匹配到一个就不再继续匹配
                 * 一般情况下, loader的执行顺序为从右往左, 从下往上
                 * 可以通过enforce属性去改变执行顺序
                 */
                oneOf: [
                    // 详细loader配置
                    // 不同文件必须配置不同loader处理
                    {
                        // 匹配哪些文件
                        test: /\.css$/,
                        // 使用哪些loader进行处理
                        // use 数组中loader执行顺序: 从右往左, 从下往上
                        use: [
                            ...CommonCssLoader
                        ]
                    },
                    {
                        test: /\.less$/,
                        use: [
                            ...CommonCssLoader,
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
                    {
                        /**
                         * js兼容性处理: babel-loader @babel/core @babel/preset-env core-js
                         */
                        test: /\.js$/,
                        exclude: /node_modules/,
                        use: [
                            /**
                             * 开启多进程打包
                             * 进程启动大概需要600ms, 进程间通信也会有开销
                             * 只有工作消耗时间比较长(js代码量比较大)时, 才需要多进程打包
                             */
                            {
                                loader: 'thread-loader',
                                options: {
                                    workers: 2 // 进程2个
                                }
                            },
                            {
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
                                    ],
                                    // 开启babel缓存
                                    cacheDirectory: true
                                }
                            }
                        ]
                    }
                ]
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
            /**
             * html-webpack-plugin could not minify the generated output.
             * In production mode the html minifcation is enabled by default.
             * If you are not generating a valid html output please disable it manually.
             * You can do so by adding the following setting to your HtmlWebpackPlugin config:
             *      minify: false
             */
            minify: false
        }),
        new MiniCssExtractPlugin({
            // 对输出的css文件进行重命名
            filename: 'css/built.[contenthash:10].css'

        }),
        new OptimizeCssAssetsWebpackPlugin(),
        new WorkboxWebpackPlugin.GenerateSW({
            /**
             * 1. 帮助 serviceWork 快速启动
             * 2. 删除旧的 serviceWork
             * 3. 生成一个 serviceWork 配置文件
             */
            clientsClaim: true,
            skipWaiting: true
        })
    ],
    /**
     * 1. 会将入口文件中引入的node_modules依赖包单独打包成一个chunk输出
     * 2. 多入口情况下, 多个入口文件中的公共依赖只会单独输出成一个chunk
     */
    optimization: {
        splitChunks: {
            chunks: 'all'
        }
    },
    // 模式
    mode: 'production', //生产环境会自动压缩js代码
    // devtool: 'source-map'
}