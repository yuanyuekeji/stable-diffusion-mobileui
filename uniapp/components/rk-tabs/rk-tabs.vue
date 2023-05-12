<template>
	<view class="_tab-box" :style="{fontSize: defaultConfig.fontSize + 'rpx', color: defaultConfig.color}">
		<scroll-view id="_scroll" :scroll-x="true" class="scroll-view-h" scroll-with-animation
			:scroll-left="slider.scrollLeft">
			<view class="_scroll-content">
				<view class="_tab-item-box" :class="[(defaultConfig.itemWidth || defaultConfig.alignLeft) ? '_clamp' : '_flex']">
					<block v-for="(item, index) in tabList" :key="index">
						<view class="_item" :id="'_tab_'+index" :class="{ '_active': tagIndex === index }"
							:style="{color: tagIndex == index ? defaultConfig.activeColor : defaultConfig.color, 'width': defaultConfig.itemWidth ? defaultConfig.itemWidth + 'rpx' : ''}"
							@click="tabClick(index,item)">{{ item[defaultConfig.key] || item }}</view>
					</block>
				</view>
				<view class="_underline" :style="{
						transform: 'translateX(' + slider.left + 'px)',
						width: slider.width + 'px',
						height: defaultConfig.underLineHeight + 'rpx',
						backgroundColor: defaultConfig.underLineColor,
					}" />
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		name: 'rk-tabs',
		props: {
			tabData: {
				type: Array,
				default: () => []
			},
			activeIndex: {
				type: Number,
				default: 0
			},
			config: {
				type: Object,
				default: () => {
					return {}
				}
			},
		},
		data() {
			return {
				tabList: [],
				tagIndex: 0,
				slider: {
					left: 0,
					width: 0,
					scrollLeft: 0
				},
				scorll: {},
				defaultConfig: {
					// 要显示的key
					key: 'name',
					// 字体大小 rpx
					fontSize: 30,
					// 字体颜色
					color: '#969696',
					// 激活字体颜色
					activeColor: '#323232',
					// item宽度 0为自动
					itemWidth: 0,
					//rk_add 靠左:true 居中：false
					alignLeft:true,
					// 下划线左右边距，文字宽度加边距 rpx
					underLinePadding: -10,
					// 下划线宽度 rpx  注意：设置了此值 underLinePadding 失效
					underLineWidth: 0,
					// 下划线高度 rpx
					underLineHeight: 4,
					// 下划线颜色
					underLineColor: '#e54d42',
				},
			};
		},
		watch: {
			tabData(value) {
				this.updateData();
				setTimeout(() => {
					this.updateTabWidth();
				}, 0);
			},
			config(value) {
				this.updateConfig();
			},
		},
		mounted() {
			this.updateConfig();
			this.updateData();
			this.tagIndex = this.activeIndex;

			this.$nextTick(() => {
				this.calcScrollPosition();
			})
		},
		methods: {
			updateData() {
				let data = [];
				if (typeof(this.tabData[0]) == 'string') {
					this.tabData.forEach((item, index) => {
						data.push({
							name: item,
						})
					});
					this.defaultConfig.key = 'name';
				} else {
					data = JSON.parse(JSON.stringify(this.tabData));
				}

				this.tabList = data;
			},
			updateConfig() {
				this.defaultConfig = Object.assign(this.defaultConfig, this.config);
			},
			calcScrollPosition() {

				const query = uni.createSelectorQuery().in(this);

				query.select('#_scroll').boundingClientRect((res) => {
					this.scorll = res;
					this.updateTabWidth();
				}).exec();
			},
			updateTabWidth(index = 0) {
				let data = this.tabList;

				if (data.length == 0) return false;

				const query = uni.createSelectorQuery().in(this);

				query.select('#_tab_' + index).boundingClientRect((res) => {

					data[index]._slider = {
						width: res.width,
						left: res.left,
						scrollLeft: res.left - (data[index - 1] ? data[index - 1]._slider.width : 0),
					};

					if (this.tagIndex == index) {
						this.tabToIndex(this.tagIndex);
					}

					index++;
					if (data.length > index) {
						this.updateTabWidth(index);
					}
				}).exec();
			},

			tabToIndex(index) {

				let _slider = this.tabList[index]._slider;

				let width = uni.upx2px(this.defaultConfig.underLineWidth);

				if (!width) {
					if (this.defaultConfig.itemWidth) {
						width = uni.upx2px(this.defaultConfig.itemWidth);
					} else {
						width = this.tabList[index][this.defaultConfig.key].length * uni.upx2px(this.defaultConfig
							.fontSize);
					}
					width += uni.upx2px(this.defaultConfig.underLinePadding) * 2;
				}

				let scorll_left = this.scorll.left || 0;

				this.slider = {
					left: _slider.left - scorll_left + (_slider.width - width) / 2,
					width: width,
					scrollLeft: _slider.scrollLeft - scorll_left,
				}
			},

			tabClick(index,item) {
				this.tagIndex = index;
				this.tabToIndex(index);
				
				this.$emit('tabClick', index,item);
			}
		}
	}
</script>

<style lang="scss" scoped>
	scroll-view ::-webkit-scrollbar {
		width: 0;
		height: 0;
		background-color: transparent;
	}
	._tab-box {
		width: 100%;
		display: flex;
		font-size: 26rpx;
		position: relative;
		height: 70rpx;
		line-height: 70rpx;
		z-index: 10;

		.scroll-view-h {
			white-space: nowrap;
			width: 100%;
			height: 100%;
			box-sizing: border-box;

			._scroll-content {
				width: 100%;
				height: 100%;
				position: relative;

				._tab-item-box {
					height: 100%;

					&._flex {
						display: flex;

						._item {
							flex: 1;
						}
					}

					&._clamp {
						._item {
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
						}
					}


					._item {
						height: 100%;
						display: inline-block;
						text-align: center;
						padding: 0 20rpx;
						position: relative;
						text-align: center;

						color: #969696;

						&._active {
							color: #e54d42;
							font-weight: bold;
						}
					}
				}

				._underline {
					height: 4rpx;
					background-color: #e54d42;
					border-radius: 6rpx;
					transition: .5s;
					position: absolute;
					bottom: 0;
				}
			}
		}
	}
</style>
