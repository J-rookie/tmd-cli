const path = require('path');
const Webpack = require("webpack");
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

const config = {
    //入口
    entry: {
        <% name %>: [path.resolve(__dirname, '../src/server-entry.js')],
    },
    //产出
    output: {
        path: path.resolve(__dirname, '../dist/'),
        filename: '[name].js',
        publicPath:'./',
        libraryTarget: "commonjs2"
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
            use: 'vue-loader'
        }, {
            test: /\.(jpg|png|gif|ico)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8196,
                    name: './[name].[ext]',
                    outputPath: './images/',
                }
            }]
        }, {
            test: /\.css$/,
            //提取合并为同一个css文件
            use: ExtractTextPlugin.extract({
                publicPath: '../',
                fallback: "style-loader",
                use: [ "css-loader?minimize=true"],
            })
            
        }, {
            test: /\.scss$/,
            use: ExtractTextPlugin.extract({
                publicPath: '../',
                fallback: "style-loader",
                use: ["css-loader?minimize=true", "sass-loader"]
            })
        }, {
            test: /\.(eot|woff|svg|ttf)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    name: './[name].[ext]',
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
        new VueSSRServerPlugin()
    ],
    //构建模式
    target: 'node'
}

module.exports = config