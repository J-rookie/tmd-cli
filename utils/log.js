module.exports = {
	/*
	 * 输出错误提示 红色
	 * @params {any} o 输出对象
	*/
	err(o){ 
        console.log('\x1B[31m%s\x1B[39m',this.opt(o,'[错误]'))
        return this;
	},
    /*
	 * 成功信息 绿色
	 * @params {any} o 输出对象
	*/
	suc(o){ 
        console.log('\x1B[32m%s\x1B[39m',this.opt(o,'[成功]'))
        return this;
	},
	/*
	 * 警告信息 黄色
	 * @params {any} o 输出对象
	*/
	warn(o){ 
        console.log('\x1B[33m%s\x1B[39m',this.opt(o,'[警告]'))
        return this;
	},
	/*
	 * 提示信息 蓝色
	 * @params {any} o 输出对象
	*/
	info(o){ 
        console.log('\x1B[36m%s\x1B[39m',this.opt(o,'[提示]'))
        return this;
	},
	/*
	 * 普通输出
	 * @params {any} o 输出对象
	*/
	log(){
		console.log(JSON.stringify(o))
		return this;
	},
	/*
	 * 输出文字
	 * @params {any} o 输出对象
	*/
	opt(o,hint){
		return (hint?hint:'')+(typeof o === 'string'?o:JSON.stringify(o));
	}

	
}