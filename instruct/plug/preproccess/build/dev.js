//引入相关依赖包
const express = require('express');
const path = require('path');

const Webpack = require("webpack");

//创建应用
const app = express();

const clientConfig = require('./webpack.config.client.js');

clientConfig.entry.wzlysdk.push(path.resolve(__dirname, './dev-client'));
clientConfig.plugins.push(
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin())
// dev middleware
const clientCompiler = Webpack(clientConfig);
const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    log: false,
    heartbeat: 2500,
    noInfo: true
})

//静态资源管理
app.use(express.static(path.resolve(__dirname, '../demo')));

app.use('/',devMiddleware)
// 热重载
app.use('/',require('webpack-hot-middleware')(clientCompiler))

//监听端口
app.listen(9080, '0.0.0.0', () => {
    console.log('打开成功')
})