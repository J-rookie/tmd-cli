<template>
    <div>
        <div>hello world</div>
        <div>我是vuex的count {{count}}</div>
        <router-link to="/">返回测试首页</router-link>
    </div>
</template>

<script type="text/javascript">
    export default {
        name:'test-page',
        data(){
            return {}
        },
        computed:{
            count(){
                return this.$store.state['count'];
            },
        },
        created(){
            console.log('这里是内容page页面')
        },
        methods:{
        }
    }
</script>