const filemanage = require('../../utils/filemanage.js');
const path = require('path');
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
                //单页面模式main.js
            case "single":
                executeString = `import App from './App.vue';\n\nexport function createApp () {\n\tconst app = new Vue({\n\t\trender: h => h(App)\n\t})\n\treturn { app }\n}`;
                break;
                //单页应用模式mainmain.js
            case "spa":
                executeString = `import App from './App.vue';\nimport { createRouter } from './routes';\nimport { createStore } from './store';\n\nexport function createApp () {\n\tconst router = createRouter()\n\tconst store = createStore()\n\tconst app = new Vue({\n\t\trouter,\n\t\tstore,\n\t\trender: h => h(App)\n\t})\n\treturn { app }\n}`;
                break;
                //单页面模式client-entry.js
            case "singleClient":
                executeString = `import './main.scss';\nimport axios from '${data.type==='pages'?'../..':'.'}/lib/axios.${data.proxy?'client.':''}config.js';\nimport { createApp } from './main';\n\nVue.prototype.$http = axios;\n\nconst { app } = createApp();\n\napp.$mount('#app')`
                break;
                //单页应用模式client-entry.js
            case "spaClient":
                executeString = `import '${data.type==='pages'?'../..':'.'}/main.scss';\nimport axios from '${data.type==='pages'?'../..':'.'}/lib/axios.config.js';\nimport { createApp } from './main';\n\nVue.prototype.$http = axios;\n\nconst { app } = createApp();\n\napp.$mount('#app')`
                break;
                //server-entry.js
            case "singleServer":
                executeString = `import { createApp } from './main';\nimport axios from '${data.type==='pages'?'../..':'.'}/lib/axios.${data.proxy?'server.':''}config.js';\n\nVue.prototype.$http = axios;\n\nexport default context => {\n\n\tconst { app } = createApp()\n\n\treturn app\n}`
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
        let nodeString = '',
            proxyStr = '';
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

const serverConfig = require('./webpack.config.js');

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
    console.log('\\x1B[44m%s\\x1B[49m', '插件打包成功');
}).catch(function(){
    console.log('\\x1B[31m%s\\x1B[39m', '插件打包失败');
})`
                break;
                //使用jq的多页面打包
                case "Pages$Build":
                nodeString = `const fs = require('fs');
const path = require('path');
const Webpack = require("webpack");

const serverConfig = require('./webpack.config.js');

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
    return new Promise((resolve,reject)=>{
        let  pros = [];
        fs.readdir(path.resolve(__dirname, '../src'), (err, data)=>{
            if(err){
            reject(err)
          }else{
            data.map((e)=>{
                if(/(\\.html)$/.test(e)){
                    pros.push(new Promise((res,rej)=>{
                        fs.copyFile(path.resolve(__dirname, '../src/'+e), path.resolve(__dirname, '../dist/'+e), function(err) {
                            if (err) {
                                rej(err)
                            } else {
                                res();
                            }
                        });
                    }))
                }
            })
            
            Promise.all(pros).then(()=>{
                resolve();
            }).catch((err)=>{
                reject(err)
            })
          }
        })
    })
}).then(function(){
    console.log('\\x1B[44m%s\\x1B[49m', '插件打包成功');
}).catch(function(err){
    console.log('\\x1B[31m%s\\x1B[39m', '插件打包失败');
})`
                break;
                 //使用VueSSR的多页面打包
                case "PagesVueBuild":
                nodeString = `//---- 生成html文件----//
const fs = require('fs');
const path = require('path');
const Webpack = require("webpack");
const pages = ['aaaa','bb','cc'];

const clientConfig = require('./webpack.config.client.js');
const serverConfig = require('./webpack.config.server.js');

const buildFunc = function(client,server,names = [],cbOk){
    if(names.length<=0){
        cbOk&&cbOk();
        return;
    }
    let name = names.shift();
    client.entry = { 
        [name]: ['babel-polyfill',path.resolve(__dirname, '../src/entry/'+name+'/client-entry.js')],
    }
    client.output.path = path.resolve(__dirname, '../dist/'+name+'/');
    server.entry = { 
        [name]: [path.resolve(__dirname, '../src/entry/'+name+'/server-entry.js')],
    }
    server.output.path = path.resolve(__dirname, '../dist/'+name+'/');
    //客户端打包
    Webpack(client, (err, stats) => {
        if (err || stats.hasErrors()) {
            // 在这里处理错误
            console.log('\\x1B[31m%s\\x1B[39m', name+'客户端脚本打包失败');
        }else{
                console.log('\\x1B[44m%s\\x1B[49m', name+'客户端脚本打包成功');
            //服务端打包
            Webpack(server, (err, stats) => {
                if (err || stats.hasErrors()) {
                    // 在这里处理错误
                    console.log('\\x1B[31m%s\\x1B[39m', name+'服务端ssr文件打包失败');
                }else{
                    console.log('\\x1B[44m%s\\x1B[49m', name+'服务端ssr文件打包成功');

                    const serverBundle = require('../dist/'+name+'/vue-ssr-server-bundle.json')
                    const clientManifest = require('../dist/'+name+'/vue-ssr-client-manifest.json')
                    const template = fs.readFileSync(path.resolve(__dirname, '../template/render.tpl'), 'utf-8');

                    //创建一个生成器
                    const createBundleRenderer = require('vue-server-renderer').createBundleRenderer;


                    let renderer = createBundleRenderer(serverBundle, {
                        runInNewContext: false, // 推荐
                        template, // 页面模板
                        clientManifest // 客户端构建 manifest
                    })

                    let context = {};
                    renderer.renderToString(context, (err, html) => {
                        if (err) {
                            console.log(err)
                        }else{
                            fs.writeFile(path.resolve(__dirname, '../dist/'+name+'/index.html'), html, 'utf8', function(err) {
                                if (err) {
                                    console.log(err)
                                } else {
                                    console.log('\\x1B[44m%s\\x1B[49m', name+'生成html文件成功');
                                    buildFunc(client,server,names,cbOk);
                                }
                            });
                        }
                        
                    })
                }
                
            })
        }
        
    });
}

buildFunc(clientConfig,serverConfig,[`+function(){return data.subpage.map(e=>`"${e}"`).join(",");}()+`],function(){})`
                break;
            //插件打包模式
            case "PlugDevServer":
                nodeString = `const express = require('express');
const path = require('path');

const Webpack = require("webpack");

const app = express();

const clientConfig = require('./webpack.config.js');

clientConfig.entry.${data.name}.unshift(path.resolve(__dirname, './dev-client'));
clientConfig.mode = "development";
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
                proxyStr = data.http != "" && data.proxy ?
                    `\n//代理配置
app.use('/api', httpProxyMiddleware({
    target: '${data.http}',
    pathRewrite: {
        '^/api': '/api'
    },
    changeOrigin: true
}));\n` : '';
                nodeString = `const express = require('express');
const path = require('path');

const Webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const httpProxyMiddleware = require('http-proxy-middleware');

//创建应用
const app = express();

const clientConfig = require('./webpack.config.client.js');

clientConfig.entry.${data.name}.push(path.resolve(__dirname, './dev-client'));
clientConfig.mode = "development";
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
                nodeString = `const fs = require('fs');
const path = require('path');
const Webpack = require("webpack");

const clientConfig = require('./webpack.config.client.js');
const serverConfig = require('./webpack.config.server.js');
//客户端打包
Webpack(clientConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
        // 在这里处理错误
        console.log('\\x1B[31m%s\\x1B[39m', '客户端脚本打包失败');
        return;
    }
    console.log('\\x1B[44m%s\\x1B[49m', '客户端脚本打包成功');
    //服务端打包
    Webpack(serverConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
            // 在这里处理错误
            console.log('\\x1B[31m%s\\x1B[39m', '服务端ssr文件打包失败');
            return;
        }
        console.log('\\x1B[44m%s\\x1B[49m', '服务端ssr文件打包成功');

        const serverBundle = require('../dist/vue-ssr-server-bundle.json')
        const clientManifest = require('../dist/vue-ssr-client-manifest.json')
        const template = fs.readFileSync(path.resolve(__dirname, '../template/render.tpl'), 'utf-8');

        //创建一个生成器
        const createBundleRenderer = require('vue-server-renderer').createBundleRenderer;


        let renderer = createBundleRenderer(serverBundle, {
            runInNewContext: false, // 推荐
            template, // 页面模板
            clientManifest // 客户端构建 manifest
        })

        let context = {};
        renderer.renderToString(context, (err, html) => {
            if (err) {
                console.log(err)
                return;
            }
            fs.writeFile(path.resolve(__dirname, '../dist/${data.name}.html'), html, 'utf8', function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('\\x1B[44m%s\\x1B[49m', '生成html文件成功');
                    try {
                      fs.unlinkSync(path.resolve(__dirname, '../dist/vue-ssr-server-bundle.json'))
                      try{
                        fs.unlinkSync(path.resolve(__dirname, '../dist/vue-ssr-client-manifest.json'))
                        }catch(e){
                            throw e;
                        }
                    } catch (err) {
                      // 处理异常。
                      console.log(e)
                    }
                }
            });
        })
    })
});`
                break;
            case "SpaDevServer":
                proxyStr = data.http != "" && data.proxy ?
                    `\n//代理配置
app.use('/api', httpProxyMiddleware({
    target: '${data.http}',
    pathRewrite: {
        '^/api': '/api'
    },
    changeOrigin: true
}));\n` : '';
                nodeString = `const express = require('express');
const path = require('path');

const Webpack = require("webpack");
const httpProxyMiddleware = require('http-proxy-middleware');

//创建应用
const app = express();

const clientConfig = require('./webpack.config.js');

clientConfig.entry.${data.name}.push(path.resolve(__dirname, './dev-client'));
clientConfig.mode = "development";
clientConfig.plugins.push(
    new Webpack.HotModuleReplacementPlugin(), 
    new Webpack.NoEmitOnErrorsPlugin())

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
                case "PagesDevServer":
                proxyStr = data.http != "" && data.proxy ?
                    `\n//代理配置
app.use('/api', httpProxyMiddleware({
    target: '${data.http}',
    pathRewrite: {
        '^/api': '/api'
    },
    changeOrigin: true
}));\n` : '';
                nodeString = `const express = require('express');
const path = require('path');

const Webpack = require("webpack");
const httpProxyMiddleware = require('http-proxy-middleware');

const app = express();

const clientConfig = require('./webpack.config.js');

for(let e in clientConfig.entry){
    clientConfig.entry[e].unshift(path.resolve(__dirname, './dev-client'));
}

clientConfig.mode = "development";
clientConfig.plugins.push(
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin())
const clientCompiler = Webpack(clientConfig);
const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    log: false,
    heartbeat: 2500,
    noInfo: true
})

app.use(express.static(path.resolve(__dirname, '../src')));

app.use('/',devMiddleware)
app.use('/',require('webpack-hot-middleware')(clientCompiler))
${proxyStr}
//监听端口
app.listen(9080, '0.0.0.0', () => {
    console.log('打开成功')
})`
                break;
                case "PagesVueDevServer":

                proxyStr = data.http != "" && data.proxy ?
                    `\n//代理配置
app.use('/api', httpProxyMiddleware({
    target: '${data.http}',
    pathRewrite: {
        '^/api': '/api'
    },
    changeOrigin: true
}));\n` : '';
                nodeString = `const express = require('express');
const path = require('path');

const Webpack = require("webpack");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const httpProxyMiddleware = require('http-proxy-middleware');

const app = express();

const clientConfig = require('./webpack.config.client.js');

clientConfig.entry = {\n`+function(){
        return data.subpage.map(e=>{
                    return `${e}: [path.resolve(__dirname, './dev-client'),'babel-polyfill',path.resolve(__dirname, '../src/entry/${e}/client-entry.js')],\n`
}).join("");}()+`}

clientConfig.mode = "development";
clientConfig.plugins.push(
    new Webpack.HotModuleReplacementPlugin(),
    new Webpack.NoEmitOnErrorsPlugin(),`+function(){
        return data.subpage.map(e=>{
                    return `new HtmlWebpackPlugin({\n\t\t\taddLinkCss: ['./css/${data.name}.css'],\n\t\t\tfilename: './${e}.html',\n\t\t\ttemplate: path.resolve(__dirname, '../template/hot.tpl'),\n\t\t\thash: true,\n\t\t\tnodeModules: false,\n\t\t\tchunks: ['${e}']\n\t\t\t}),\n\t\t`
                }).join("");
    }()+`)
const clientCompiler = Webpack(clientConfig);
const devMiddleware = require('webpack-dev-middleware')(clientCompiler, {
    log: false,
    heartbeat: 2500,
    noInfo: true
})

app.use('/',devMiddleware)
app.use('/',require('webpack-hot-middleware')(clientCompiler))
${proxyStr}
//监听端口
app.listen(9080, '0.0.0.0', () => {
    console.log('打开成功')
})`
                break;
            default:
                reString = '这是一个错误的文件请联系作者'
                break;
        }

        return nodeString;
    },
    /*
     *拷贝源代码至指定路径
     *params { String } type 内容文件夹名
     *params { String } ouputDir 路径
     *return {Psomise} 固定返回promise对象
     */
    sc(type, ouputDir) {
        return filemanage.copyDir(path.resolve(__dirname, './' + type), ouputDir)
    }
}