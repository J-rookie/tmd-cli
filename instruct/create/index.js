const path = require('path');
const { spawn } = require('child_process');
const filemanage = require('../../lib/filemanage.js');
const Log = require('../../lib/log.js');
module.exports = function(name,options = {}){
	let dirpath = './'+name,
		shellStop = process.platform === 'win32';
	Log.info('开始创建工作目录...')
	//开始创建目录
	filemanage.mkdir(dirpath).then(function(){
		Log.suc('创建主文件夹成功').info('开始生成配置文件 -> "package.json"')
		return filemanage.createFile(dirpath+'/package.json',JSON.stringify(Object.assign({},require(path.resolve(__dirname, './package')),{
			name:name
		})))
	}).then(function(){
		Log.suc('生成配置文件 -> "package.json" --> 成功').info('开始生成工具文件夹 -> "lib"')
		return filemanage.copyDir(path.resolve(__dirname, './lib'),dirpath+'/lib')
	}).then(function(){
		Log.suc('生成工具文件夹 -> "lib" --> 成功').info('开始生成配置文件 -> ".tmd"')
		return filemanage.createFile(dirpath+'/.tmd',JSON.stringify(Object.assign({
			version:require(path.resolve(__dirname, '../../package')).version,
			proxy:'',
			install:'npm'
		},options)))
	}).then(function(){
		Log.suc('生成配置文件 -> ".tmd" --> 成功')
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
		Log.err(msg)
	})
}