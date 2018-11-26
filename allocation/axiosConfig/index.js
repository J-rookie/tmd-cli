/*
 *创建配置
 *params { String } data 类型
 *params { Object } data 生成文件配置
 *return {String} 生成文件内容
*/
module.exports = function(type,data={}){
	let configString = '',
		httpBaseUrl = '';
	if(typeof type === "object"){
		data = type;
	}
	if(data.proxy){
		httpBaseUrl = type==='client'?"/api/":data.http;
	}else{
		httpBaseUrl = data.http;
	}
	configString = `const axios = require('axios');\nconst qs = require('qs');\n\nmodule.exports = axios.create({\n\tmethod: 'GET', \n\tbaseURL: '${httpBaseUrl}',\n\ttransformRequest: [function (data) {\n\t\treturn qs.stringify(data);\n\t}],\n\ttransformResponse: [function (data) {\n\t\treturn data;\n\t}],\n\theaders: {'X-Requested-With': 'XMLHttpRequest','Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},\n\tdata: {},\n\ttimeout: 30000,\n\twithCredentials: true,\n\tresponseType: 'json',\n})`;

	return configString;
}