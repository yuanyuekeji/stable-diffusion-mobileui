<template>
	<view class="com-pic-analysis">
		<scroll-view scroll-y="true" :style="'height:'+scrollHeight+'px'">
			<view class="title-box">
				<view class="title">基于MJ解析图片中的元素，并生成咒语描述词</view>
			</view>
			<view class="upload-box">
				<view class="upload-content" :style="'width:'+imgSize+'px;height:'+imgSize+'px;'">
					<view class="img-box" v-if="!formData.base64" @click="clickSelImg">
						<text class="iconfont icon-morentupianccccccpx"></text>
						<view class="des">点击上传图片</view>
					</view>
					<view class="img-box" v-if="formData.base64" @click="clickSelImg">
						<image :src="formData.base64" mode="aspectFit"></image>
					</view>
				</view>
			</view>

			<view class="submit-box">
				<view class="submit-btn" @click="clickSubmit">立即解析</view>
			</view>

			<!--  -->
			<view class="desc-box">
				<view class="desc">生成时间1-3分钟,请耐心等待</view>
			</view>

			<view class="res-box">
				<view class="res-title">解析结果</view>
				<view class="res-item">
					<view class="section-box">
						<view class="res-item-title">英文</view>
						<view class="res-item-copy" @click="clickClipboard(2)">
							<text class="iconfont icon-copy"></text>复制
						</view>
					</view>
					<text class="res-item-content">{{analysisRes}}</text>
				</view>
			</view>
			<view class="yuanyue-safe"></view>
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
		TIMER_FETCH_INTERVAL,
		FETCH_REPEAT_COUNT
	} from "@/config/app.js"
	import {
		mapGetters
	} from 'vuex';
	import {
		postMjDescribe,
		getMjFetch
	} from "@/api/api.js"

	import {
		HTTP_URL_SD
	} from "@/config/app.js"

	export default {
		name: 'pic-analysis',
		props: {
			scrollHeight: {
				typeof: Number,
				default: 0
			}
		},
		computed: {
			imgSize() {
				let s_w = uni.getSystemInfoSync().screenWidth;
				let img_w = s_w * 0.7;
				return img_w;
			}
		},
		data() {
			return {
				isGenerating: false,
				formData: {
					base64: '',
				},
				generateTimer: null,
				timerClear: false,
				gener_task_id: '',
				fetchErrCount: 0,
				fetchRepeat: false,
				analysisRes: '',
			}
		},
		watch: {},
		mounted() {

		},
		methods: {
			clickSelImg() {
				if (this.isGenerating) {
					return;
				}
				let that = this;
				uni.chooseImage({
					count: 1,
					success(res) {
						let imgPath = res.tempFilePaths[0];
						that.pathToBase64(imgPath);
					}
				})
			},
			/**
			 * 格式转换
			 */
			pathToBase64(path) {
				this.isGenerating = true;
				this.$utils.pathToBase64(path).then(res => {
					this.isGenerating = false;
					this.formData.base64 = res;
				}).catch(err => {
					this.isGenerating = false;
					this.$utils.showToast('图片解析失败,请重新选择')
				});
			},
			/**
			 * 提交
			 */
			clickSubmit() {
				if (!this.formData.base64) {
					return this.$utils.showToast('请先选择图片')
				}
				this.analysisRes = '';

				uni.showLoading({
					title: "请稍后...",
					mask: true
				})
				this.isGenerating = true;
				postMjDescribe(this.formData).then(res => {
					if (res.code == 1) {
						this.gener_task_id = res.result;
						this.timerClear = false;
						this.createTimer(this.gener_task_id);
					} else {
						this.isGenerating = false;
						uni.hideLoading()
						this.$utils.showToast(res.description);
					}
				}).catch(err => {
					this.isGenerating = false;
					uni.hideLoading()
				});
			},

			/**
			 * 创建计时器
			 */
			createTimer(taskId) {
				let that = this;
				that.generateTimer = setInterval(function() {
					if (that.timerClear) {
						clearInterval(that.generateTimer);
						that.generateTimer = null;
						return;
					}
					that.getMjFetch(taskId);
				}, TIMER_FETCH_INTERVAL);
			},
			destroyTimer() {
				if (this.generateTimer) {
					clearInterval(this.generateTimer);
					this.generateTimer = null;
				}
				this.timerClear = true;
				this.isGenerating = false;
			},
			/**
			 * 获取图片进度
			 */
			getMjFetch(taksId) {
				let postDic = {
					taskId: taksId,
				}
				uni.showLoading({
					title: "请稍后...",
					mask: true
				})
				let that = this;

				getMjFetch(postDic).then(res => {
					if (res.status == 'NOT_START' || res.status == 'IN_PROGRESS' || res.status == 'SUBMITTED') {
						if (that.fetchRepeat) {
							that.fetchRepeat = false;
							that.destroyTimer();
							that.createTimer(taksId);
						}
					} else if (res.status == 'SUCCESS') {
						uni.hideLoading()
						this.fetchErrCount = 0;
						this.analysisRes = res.prompt;
						this.$utils.showToast('解析成功');
						// 销毁
						this.destroyTimer();

					} else {
						uni.hideLoading()
						this.$utils.showToast('解析失败');
						// 销毁
						this.destroyTimer();
					}
				}).catch(err => {
					// 销毁
					that.destroyTimer();
					if (that.fetchErrCount >= FETCH_REPEAT_COUNT) {
						uni.hideLoading()
						this.fetchErrCount = 0;
						that.$utils.showToast('获取失败');
						// console.log("rk===>[重试-放弃]", that.fetchErrCount);
					} else {
						setTimeout(() => {
							that.fetchErrCount += 1;
							that.fetchRepeat = true;
							// console.log("rk===>[重试]", that.fetchErrCount);
							that.getMjFetch(taksId);
						}, 2000);
					}
				});
			},

			/**
			 * 复制解析结果
			 */
			clickClipboard(flag) {
				let that = this;
				uni.setClipboardData({
					data: this.analysisRes,
					showToast: false,
					success: function() {
						that.$utils.showToast('复制成功')
					}
				});
			}

		}
	}
</script>

<style lang="scss">
	.title-box {
		color: #7e7e7e;
		display: flex;
		justify-content: center;
		padding: 50rpx 0 30rpx;
		font-size: 15px;
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

	.submit-box {
		display: flex;
		justify-content: center;
		margin: 50rpx 0;

		.submit-btn {
			width: 70%;
			background-color: $yuanyue-color-main;
			border-radius: 100px;
			padding: 20rpx 0;
			display: flex;
			justify-content: center;
			font-size: 15px;
			color: #323232;
		}
	}

	.desc-box {
		display: flex;
		justify-content: center;

		.desc {
			font-size: 14px;
		}
	}

	.res-box {
		padding: 0 30rpx 50rpx;
		font-size: 15px;

		.res-item {
			font-size: 14px;
			background-color: #171717;
			margin: 10rpx 0;
			padding: 0rpx 20rpx 20rpx;
			border-radius: 10rpx;

			.section-box {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 15rpx 0;

				.res-item-title {}

				.res-item-copy {
					text {}

					.iconfont {
						margin-right: 3rpx;
					}
				}
			}
			.res-item-content {}
		}
	}
</style>