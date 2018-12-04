# tmd-cli
提供webpack的多种项目打包方案 自用未上架  
使用 下载文件到本地使用npm或cnpm 安装到本地 即可使用tmd命令  

参数 :
  -V, --version                    查看版本号  
  -h, --help                       获取版主信息  

命令:
  create [options] <work-name>     创建工作文件夹 <文件夹名称>  
  spa [options] <spa-name>         新建单页应用项目 <项目名称>  
  single [options] <project-name>  新建单页面项目 <项目名称>  
  pages [options] <pages-name>     新建多页面项目 <项目名称>  
  plug [options] <plug-name>       新建插件模式 <项目名称>  

说明:  
create 命令  
	创建项目工作路径路径默认安装所有依赖  
可选参数  
	-h, --http <httpUrl>		http请求地址 默认为空  
	-p, --proxy 				是否开启代理 默认为false 当开启时使用生成的axios配置为相对地址  
	-i, --install <way>			初始化安装依赖方式 npm cnpm 默认为npm  
spa 命令  
	新建单页应用项目,不在create创建的工作路径下会以独立项目形式创建 单页router模式为默认的hash  
可选参数  
	-h, --http <httpUrl>		http请求地址 默认为空  
	-p, --proxy 				是否开启代理 默认为false 当开启时使用生成的axios配置为相对地址  
	-e, --no_extend				是否不继承工作文件夹请求相关配置 true false 默认为false  
	-i, --install <way>			初始化安装依赖方式 npm cnpm 默认为npm  
single 命令  
	新建单页面项目,使用SSR渲染模式生成html  
可选参数  
	-h, --http <httpUrl>		http请求地址 默认为空  
	-p, --proxy 				是否开启代理 默认为false 当开启时使用生成的axios配置为相对地址  
	-e, --no_extend				是否不继承工作文件夹请求相关配置 true false 默认为false  
	-i, --install <way>			初始化安装依赖方式 npm cnpm 默认为npm  
pages 命令  
	创建项目工作路径路径默认安装所有依赖  
可选参数  
	-h, --http <httpUrl>		http请求地址 默认为空 当no_extend为true时生效  
	-p, --proxy 				是否开启代理 默认为false 当开启时使用生成的axios配置为相对地址 当no_extend为true时生效  
	-e, --no_extend				是否不继承工作文件夹请求相关配置 true false 默认为false  
	-s, --subpage <subpages>	页面名称集合以,逗号分隔  
	-m, --mode <mode-name>		项目模式 jquery vue 默认创建jq形式的多页面 类似普通项目 仅混淆js（装逼） vue模式为多个single的合集  
	-i, --install <way>			初始化安装依赖方式 npm cnpm 默认为npm 独立项目时有效  
plug 命令  
	新建插件模式,不在create创建的工作路径下会以独立项目形式创建  
可选参数  
	-i, --install <way>			初始化安装依赖方式 npm cnpm 默认为npm 独立项目时有效  
