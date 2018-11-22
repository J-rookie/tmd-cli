const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const filemanage = require('../../utils/filemanage.js');
const Log = require('../../utils/log.js');
const allocation = require('../../allocation');

module.exports = function(name,options = {}){
	let dirpath = './'+name,
		buildpath = dirpath+'/build',
		demopath =  dirpath+'/demo',
		srcpath = dirpath+'/src',
		shellStop = process.platform === 'win32',
		tmdConfig = null;
		changeReg = {
			name:name
		};
		if (fs.existsSync('./.tmd')) {
			try{
				tmdConfig = JSON.parse(fs.readFileSync('./.tmd','utf8'));
			}catch(e){
				Log.err('.tmd配置文件解析错误,请确认是否为严格JSON格式')
				return;
			}
			
		}
	Log.info('开始创建插件项目...')
	//开始创建目录
	filemanage.mkdir(dirpath).then(function(){
		Log.suc('创建文件夹成功').info('开始生成资源文件')
		return filemanage.mkdir(dirpath+'/src')
	}).then(function(){
		return filemanage.createFile(srcpath+'/main.js',allocation.handle.execute('plug',{
			name:name
		}))
	}).then(function(){
		return filemanage.createFile(srcpath+'/main.scss',allocation.css())
	}).then(function(){
		Log.suc('生成资源文件 --> 成功').info('开始生成测试文件')
		return filemanage.mkdir(dirpath+'/demo')
	}).then(function(){
		return filemanage.createFile(demopath+'/index.html',allocation.html({
			head:`<title>插件测试静态html</title>\n\t<link rel="stylesheet" href="./css/${name}.css">\n`,
			body:`<div>hello正在进行插件测试</div>\n<script type="text/javascript" src="./${name}.js"></script>\n`
		}),changeReg)
	}).then(function(){
		Log.suc('生成测试文件 --> 成功').info('开始生成项目构造配置文件')
		return filemanage.mkdir(dirpath+'/build')
	}).then(function(){
		//webpack客户端配置文件
		let clientWebpackConfig = fs.readFileSync(path.resolve(__dirname, './preproccess/build/webpack.config.client.js'),'utf8');
		return filemanage.createFile(buildpath+'/webpack.config.client.js',allocation.webpack("plug"),changeReg)
	}).then(function(){
		//webpack服务端配置文件
		let serverWebpackConfig = fs.readFileSync(path.resolve(__dirname, './preproccess/build/webpack.config.server.js'),'utf8');
		return filemanage.createFile(buildpath+'/webpack.config.server.js',allocation.webpack("plug"),changeReg)
	}).then(function(){
		//发开模式热重载启动依赖文件
		return filemanage.createFile(buildpath+'/dev-client.js',allocation.handle.node('HotDevClient'))
	}).then(function(){
		//发开模式启动文件
		return filemanage.createFile(buildpath+'/dev.js',allocation.handle.node('PlugDevServer'),changeReg)
	}).then(function(){
		//生成模式启动文件
		return filemanage.createFile(buildpath+'/build.js',allocation.handle.node('build'),changeReg)
	}).then(function(){
		Log.suc('生成项目构造配置文件 --> 成功').info('开始创建启动脚本')
		return filemanage.createFile(dirpath+'/build.bat',"node ./build/build.js")
	}).then(function(){
		return filemanage.createFile(dirpath+'/dev.bat',"node ./build/dev.js")
	}).then(function(){
		Log.suc('创建启动脚本 --> 成功').info('插件项目创建成功')
	}).catch((msg)=>{
		console.log(msg)
		Log.err(msg)
	})
}
