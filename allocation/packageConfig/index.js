/*
 *创建配置
 *params { Object } opt 生成文件配置
 *params { String } opt.name 路径包名默认生成随机字符串
 *params { String } opt.version 路径包版本号 默认1.0.0
 *params { String } opt.vue 是否需要依赖vue相关生态 默认true
 *return {String} 生成文件内容
 */
module.exports = function(opt = {
    name: Math.random().toString(36).substr(2),
    version: '1.0.0',
    vue: true,
}) {
    let config = {
        "name": opt.name,
        "version": opt.version,
        "description": "",
        "main": "index.js",
        "author": "",
        "license": "ISC",
        "dependencies": {
            "axios": "^0.18.0",
            "babel-polyfill": "^6.26.0"
        },
        "devDependencies": {
            "babel-core": "^6.26.3",
            "babel-loader": "^7.1.5",
            "babel-preset-env": "^1.7.0",
            "babel-preset-es2016": "^6.24.1",
            "babel-preset-stage-2": "^6.24.1",
            "css-loader": "^1.0.0",
            "eventsource-polyfill": "^0.9.6",
            "extract-text-webpack-plugin": "^4.0.0-beta.0",
            "html-webpack-plugin": "^3.2.0",
            "url-loader": "^1.1.2",
            "express": "^4.16.4",
            "html-webpack-plugin": "^3.2.0",
            "http-proxy-middleware": "^0.19.0",
            "node-sass": "^4.9.3",
            "sass-loader": "^7.1.0",
            "style-loader": "^0.23.0",
            "webpack": "^4.19.1",
            "webpack-cli": "^3.1.0",
            "webpack-dev-middleware": "^3.4.0",
            "webpack-hot-middleware": "^2.24.3"
        }
    };

    //如果opt.vue添加vue相关依赖
    if (opt.vue == true) {
        config["dependencies"]["vue"] = "^2.5.17";
        config["dependencies"]["vue-router"] = "^3.0.1";
        config["dependencies"]["vue-server-renderer"] = "^2.5.17";
        config["dependencies"]["vuex"] = "^3.0.1";

        config["devDependencies"]["vue-loader"] = "^15.4.2";
        config["devDependencies"]["vue-template-compiler"] = "^2.5.17";
    }

    return JSON.stringify(config) || '这是一个错误的文件请联系作者!';
}