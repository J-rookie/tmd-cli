/*
 *创建配置
 *params { Object } opt babel配置会以浅拷贝形式与配置对象合并
 *return {String} 生成文件内容
 */
module.exports = function(opt = {}) {
    let config = Object.assign({
        "presets": [
            "es2016",
            "env",
            "stage-2"
        ]
    }, opt);

    return JSON.stringify(config) || '这是一个错误的文件请联系作者!';
}