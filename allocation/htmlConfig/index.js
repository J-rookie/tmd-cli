/*
 *创建配置
 *params { Object } opt 生成HTML自定义插入字段
 *return {String} 生成文件内容
*/
module.exports = function(opt={}){
	let config = Object.assign({
			head:'',
			body:'',
			foot:'',
		},opt)
	let htmlString = `<!DOCTYPE html>\n<html>\n<head>\n\t<meta charset="utf-8">\n\t<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no, minimal-ui" />\n\t<meta name="apple-mobile-web-app-capable" content="yes" />\n\t<meta name="apple-mobile-web-app-status-bar-style" content="black" />\n\t<meta name="format-detection" content="telephone=no" />\n\t<meta name="format-detection" content="email=no" />\n\t<meta name="renderer" content="webkit">\n\t<meta http-equiv="X-UA-Compatible" content="IE=edge">\n\t<meta name="apple-mobile-web-app-capable" content="yes">\n\t<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n\t<meta name="HandheldFriendly" content="True">\n\t<meta name="mobile-web-app-title">\n\t<meta name="apple-mobile-web-app-title">\n\t${config.head}</head>\n<body>\n${config.body}</body>\n</html>\n${config.foot}`;
	return htmlString;
}