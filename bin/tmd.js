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
	.option('-h, --http <httpUrl>,','http请求地址 默认为空 ')
	.option('-p, --proxy','是否开启代理 默认为false 当开启时使用生成的axios配置为相对地址')
	.option('-v, --no_vue','是否依赖vue开发')
	.option('-r, --no_react','是否依赖react开发')
	.option('-i, --install <way>,','初始化安装依赖方式 npm cnpm 默认为npm')
	.action((name,cmd)=>{
		require('../instruct/create/index.js')(name, cleanArgs(cmd))
	})

//新建单页模式应用项目
program
	.command('spa <spa-name>')
	.description('新建单页应用项目 <项目名称>')
	.option('-h, --http <httpUrl>,','http请求地址 默认为空 ')
	.option('-p, --proxy','是否开启代理 默认为false 当开启时使用生成的axios配置为相对地址')
	.option('-e, --no_extend','是否继承工作文件夹请求相关配置')
	.option('-i, --install <way>,','初始化安装依赖方式 npm cnpm 默认为npm')
	.action((name,cmd)=>{
		require('../instruct/spa/index.js')(name, cleanArgs(cmd))
	})

//新建单页面项目
program
	.command('single <project-name>')
	.description('新建单页面项目 <项目名称>')
	.option('-h, --http <httpUrl>,','http请求地址 默认为空 ')
	.option('-p, --proxy','是否开启代理 默认为false 当开启时使用生成的axios配置为相对地址')
	.option('-e, --no_extend','是否继承工作文件夹请求相关配置')
	.option('-i, --install <way>,','初始化安装依赖方式 npm cnpm 默认为npm')
	.action((name,cmd)=>{
		require('../instruct/single/index.js')(name, cleanArgs(cmd))
	})


//新建多页面模式项目
program
	.command('pages <pages-name>')
	.description('新建多页面项目 <项目名称>')
	.option('-h, --http <httpUrl>,','http请求地址 默认为空 ')
	.option('-p, --proxy','是否开启代理 默认为false 当开启时使用生成的axios配置为相对地址')
	.option('-e, --no_extend','是否继承工作文件夹请求相关配置')
	.option('-i, --install <way>,','初始化安装依赖方式 npm cnpm 默认为npm')
	.option('-s, --subpage <subpages>,','页面名称集合以,逗号分隔')
	.option('-m, --mode <mode-name>,','项目模式,逗号分隔')
	.action((name,cmd)=>{
		require('../instruct/pages/index.js')(name, cleanArgs(cmd))
	})

//新建插件模式
program
	.command('plug <plug-name>')
	.description('新建插件模式 <项目名称>')
	.option('-i, --install <way>,','初始化安装依赖方式 npm cnpm 默认为npm')
	.action((name,cmd)=>{
		require('../instruct/plug/index.js')(name, cleanArgs(cmd))
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