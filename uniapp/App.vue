<script>
	import {
		getConfig,
		getTranslate,
		getCmdFlags
	} from "@/api/api.js"
	export default {
		onLaunch: function() {
			console.log('App Launch')
			this.getConfig();
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		},
		methods: {
			getConfig() {
				getConfig().then(res => {
					// console.log("rk===>[config-suc]" + JSON.stringify(res));
					this.$store.commit("SETAPPCONFIG", res);
				}).catch(err => {});
				getCmdFlags().then(res => {
					// console.log("rk===>[cmd-suc]" + JSON.stringify(res));
					this.$store.commit("SETAPPCOMMON", res);
				}).catch(err => {
					console.log("rk===>[cmd-err]" + JSON.stringify(err));
				});
				
			}
		}
	}
</script>

<style lang="scss">
	/*每个页面公共css */
	@import "static/css/base.scss";
	@import "static/font/iconfont.css";

	::v-deep .uni-toast {
		background-color: #fff !important;
	}

	::v-deep .uni-toast-text {
		color: #323232 !important;
	}
	
	::v-deep .uni-toast__content {
		color: #323232 !important;
	}
	
	::v-deep .uni-sample-toast {
		background-color: #fff !important;
		border-radius: 10rpx !important;
	}
	::v-deep .uni-simple-toast__text{
		background-color: #fff !important;
		color: #323232 !important;
	}
	
</style>