/*单页面创建模式*/
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
			type:"single",
			isAlone:true,
			install:options.install=='cnpm'?'cnpm':'npm',
			no_extend:options.no_extend||false,
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
	}).then(function(){
		Log.suc('生成项目构造配置文件 -> 成功').info('开始渲染模板')
		return filemanage.mkdir(tplpath)
	}).then(function(){
		return filemanage.createFile(tplpath+'/hot.tpl',allocation.html({
			body:`\t<div id="app"></div>\n`
		}))
	}).then(function(){
		return filemanage.createFile(tplpath+'/render.tpl',allocation.html({
			body:`\t<!--vue-ssr-outlet-->\n`
		}))
	}).then(function(){
		Log.suc('渲染模板 --> 成功 ').info('开始生成项目源代码')
		return filemanage.mkdir(srcpath)
	}).then(function(){
		return filemanage.mkdir(srcpath+'/component')
	}).then(function(){
		return filemanage.mkdir(srcpath+'/images')
	}).then(function(){
		return filemanage.createFile(srcpath+'/main.scss',allocation.css())
	}).then(function(){
		return filemanage.createFile(srcpath+'/App.vue',allocation.vueComponent("app"))
	}).then(function(){
		return filemanage.createFile(srcpath+'/main.js',allocation.handle.execute('single'))
	}).then(function(){
		return filemanage.createFile(srcpath+'/client-entry.js',allocation.handle.execute('singleClient',createTmd))
	}).then(function(){
		return filemanage.createFile(srcpath+'/server-entry.js',allocation.handle.execute('singleServer',createTmd))
	}).then(function(){
		return filemanage.mkdir(srcpath+'/lib')
	}).then(function(){
		//如果开启代理模式 生成2个文件
		if(createTmd.proxy){
			return Promise.all([filemanage.createFile(srcpath+'/lib/'+'axios.client.config.js',allocation.axios("client",createTmd)),
								filemanage.createFile(srcpath+'/lib/'+'axios.server.config.js',allocation.axios("server",createTmd))])
		//否者生成单文件
		}else{
			return filemanage.createFile(srcpath+'/lib/'+'axios.config.js',allocation.axios(createTmd))
		}
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
			Log.suc('生成配置文件 -> ".tmd"').info('单页面项目创建成功')
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
			Log.suc('单页面项目创建成功')
		}else{
			Log.warn("错误的参数,请稍后手动安装").suc('单页面项目创建成功')
		}
	}).catch((msg)=>{
		//正常停止不输出
		if(msg == 'shutoff') return;
		//异常错误
		console.log(msg)
		Log.err(msg)
	})
}