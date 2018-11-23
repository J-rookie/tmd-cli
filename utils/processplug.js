module.exports = {
	/*
	 * 进程对话监听输出流
	 * @cbStart {Function} 监听前操作
	 * @return {Promise} promise对象
	*/
	dialogue(cbStart){ 
		return new Promise((resolve,reject)=>{
			process.stdin.setEncoding('utf8');
		    //输入进入流模式（flowing-mode，默认关闭，需用resume开启），注意开启后将无法read到数据
		    //见 https://github.com/nodejs/node-v0.x-archive/issues/5813
		    process.stdin.resume();
		    process.stdin.on('data', function(chunk) {
		        //去掉下一行可一直监听输入，即保持标准输入流为开启模式
		        process.stdin.pause();
		        resolve(chunk);
		    });
		    cbStart&&cbStart();
		})
	},
}