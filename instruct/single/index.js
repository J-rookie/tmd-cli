const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const filemanage = require('../../utils/filemanage.js');
const proplug = require('../../utils/processplug.js');
const Log = require('../../utils/log.js');
const allocation = require('../../allocation');

module.exports = function(name,options = {}){
	let dirpath = './'+name,
		buildpath = dirpath+'/build',
		shellStop = process.platform === 'win32',
		tmdConfig = null;
		createTmd = {
			name:name,
			version:require(path.resolve(__dirname, '../../package')).version,
			type:"plug",
			isAlone:true,
			install:'npm',
			http:'',
			proxy:false
		};
		if (fs.existsSync('./.tmd')) {
			try{
				tmdConfig = JSON.parse(fs.readFileSync('./.tmd','utf8'));
			}catch(e){
				Log.err('.tmd配置文件解析错误,请确认是否为严格JSON格式')
				return;
			}
		}

		if(tmdConfig&&tmdConfig.type==="work"){
			createTmd['isAlone'] = false;
		}else{
			createTmd['http'] = tmdConfig.http;
			createTmd['proxy'] = tmdConfig.proxy;
		}

		Object.assign(createTmd,options,{
			install:options.install=='cnpm'?'cnpm':'npm',
		})

	Log.info('开始创建单页面项目...')
	//开始创建目录
	filemanage.mkdir(dirpath).then(function(){
		Log.suc('创建文件夹成功').info('开始生成项目构造配置文件')
		return filemanage.mkdir(buildpath)
	}).then(function(){
		//webpack客户端配置文件
		return filemanage.createFile(buildpath+'/webpack.config.client.js',allocation.webpack("singleClient",{name:name}))
	}).then(function(){
		//webpack服务端配置文件
		return filemanage.createFile(buildpath+'/webpack.config.server.js',allocation.webpack("singleServer",{name:name}))
	}).then(function(){
		//发开模式热重载启动依赖文件
		return filemanage.createFile(buildpath+'/dev-client.js',allocation.handle.node('HotDevClient'))
	}).then(function(){
		//发开模式启动文件
		return filemanage.createFile(buildpath+'/dev.js',allocation.handle.node('SingleDevServer',createTmd))
	}).then(function(){
		//生成模式启动文件
		return filemanage.createFile(buildpath+'/build.js',allocation.handle.node('SingleBuildServer',createTmd))
	})    .catch((msg)=>{
		Log.err(msg)
	})
	// //开始创建目录
	// filemanage.mkdir(dirpath).then(function(){
	// 	Log.suc('创建文件夹成功').info('开始生成模板文件')
	// 	return filemanage.copyDir(path.resolve(__dirname, './preproccess/template'),dirpath+'/template')
	// }).then(function(){
	// 	Log.suc('生成模板文件 --> 成功').info('开始生成资源文件')
	// 	return filemanage.copyDir(path.resolve(__dirname, './preproccess/src'),dirpath+'/src')
	// }).then(function(){
	// 	Log.suc('生成资源文件 --> 成功').info('开始生成项目构造配置文件')
	// 	return filemanage.mkdir(dirpath+'/build')
	// }).then(function(){
	// 	//webpack客户端配置文件
	// 	let clientWebpackConfig = fs.readFileSync(path.resolve(__dirname, './preproccess/build/webpack.config.client.js'),'utf8');
	// 	return filemanage.createFile(buildpath+'/webpack.config.client.js',clientWebpackConfig,changeReg)
	// }).then(function(){
	// 	//webpack服务端配置文件
	// 	let serverWebpackConfig = fs.readFileSync(path.resolve(__dirname, './preproccess/build/webpack.config.server.js'),'utf8');
	// 	return filemanage.createFile(buildpath+'/webpack.config.server.js',serverWebpackConfig,changeReg)
	// }).then(function(){
	// 	//发开模式热重载启动依赖文件
	// 	let devHotJsContent = fs.readFileSync(path.resolve(__dirname, './preproccess/build/dev-client.js'),'utf8');
	// 	return filemanage.createFile(buildpath+'/dev-client.js',devHotJsContent,changeReg)
	// }).then(function(){
	// 	//发开模式启动文件
	// 	let devJsContent = fs.readFileSync(path.resolve(__dirname, './preproccess/build/dev.js'),'utf8');
	// 	return filemanage.createFile(buildpath+'/dev.js',devJsContent,changeReg)
	// }).then(function(){
	// 	//生成模式启动文件
	// 	let buildJsContent = fs.readFileSync(path.resolve(__dirname, './preproccess/build/build.js'),'utf8');
	// 	return filemanage.createFile(buildpath+'/build.js',buildJsContent,changeReg)
	// }).then(function(){
	// 	Log.suc('生成项目构造配置文件 --> 成功').info('开始创建启动脚本')
	// 	return filemanage.createFile(dirpath+'/build.bat',"node ./build/build.js")
	// }).then(function(){
	// 	return filemanage.createFile(dirpath+'/dev.bat',"node ./build/dev.js")
	// }).then(function(){
	// 	Log.suc('创建启动脚本 --> 成功').info('单页面项目创建成功')
	// }).catch((msg)=>{
	// 	Log.err(msg)
	// })
}

