const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const filemanage = require('../../utils/filemanage.js');
const proplug = require('../../utils/processplug.js');
const Log = require('../../utils/log.js');
const allocation = require('../../allocation');

module.exports = function(name, options = {}) {
    let dirpath = './' + name,
        buildpath = dirpath + '/build',
        tplpath = dirpath+'/template',
        srcpath = dirpath + '/src',
        srcentrypath = srcpath + '/entry',
        shellStop = process.platform === 'win32',
        subpage = options.subpage || "",
        tmdConfig = null,
        mode = "jquery",
        createTmd = {
            name: name,
            version: require(path.resolve(__dirname, '../../package')).version,
            type: "pages",
            isAlone: true,
            install: 'npm',
            no_extend: options.no_extend || false,
            http: '',
            proxy: false
        },
        tmdHandle = null,
        ps = [];

    if (subpage) {
        subpage = subpage.replace(/,$/, "").split(",");
    } else {
        subpage = ['index'];
    }

    if (fs.existsSync('./.tmd')) {
        try {
            tmdConfig = JSON.parse(fs.readFileSync('./.tmd', 'utf8'));
        } catch (e) {
            Log.err('.tmd配置文件解析错误,请确认是否为严格JSON格式')
            return;
        }

    }

    if (tmdConfig && tmdConfig.type === "work") {
        createTmd.isAlone = false;
        if (!createTmd.no_extend) {
            createTmd['http'] = tmdConfig.http;
            createTmd['proxy'] = tmdConfig.proxy;
        } else {
            createTmd['http'] = options.http || "";
            createTmd['proxy'] = options.proxy || false;
        }
    } else {
        createTmd['http'] = options.http || "";
        createTmd['proxy'] = options.proxy || false;
    }
    createTmd.subpage = subpage;

    Log.info('开始创建多页面项目...')

    if (options.mode === "vue") {
        mode = "vue";
    }

    tmdHandle = filemanage.mkdir(dirpath).then(function() {
        Log.suc('创建文件夹成功').info('开始生成项目源代码')
        return filemanage.mkdir(srcpath)
    }).then(function() {
        return filemanage.mkdir(srcentrypath)
    }).then(function() {
        if (mode === "vue") {
            let vps = subpage.map((e) => {
                return filemanage.mkdir(`${srcentrypath}/${e}`)
            });

            return Promise.all(vps);
        } else if (mode === "jquery") {
            return Promise.resolve();
        }

    }).then(function() {
        return filemanage.createFile(srcpath + '/main.scss', allocation.css())
    }).then(function() {
        //vue模式
        if (mode === "vue") {
            return Promise.resolve();
            //普通jq模式
        } else if (mode === "jquery") {
            subpage.map(e => {
                ps.push(filemanage.createFile(srcpath + `/${e}.html`, allocation.html({
                    head: `<title>多页面${e}</title>\n\t<link rel="stylesheet" href="./css/${name}.css">\n`,
                    body: `<div>多页面jquery案例${e}</div>\n<script type="text/javascript" src="./js/${e}.js"></script>\n`
                })))
            })
        }
        return Promise.all(ps)
    }).then(function() {
        ps = [];
        //vue模式
        if (mode === "vue") {
            subpage.map(e => {
            	ps.push(filemanage.createFile(`${srcentrypath}/${e}/main.scss`, `@import '../../main.scss';`),
                    filemanage.createFile(`${srcentrypath}/${e}/App.vue`, allocation.vueComponent("app")),
                    filemanage.createFile(`${srcentrypath}/${e}/main.js`, allocation.handle.execute('single')),
                    filemanage.createFile(`${srcentrypath}/${e}/client-entry.js`, allocation.handle.execute('singleClient', createTmd)),
                    filemanage.createFile(`${srcentrypath}/${e}/server-entry.js`, allocation.handle.execute('singleServer', createTmd)))
            })
            //普通jq模式
        } else if (mode === "jquery") {
            subpage.map(e => {
                ps.push(filemanage.createFile(srcentrypath + `/${e}.js`, `import '../main.scss';$(function(){\n\tconsole.log("${e}页面加载结束")\n})`))
            })
        }
        return Promise.all(ps)
    }).then(function() {
        Log.suc('生成项目源代码 --> 成功').info('开始生成项目构造配置文件')
        return filemanage.mkdir(buildpath)
    }).then(function() {
        let createDir = [filemanage.mkdir(srcpath + '/images')];
        if (mode === "vue") {
            createDir.push(filemanage.mkdir(srcpath + '/components'))
            createDir.push(filemanage.mkdir(srcpath + '/lib'))
            createDir.push(filemanage.mkdir(tplpath))
        }
        return Promise.all(createDir)
    }).then(function() {
        if (mode === "vue") {
        	let createTplAndAxios = [filemanage.createFile(tplpath+'/hot.tpl',allocation.html({body:`\t<div id="app"></div>\n`})),
                    filemanage.createFile(tplpath+'/render.tpl',allocation.html({body:`\t<!--vue-ssr-outlet-->\n`}))];
            //如果开启代理模式 生成2个文件
            if (createTmd.proxy) {
            	createTplAndAxios.push(filemanage.createFile(srcpath + '/lib/' + 'axios.client.config.js', allocation.axios("client", createTmd)));
            	createTplAndAxios.push(filemanage.createFile(srcpath + '/lib/' + 'axios.server.config.js', allocation.axios("server", createTmd)));
                //否者生成单文件
            } else {
            	createTplAndAxios.push(filemanage.createFile(srcpath + '/lib/' + 'axios.config.js', allocation.axios(createTmd)));
            }
            return Promise.all(createTplAndAxios)
        } else {
            return Promise.resolve();
        }
    }).then(function() {
        //webpack配置文件
        if (mode === "vue") {
            return Promise.all([filemanage.createFile(buildpath + '/webpack.config.client.js', allocation.webpack("pagesVueClient", createTmd)),
                filemanage.createFile(buildpath + '/webpack.config.server.js', allocation.webpack("pagesVueServer", createTmd))
            ])
            //普通jq模式
        } else if (mode === "jquery") {
            return filemanage.createFile(buildpath + '/webpack.config.js', allocation.webpack("pagesjQuery", createTmd))
        }

    }).then(function() {
        //发开模式热重载启动依赖文件
        return filemanage.createFile(buildpath + '/dev-client.js', allocation.handle.node('HotDevClient'))
    }).then(function() {
    	if (mode === "vue") {
    		return filemanage.createFile(buildpath + '/dev.js', allocation.handle.node('PagesVueDevServer', createTmd))
    	} else if (mode === "jquery") {
            return filemanage.createFile(buildpath + '/dev.js', allocation.handle.node('PagesDevServer', createTmd))
        }
    }).then(function() {
        if (mode === "vue") {
    		return filemanage.createFile(buildpath + '/build.js', allocation.handle.node('PagesVueBuild',createTmd))
    	} else if (mode === "jquery") {
            return filemanage.createFile(buildpath + '/build.js', allocation.handle.node('Pages$Build',createTmd))
        }
    }).then(function() {
        Log.suc('生成项目构造配置文件 --> 成功').info('开始创建启动脚本')
        return filemanage.createFile(dirpath + '/build.bat', "node ./build/build.js")
    }).then(function() {
        return filemanage.createFile(dirpath + '/dev.bat', "node ./build/dev.js")
    }).then(function() {
        Log.suc('创建启动脚本 --> 成功').info('开始生成配置文件 -> ".tmd"')
        return filemanage.createFile(dirpath + '/.tmd', JSON.stringify(createTmd))
    }).then(function() {
        //如果是在tmd工作路径中视为创建子项目文件
        if (tmdConfig && tmdConfig.type === "work") {
            Log.suc('生成配置文件 -> ".tmd"').info('插件项目创建成功')
            return Promise.reject('shutoff');
            //否者视为创建独立项目
        } else {
            Log.suc('生成配置文件 -> ".tmd"').info('开始生成配置文件 -> "package.json"')
            return filemanage.createFile(dirpath + '/package.json', allocation.package({
                name: name,
                version: '1.0.0',
                vue: mode === "vue",
                $: mode === "jquery"
            }))
        }
    }).then(function() {
        Log.suc('生成配置文件  -> "package.json" --> 成功').info('开始生成配置文件 -> ".babelrc"')
        return filemanage.createFile(dirpath + '/.babelrc', allocation.babel())
    }).then(function() {
        return proplug.dialogue(function() {
            Log.suc('生成配置文件 -> ".babelrcn" --> 成功').info('是否立即安装依赖[Y/N]?')
        })
    }).then(function(chunk) {
        let res = chunk.slice(0, chunk.length - 2).toUpperCase();
        if (res === "Y") {
            Log.warn('开始安装,如遇失败 --- 请手动安装')
            let ls = spawn('cd ' + dirpath + '&& ' + createTmd.install + ' i', {
                stdio: 'inherit',
                shell: shellStop
            });
            ls.on('close', (code) => {
                if (code == 0) {
                    Log.suc('安装结束')
                } else {
                    Log.err('安装依赖失败，请手动尝试')
                }
            });
        } else if (res === "N") {
            Log.suc('插件项目创建成功')
        } else {
            Log.warn("错误的参数,请稍后手动安装").suc('插件项目创建成功')
        }
    }).catch((msg) => {
        //正常停止不输出
        if (msg == 'shutoff') return;
        //异常错误
        Log.err(msg)
    })
}