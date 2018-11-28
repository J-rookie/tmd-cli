const fs = require('fs');
const path = require('path');

module.exports = {
    /*
     * 创建路径文件
     * @params {String} dirpath 创建路径
     * @params {String} dirName 文件名
     * @return {Promise} 返回Promise对象
     */
    mkdir(dirPath, dirName) {
        return new Promise((resolve, reject) => {
            //判断是否是第一次调用  
            if (typeof dirName === "undefined") {
                //如果路径文件存在  不创建
                if (fs.existsSync(dirPath)) {
                    reject('当前文件夹已存在')
                    //如果路径文件不存在 创建目录 
                } else {
                    this.mkdir(dirPath, path.dirname(dirPath)).then(() => {
                        resolve();
                    }).catch((err) => {
                        reject(err)
                    });
                }
            } else {
                //判断第二个参数是否正常，避免调用时传入错误参数  
                if (dirName !== path.dirname(dirPath)) {
                    this.mkdir(dirPath).then(() => {
                        resolve();
                    }).catch((err) => {
                        reject(err)
                    });
                } else {
                    //如果是在当前目录
                    if (fs.existsSync(dirName)) {
                        fs.mkdir(dirPath, function(err) {
                            if (err) {
                                reject(err)
                            } else {
                                resolve();
                            }
                        })
                    } else {
                        reject('当前路径不存在无法操作')
                    }
                }
            }
        })

    },
    /*
     * 移动文件
     * 
     */
    move(oldurl, newurl, fun) {
        //移动文件
        fs.rename(oldurl, newurl, function(err) {
            if (err) throw err;
            // 删除临时文件夹文件, 
            fs.unlink(oldurl, function() {
                if (err) throw err;
                fun ? fun() : null;
                return;
            });
        });
    },
    /*
     * 拷贝文件
     */
    copy(oldurl, newurl) {
        return new Promise((resolve, reject) => {
            fs.copyFile(oldurl, newurl, function(err) {
                if (err) {
                    reject(err)
                } else {
                    resolve();
                }
            });
        })
    },
    /*
     * 拷贝文件夹
     * @params {String} oldurl 文件路径
     * @params {String} newurl 目标文件路径
     * @return {Promise} 返回Promise对象
     */
    copyDir(oldurl, newurl) {
        return new Promise((resolve, reject) => {
        	fs.readdir(oldurl, (err, data)=>{
			  if(err){
			    reject(err)
			  }else{
			  	this.mkdir(newurl).then(()=>{
			  		let pros = [],p;
			  		data.map((e)=>{
                        p = oldurl+'/'+e;
                        if(fs.statSync(p).isFile()){
                            pros.push(this.copy(p,newurl+'/'+e))
                        }else{
                            pros.push(this.copyDir(p,newurl+'/'+e))
                        }
				  	})
				  	Promise.all(pros).then(()=>{
				  		resolve();
				  	}).catch((err)=>{
				  		reject(err)
				  	})
			  	}).catch((err)=>{
			  		reject(err)
			  	})
			  }
			});
        })
    },
    /*
     * 生成文件
     * @params {String} fileName 文件名
     * @params {String} fileContent 文件内容
     * @params {String} changePegexp 文件内容
     * @return {Promise} 返回Promise对象
     */
    createFile(fileName,fileContent = '',changePegexp = {}){
    	return new Promise((resolve, reject) => {
            let changePegexpItem;
            for(let key in changePegexp){
                changePegexpItem =changePegexp[key]
                if(typeof changePegexpItem == 'string' || typeof changePegexpItem == 'number'){
                    fileContent = fileContent.replace(new RegExp('\<\%(\\s+)?'+key+'(\\s+)?\%\>','g'),changePegexpItem)
                }
            }
            fs.writeFile(fileName, fileContent, 'utf8', function(err) {
                if (err) {
                    reject(err)
                } else {
                    resolve();
                }
            });
        })
    },
}