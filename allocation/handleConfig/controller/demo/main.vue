<template>
    <div>
        <div>hello world</div>
        <div v-on:click="handleCountAdd">我是vuex的count {{count}} 点击会自增</div>
        <router-link to="/page">前往测试页面</router-link>
    </div>
</template>

<script type="text/javascript">
	export default {
		name:'test-main',
        data(){
            return {}
        },
        computed:{
            count(){
                return this.$store.state['count'];
            },
        },
        created(){
            console.log('这里是内容Main页面')
        },
		methods:{
            handleCountAdd(){
                this.$store.commit("TEST");
            }
		}
    }
</script>