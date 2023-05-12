<template>
	<view class="com-pic-to-pic">
		<view class="ptp-content">
			<view class="header">
				<image src="./static/header.png" mode=""></image>
				<view class="title">敬请期待</view>
			</view>
			<view class="content-box">
				<view class="item open-url-box">
					开源地址
					<view class="yuanyue-pl20 open-url yuanyue-line yuanyue-line10" v-if="appConfig.github_url">{{appConfig.github_url}}</view>
					<view class="yuanyue-pl20 open-url yuanyue-line yuanyue-line10" v-if="appConfig.gitee_url">{{appConfig.gitee_url}}</view>
				</view>
				<view class="item contact-box">
					联系我们
					<view class="yuanyue-pl20 contact-wx" v-if="appConfig.qq">QQ：{{appConfig.qq}}</view>
				</view>
				<view class="item img-box">
					<view class="contact-wx-img" :style="'width:'+qrSize+'px;height:'+qrSize+'px;'">
						<image :src="appConfig.qq_qr" mode="aspectFit"></image>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	// +—————————————————————————————————————————————————————————————————————
	// | Created by 元岳科技
	// +—————————————————————————————————————————————————————————————————————
	// | Copyright (c) 2013~2023 http://www.yuanyuekj.com/ All rights reserved.
	// +—————————————————————————————————————————————————————————————————————
	// | GITEE: https://gitee.com/yuanyuekeji/stable-diffusion-mobileui
	// +—————————————————————————————————————————————————————————————————————
	// | GITHUB: https://github.com/yuanyuekeji/stable-diffusion-mobileui
	// +—————————————————————————————————————————————————————————————————————
	import {
		mapGetters
	} from 'vuex';
	export default {
		name: 'pic-to-pic',
		computed: {
			...mapGetters(['appConfig']),
			qrSize(){
				let s_w = uni.getSystemInfoSync().screenWidth;
				let qr_w = s_w * 0.5;
				return qr_w;
			}
		},
		data() {
			return {

			}
		},
		mounted() {
			
		},
		methods: {

		}
	}
</script>

<style lang="scss">
	.com-pic-to-pic {
		display: flex;
		justify-content: center;
	}
	.header{
		width: 338rpx;
		height: 80rpx;
		margin-top: -40rpx;
		position: relative;
		.title {
			position: absolute;
			width: 100%;
			height: 80% ;
			display: flex;
			justify-content: center;
			align-items: center;
			top: 0;
			left: 0;
		}
	}
	.ptp-content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		
		background-color: #333;
		margin-top: 50px;
		width: 70%;
		padding: 30rpx;
		border-radius: 10rpx;
	}
	.content-box {
		width: 100%;
		.item {
			margin-bottom: 20rpx;
		}
		.open-url {
			padding: 10rpx 20rpx;
		}
		
	}
	.img-box {
		width: 100%;
		display: flex;
		justify-content: center;
		.contact-wx-img {
			margin-top: 20rpx;
			// background-color: #fff000;
		}
	}
	
</style>