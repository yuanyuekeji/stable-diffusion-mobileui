<template>
	<view class="com-pic-draw">
		<scroll-view scroll-y="true" :style="'height:'+scrollHeight+'px'" :scroll-top="scrollViewTop">
			<!-- 提示词 -->
			<view class="input-item">
				<view class="section">
					<view class="title">提示词</view>
					<view class="title-en">(Prompt)</view>
				</view>
				<view class="text-area">
					<textarea v-model="cueword" placeholder="输入你想要的内容,支持中英文,用逗号分割." :maxlength="maxinput"></textarea>
				</view>
				<view class="text-num-box">
					<view class="text-num">{{cueword_num}}/{{maxinput}}</view>
				</view>
			</view>
			<view class="translate-box">
				<view class="translate" @click="clickTranslate(true)">
					<text class="iconfont icon-qiehuan"></text>翻译英文
				</view>
			</view>
			<!-- 模型选择 -->
			<view class="box-content model-box">
				<view class="item-section">大模型选择</view>
				<view class="model-content">
					<view class="model-item-list" v-for="(item,index) in models" :key="index">
						<view class="model-item" :class="item.selected?'model-sel':''" @click="clickModel(item,index)">
							<view class="model-item-txt yuanyue-line">{{item.title}}</view>
						</view>
					</view>
				</view>
			</view>
			<!-- 提示词相关度 -->
			<view class="box-content cueword-box" v-if="selModel && selModel.have_relevace">
				<view class="section-box">
					<view class="item-section">相关度</view>
					<view class="item-right" @click="clickCuewordInfo">
						<text class="iconfont icon-xiangqing"></text>说明
					</view>
				</view>
				<view class="slier">
					<slider :value="formData.relevance" min="0" max="1000" @change="cuewordSliderChange"
						:show-value="true" active-color="#F8D849" block-color="#F8D849" block-size="20"></slider>
				</view>
			</view>

			<!-- 选择图片 -->
			<view class="box-content reference-box">
				<view class="item-section">参考图 <text class="item-section-subs">(选填)</text> </view>
				<view class="refer-content">
					<view class="refer-item refer-normal" v-if="!formData.have_img" @click.stop="clickSelImage">
						<text class="iconfont icon-jiahao"></text>
					</view>
					<view class="refer-item refer-sel" v-else @click.stop="clickSelImage">
						<image :src="formData.image_path" mode="aspectFill"></image>
						<view class="clear-image" @click.stop="clearImage">
							<text class="iconfont icon-guanbi"></text>
						</view>
					</view>
				</view>
			</view>

			<!-- 图片影响度 -->
			<view class="box-content cueword-box" v-if="formData.have_img">
				<view class="item-section">图片影响度</view>
				<view class="slier">
					<slider :value="formData.influence" step="0.1" min="0.5" max="2" @change="influenceSliderChange"
						:show-value="true" active-color="#F8D849" block-color="#F8D849" block-size="20"></slider>
				</view>
			</view>

			<!-- 尺寸比例 -->
			<view class="box-content ratio-box">
				<view class="item-section">尺寸比例</view>
				<view class="ratio-content">
					<view class="ratio-list" v-for="(item,index) in sizeRatios" :key="index">
						<view class="ratio-item" :class="item.selected?'ratio-sel':''"
							@click="clickRatioChange(item,index)">
							<view class="item-shape-box">
								<view class="item-shape" :style="'width:'+item.width+'px;height:'+item.height+'px;'">
								</view>
							</view>
							<view class="item-txt">{{item.ratio}}</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 提交 -->
			<view class="submit-box" @click="clickSubmit">
				<view class="submit-btn" v-if="!generatesImages || generatesImages.length<=0">立即生成</view>
				<view class="submit-btn" v-else>再来一次</view>
			</view>
			<!--  -->
			<view class="desc-box">
				<view class="desc">生成时间1-3分钟,请耐心等待</view>
			</view>

			<!-- 生成结果 -->
			<view id="result-rect" class="box-content result-box">
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
		getTranslate,
		postMjAddAll,
		getMjFetch,
		postMjChange
	} from "@/api/api.js"
	import {
		HTTP_URL_SD
	} from "@/config/app.js"

	export default {
		name: 'pic-draw',
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
				isGenerating: false,
				cueword: '',
				formData: {
					prompt: '',
					model: '--v 5',
					relevance: 250, // 提示词相关度
					have_img: false,
					image_path: '',
					influence: 1, // 图片影响度
					size_ratio: '1:1',
				},
				maxinput: 1000,
				cueword_num: 0,
				models: [{
					id: 0,
					title: 'mj-v5.1',
					value: '--v 5.1',
					selected: false,
					have_relevace:true,
				}, {
					id: 1,
					title: 'mj-v5',
					value: '--v 5',
					selected: true,
					have_relevace:true,
				}, {
					id: 2,
					title: 'mj-v4',
					value: '--v 4',
					selected: false,
					have_relevace:true,
				}, {
					id: 3,
					title: 'niji-v4',
					value: '--niji 4',
					selected: false,
					have_relevace:false,
				}, {
					id: 4,
					title: 'niji-v5',
					value: '--niji 5',
					selected: false,
					have_relevace:true,
				}],
				selModel:null,
				sizeRatios: [{
					ratio: '1:1',
					width: 10,
					height: 10,
					val: 0,
					selected: true
				}, {
					ratio: '9:16',
					width: 9,
					height: 16,
					val: 2,
					selected: false
				}, {
					ratio: '16:9',
					width: 16,
					height: 9,
					val: 3,
					selected: false
				}, {
					ratio: '3:4',
					width: 3,
					height: 4,
					val: 4,
					selected: false
				}, {
					ratio: '4:3',
					width: 4,
					height: 3,
					val: 5,
					selected: false
				}, {
					ratio: '2:3',
					width: 2,
					height: 3,
					val: 6,
					selected: false
				}, {
					ratio: '3:2',
					width: 3,
					height: 2,
					val: 7,
					selected: false
				}],

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
				generateTimer: null,
				timerClear: false,
				gener_task_id: '',
				down_task_id: '',
				draw_task_id: '',
				fetchErrCount: 0,
				fetchRepeat: false,
				generatesImages: '',
				generateDownImage:'',
			}
		},
		watch: {
			cueword(n, o) {
				this.cueword_num = n.length;
			},
		},

		mounted() {
			this.sizeDeal();
			this.resetModel();
			let that = this;
			this.$utils.getRect('#result-rect').then(res => {
				this.resultRectTop = res.top;
			})
		},
		methods: {
			sizeDeal() {
				this.sizeRatios.forEach((item, index) => {
					let min = 0.3;
					let sizeBase = 5;
					if (index > 2) {
						min = 1;
					}
					let n_w = item.width * sizeBase * min;
					let n_h = n_w * item.height / item.width;
					item.width = n_w;
					item.height = n_h;
				});
			},
			resetModel(){
				this.models.forEach(item=>{
					if(item.selected){
						this.selModel = item;
					}
				})
			},
			/**
			 * 翻译
			 */
			clickTranslate(showAlert) {
				if (!this.cueword) {
					return this.$utils.showToast('内容不能为空');
				}
				let postDic = {
					doctype: 'json',
					type: 'ZH_CN2EN',
					i: this.cueword
				}
				if (showAlert) {
					uni.showLoading({
						title: '请稍后...',
						mask: true
					})
				}
				return new Promise((reslove, reject) => {
					getTranslate(postDic).then(res => {
						if (showAlert) {
							uni.hideLoading()
						}
						if (res.errorCode == 0) {
							let result = res.translateResult;
							let tgt = result.map(item => {
								return item.map(subitem => subitem.tgt).join(',')
							}).join(',');

							this.cueword = tgt;

							reslove(true);
						} else {
							if(showAlert){
								this.$utils.showToast('翻译失败,请重试');
							}
							//注意这里不要reject
							reslove(false)
						}
					}).catch(err => {
						if (showAlert) {
							uni.hideLoading()
							this.$utils.showToast('翻译失败,请重试');
						}
						//注意这里不要reject
						reslove(false)
					});
				});
			},
			/**
			 * 切换模型
			 */
			clickModel(item, index) {
				this.models.forEach((fItem, fIndex) => {
					fItem.selected = false;
				})
				item.selected = true;
				this.formData.model = item.value;
				this.selModel = item;
			},
			/**
			 * 提示词相关性改变
			 */
			cuewordSliderChange(e) {
				this.formData.relevance = e.detail.value;
			},
			clickCuewordInfo() {
				uni.showModal({
					content: '数值越高会产生与提示词紧密相匹配但艺术感较低的图像，数值越低创建的图片非常艺术，但与提示词的连接较少。',
					showCancel: false,
					confirmColor: '#F8D849',
					success() {}
				})
			},
			/**
			 * 选择图片
			 */
			clickSelImage() {
				if (this.isGenerating) {
					return;
				}
				this.$utils.uploadImageOne({
					url: 'mj_upload',
					type: 'mj'
				}, res => {
					this.formData.have_img = true;
					this.formData.image_path = res;
				})
			},
			clearImage() {
				this.formData.have_img = false;
				this.formData.image_path = '';
			},
			/**
			 * 图片影响度改变
			 */
			influenceSliderChange(e) {
				this.formData.influence = e.detail.value;
			},

			/**
			 * 尺寸比例改变
			 */
			clickRatioChange(item, index) {
				this.sizeRatios.forEach((fItem, fIndex) => {
					fItem.selected = false;
				});
				item.selected = true;
				this.formData.size_ratio = item.ratio;
			},
			/**
			 * 开始生成
			 */
			async clickSubmit() {
				if (!this.cueword) {
					return this.$utils.showToast("请输入提示词")
				}
				if (this.isGenerating) {
					return this.$utils.showToast("请稍后...")
				}
				
				this.task_type = 0;
				this.generatesImages = '';
				this.generateDownImage = '';
				
				uni.showLoading({
					title: '请稍后...',
					mask: true
				});

				// 信息处理
				let post_str = '';
				if (this.formData.have_img) {
					post_str += this.formData.image_path + ' ';
				}
				let trans_res = await this.clickTranslate(false);
				
				post_str += this.cueword + ' ';
				post_str += this.formData.model + ' ';
				if(this.selModel.have_relevace){
					post_str += '--s ' + this.formData.relevance + ' ';
				}
				post_str += '--ar ' + this.formData.size_ratio;
				if (this.formData.have_img) {
					post_str += ' --iw ' + this.formData.influence;
				}
				
				let postDic = {
					prompt: post_str
				}
				this.isGenerating = true;
				postMjAddAll(postDic).then(res => {
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
					uni.hideLoading();
					this.isGenerating = false;
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


		}
	}
</script>

<style lang="scss">
	.com-pic-draw {
		padding: 0rpx 30rpx;

	}

	.input-item {
		margin-top: 30rpx;
		background-color: #323232;
		padding: 20rpx;
		border-radius: 10rpx;

		.section {
			display: flex;
			align-items: baseline;
			font-size: 15px;
			color: $yuanyue-color-main;

			.title {
				font-weight: bold;
				margin-right: 8rpx;
			}

			.title-en {
				font-size: 14px;
			}
		}

		.text-area {

			textarea {
				width: 100%;
				height: 120px;
				font-size: 15px;
				padding: 10rpx 0;
			}
		}

		.text-num-box {
			display: flex;
			justify-content: flex-end;
			color: #969696;
		}
	}

	.translate-box {
		padding: 26rpx 0 10rpx 10rpx;
		display: flex;

		.translate {
			display: flex;
			align-items: center;
			font-size: 13px;
			border: 1rpx solid $yuanyue-color-main;
			padding: 6rpx 12rpx;
			border-radius: 10rpx;
			color: $yuanyue-color-main;

			text {
				margin-right: 5rpx;
			}
		}
	}

	.item-section {
		padding: 30rpx 0 10rpx;

		.item-section-subs {
			font-size: 13px;
			margin-left: 10rpx;
		}
	}

	.box-content {
		padding: 0 20rpx;
	}

	.model-box {
		.model-content {
			padding: 10rpx 10rpx 0;
			display: flex;
			flex-wrap: wrap;

			.model-item-list {
				width: calc(33% - 14rpx);
				height: 80rpx;
				margin: 0 20rpx 0rpx 0;

				&:nth-child(3n) {
					margin: 0;
				}

				.model-item {
					padding: 10rpx 15rpx;
					font-size: 14px;
					border-radius: 10rpx;
					background-color: #323232;
					box-sizing: border-box;
					width: 100%;
					border: 1px solid transparent;

					.model-item-txt {
						text-align: center;
					}
				}

				.model-sel {
					background-color: transparent;
					border: 1px solid $yuanyue-color-main;
					color: $yuanyue-color-main;
					box-sizing: border-box;
				}
			}
		}
	}

	.cueword-box {
		.section-box {
			display: flex;
			align-items: baseline;
			justify-content: space-between;

			.item-right {
				font-size: 13px;

				.iconfont {
					font-size: 13px;
					margin-right: 6rpx;
				}
			}
		}
	}

	.reference-box {
		.refer-content {
			margin-top: 10rpx;
			display: flex;

			.refer-item {
				background-color: #323232;
				width: 80px;
				height: 80px;
				border-radius: 10rpx;
				display: flex;
				justify-content: center;
				align-items: center;
			}

			.refer-normal {
				.iconfont {
					color: #969696;
					font-size: 20px;
				}
			}

			.refer-sel {
				image {
					border-radius: 10rpx;
				}

				position: relative;

				.clear-image {
					position: absolute;
					top: -15rpx;
					right: -15rpx;

					.iconfont {
						font-size: 16px;
						color: $yuanyue-color-main;
					}
				}
			}
		}

	}

	.ratio-box {
		.ratio-content {
			display: flex;
			flex-wrap: wrap;

			.ratio-list {
				width: calc(20% - 25rpx);
				margin: 20rpx 30rpx 0rpx 0;

				&:nth-child(5n) {
					margin-right: 0;
				}

				.ratio-item {
					padding: 5rpx 10rpx;
					box-sizing: border-box;
					display: flex;
					flex-direction: column;
					align-items: center;
					border-radius: 10rpx;
					border: 1px solid #969696;

					.item-shape-box {
						width: 60rpx;
						height: 60rpx;
						display: flex;
						justify-content: center;
						align-items: center;

						.item-shape {
							background-color: #969696;
							border-radius: 5rpx;
						}
					}

					.item-txt {
						font-size: 13px;
					}
				}

				.ratio-sel {
					border: 1px solid $yuanyue-color-main;
				}
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

	::v-deep uni-slider {
		margin: 10px 2px !important;
	}

	::v-deep uni-slider .uni-slider-value {
		width: auto !important;
		margin-left: 20rpx !important;
		// text-align: right;
		min-width: 20px;
	}
</style>