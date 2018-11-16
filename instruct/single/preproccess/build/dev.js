//引入相关依赖包
const express = require('express');
const path = require('path');

const Webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const httpProxyMiddleware = require('http-proxy-middleware');

//创建应用
const app = express();

const clientConfig = require('./webpack.config.client.js');

clientConfig.entry.<% name %>.push(path.resolve(__dirname, './dev-client'));
clientConfig.plugins.push(
	new Webpack.HotModuleReplacementPlugin(), 
	new Webpack.NoEmitOnErrorsPlugin(),
	new HtmlWebpackPlugin({
            addLinkCss: ['./css/<% name %>.css'],
            filename: './<% name %>.html',
            template: path.resolve(__dirname, '../template/hot.tpl'),
            hash: true
        }))
// dev middleware
const clientCompiler = Webpack(clientConfig);	
const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    noInfo: true
})

app.use('/',devMiddleware)
// 热重载
app.use('/',require('webpack-hot-middleware')(clientCompiler))

if(<% proxy %> != ""){
   //代理配置
    app.use('/api', httpProxyMiddleware({
        target: <% proxy %>,
        pathRewrite: {
            '^/api': ''
        },
        changeOrigin: true
    })); 
}


//监听端口
app.listen(9080, '0.0.0.0', () => {
	console.log('打开成功')
})