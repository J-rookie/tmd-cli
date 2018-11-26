const fs = require("fs");
const path = require("path");
/*
 *创建Vue组件模板
 *params { String } type 文件名
 *return {String} 生成文件内容
*/
module.exports = function(type){
	if(!type||typeof type == 'function'||typeof type == 'object') return;
	let componentString = '';

	try{
		componentString = fs.readFileSync(path.resolve(__dirname, './'+type+'.vue'),'utf8');
	}catch(e){
		console.log(e)
		componentString = "这是一个错误的文件请联系作者";
	}

	return componentString;
}