<template>
	<view class="content">
		<skeleton :show="showSkeleton" :isNodes="isNodes" ref="skeleton" loading="chiaroscuro" selector="skeleton"
			bgcolor="#323232"></skeleton>
		<!-- 通知 -->
		<view class="notice skeleton">
			<rk-notice :show-icon="true" :show-more="false" :list="notice" @clickItem="clickItem"></rk-notice>
		</view>
		<!-- tabs -->
		<view id="tabs-rect" class="tabs-box">
			<rk-tabs :tabData="tabList" :defaultIndex="tabIdx" :config="tabsConfig" @tabClick='changeTab' />
		</view>
		<!-- tab-item -->
		<pic-draw :scrollHeight="subsHeight" v-if="tabIdx == 0"></pic-draw>
		<pic-analysis :scrollHeight="subsHeight" v-else-if="tabIdx == 1"></pic-analysis>
		<pic-to-pic :scrollHeight="subsHeight" v-else></pic-to-pic>

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
	import picDraw from "./components/pic-draw.vue"
	import picAnalysis from "./components/pic-analysis.vue"
	import PicToPic from "./components/pic-to-pic.vue"

	export default {
		components: {
			picDraw,
			picAnalysis,
			PicToPic,
		},
		computed: {
			...mapGetters(['notice']),
		},
		data() {
			return {
				showSkeleton: true,
				isNodes: 0,
				tabsConfig: {
					alignLeft: false,
					underLineColor: '#F8D849',
					activeColor: '#F8D849'
				},
				tabIdx: 0,
				tabList: [{
						name: "SD绘画",
						value: 0,
					}, {
						name: "咒语解析",
						value: 1
					},
					{
						name: "以图生图",
						value: 2
					}
				],
				subsHeight:300,
			}
		},
		onReady() {
			this.isNodes++;
			let that = this;
			this.$utils.getRect('#tabs-rect').then(res => {
				let w_h = uni.getSystemInfoSync().windowHeight;
				that.subsHeight = w_h - res.top - res.height;
			});
		},
		onLoad() {
			setTimeout(() => {
				this.showSkeleton = false;
			}, 1500)
		},
		/**
		 * 用户点击右上角分享
		 */
		// #ifdef MP
		onShareAppMessage: function() {
			let that = this;
			wx.showShareMenu({
				withShareTicket: true,
				menus: ['shareAppMessage', 'shareTimeline']
			});
			return {
				title: '',
				path: '/pages/index/index'
			};
		},
		onShareTimeline: function() {
			let that = this;
			return {
				title: '',
				query: {},
				imageUrl: ''
			};
		},
		// #endif
		methods: {
			clickItem(item) {
				if(item.url){
					uni.navigateTo({
						url:'/pages/webview/webview?url='+item.url,
					})
				}
			},
			changeTab(idx, item) {
				this.tabIdx = idx;
				// console.log("rk===>[item]" + JSON.stringify(item));
			},
		}
	}
</script>

<style lang="scss">
	.content {}

	.notice {
		margin-bottom: 20rpx;
	}
</style>