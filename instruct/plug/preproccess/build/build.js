//---- 生成html文件----//
const fs = require('fs');
const path = require('path');
const Webpack = require("webpack");

const serverConfig = require('./webpack.config.server.js');

const handlePack = function(config){
    return new Promise((resolve,reject)=>{
        Webpack(config, (err, stats) => {
            if (err || stats.hasErrors()) {
                // 在这里处理错误
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
})
