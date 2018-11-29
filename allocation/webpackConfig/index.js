/*
    *创建webpack配置文件
    *params { String } type 创建类型
    *params { Object } data 对应类型附带参数
    *return {String} 生成文件内容
    */
module.exports = function(type,data) {
	let configAdd = null;
	switch(type){
		case 'plug':
		configAdd = {
			require:``,
			entry:`'${data.name}': ['babel-polyfill',path.resolve(__dirname, '../src/main.js')],`,
			output:`libraryTarget: "umd",\n\t\tlibrary:'${data.name}'`,
			resolve:`extensions: ['.js']`,
			rules:``,
			target:`web`,
			plugins:''
		};
		break;
        case 'singleClient':
        configAdd = {
            require:`const VueLoaderPlugin = require('vue-loader/lib/plugin');\nconst VueSSRClientPlugin = require('vue-server-renderer/client-plugin');`,
            entry:`'${data.name}': ['babel-polyfill',path.resolve(__dirname, '../src/client-entry.js')],`,
            output:``,
            resolve:`extensions: ['.vue', '.js'],\n\t\talias: {\n\t\t\t'vue$': 'vue/dist/vue.min.js'\n\t\t}\n`,
            rules:`{\n\t\t\ttest: /\\.vue$/,\n\t\t\texclude: /node_modules/,\n\t\t\tuse: 'vue-loader'\n\t\t},`,
            target:`web`,
            plugins:`new Webpack.ProvidePlugin({Vue: 'vue'}),\n\t\tnew VueLoaderPlugin(),\n\t\tnew VueSSRClientPlugin()`
        };
        break;
        case 'singleServer':
        configAdd = {
            require:`const VueLoaderPlugin = require('vue-loader/lib/plugin');\nconst VueSSRServerPlugin = require('vue-server-renderer/server-plugin');`,
            outputFilename:`'[name].js'`,
            entry:`'${data.name}': [path.resolve(__dirname, '../src/server-entry.js')],`,
            output:`libraryTarget: 'commonjs2'`,
            resolve:`extensions: ['.vue', '.js'],\n\t\talias: {\n\t\t\t'vue$': 'vue/dist/vue.min.js'\n\t\t}\n`,
            rules:`{\n\t\t\ttest: /\\.vue$/,\n\t\t\texclude: /node_modules/,\n\t\t\tuse: 'vue-loader'\n\t\t},`,
            target:`node`,
            plugins:`new Webpack.ProvidePlugin({Vue: 'vue'}),\n\t\tnew VueLoaderPlugin(),\n\t\tnew VueSSRServerPlugin()`
        };
        break;
        case 'spa':
        configAdd = {
            require:`const VueLoaderPlugin = require('vue-loader/lib/plugin');\nconst HtmlWebpackPlugin = require('html-webpack-plugin');\n`,
            entry:`'${data.name}': ['babel-polyfill',path.resolve(__dirname, '../src/client-entry.js')],`,
            output:``,
            resolve:`extensions: ['.vue', '.js'],\n\t\talias: {\n\t\t\t'vue$': 'vue/dist/vue.min.js'\n\t\t}\n`,
            rules:`{\n\t\t\ttest: /\\.vue$/,\n\t\t\texclude: /node_modules/,\n\t\t\tuse: 'vue-loader'\n\t\t},`,
            target:`web`,
            plugins:`new Webpack.ProvidePlugin({Vue: 'vue'}),\n\t\tnew VueLoaderPlugin(),\n\t\tnew HtmlWebpackPlugin({\n\t\t\taddLinkCss: ['./css/${data.name}.css'],\n\t\t\tfilename: './${data.name}.html',\n\t\t\ttemplate: path.resolve(__dirname, '../template/render.tpl'),\n\t\t\thash: true\n})`
        };
        break;
        case 'pagesjQuery':
        configAdd = {
            require:``,
            outputFilename:`'./js/[name].js?r='+Math.random().toString(36).substr(2)`,
            entry:function(){
                let pagesjQueryEntry = [];
                data.subpage.map(e=>{
                    pagesjQueryEntry.push(`'${e}': ['babel-polyfill',path.resolve(__dirname, '../src/entry/${e}.js')],\n`)
                })
                return pagesjQueryEntry.join("");
            }(),
            output:``,
            resolve:`extensions: ['.js']`,
            rules:``,
            target:`web`,
            plugins:`new Webpack.ProvidePlugin({$: 'jquery'})\n`
        };
        break;
        case 'pagesVueClient':
        configAdd = {
            require:`const VueLoaderPlugin = require('vue-loader/lib/plugin');\nconst VueSSRClientPlugin = require('vue-server-renderer/client-plugin');\nconst HtmlWebpackPlugin = require('html-webpack-plugin');\n`,
            entry:``,
            output:``,
            resolve:`extensions: ['.vue', '.js'],\n\t\talias: {\n\t\t\t'vue$': 'vue/dist/vue.min.js'\n\t\t}\n`,
            rules:`{\n\t\t\ttest: /\\.vue$/,\n\t\t\texclude: /node_modules/,\n\t\t\tuse: 'vue-loader'\n\t\t},`,
            target:`web`,
            plugins:`new Webpack.ProvidePlugin({Vue: 'vue'}),\n\t\tnew VueLoaderPlugin(),\n\t\tnew VueSSRClientPlugin()`
        };
        break;
        case 'pagesVueServer':
        configAdd = {
            require:`const VueLoaderPlugin = require('vue-loader/lib/plugin');\nconst VueSSRServerPlugin = require('vue-server-renderer/server-plugin');`,
            outputFilename:`'[name].js'`,
            entry:``,
            output:`libraryTarget: 'commonjs2'`,
            resolve:`extensions: ['.vue', '.js'],\n\t\talias: {\n\t\t\t'vue$': 'vue/dist/vue.min.js'\n\t\t}\n`,
            rules:`{\n\t\t\ttest: /\\.vue$/,\n\t\t\texclude: /node_modules/,\n\t\t\tuse: 'vue-loader'\n\t\t},`,
            target:`node`,
            plugins:`new Webpack.ProvidePlugin({Vue: 'vue'}),\n\t\tnew VueLoaderPlugin(),\n\t\tnew VueSSRServerPlugin()`
        };
        break;
		default:
		break;
	}
	if(!configAdd){
        
		return '这是一个错误的文件请联系作者';
	}
	
    let webpackString = `const path = require('path');
const Webpack = require("webpack");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
${configAdd.require}
const config = {
    //入口
    entry: {
    	${configAdd.entry}
    },
    //产出
    output: {
        ${type==='pagesVueServer'?"path: path.resolve(__dirname, '../dist/'),":''}
        filename: ${configAdd.outputFilename?configAdd.outputFilename:"'[name].js?r='+Math.random().toString(36).substr(2)"},
        publicPath: './',
        ${configAdd.output}
    },
    mode: 'production',
    //解析
    resolve: {
        ${configAdd.resolve}
    },
    //模块配置
    module: {
        rules: [${configAdd.rules}{
            test: /\\.js$/,
            exclude: /node_modules/,
            use: 'babel-loader'
        }, {
            test: /\\.(jpg|png|gif|ico)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    limit: 8196,
                    name: './[name].[ext]',
                    outputPath: './images/',
                }
            }]
        }, {
            test: /\\.css$/,
            //提取合并为同一个css文件
            use: ExtractTextPlugin.extract({
                publicPath: '../',
                fallback: "style-loader",
                use: ["css-loader?minimize=true"],
            })

        }, {
            test: /\\.scss$/,
            use: ExtractTextPlugin.extract({
                publicPath: '../',
                fallback: "style-loader",
                use: ["css-loader?minimize=true", "sass-loader"]
            })
        }, {
            test: /\\.(eot|woff|svg|ttf)$/,
            use: [{
                loader: 'url-loader',
                options: {
                    name: './[name].[ext]',
                    outputPath: './fonts/'
                }
            }]
        }]
    },
    //插件配置
    plugins: [
        new ExtractTextPlugin({
            filename: "css/${type==='pagesjQuery'?data.name:'[name]'}.css?r="+Math.random().toString(36).substr(2),
            disable: false,
            allChunks: true
        }),
        ${configAdd.plugins}
    ],
    //构建模式
    target: '${configAdd.target}'
}

module.exports = config`;

    return webpackString;
}


