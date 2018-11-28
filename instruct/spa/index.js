/*spa单页面应用模式*/
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
		tplpath = dirpath+'/template',
		srcpath = dirpath+'/src',
		shellStop = process.platform === 'win32',
		tmdConfig = null;
		createTmd = {
			name:name,
			version:require(path.resolve(__dirname, '../../package')).version,
			type:"spa",
			isAlone:true,
			install:'npm',
			no_extend:false,
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
			if(!createTmd.no_extend){
				createTmd['http'] = tmdConfig.http;
				createTmd['proxy'] = tmdConfig.proxy;
			}else{
				reateTmd['http']=options.http||"";
				createTmd['proxy']=options.proxy||false;
			}
		}else{
			createTmd['http']=options.http||"";
			createTmd['proxy']=options.proxy||false;
		}

	Log.info('开始创建单页应用项目...')
	//开始创建目录
	filemanage.mkdir(dirpath).then(function(){
		Log.suc('创建文件夹成功').info('开始生成项目构造配置文件')
		return filemanage.mkdir(buildpath)
	}).then(function(){
		//webpack客户端配置文件
		return filemanage.createFile(buildpath+'/webpack.config.js',allocation.webpack("spa",createTmd))
	}).then(function(){
		//发开模式热重载启动依赖文件
		return filemanage.createFile(buildpath+'/dev-client.js',allocation.handle.node('HotDevClient'))
	}).then(function(){
		//发开模式启动文件
		return filemanage.createFile(buildpath+'/dev.js',allocation.handle.node('SpaDevServer',createTmd))
	}).then(function(){
		//生成模式启动文件
		return filemanage.createFile(buildpath+'/build.js',allocation.handle.node('build',createTmd))
	}).then(function(){
		Log.suc('生成项目构造配置文件 -> 成功').info('开始渲染模板')
		return filemanage.mkdir(tplpath)
	}).then(function(){
		return filemanage.createFile(tplpath+'/render.tpl',allocation.html({
			body:`\t<div id="app"></div>\n`
		}))
	}).then(function(){
		Log.suc('渲染模板 --> 成功 ').info('开始生成项目源代码')
		return filemanage.mkdir(srcpath)
	}).then(function(){
		return filemanage.mkdir(srcpath+'/component')
	}).then(function(){
		return filemanage.mkdir(srcpath+'/images')
	}).then(function(){
		return allocation.handle.sc('controller',srcpath+'/controller');
	}).then(function(){
		return allocation.handle.sc('store',srcpath+'/store');
	}).then(function(){
		return allocation.handle.sc('routes',srcpath+'/routes');
	}).then(function(){
		return filemanage.createFile(srcpath+'/main.scss',allocation.css())
	}).then(function(){
		return filemanage.createFile(srcpath+'/App.vue',allocation.vueComponent("route"))
	}).then(function(){
		return filemanage.createFile(srcpath+'/main.js',allocation.handle.execute('spa'))
	}).then(function(){
		return filemanage.createFile(srcpath+'/client-entry.js',allocation.handle.execute('spaClient',createTmd))
	}).then(function(){
		return filemanage.mkdir(srcpath+'/lib')
	}).then(function(){
		return filemanage.createFile(srcpath+'/lib/'+'axios.config.js',allocation.axios("client",createTmd))
	}).then(function(){
		Log.suc('生成项目源代码 --> 成功').info('开始创建启动脚本')
		return filemanage.createFile(dirpath+'/build.bat',"node ./build/build.js")
	}).then(function(){
		return filemanage.createFile(dirpath+'/dev.bat',"node ./build/dev.js")
	}).then(function(){
		Log.suc('创建启动脚本 --> 成功').info('开始生成配置文件 -> ".tmd"')
		return filemanage.createFile(dirpath+'/.tmd',JSON.stringify(createTmd))
	}).then(function(){
		//如果是在tmd工作路径中视为创建子项目文件
		if(tmdConfig&&tmdConfig.type==="work"){
			Log.suc('生成配置文件 -> ".tmd"').info('单页应用项目创建成功')
			return Promise.reject('shutoff');
		//否者视为创建独立项目
		}else{
			Log.suc('生成配置文件 -> ".tmd"').info('开始生成配置文件 -> "package.json"')
			return filemanage.createFile(dirpath+'/package.json',allocation.package({
				name:name,
				version: '1.0.0',
				vue:true
			}))
		}
	}).then(function(){
		Log.suc('生成配置文件  -> "package.json" --> 成功').info('开始生成配置文件 -> ".babelrc"')
		return filemanage.createFile(dirpath+'/.babelrc',allocation.babel())
	}).then(function(){
		return proplug.dialogue(function(){
			Log.suc('生成配置文件 -> ".babelrcn" --> 成功').info('是否立即安装依赖[Y/N]?')
		})
	}).then(function(chunk){
		let res = chunk.slice(0,chunk.length-2).toUpperCase();
		if(res==="Y"){
			Log.warn('开始安装,如遇失败 --- 请手动安装')
			let ls = spawn('cd '+dirpath+'&& '+createTmd.install+' i', {
				 stdio: 'inherit',
				 shell:shellStop
				});
				ls.on('close', (code) => {
				 if(code == 0){
				 	Log.suc('安装结束')
				 }else{
				 	Log.err('安装依赖失败，请手动尝试')
				 }  
			});
		}else if(res==="N"){
			Log.suc('单页应用项目创建成功')
		}else{
			Log.warn("错误的参数,请稍后手动安装").suc('单页应用项目创建成功')
		}
	}).catch((msg)=>{
		//正常停止不输出
		if(msg == 'shutoff') return;
		//异常错误
		console.log(msg)
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
	// 	Log.suc('创建启动脚本 --> 成功').info('单页应用项目创建成功')
	// }).catch((msg)=>{
	// 	Log.err(msg)
	// })
}

