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
		<mj-draw :scrollHeight="subsHeight" v-if="tabIdx == 0"></mj-draw>
		<mj-analysis :scrollHeight="subsHeight" v-else-if="tabIdx == 1"></mj-analysis>
		<mj-to-pic :scrollHeight="subsHeight" v-else></mj-to-pic>

		
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
	import mjDraw from "./components/mj-draw.vue"
	import mjAnalysis from "./components/mj-analysis.vue"
	import mjToPic from "./components/mj-to-pic.vue"
	export default {
		components:{
			mjDraw,
			mjAnalysis,
			mjToPic
		},
		computed: {
			...mapGetters(['notice']),
		},
		data() {
			return {
				showSkeleton: true,
				isNodes: 0,
				isCurrentPage: false,
				tabsConfig: {
					alignLeft: false,
					underLineColor: '#F8D849',
					activeColor: '#F8D849'
				},
				tabIdx: 0,
				tabList: [{
						name: "MJ绘图",
						value: 0,
					}, {
						name: "咒语解析",
						value: 1
					},
					{
						name: "头像制作",
						value: 2
					}
				],
				subsHeight:300,
			}
		},
		watch: { },
		onReady() {
			this.isNodes++;
			let that = this;
			this.$utils.getRect('#tabs-rect').then(res => {
				let w_h = uni.getSystemInfoSync().windowHeight;
				that.subsHeight = w_h - res.top - res.height;
			});
		},
		onShow() {
			this.isCurrentPage = true;
		},
		onHide() {
			this.isCurrentPage = false;
		},
		onUnload() {
			this.isCurrentPage = false;
		},
		onLoad() {
			setTimeout(() => {
				this.showSkeleton = false;
			}, 1500)
		},
		methods: {
			clickItem(item) {
				if (item.url) {
					uni.navigateTo({
						url: '/pages/webview/webview?url=' + item.url,
					})
				}
			},
			changeTab(idx, item) {
				this.tabIdx = idx;
			},
		}
	}
</script>

<style lang="scss">
	
	.notice {
		margin-bottom: 20rpx;
	}
</style>