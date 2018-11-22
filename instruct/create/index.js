const path = require('path');
const { spawn } = require('child_process');
const filemanage = require('../../utils/filemanage.js');
const Log = require('../../utils/log.js');
const allocation = require('../../allocation');
module.exports = function(name,options = {}){
	let dirpath = './'+name,
		shellStop = process.platform === 'win32';
	Log.info('开始创建工作目录...')
	//开始创建目录
	filemanage.mkdir(dirpath).then(function(){
		Log.suc('创建主文件夹成功').info('开始生成配置文件 -> ".tmd"')
		return filemanage.createFile(dirpath+'/.tmd',JSON.stringify(Object.assign({
			version:require(path.resolve(__dirname, '../../package')).version,
			http:options.http||"",
			proxy:options.proxy||false,
			vueDepend:options.vue||false,
			reactDepend:options.react||false,
			install:"npm",
			type:"work"
		},options)))
	}).then(function(){
		Log.suc('创建主文件夹成功').info('生成配置文件 -> ".tmd" --> 成功 -> "package.json"')
		return filemanage.createFile(dirpath+'/package.json',allocation.package({
			name:name,
			version: '1.0.0',
			vue:options.vue||false
		}))
	}).then(function(){
		Log.suc('生成配置文件  -> "package.json" --> 成功').info('开始生成配置文件 -> ".babelrc"')
		return filemanage.createFile(dirpath+'/.babelrc',allocation.babel())
	}).then(function(){
		Log.suc('生成配置文件  -> ".babelrc" --> 成功')
			.info("创建工作目录成功")
			.warn('正在进入文件目录执行npm i安装依赖初始化项目,如遇失败 --- 请手动安装')
		let ls = spawn('cd '+dirpath+'&& '+(options.install=='cnpm'?'cnpm':'npm')+' i', {
		 stdio: 'inherit',
		 shell:shellStop
		});
		ls.on('close', (code) => {
		 if(code == 0){
		 	Log.suc('初始化结束')
		 }else{
		 	Log.err('执行npm安装依赖失败，请手动尝试')
		 }  
		});
	}).catch((msg)=>{
		console.log(msg)
		Log.err(msg)
	})
}