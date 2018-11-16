//---- 生成html文件----//
const fs = require('fs');
const path = require('path');
const Webpack = require("webpack");

const clientConfig = require('./webpack.config.client.js');
const serverConfig = require('./webpack.config.server.js');
//客户端打包
Webpack(clientConfig, (err, stats) => {
    if (err || stats.hasErrors()) {
        // 在这里处理错误
        console.log('\x1B[31m%s\x1B[39m', '客户端脚本打包失败');
        return;
    }
    console.log('\x1B[44m%s\x1B[49m', '客户端脚本打包成功');
    //服务端打包
    Webpack(serverConfig, (err, stats) => {
        if (err || stats.hasErrors()) {
            // 在这里处理错误
            console.log('\x1B[31m%s\x1B[39m', '服务端ssr文件打包失败');
            return;
        }
        console.log('\x1B[44m%s\x1B[49m', '服务端ssr文件打包成功');

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
            fs.writeFile(path.resolve(__dirname, '../dist/<% name %>.html'), html, 'utf8', function(err) {
                if (err) {
                    console.log(err)
                } else {
                    console.log('\x1B[44m%s\x1B[49m', '生成html文件成功');
                }
            });
        })
    })
});