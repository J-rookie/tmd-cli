const fs = require('fs');
const path = require('path');
/*
 *创建配置
 *params { String } type 需要类型文件
 *params { Object } opt 生成文件配置
 *return {String} 生成文件内容
 */
module.exports = function(type="reset",opt = {}) {
    let cssContent = '';
    switch(type){
    	case 'reset':
    	cssContent = fs.readFileSync(path.resolve(__dirname, './reset.css'),'utf8');
    	break;
    	default:
    	break;
    }

    return cssContent || '这是一个错误的文件请联系作者!';
}