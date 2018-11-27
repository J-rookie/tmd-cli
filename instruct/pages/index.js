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
		demopath =  dirpath+'/demo',
		srcpath = dirpath+'/src',
		shellStop = process.platform === 'win32',
		tmdConfig = null;
		createTmd = {
			name:name,
			version:require(path.resolve(__dirname, '../../package')).version,
			type:"plug",
			isAlone:true,
			install:options.install=='cnpm'?'cnpm':'npm'
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
			createTmd.isAlone = false;
		}
	
	Log.info('开始创建插件项目...')
	//开始创建目录
	filemanage.mkdir(dirpath).then(function(){
		Log.suc('创建文件夹成功').info('开始生成项目源代码')
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
		}))
	}).then(function(){
		Log.suc('生成测试文件 --> 成功').info('开始生成项目构造配置文件')
		return filemanage.mkdir(buildpath)
	}).then(function(){
		//webpack配置文件
		return filemanage.createFile(buildpath+'/webpack.config.js',allocation.webpack("plug",{name:name}))
	}).then(function(){
		//发开模式热重载启动依赖文件
		return filemanage.createFile(buildpath+'/dev-client.js',allocation.handle.node('HotDevClient'))
	}).then(function(){
		//发开模式启动文件
		return filemanage.createFile(buildpath+'/dev.js',allocation.handle.node('PlugDevServer',{name:name}))
	}).then(function(){
		//生成模式启动文件
		return filemanage.createFile(buildpath+'/build.js',allocation.handle.node('build'))
	}).then(function(){
		Log.suc('生成项目构造配置文件 --> 成功').info('开始创建启动脚本')
		return filemanage.createFile(dirpath+'/build.bat',"node ./build/build.js")
	}).then(function(){
		return filemanage.createFile(dirpath+'/dev.bat',"node ./build/dev.js")
	}).then(function(){
		Log.suc('创建启动脚本 --> 成功').info('开始生成配置文件 -> ".tmd"')
		return filemanage.createFile(dirpath+'/.tmd',JSON.stringify(createTmd))
	}).then(function(){
		//如果是在tmd工作路径中视为创建子项目文件
		if(tmdConfig&&tmdConfig.type==="work"){
			Log.suc('生成配置文件 -> ".tmd"').info('插件项目创建成功')
			return Promise.reject('shutoff');
		//否者视为创建独立项目
		}else{
			Log.suc('生成配置文件 -> ".tmd"').info('开始生成配置文件 -> "package.json"')
			return filemanage.createFile(dirpath+'/package.json',allocation.package({
				name:name,
				version: '1.0.0'
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
			Log.suc('插件项目创建成功')
		}else{
			Log.warn("错误的参数,请稍后手动安装").suc('插件项目创建成功')
		}
	}).catch((msg)=>{
		//正常停止不输出
		if(msg == 'shutoff') return;
		//异常错误
		Log.err(msg)
	})
}