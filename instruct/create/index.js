const path = require('path');
const { spawn } = require('child_process');
const filemanage = require('../../utils/filemanage.js');
const proplug = require('../../utils/processplug.js');
const Log = require('../../utils/log.js');
const allocation = require('../../allocation');
module.exports = function(name,options = {}){
	let dirpath = './'+name,
		shellStop = process.platform === 'win32',
		createTmd = Object.assign({
			name:name,
			version:require(path.resolve(__dirname, '../../package')).version,
			http:options.http||"",
			proxy:options.proxy||false,
			vueDepend:options.vue||false,
			reactDepend:options.react||false,
			install:"npm",
			type:"work"
		},options,{
			install:options.install=='cnpm'?'cnpm':'npm'
		});
	Log.info('开始创建工作目录...')
	//开始创建目录
	filemanage.mkdir(dirpath).then(function(){
		Log.suc('创建主文件夹成功').info('开始生成配置文件 -> ".tmd"')
		return filemanage.createFile(dirpath+'/.tmd',JSON.stringify(createTmd))
	}).then(function(){
		Log.suc('生成配置文件 -> ".tmd" --> 成功').info('开始生成配置文件 -> "package.json"')
		return filemanage.createFile(dirpath+'/package.json',allocation.package({
			name:name,
			version: '1.0.0',
			vue:options.vue||false
		}))
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
				 	Log.suc('安装结束').suc('创建工作目录成功')
				 }else{
				 	Log.err('执行npm安装依赖失败，请手动尝试')
				 }  
			});
		}else if(res==="N"){
			Log.suc('插件项目创建成功')
		}else{
			Log.warn("错误的参数,请稍后手动安装").suc('插件项目创建成功')
		}
	}).catch((msg)=>{
		console.log(msg)
		Log.err(msg)
	})
}