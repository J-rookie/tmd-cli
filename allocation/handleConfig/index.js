module.exports = {
    /*
     *创建执行文件
     *params { String } type 创建类型
     *params { Object } data 对应类型附带参数
     *return {String} 生成文件内容
     */
    execute(type, data) {
        let executeString = '';
        switch (type) {
            //插件模式main.js
            case "plug":
                executeString = `import './main.scss';\n\nconst ${data.name} = {};\n\nmodule.exports = ${data.name};`
                break;
            default:
                executeString = '这是一个错误的文件请联系作者'
                break;
        }

        return executeString;
    },
    /*
     *创建node脚本执行文件
     *params { String } type 脚本类别
     *params { Object } data 对应类型附带参数
     *return {String} 生成文件内容
     */
    node(type, data) {
        let nodeString = '';
        switch (type) {
            //热重载必要文件
            case "HotDevClient":
                nodeString = `require('eventsource-polyfill')
var hotClient = require('webpack-hot-middleware/client?noInfo=true&reload=true')

hotClient.subscribe(function(event) {
    if (event.action === 'reload') {
        window.location.reload()
    }
})`
                break;
                //普通打包模式
            case "build":
                nodeString = `const fs = require('fs');
const path = require('path');
const Webpack = require("webpack");

const serverConfig = require('./webpack.config.server.js');

const handlePack = function(config){
    return new Promise((resolve,reject)=>{
        Webpack(config, (err, stats) => {
            if (err || stats.hasErrors()) {
                console.log(err)
                reject();
                return;
            }
            resolve();
        })
    })
}

handlePack(serverConfig).then(()=>{
    console.log('\x1B[44m%s\x1B[49m', '插件打包成功');
}).catch(function(){
    console.log('\x1B[31m%s\x1B[39m', '插件打包失败');
})`
                break;
             case "PlugDevServer":
             	nodeString = `const express = require('express');
const path = require('path');

const Webpack = require("webpack");

const app = express();

const clientConfig = require('./webpack.config.client.js');

clientConfig.entry.${data.name}.unshift(path.resolve(__dirname, './dev-client'));
clientConfig.plugins.push(
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin())
const clientCompiler = Webpack(clientConfig);
const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    log: false,
    heartbeat: 2500,
    noInfo: true
})

app.use(express.static(path.resolve(__dirname, '../demo')));

app.use('/',devMiddleware)
app.use('/',require('webpack-hot-middleware')(clientCompiler))

//监听端口
app.listen(9080, '0.0.0.0', () => {
    console.log('打开成功')
})`
             break;
             case "SingleDevServer":
             let proxyStr = data.http!=""&&data.proxy?
`\n//代理配置
app.use('/api', httpProxyMiddleware({
    target: '${data.http}',
    pathRewrite: {
        '^/api': '/api'
    },
    changeOrigin: true
}));\n`:'';
                nodeString = `const express = require('express');
const path = require('path');

const Webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const httpProxyMiddleware = require('http-proxy-middleware');

//创建应用
const app = express();

const clientConfig = require('./webpack.config.client.js');

clientConfig.entry.${data.name}.push(path.resolve(__dirname, './dev-client'));
clientConfig.plugins.push(
    new Webpack.HotModuleReplacementPlugin(), 
    new Webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
            addLinkCss: ['./css/${data.name}.css'],
            filename: './${data.name}.html',
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
${proxyStr}
//监听端口
app.listen(9080, '0.0.0.0', () => {
    console.log('打开成功')
})`
             break;
             case "SingleBuildServer":
             break;
            default:
            reString = '这是一个错误的文件请联系作者'
            break;
        }

        return nodeString;
    }

}