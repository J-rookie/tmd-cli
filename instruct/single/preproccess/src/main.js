//引入axios实例
import axios from '../../lib/axios.config.js';
//引入页面组件
import App from './App.vue';
//引入样式 scss
import './main.scss';

Vue.prototype.$http = axios;

export function createApp () {
  const app = new Vue({
    // 根实例简单的渲染应用程序组件。
    render: h => h(App)
  })
  return { app }
}