<template>
	<view class="com-pic-draw">
		<scroll-view scroll-y="true" :style="'height:'+scrollHeight+'px'">
			<!-- 提示词 -->
			<view class="input-item">
				<view class="section">
					<view class="title">提示词</view>
					<view class="title-en">(Prompt)</view>
				</view>
				<view class="text-area">
					<textarea v-model="cueword" placeholder="输入你想要的内容,支持中英文,用逗号分割."
						:maxlength="maxinput"></textarea>
				</view>
				<view class="text-num-box">
					<view class="text-num">{{cueword_num}}/{{maxinput}}</view>
				</view>
			</view>
			<!-- <view class="translate-box">
				<view class="translate" @click="clickTranslate(1)">
					<text class="iconfont icon-qiehuan"></text>翻译英文
				</view>
			</view> -->
			<!-- 反向提示词 -->
			<view class="input-item">
				<view class="section">
					<view class="title">反向提示词</view>
					<view class="title-en">(Negative prompt)</view>
				</view>
				<view class="text-area">
					<textarea v-model="formData.negative_prompt" placeholder="输入你不想要的内容,支持中英文,用逗号分割."
						:maxlength="maxinput"></textarea>
				</view>
				<view class="text-num-box">
					<view class="text-num">{{reverse_num}}/{{maxinput}}</view>
				</view>
			</view>
			<!-- <view class="translate-box">
				<view class="translate" @click="clickTranslate(2)">
					<text class="iconfont icon-qiehuan"></text>翻译英文
				</view>
			</view> -->

			<!-- 模型选择 -->
			<view class="box-content model-box">
				<view class="item-section">大模型选择</view>
				<view class="model-content">
					<view class="model-item-list" v-for="(item,index) in models" :key="index">
						<view class="model-item" :class="item.selected?'model-sel':''" @click="clickModel(item,index)">
							<view class="model-item-txt yuanyue-line">{{item.model_name}}</view>
						</view>
					</view>
				</view>
			</view>
			<!-- 模板选择 -->
			<view class="box-content template-box">
				<view class="item-section">LoRA模型选择</view>
				<view class="template-content">
					<view class="template-item-list" v-for="(item,index) in loras" :key="index">
						<view class="template-item" :class="item.selected?'template-sel':''"
							@click="clickLora(item,index)">
							<view class="img-box">
								<image :src="item.path" mode="aspectFill"></image>
								<!-- <image src="@/static/car1.jpeg" mode="aspectFill"></image> -->
							</view>
							<view class="template-item-txt yuanyue-line">{{item.name}}</view>
						</view>
					</view>
				</view>
			</view>
			<!-- 提示词相关性 -->
			<view class="box-content cueword-box">
				<view class="item-section">提示词相关性</view>
				<view class="slier">
					<slider :value="formData.cfg_scale" min="1" max="30" @change="cuewordSliderChange"
						:show-value="true" active-color="#F8D849" block-color="#F8D849" block-size="20"></slider>
				</view>
			</view>
			<!-- 采样 -->
			<view class="box-content cueword-box">
				<view class="item-section">采样迭代步数</view>
				<view class="slier">
					<slider :value="formData.steps" min="1" max="150" @change="sampleSliderChange" :show-value="true"
						active-color="#F8D849" block-color="#F8D849" block-size="20"></slider>
				</view>
			</view>
			<!-- 采样方法 -->
			<view class="box-content samplers-box">
				<view class="item-section">采样方法</view>
				<uni-data-select v-model="samplerVal" :localdata="samplers"></uni-data-select>
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

			<!-- 生成数量 -->
			<view class="box-content generate-box">
				<view class="item-section">生成数量</view>
				<view class="generate-content">
					<view class="generate-list" v-for="(item,index) in generates" :key="index">
						<view class="generate-item" :class="item.selected?'generate-sel':''"
							@click="clickGenerateChange(item,index)">{{item.val}}张</view>
					</view>
				</view>
			</view>

			<!-- 图片质量 -->
			<view class="box-content quality-box">
				<view class="item-section">图片质量</view>
				<view class="quality-content">
					<view class="quality-list" v-for="(item,index) in qualitys" :key="index">
						<view class="quality-item" :class="item.selected?'quality-sel':''"
							@click="clickQualityChange(item,index)">{{item.title}}</view>
					</view>
				</view>
			</view>

			<!-- 生成结果 -->
			<view class="box-content result-box" v-if="generatesImages && generatesImages.length>0">
				<view class="result-content">
					<view class="res-img-box" v-for="(item,index) in generatesImages" :key="index"
						@click="clickImg(generatesImages,index)">
						<image :src="item" mode="aspectFit"></image>
						<view class="download" @click.stop="clickDown(item,index)">
							<text class="iconfont icon-xiazai"></text>
						</view>
					</view>
				</view>
			</view>

			<!-- 提交 -->
			<view class="submit-box" @click="clickSubmit">
				<view class="submit-btn" v-if="generatesImages.length<=0">立即生成</view>
				<view class="submit-btn" v-else>再画一次</view>
			</view>

			<view class="yuanyue-safe20"></view>
		</scroll-view>
	</view>
</template>

<script>
	import {
		mapGetters
	} from 'vuex';
	import {
		getSdModels,
		getSdLoRA,
		getSdSamplers,
		getTranslate,
		postTxt2img
	} from "@/api/api.js"
	import {
		HTTP_REQUEST_URL
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
			...mapGetters(['lora_dir']),
		},
		data() {
			return {
				isBusying: false,
				samplerVal: 0,
				selLora:null,
				cueword:'',
				formData: {
					styles: [], //模板风格-字符串数组
					firstphase_width: 0,
					firstphase_height: 0,
					seed: -1,
					subseed: -1,
					subseed_strength: 0,
					seed_resize_from_h: -1,
					seed_resize_from_w: -1,
					n_iter: 1,
					restore_faces: false, // 脸部修复
					tiling: false, // 平铺分块
					do_not_save_samples: false,
					do_not_save_grid: false,
					eta: 0,
					s_churn: 0,
					s_tmax: 0,
					s_tmin: 0,
					s_noise: 1,
					override_settings: {},
					override_settings_restore_afterwards: true,
					script_args: [], //字符串数组
					
					prompt: "", // 提示词
					negative_prompt: "", //反向提示词
					sd_model_hash: "", //模型的hash
					cfg_scale: 1, //提示词相关性1-30
					steps: 20, //采样迭代步数 1-150
					sampler_name: "", //采样方法
					width: 512,
					height: 512,
					batch_size: 1, //图片数量
					//图片质量相关
					enable_hr: false,
					denoising_strength: 0,
					hr_scale: 2,
					hr_upscaler: "",
					hr_second_pass_steps: 0,
					hr_resize_x: 0,
					hr_resize_y: 0,
				},

				maxinput: 1000,
				cueword_num: 0,
				reverse_num: 0,
				models: [],
				loras: [],
				samplers: [],
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
				generates: [{
					val: 1,
					selected: true,
				}, {
					val: 2,
					selected: false,
				}, {
					val: 3,
					selected: false,
				}, {
					val: 4,
					selected: false,
				}],
				qualitys: [{
					title: '普通',
					val: 1,
					selected: true,
					param:{
						enable_hr: false,
						denoising_strength: 0,
						hr_scale: 2,
						hr_upscaler: "",
					}
				}, {
					title: '高清',
					val: 2,
					selected: false,
					param:{
						enable_hr: true,
						denoising_strength: 0.7,
						hr_scale: 2,
						hr_upscaler: "ESRGAN_4x",
					}
				}, {
					title: '超高清',
					val: 3,
					selected: false,
					param:{
						enable_hr: true,
						denoising_strength: 0.7,
						hr_scale: 2,
						hr_upscaler: "R-ESRGAN 4x+",
					}
				}, {
					title: '精绘',
					val: 4,
					selected: false,
					param:{
						enable_hr: true,
						denoising_strength: 0.7,
						hr_scale: 2,
						hr_upscaler: "R-ESRGAN 4x+",
					}
				}],
				generatesImages: [],

			}
		},
		watch: {
			cueword(n, o) {
				this.cueword_num = n.length;
			},
			"formData.negative_prompt"(n, o) {
				this.reverse_num = n.length;
			},
			"formData.steps":{
				immediate:true,
				handler(n,o){
					this.formData.hr_second_pass_steps = n;
				}
			},
			samplerVal: {
				immediate: false,
				handler(n, o) {
					this.samplers.forEach((item, index) => {
						if (n == index) {
							this.formData.sampler_name = item.name;
						}
					});
				}
			}
		},
		mounted() {
			this.sizeDeal();
			this.getSdModels();
			this.getSdLoRA();
			this.getSdSamplers();
			
			this.resetQulitys(this.qualitys[0].param);
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
			/**
			 * 翻译
			 */
			clickTranslate(falg) {
				// rk_warning
				let postDic = {
					doctype: 'json',
					type: 'ZH_CN2EN',
					i: '你好'
				}
				getTranslate(postDic).then(res => {
					
				}).catch(err => {
					
				});
			},
			/**
			 * 获取模型
			 */
			getSdModels() {
				getSdModels().then(res => {
					this.models = [];
					res.forEach((item, index) => {
						if (index == 0) {
							item.selected = true;
							this.formData.sd_model_hash = item.hash;
						} else {
							item.selected = false;
						}
						this.models.push(item);
					});
				}).catch(err => {});
			},
			/**
			 * 切换模型
			 */
			clickModel(item, index) {
				this.models.forEach((fItem, fIndex) => {
					fItem.selected = false;
				})
				item.selected = true;
				this.formData.sd_model_hash = item.hash;
			},
			/**
			 * 获取模板
			 */
			getSdLoRA() {
				getSdLoRA().then(res => {
					
					let temps = res.split(/[(\r\n)\r\n]+/);
					temps.forEach((item, index) => {
						if (!item) {
							temps.splice(index, 1);
						}
						let new_item = {
							name: item,
							// path: this.lora_dir + "\\" + item + '.png',
							path: HTTP_REQUEST_URL + "/file=models/Lora/" + item + '.png',
							selected: index == 0 ? true : false,
						};
						if (index == 0) {
							this.selLora = new_item;
						}
						this.loras.push(new_item);
					})
				}).catch(err => {});
			},
			/**
			 * 切换模板
			 */
			clickLora(item, index) {
				
				this.loras.forEach((fItem, fIndex) => {
					fItem.selected = false;
				})
				item.selected = true;
				this.selLora = item;
			},

			/**
			 * 提示词相关性改变
			 */
			cuewordSliderChange(e) {
				
				this.formData.cfg_scale = e.detail.value;
			},
			/**
			 * 采样迭代步数改变
			 */
			sampleSliderChange(e) {
				
				this.formData.steps = e.detail.value;
			},
			/**
			 * 获取采样方法
			 */
			getSdSamplers() {
				getSdSamplers().then(res => {
					this.samplers = [];
					res.forEach((item, index) => {
						let new_item = {
							text: item.name,
							value: index,
							...item
						}
						if (index == this.samplerVal) {
							this.formData.sampler_name = item.name;
						}
						this.samplers.push(new_item);
					});
				}).catch(err => {});
			},
			/**
			 * 采样比例改变
			 */
			clickRatioChange(item, index) {
				this.sizeRatios.forEach((fItem, fIndex) => {
					fItem.selected = false;
				});
				item.selected = true;
				
				let ratios = item.ratio.split(':');
				let ratio_w = ratios[0];
				let ratio_h = ratios[1];
				this.formData.width = parseInt(512 * ratio_w / ratio_h);
				this.formData.height = parseInt(512 * ratio_h / ratio_w);
				
			},
			/**
			 * 生成数量改变
			 */
			clickGenerateChange(item, index) {
				this.generates.forEach((fItem, fIndex) => {
					fItem.selected = false;
				});
				item.selected = true;
				this.formData.batch_size = item.val;
			},
			/**
			 * 图片质量选择
			 */
			clickQualityChange(item, index) {
				this.qualitys.forEach((fItem, fIndex) => {
					fItem.selected = false;
				});
				item.selected = true;
				this.resetQulitys(item.param);
			},
			resetQulitys(param){
				this.formData.enable_hr = param.enable_hr;
				this.formData.denoising_strength = param.denoising_strength;
				this.formData.hr_scale = param.hr_scale;
				this.formData.hr_upscaler = param.hr_upscaler;
				// this.formData.hr_second_pass_steps = param.hr_second_pass_steps;
				// this.formData.hr_resize_x = param.hr_resize_x;
				// this.formData.hr_resize_y = param.hr_resize_y;
			},
			/**
			 * 开始生成
			 */
			clickSubmit() {
				
				this.formData.prompt = this.cueword + ",<lora:"+this.selLora.name+":1>"
				
				
				if (!this.cueword && !this.formData.negative_prompt) {
					return this.$utils.showToast("请输入提示词或反向提示词")
				}

				if (this.isBusying) {
					return this.$utils.showToast("请稍后...")
				}
				this.isBusying = true;
				uni.showLoading({
					title: '正在生成...'
				});
				postTxt2img(this.formData).then(res => {
					uni.hideLoading()
					this.isBusying = false;
					this.$utils.showToast('生成成功');
					
					this.generatesImages = [];
					res.images.forEach(item => {
						let new_item = 'data:image/png;base64,' + item
						this.generatesImages.push(new_item);
					})
				}).catch(err => {
					uni.hideLoading();
					this.isBusying = false;
					this.$utils.showToast('生成失败');
				});

			},
			/**
			 * 预览
			 */
			clickImg(urls, index) {
				
				wx.previewImage({
					urls: urls,
					current: index,
					success: function(res) {},
					fail: function(res) {},
					complate: function(res) {}
				})
			},
			/**
			 * 下载
			 */
			async clickDown(item, index) {
				
				if (this.isBusying) {
					return this.$utils.showToast("请稍后...")
				}
				this.isBusying = true;
				uni.showLoading({
					title: '图片解析中...'
				})
				let img_path = await this.$utils.base64ToPath(item);
				
				uni.hideLoading();
				this.isBusying = false;

				// #ifdef H5
				let aLink = document.createElement('a');
				let evt = document.createEvent("HTMLEvents");
				evt.initEvent("click", true, true); //initEvent 不加后两个参数在FF下会报错  事件类型，是否冒泡，是否阻止浏览器的默认行为
				aLink.download = new Date().getTime() + '.png';
				aLink.href = img_path;
				aLink.click();
				// #endif

				// #ifndef H5
				uni.saveImageToPhotosAlbum({
					filePath: img_path, //不支持网络地址
					success: function() {
						uni.showToast({
							title: '保存成功',
						});
					},
					fail(err) {
						uni.showToast({
							title: '保存失败',
							icon: 'error'
						});
					}
				});
				// #endif
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

	.template-box {
		.template-content {
			padding: 10rpx 10rpx 0;
			display: flex;
			flex-wrap: wrap;

			.template-item-list {
				width: calc(33% - 14rpx);
				height: 160rpx;
				margin: 0 20rpx 0rpx 0;

				&:nth-child(3n) {
					margin: 0;
				}

				.template-item {
					font-size: 14px;
					border-radius: 10rpx;
					background-color: #323232;
					box-sizing: border-box;
					width: 100%;
					height: 140rpx;
					border: 1px solid transparent;
					overflow: hidden;
					position: relative;

					.img-box {
						width: 100%;
						height: 100%;
					}

					.template-item-txt {
						padding: 5rpx 10rpx;
						box-sizing: border-box;
						position: absolute;
						bottom: 0;
						left: 0;
						width: 100%;
						text-align: center;
						background-color: rgba(0, 0, 0, 0.7);
					}
				}

				.template-sel {
					border: 1px solid $yuanyue-color-main;
					color: $yuanyue-color-main;
					box-sizing: border-box;
				}
			}
		}
	}

	.cueword-box {}

	.samplers-box {}

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

	.generate-box {
		.generate-content {
			display: flex;
			flex-wrap: wrap;

			.generate-list {
				width: calc(25% - 17rpx);
				margin-right: 20rpx;

				&:nth-child(4n) {
					margin-right: 0;
				}

				.generate-item {
					display: flex;
					justify-content: center;
					padding: 10rpx 0;
					background-color: #969696;
					border-radius: 10rpx;
					font-size: 14px;
				}

				.generate-sel {
					background-color: $yuanyue-color-main;
				}
			}
		}
	}

	.quality-box {
		.quality-content {
			display: flex;
			flex-wrap: wrap;

			.quality-list {
				width: calc(25% - 17rpx);
				margin-right: 20rpx;

				&:nth-child(4n) {
					margin-right: 0;
				}

				.quality-item {
					display: flex;
					justify-content: center;
					padding: 10rpx 0;
					background-color: #969696;
					border-radius: 10rpx;
					font-size: 14px;
				}

				.quality-sel {
					background-color: $yuanyue-color-main;
				}
			}
		}
	}

	.submit-box {
		display: flex;
		justify-content: center;
		margin: 80rpx 0;

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

	.result-box {
		margin-top: 30rpx;

		.result-content {
			display: flex;
			flex-wrap: wrap;

			.res-img-box {
				width: calc(50% - 12rpx);
				height: 150px;
				margin: 20rpx 20rpx 0 0;

				&:nth-child(2n) {
					margin-right: 0;
				}

				background-color: rgba(150, 150, 150, 0.8);
				border-radius: 10rpx;
				position: relative;

				.download {
					position: absolute;
					right: 0rpx;
					bottom: 0;
					padding: 50rpx 18rpx 20rpx 40rpx;

					// background-color: #fff000;
					text {
						background-color: rgba(0, 0, 0, 0.6);
						padding: 13rpx;
						border-radius: 100px;
					}
				}
			}
		}

	}

	/deep/ uni-slider {
		margin: 10px 2px !important;
	}

	/deep/ uni-slider .uni-slider-value {
		width: auto !important;
		margin-left: 20rpx !important;
		// text-align: right;
		min-width: 20px;
	}

	/deep/ .uni-select .uni-select__selector {
		background-color: #323232 !important;
		border: 1px solid #969696 !important;
	}

	/deep/ .uni-select .uni-popper__arrow {
		border-bottom-color: #969696 !important;
	}

	/deep/ .uni-select .uni-popper__arrow::after {
		border-bottom-color: #969696 !important;
	}

	/deep/ .uni-select .uni-select__input-text {
		color: #fff;
	}

	/deep/ .uni-select .uni-select__input-placeholder {
		color: #6a6a6a !important;
	}
</style>