#! /usr/bin/env node

const program = require('commander')

//基础信息
program
	.version(require('../package').version)
  	.usage('<command> [options]')

//创建工作文件夹
program
	.command('create <work-name>')
	.description('创建工作文件夹 <文件夹名称>')
	.option('-p, --proxy <proxyUrl>,','http请求代理地址 默认为空 既相对路径请求本机 ')
	.option('-i, --install <way>,','初始化安装依赖方式 npm cnpm 默认为npm')
	.action((name,cmd)=>{
		require('../instruct/create/index.js')(name, cleanArgs(cmd))
	})

//新建单页模式应用项目
program
	.command('spa <spa-name>')
	.description('新建单页应用项目 <项目名称>')
	.option('-p, --proxy <proxyUrl>,','http请求代理地址 默认为工作文件夹配置proxy')
	.action((name,cmd)=>{
		console.log(name)
		console.log( cleanArgs(cmd))
		//require('../lib/inspect')(paths, cleanArgs(cmd))
	})

//新建单页面项目
program
	.command('single <project-name>')
	.description('新建单页面项目 <项目名称>')
	.option('-p, --proxy <proxyUrl>,','http请求代理地址 默认为工作文件夹配置proxy')
	.action((name,cmd)=>{
		require('../instruct/single/index.js')(name, cleanArgs(cmd))
	})


//新建多页面模式项目
program
	.command('pages <pages-name>')
	.description('新建多页面项目 <项目名称>')
	.option('-p, --proxy <proxyUrl>,','http请求代理地址 默认为工作文件夹配置proxy')
	.action((name,cmd)=>{
		console.log(name)
		console.log( cleanArgs(cmd))
		//require('../lib/inspect')(paths, cleanArgs(cmd))
	})

//解析命令行参数
program.parse(process.argv)

function cleanArgs (cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = o.long.replace(/^--/, '')
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}