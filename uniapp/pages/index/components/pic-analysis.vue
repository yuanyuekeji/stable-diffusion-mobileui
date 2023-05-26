<template>
	<view class="com-pic-analysis">
		<scroll-view scroll-y="true" :style="'height:'+scrollHeight+'px'">
			<view class="title-box">
				<view class="title">基于SD解析图片中的元素，并生成咒语描述词</view>
			</view>
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

			<view class="submit-box">
				<view class="submit-btn" @click="clickSubmit">立即解析</view>
			</view>

			<view class="res-box">
				<view class="res-title">解析结果</view>
				<!-- <view class="res-item">
					<view class="section-box">
						<view class="res-item-title">中文</view>
						<view class="res-item-copy" @click="clickClipboard(1)">
							<text class="iconfont icon-copy"></text>复制
						</view>
					</view>
					<view class="res-item-content">结果11111</view>
				</view> -->
				<view class="res-item">
					<view class="section-box">
						<view class="res-item-title">英文</view>
						<view class="res-item-copy" @click="clickClipboard(2)">
							<text class="iconfont icon-copy"></text>复制
						</view>
					</view>
					<view class="res-item-content">{{analysisRes}}</view>
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
		mapGetters
	} from 'vuex';
	import {
		postPreprocess,
		getAnalysRes
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
			...mapGetters(['data_dir']),
			imgSize() {
				let s_w = uni.getSystemInfoSync().screenWidth;
				let img_w = s_w * 0.7;
				return img_w;
			}
		},
		data() {
			return {
				baseUrl: HTTP_URL_SD + "/file/",
				selShowUrl: '',
				selDir: '',
				imageName: '',
				formData: {
					id_task: '',
					process_src: '', //源目录
					process_dst: '', //目标目录
					process_width: 512,
					process_height: 512,
					preprocess_txt_action: 'ignore', //可选项有：无视（ignore）；复制（copy）;放前面（prepend）；放后面（append）
					process_flip: false, //创建镜像副本
					process_split: false, //分割过大副本
					process_caption: false, //使用 BLIP 生成说明文字(自然语言描述
					process_caption_deepbooru: true,
					process_keep_original_size:false,
				},
				analysisRes: '',
			}
		},
		watch: {
			selDir(n, o) {
				if (n) {
					this.selShowUrl = this.baseUrl + n;
				}
			}
		},
		mounted() {
			this.formData.process_dst = this.data_dir + "/sd_analysis_pic_to_txt";
		},
		methods: {
			clickSelImg() {

				this.$utils.uploadImageOne('upload', res => {
					this.selDir = res;
					let temps = res.split(/[\/]+/);
					let last_str = temps[temps.length - 1];
					let name_temps = last_str.split('.')
					this.imageName = name_temps[0];
				})

			},
			clickSubmit() {

				if (!this.selDir) {
					return this.$utils.showToast("请先选择图片");
				}

				let task_id = this.$utils.fn_Guid(15);
				this.formData.id_task = "task(" + task_id + ")";
				let temps = this.selDir.split(/[\/]+/);
				let last_str = "/" + temps[temps.length - 1];
				let img_dir = this.selDir.replace(last_str, '');
				this.formData.process_src = img_dir;

				uni.showLoading({
					title: "解析中...",
					mask: true
				})
				postPreprocess(this.formData).then(res => {
					uni.hideLoading()
					this.getAnalysRes();
				}).catch(err => {
					uni.hideLoading()
				});

			},
			getAnalysRes() {
				let dir = this.formData.process_dst;
				let name = "00001-0-" + this.imageName;
				getAnalysRes(dir, name).then(res => {
					this.$utils.showToast("解析成功");
					this.analysisRes = res;
				}).catch(err => {
					let name2 = "00000-0-" + this.imageName;
					getAnalysRes(dir, name2).then(res => {
						this.$utils.showToast("解析成功");
						this.analysisRes = res;
					}).catch(err => {
						this.$utils.showToast("解析失败");
					});
				});
			},
			/*
			getAnalysRes(){
				let dir = this.formData.process_dst;
				let name = "00000-0-" + this.imageName;
				getAnalysRes(dir,name).then(res=>{
					this.$utils.showToast("解析成功");
					this.analysisRes = res;
				}).catch(err => {});
			},
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