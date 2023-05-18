<template>
	<view class="content">
		<!-- 通知 -->
		<view id="notice-rect" class="notice skeleton">
			<rk-notice :show-icon="true" :show-more="false" :list="notice" @clickItem="clickItem"></rk-notice>
		</view>

		<scroll-view scroll-y="true" :style="'height:'+scrollHeight+'px'" :scroll-top="scrollViewTop"
			@scroll="onScroll">
			<view class="scroll-content">
				<view class="upload-box">
					<view class="upload-content" :style="'width:'+imgSize+'px;height:'+imgSize+'px;'">
						<view class="img-box" v-if="!selShowUrl" @click="clickSelImg">
							<text class="iconfont icon-morentupianccccccpx"></text>
							<view class="des">点击上传图片</view>
						</view>
						<view class="img-box" v-if="selShowUrl" @click="clickSelImg">
							<image :src="selShowUrl" mode="aspectFit"></image>
						</view>
					</view>
				</view>
				<view class="item-section">请选择类型</view>
				<view class="type-box">
					<view class="type-list" v-for="(item,index) in types" :key="index">
						<view class="type-list-item" :class="formData.type == item.val?'type-list-sel':''"
							@click="clickChangeType(item)">
							{{item.title}}
						</view>
					</view>
				</view>

				<!-- 提交 -->
				<view class="submit-box" @click="clickSubmit">
					<view class="submit-btn" v-if="!generatesImages">立即生成头像</view>
					<view class="submit-btn" v-else>再来一次</view>
				</view>
				<!--  -->
				<view class="desc-box">
					<view class="desc">生成时间1-3分钟,请耐心等待</view>
				</view>

				<!-- 结果 -->
				<view id="result-rect" class="result-box">
					<view class="result-content" v-if="generatesImages">
						<view class="item-section">生成结果(点击图片长按保存)</view>
						<view class="item-content"@click="clickImg()">
							<view class="res-img-box" :style="'width:'+imgSize*1.15+'px;height:'+imgSize*1.15+'px;'">
								<image :src="generatesImages" mode="aspectFit"></image>
							</view>
						</view>
					</view>
				</view>

				<view class="yuanyue-safe20"></view>
			</view>
		</scroll-view>
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
	import {
		HTTP_URL_MJ
	} from "@/config/app.js"
	import {
		postMjAdd,
		getMjFetch
	} from "@/api/api.js"
	export default {
		computed: {
			...mapGetters(['notice']),
			imgSize() {
				let s_w = uni.getSystemInfoSync().screenWidth;
				let img_w = s_w * 0.7;
				return img_w;
			}
		},
		data() {
			return {
				showSkeleton: true,
				isNodes: 0,
				scrollHeight: 0,
				scrollViewTop: 0,
				resultRectTop: 0,
				selShowUrl: '',
				selDir: '',
				formData: {
					prompt: '', //可以纯关键词文生图，可以前面带图片链接和关键词，图生图
					type: 1, //1男宝，2女宝，3男性，4女性
				},
				types: [{
						title: '男宝宝',
						val: 1
					},
					{
						title: '女宝宝',
						val: 2
					}, {
						title: '男性',
						val: 3
					}, {
						title: '女性',
						val: 4
					}
				],
				task_id:'',
				generateTimer: null,
				timerClear:false,
				isGenerating:false,
				isCurrentPage:false,
				generatesImages: '',
			}
		},
		watch: {
			selDir(n, o) {
				if (n) {
					this.selShowUrl = n;
				}
			},
			task_id(n,o){
				if(n && n!=o){
					this.timerClear = false;
					this.createTimer();
				}
			}
		},
		onReady() {
			this.isNodes++;
			let that = this;
			this.$utils.getRect('#notice-rect').then(res => {
				let w_h = uni.getSystemInfoSync().windowHeight;
				that.scrollHeight = w_h - res.top - res.height;
			});
			this.$utils.getRect('#result-rect').then(res => {
				this.resultRectTop = res.top;
			})
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
			
		},
		methods: {
			clickItem(item) {
				if (item.url) {
					uni.navigateTo({
						url: '/pages/webview/webview?url=' + item.url,
					})
				}
			},
			/**
			 * 选择图片
			 */
			clickSelImg() {
				if(this.isGenerating){
					return;
				}
				this.$utils.uploadImageOne({url:'mj_upload',type:'mj'}, res => {
					this.selDir = res;
				})

			},
			/**
			 * 切换类型
			 */
			clickChangeType(item) {
				if(this.isGenerating){
					return;
				}
				this.formData.type = item.val;
				
			},
			clickSubmit() {
				
				
				if (!this.selDir) {
					return this.$utils.showToast("请先选择图片");
				}
				
				if(this.isGenerating){
					return;
				}
				/*
				let temps = this.selDir.split(/[\/]+/);
				let last_str = "/" + temps[temps.length-1];
				let img_dir = this.selDir.replace(last_str,'');
				this.formData.prompt = img_dir;
				*/
				this.formData.prompt = this.selDir;
				this.generatesImages = '';
				uni.showLoading({
					title:"正在生成...",
					mask:true
				})
				this.isGenerating = true;
				postMjAdd(this.formData).then(res => {
					if(res.code == 1){
						this.task_id = res.result;
					}else{
						uni.hideLoading()
						this.$utils.showToast(res.description);
					}
				}).catch(err => {
					uni.hideLoading()
				});

			},
			/**
			 * 创建计时器
			 */
			createTimer(){
				let that = this;
				that.generateTimer = setInterval(function() {
					if (that.timerClear) {
						clearInterval(that.generateTimer);
						that.generateTimer = null;
						return;
					}
					that.getMjFetch();
				}, 10000);
			},
			destroyTimer(){
				if(this.generateTimer){
					clearInterval(this.generateTimer);
					this.generateTimer = null;
				}
				this.timerClear = true;
				this.isGenerating = false;
			},
			/**
			 * 获取图片进度
			 */
			getMjFetch(){
				let postDic = {
					taskId:this.task_id,
				}
				if(this.isCurrentPage){
					uni.showLoading({
						title:"正在生成...",
						mask:true
					})
				}
				getMjFetch(postDic).then(res => {
					let that = this;
					if(res.status == 'NOT_START' || res.status == 'IN_PROGRESS'){
						
					}else if(res.status == 'SUCCESS'){
						uni.hideLoading()
						this.generatesImages = res.imageUrl;
						this.$utils.showToast('生成成功');
						// 销毁
						this.destroyTimer();
						// 滚动
						that.scrollToRes();
						
					}else{
						uni.hideLoading()
						this.$utils.showToast('生成失败');
						// 销毁
						this.destroyTimer();
					}
				}).catch(err => {
					uni.hideLoading()
					this.$utils.showToast('生成失败');
					// 销毁
					this.destroyTimer();
				});
			},
			onScroll(e) {
				if (e.detail.scrollTop <= 10) {
					this.scrollViewTop = 0;
				}
			},
			scrollToRes(){
				if (this.scrollViewTop <= 0) {
					this.scrollViewTop = this.resultRectTop;
				}
			},
			/**
			 * 预览
			 */
			clickImg() {
				let urls = [this.generatesImages];
				wx.previewImage({
					urls: urls,
					current: 0,
					success: function(res) {},
					fail: function(res) {},
					complate: function(res) {}
				})
			},
		}
	}
</script>

<style lang="scss">
	.scroll-content {
		padding: 30px;
	}

	.upload-box {
		display: flex;
		justify-content: center;

		.upload-content {
			background-color: #171717;
			padding: 30rpx;
			border-radius: 10rpx;
			border: 1rpx solid #222;

			.img-box {
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;

				text {
					font-size: 150px;
					color: #323232;
				}

				.des {
					font-size: 15px;
					color: #7e7e7e;
				}
			}

		}
	}

	.item-section {
		padding: 30rpx 0 20rpx;
	}

	.type-box {
		display: flex;
		flex-wrap: wrap;

		.type-list {
			width: calc(25% - 17rpx);
			margin-right: 20rpx;

			&:nth-child(4n) {
				margin-right: 0;
			}

			.type-list-item {
				display: flex;
				justify-content: center;
				padding: 10rpx 0;
				background-color: #323232;
				border: 1px solid #323232;
				border-radius: 10rpx;
				font-size: 14px;
			}

			.type-list-sel {
				border: 1px solid $yuanyue-color-main;
				background-color: transparent;
				color: $yuanyue-color-main;
			}
		}
	}

	.submit-box {
		display: flex;
		justify-content: center;
		margin: 80rpx 0 20rpx;

		.submit-btn {
			width: 80%;
			padding: 20rpx 0;
			background-color: $yuanyue-color-main;
			color: #323232;
			border-radius: 10rpx;
			display: flex;
			justify-content: center;
		}
	}
	.desc-box {
		display: flex;
		justify-content: center;
		.desc {
			font-size: 14px;
		}
	}

	.result-box {
		.result-content {
			// background-color: #fff000;
			.item-content {
				display: flex;
				justify-content: center;
				.res-img-box {
					background-color: #323232;
					border-radius: 10rpx;
				}
			}
		}
	}
</style>