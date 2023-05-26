<template>
	<view class="com-mj-icon">
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
						<view class="item-content" @click="clickImg(generatesImages)">
							<view class="res-img-box" :style="'width:'+imgSize*1.15+'px;height:'+imgSize*1.15+'px;'">
								<image :src="generatesImages" mode="aspectFit"></image>
							</view>
						</view>
					</view>
				</view>

				<!-- 图片处理 -->
				<view class="reult-iamge-deal-box" v-if="showDealTool">
					<view class="item-section">相似图重绘</view>
					<view class="same-redraw-box">
						<view class="same-redraw-list" v-for="(item,index) in redrawTypes" :key="index">
							<view class="same-redraw-list-item"
								:class="redrawForm.draw_val == item.draw_val?'same-redraw-list-item-sel':''"
								@click="clickRedrawItem(item)">{{item.title}}</view>
						</view>
					</view>
					<view class="item-section">单张下载</view>
					<view class="same-redraw-box">
						<view class="same-redraw-list" v-for="(item,index) in redrawTypes" :key="index">
							<view class="same-redraw-list-item"
								:class="redrawForm.down_val == item.down_val?'same-redraw-list-item-sel':''"
								@click="clickDownItem(item)">{{item.title}}</view>
						</view>
					</view>
					<view class="result-content" v-if="generateDownImage">
						<view class="item-section">生成结果(点击图片长按保存)</view>
						<view class="item-content" @click="clickImg(generateDownImage)">
							<view class="res-img-box" :style="'width:'+imgSize*1.15+'px;height:'+imgSize*1.15+'px;'">
								<image :src="generateDownImage" mode="aspectFit"></image>
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
		TIMER_FETCH_INTERVAL,
		FETCH_REPEAT_COUNT
	} from "@/config/app.js"
	import {
		postMjAdd,
		getMjFetch,
		postMjChange
	} from "@/api/api.js"
	export default {
		name: 'mj-icon',
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
				scrollViewTop: 0,
				resultRectTop: 0,
				selShowUrl: '',
				selDir: '',
				formData: {
					prompt: '', //可以纯关键词文生图，可以前面带图片链接和关键词，图生图
					type: 1, //1婴儿，2男孩，3女孩，
				},
				types: [{
						title: '婴儿',
						val: 1
					},
					{
						title: '男孩',
						val: 2
					}, {
						title: '女孩',
						val: 3
					}
				],
				gener_task_id: '',
				down_task_id: '',
				draw_task_id: '',
				generateTimer: null,
				timerClear: false,
				isGenerating: false,
				isCurrentPage: false,
				generatesImages: '',
				redrawTypes: [{
						title: '左上',
						down_val: 'U1',
						draw_val: 'V1',
					},
					{
						title: '右上',
						down_val: 'U2',
						draw_val: 'V2',
					},
					{
						title: '左下',
						down_val: 'U3',
						draw_val: 'V3',
					},
					{
						title: '右下',
						down_val: 'U4',
						draw_val: 'V4',
					}
				],
				redrawForm: {
					down_val: '',
					draw_val: '',
				},
				showDealTool: false,
				task_type: 0, //0-生成任务，1-重绘任务，2下载任务
				generateDownImage: '',
				canResetTaskid: false,
				fetchErrCount: 0,
				fetchRepeat: false,
			}
		},
		watch: {
			selDir(n, o) {
				if (n) {
					this.selShowUrl = n;
				}
			},
		},
		mounted() {
			let that = this;
			this.$utils.getRect('#result-rect').then(res => {
				this.resultRectTop = res.top;
			})
		},
		methods: {
			/**
			 * 选择图片
			 */
			clickSelImg() {
				if (this.isGenerating) {
					return;
				}
				this.$utils.uploadImageOne({
					url: 'mj_upload',
					type: 'mj'
				}, res => {
					this.selDir = res;
				})

			},
			/**
			 * 切换类型
			 */
			clickChangeType(item) {
				if (this.isGenerating) {
					return;
				}
				this.formData.type = item.val;

			},
			clickSubmit() {

				if (!this.selDir) {
					return this.$utils.showToast("请先选择图片");
				}

				if (this.isGenerating) {
					return;
				}

				this.task_type = 0;
				this.generatesImages = '';
				this.generateDownImage = '';
				this.formData.prompt = this.selDir;
		
				uni.showLoading({
					title: "请稍后...",
					mask: true
				})
				this.isGenerating = true;
				postMjAdd(this.formData).then(res => {
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
				if (this.isCurrentPage) {
					uni.showLoading({
						title: "请稍后...",
						mask: true
					})
				}
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
						if (this.task_type == 2) {
							// 下载任务
							this.generateDownImage = res.imageUrl;
						} else if (this.task_type == 1) {
							// 重绘
							this.generatesImages = res.imageUrl;
							this.showDealTool = true;
							// 重绘成功将重绘id给生成id,以便下一次重绘或下载
							this.gener_task_id = this.draw_task_id;
							this.toolBtnReset();
						} else {
							//生成
							this.generatesImages = res.imageUrl;
							this.showDealTool = true;
							this.toolBtnReset();
						}
						this.$utils.showToast('获取成功');
						// 销毁
						this.destroyTimer();
						// 滚动
						that.scrollToRes();

					} else {
						let err_msg = '获取失败';
						if(res.failReason){
							err_msg = res.failReason;
						}
						uni.hideLoading()
						this.$utils.showToast(err_msg);
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
						// console.log("rk===>[重试-放弃]",that.fetchErrCount);
					} else {
						setTimeout(() => {
							that.fetchErrCount += 1;
							that.fetchRepeat = true;
							// console.log("rk===>[重试]" ,that.fetchErrCount);
							that.getMjFetch(taksId);
						}, 2000);
					}
				});
			},
			onScroll(e) {
				if (e.detail.scrollTop <= 10) {
					this.scrollViewTop = 0;
				}
			},
			scrollToRes() {
				if (this.scrollViewTop <= 0) {
					this.scrollViewTop = this.resultRectTop;
				}
			},
			/**
			 * 预览
			 */
			clickImg(url) {
				let urls = [url];
				wx.previewImage({
					urls: urls,
					current: 0,
					success: function(res) {},
					fail: function(res) {},
					complate: function(res) {}
				})
			},
			/**
			 * 重绘-选择重绘的图
			 */
			clickRedrawItem(item) {
				if (item.draw_val == this.redrawForm.draw_val) {
					return
				}
				this.redrawForm.draw_val = item.draw_val;

				this.task_type = 1;
				this.generateDownImage = '';
				this.generatesImages = '';
				
				uni.showLoading({
					title: "请稍后...",
					mask: true
				})
				this.isGenerating = true;
				let postDic = {
					content: this.gener_task_id + " " + item.draw_val
				}
				postMjChange(postDic).then(res => {
					if (res.code == 1) {
						this.draw_task_id = res.result;
						this.timerClear = false;
						this.createTimer(this.draw_task_id);
					} else {
						uni.hideLoading()
						this.$utils.showToast(res.description);
					}
				}).catch(err => {
					uni.hideLoading()
				});

			},
			/**
			 * 单张下载
			 */
			clickDownItem(item) {
				if (item.down_val == this.redrawForm.down_val) {
					return
				}
				this.redrawForm.down_val = item.down_val;

				this.task_type = 2;
				this.generateDownImage = '';

				uni.showLoading({
					title: "请稍后...",
					mask: true
				})
				this.isGenerating = true;
				let postDic = {
					content: this.gener_task_id + " " + item.down_val
				}
				postMjChange(postDic).then(res => {
					if (res.code == 1) {
						this.down_task_id = res.result;
						this.timerClear = false;
						this.createTimer(this.down_task_id);
					} else {
						uni.hideLoading()
						this.$utils.showToast(res.description);
					}
				}).catch(err => {
					uni.hideLoading()
				});

			},
			toolBtnReset(){
				this.redrawForm.draw_val = '';
				this.redrawForm.down_val = '';
			},
		}
	}
</script>

<style lang="scss">
	.scroll-content {
		padding: 30rpx;
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
		
	}
	.result-content {
		.item-content {
			display: flex;
			justify-content: center;
	
			.res-img-box {
				background-color: #323232;
				border-radius: 10rpx;
			}
		}
	}

	.reult-iamge-deal-box {
		.same-redraw-box {
			display: flex;
			flex-wrap: wrap;

			.same-redraw-list {
				width: calc(25% - 17rpx);
				margin-right: 20rpx;

				&:nth-child(4n) {
					margin-right: 0;
				}

				.same-redraw-list-item {
					display: flex;
					justify-content: center;
					padding: 10rpx 0;
					background-color: #323232;
					border-radius: 10rpx;
					font-size: 14px;
				}

				.same-redraw-list-item-sel {
					background-color: $yuanyue-color-main;
					color: #323232;
				}
			}
		}
	}
</style>