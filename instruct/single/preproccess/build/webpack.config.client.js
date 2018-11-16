const path = require('path');
const Webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const config = {
    //入口
    entry: {
        <% name %>: [path.resolve(__dirname, '../src/client-entry.js')],
    },
    //产出
    output: {
        path: path.resolve(__dirname, '../dist/'),
        filename: '[name].js',
        publicPath:'./'
    },
    mode: 'production',
    //解析
    resolve: {
        extensions: ['.vue', '.js'],
        alias: {
            'vue$': 'vue/dist/vue.min.js'
        }
    },
    //模块配置
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }, {
            test: /\.vue$/,
            exclude: /node_modules/,
            use: [{
                loader: 'vue-loader',
                options: {
                    loaders: {
                        js: 'babel-loader'
                    }
                }
            }]
        }, {
            test: /\.(jpg|png|gif|ico)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: './images/[name].[ext]',
                    publicPath:'../images/[name].[ext]',
                }
            }]
        }, {
            test: /\.css$/,
            //提取合并为同一个css文件
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: [ 'css-loader'],
            })
            
        }, {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                fallback: "style-loader",
                use: ["css-loader", "sass-loader"]
            })
        }, {
            test: /\.(eot|woff|svg|ttf)$/,
            use: [{
                loader: 'file-loader',
                options: {
                    name: './fonts/[name].[ext]',
                    publicPath: './fonts/',
                    outputPath: './fonts/'
                }
            }]
        }]
    },
    //插件配置
    plugins: [
        new ExtractTextPlugin({
            filename: "css/[name].css",
            disable: false,
            allChunks: true
        }),
        new Webpack.ProvidePlugin({
            Vue: 'vue'
        }),
        new VueLoaderPlugin(),
        new VueSSRClientPlugin()
    ],
    //构建模式
    target: 'web'
}

module.exports = config