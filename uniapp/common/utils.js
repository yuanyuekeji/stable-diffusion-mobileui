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
	TOKENNAME,
	HTTP_REQUEST_URL
} from '@/config/app.js';
import store from "@/store/index.js"
// import {
// 	isObject
// } from '@vue/shared'
// setStorage 将数据存入缓存
function setStorage(key, val) {
	if (typeof val == 'string') {
		uni.setStorageSync(key, val);
		return val
	}
	uni.setStorageSync(key, JSON.stringify(val));
}

// getStorage 从缓存中读取数据
function getStorage(key) {
	let uu = uni.getStorageSync(key);
	try {
		if (typeof JSON.parse(uu) != 'number') {
			uu = JSON.parse(uu);
		}
	} catch (e) {}
	return uu;
}
// 删除缓存中的数据
function removeStorage(key) {
	if (key) {
		uni.removeStorageSync(key);
	}
}
// 将缓存中的数据清空
function clearStorage() {
	try {
		uni.clearStorageSync();
	} catch (e) {
		throw new Error('处理失败');
	}
}
// 显示Toast
/*
@title 最多汉字数量7个
@icon success loading none 
*/
function showToast(title, icon = 'none', obj = {}, duration = 1500) {
	if (typeof title !== 'string') {
		return
	}
	let toastData = {
		title: title,
		duration: duration,
		position: 'center',
		mask: true,
		icon: icon ? icon : 'none',
		...obj
	};
	uni.showToast(toastData);
}
/*
显示loading提示框,需要手动隐藏
*/
function showLoading(title = '正在加载...', obj = {}) {
	uni.showLoading({
		title: title,
		mask: true,
		...obj
	});
}
// 隐藏loading
function hideLoading() {
	try {
		uni.hideLoading();
	} catch (e) {
		//TODO handle the exception
		throw new Error('处理失败');
	}
}
// 模态框 
/*
确定取消按钮的文字颜色可修改
obj 对象中传入 cancelColor : rgb 即可修改取消按钮颜色
obj 对象中传入 confirmColor : rgb 即可修改确认按钮颜色
*/
function showModal(content = '这是一个模态弹窗!', obj = {
	title: '提示',
	showCancel: true,
	cancelText: '取消',
	confirmText: '确定'
}) {
	// #ifdef APP-PLUS
	// obj.cancelText = '确定';
	// obj.confirmText = '取消';
	// #endif
	return new Promise((reslove, reject) => {
		uni.showModal({
			// title: title,
			content: content,
			...obj,
			success: (res) => {
				if (res.confirm) {
					reslove()
				}
				if (res.cancel) {
					reject()
				}
			}
		});
	})
}
/*
显示操作菜单
@itemList 操作菜单数组
@itemColor 文字颜色
*/
function showSheet(itemList, itemColor = "#000000") {
	return new Promise((reslove, reject) => {
		uni.showActionSheet({
			itemList: itemList,
			itemColor: itemColor,
			success: (res) => {
				reslove(res.tapIndex);
			},
			fail: function(res) {
				reject(res.errMsg);
			}
		});
	})
}
//将页面滚动到目标位置。
function scrollTo(ScrollTop) {
	uni.pageScrollTo({
		scrollTop: ScrollTop,
		duration: 300
	})
}

// 获取用户信息
function getUserInfo() {
	return new Promise((reslove, reject) => {
		uni.getUserInfo({
			success(res) {
				// console.log(res);
				reslove(res);
			},
			fail(rej) {
				reject(rej);
			}
		})
	})
}

// 获取用户授权信息
function authorize(scoped = 'scope.userInfo') {
	return new Promise((reslove, reject) => {
		uni.authorize({
			scope: scoped,
			success(res) {
				reslove(res);
			},
			fail(rej) {
				reject(rej);
			}
		})
	})
}

// 将对象转换成使用 & 连接的字符串
function convertObj(opt) {
	let str = '';
	let arr = [];
	Object.keys(opt).forEach(item => {
		arr.push(`${item}=${opt[item]}`);
	})
	str = arr.join('&');
	return str;
}
// 节流函数
// 节流函数
function throttle(fn, delay) {
	var lastArgs;
	var timer;
	var delay = delay || 200;
	return function(...args) {
		lastArgs = args;
		if (!timer) {
			timer = setTimeout(() => {
				timer = null;
				fn.apply(this, lastArgs);
			}, delay);
		}
	}
}

// 调起相机
function chooseImage(count) {
	return new Promise((reslove, reject) => {
		uni.chooseImage({
			count: count, //默认9
			sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], //从相册选择
			success: (res) => {
				reslove(res);
				// const tempFilePaths = res.tempFilePaths;
				// let tempPathList = [];
				// for (let i = 0; i < tempFilePaths.length; i++) {
				// 	const path = tempFilePaths[i];
				// 	const src = await compressImageHandler(path)
				// 	tempPathList.push(src);
				// }
				// reslove(tempPathList);
			},
			fail: (rej) => {
				reject(rej);
			}
		});
	})
}

// function compressImageHandler(src) {
// 	// console.log('platform===' + device.platform)
// 	const tempPath = compressImage(src, device.platform);
// 	// console.log('tempPath-----' + tempPath);
// 	return tempPath
// }
//序列化对象和数组
function serialize(data) {
	if (data != null && data != '') {
		try {
			return JSON.parse(JSON.stringify(data));
		} catch (e) {
			if (data instanceof Array) {
				return [];
			}
			return {};
		}
	}
	return data;
}
Date.prototype.format = function(fmt) {
	let o = {
		'M+': this.getMonth() + 1, //月份
		'd+': this.getDate(), //日
		'h+': this.getHours(), //小时
		'm+': this.getMinutes(), //分
		's+': this.getSeconds(), //秒
		'q+': Math.floor((this.getMonth() + 3) / 3), //季度
		S: this.getMilliseconds() //毫秒
	};

	if (/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, String(this.getFullYear()).substr(4 - RegExp.$1.length));
	}
	for (let k in o) {
		if (new RegExp('(' + k + ')').test(fmt)) {
			fmt = fmt.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(String(o[k]).length));
		}
	}
	return fmt;
};

//格式化日期
function formatDate(nS, format) {
	//日期格式化
	if (!nS) {
		return '';
	}
	format = format || 'yyyy-MM-dd hh:mm:ss';
	return new Date(nS).format(format);
}

// 图片转base64
function pathToBase64(path) {
	return new Promise(function(resolve, reject) {
		if (typeof window === 'object' && 'document' in window) {
			if (typeof FileReader === 'function') {
				var xhr = new XMLHttpRequest()
				xhr.open('GET', path, true)
				xhr.responseType = 'blob'
				xhr.onload = function() {
					if (this.status === 200) {
						let fileReader = new FileReader()
						fileReader.onload = function(e) {
							resolve(e.target.result)
						}
						fileReader.onerror = reject
						fileReader.readAsDataURL(this.response)
					}
				}
				xhr.onerror = reject
				xhr.send()
				return
			}
			var canvas = document.createElement('canvas')
			var c2x = canvas.getContext('2d')
			var img = new Image
			img.onload = function() {
				canvas.width = img.width
				canvas.height = img.height
				c2x.drawImage(img, 0, 0)
				resolve(canvas.toDataURL())
				canvas.height = canvas.width = 0
			}
			img.onerror = reject
			img.src = path
			return
		}
		if (typeof plus === 'object') {
			plus.io.resolveLocalFileSystemURL(getLocalFilePath(path), function(entry) {
				entry.file(function(file) {
					var fileReader = new plus.io.FileReader()
					fileReader.onload = function(data) {
						resolve(data.target.result)
					}
					fileReader.onerror = function(error) {
						reject(error)
					}
					fileReader.readAsDataURL(file)
				}, function(error) {
					reject(error)
				})
			}, function(error) {
				reject(error)
			})
			return
		}
		if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
			wx.getFileSystemManager().readFile({
				filePath: path,
				encoding: 'base64',
				success: function(res) {
					resolve('data:image/png;base64,' + res.data)
				},
				fail: function(error) {
					reject(error)
				}
			})
			return
		}
		reject(new Error('not support'))
	})
}

function base64ToBlob(code) {
	// #ifdef H5
	let parts = code.split(';base64,');
	let contentType = parts[0].split(':')[1];
	let raw = window.atob(parts[1]);
	let rawLength = raw.length;
	let uInt8Array = new Uint8Array(rawLength);
	for (let i = 0; i < rawLength; ++i) {
		uInt8Array[i] = raw.charCodeAt(i);
	}
	return new Blob([uInt8Array], {
		type: contentType
	});
	// #endif
}

function base64ToPath(base64) {
	return new Promise(function(resolve, reject) {
		if (typeof window === 'object' && 'document' in window) {
			base64 = base64.split(',')
			var type = base64[0].match(/:(.*?);/)[1]
			var str = atob(base64[1])
			var n = str.length
			var array = new Uint8Array(n)
			while (n--) {
				array[n] = str.charCodeAt(n)
			}
			return resolve((window.URL || window.webkitURL).createObjectURL(new Blob([array], {
				type: type
			})))
		}
		var extName = base64.match(/data\:\S+\/(\S+);/)
		if (extName) {
			extName = extName[1]
		} else {
			reject(new Error('base64 error'))
		}
		var fileName = Date.now() + '.' + extName
		if (typeof plus === 'object') {
			var bitmap = new plus.nativeObj.Bitmap('bitmap' + Date.now())
			bitmap.loadBase64Data(base64, function() {
				var filePath = '_doc/uniapp_temp/' + fileName
				bitmap.save(filePath, {}, function() {
					bitmap.clear()
					resolve(filePath)
				}, function(error) {
					bitmap.clear()
					reject(error)
				})
			}, function(error) {
				bitmap.clear()
				reject(error)
			})
			return
		}
		if (typeof wx === 'object' && wx.canIUse('getFileSystemManager')) {
			var filePath = wx.env.USER_DATA_PATH + '/' + fileName
			wx.getFileSystemManager().writeFile({
				filePath: filePath,
				data: base64.replace(/^data:\S+\/\S+;base64,/, ''),
				encoding: 'base64',
				success: function() {
					resolve(filePath)
				},
				fail: function(error) {
					reject(error)
				}
			})
			return
		}
		reject(new Error('not support'))
	})
}



/*
@value 要拷贝的内容
*/
// export function copyText(value) {
// 	// 条件编译，以下代码仅在H5出现
// 	//#ifdef H5
// 	return new Promise((reslove, reject) => {
// 		uniCopy({
// 			content: value,
// 			success: (res) => {
// 				reslove(res);
// 			},
// 			error: (e) => {
// 				reject(res)
// 			}
// 		})
// 	})

// 	//#endif

// 	// 以下代码在除H5以外的平台出现
// 	//#ifndef H5

// 	//#endif
// }

// 获取本周的第一天
function showWeekFirstDay() {
	var date = new Date();
	var weekday = date.getDay() || 7; //获取星期几,getDay()返回值是 0（周日） 到 6（周六） 之间的一个整数。0||7为7，即weekday的值为1-7
	date.setDate(date.getDate() - weekday + 1); //往前算（weekday-1）天，年份、月份会自动变化
	return formatDate(date, 'yyyy-MM-dd');
}



// 获取本月第一天
function showMonthFirstDay() {
	var MonthFirstDay = new Date().setDate(1);
	return formatDate(new Date(MonthFirstDay).getTime(), 'yyyy-MM-dd');
}

var now = new Date(); //当前日期 
// var nowDayOfWeek = now.getDay(); //今天本周的第几天 
// var nowDay = now.getDate(); //当前日 
var nowMonth = now.getMonth(); //当前月 
var nowYear = now.getYear(); //当前年 
nowYear += (nowYear < 2000) ? 1900 : 0; //
//获得本季度的开始月份 
function getQuarterStartMonth() {
	var quarterStartMonth = 0;
	if (nowMonth < 3) {
		quarterStartMonth = 0;
	}
	if (2 < nowMonth && nowMonth < 6) {
		quarterStartMonth = 3;
	}
	if (5 < nowMonth && nowMonth < 9) {
		quarterStartMonth = 6;
	}
	if (nowMonth > 8) {
		quarterStartMonth = 9;
	}
	return quarterStartMonth;
}

//或的本季度的结束日期 
//获得本季度的开始日期 
function getQuarterStartDate() {
	var quarterStartDate = new Date(nowYear, getQuarterStartMonth(), 1);
	return formatDate(quarterStartDate, 'yyyy-MM-dd');
}
// 删除数组中重复数据
function unique(data) {
	data = data || [];
	var n = {}; //存放新的数据
	for (var i = 0; i < data.length; i++) {
		var v = JSON.stringify(data[i]);
		if (typeof(v) == "undefined") {
			n[v] = 1;
		}
	}
	data.length = 0;
	for (var i in n) {
		data[data.length] = i;
	}
	return data;
}

/*
 * 单图上传
 * @param object opt
 * @param callable successCallback 成功执行方法 data 
 * @param callable errorCallback 失败执行方法 
 */
function uploadImageOne(opt, successCallback, errorCallback) {
	let that = this;
	if (typeof opt === 'string') {
		let url = opt;
		opt = {};
		opt.url = url;
	}
	let count = opt.count || 1,
		sizeType = opt.sizeType || ['compressed'],
		sourceType = opt.sourceType || ['album', 'camera'],
		is_load = opt.is_load || true,
		uploadUrl = opt.url || '',
		inputName = opt.name || 'file';
	uni.chooseImage({
		count: count, //最多可以选择的图片总数  
		sizeType: sizeType, // 可以指定是原图还是压缩图，默认二者都有  
		sourceType: sourceType, // 可以指定来源是相册还是相机，默认二者都有  
		success: function(res) {
			//启动上传等待中...  
			uni.showLoading({
				title: '图片上传中',
			});

			// console.log("rk===>[图片信息1]" + JSON.stringify(res));
			// console.log("rk===>[图片信息1]" + JSON.stringify(res.tempFilePaths[0]));
			// console.log("rk===>[图片信息2]", store.state.app.token);
			let imgPath = res.tempFilePaths[0];

			uploadImgWithPath(uploadUrl, imgPath, successCallback, errorCallback);

		}
	})
}

function uploadImgWithPath(uploadUrl, imgPath, successCallback, errorCallback) {

	let that = this;
	let server_url = HTTP_REQUEST_URL + '/' + uploadUrl;
	let inputName = 'files';
	// let random = Math.random().toString().substr(2);
	// let contentType = "multipart/form-data;boundary="+random
	let contentType = "multipart/form-data"

	// console.log("rk===>[iamge-path]" ,  imgPath);
	// console.log("rk===>[url]" , server_url);
	// console.log("rk===>[contentType]" , contentType);
	
	uni.uploadFile({
		url: server_url,
		filePath: imgPath,
		name: inputName,
		formData: {},
		header: {
			"accept":"application/json",
			"contentype": contentType
		},
		// fileType: 'image',
		success: function(res) {
			// console.log('图片上传成功', res)
			uni.hideLoading();
			if (res.statusCode == 200) {
				let data = res.data ? JSON.parse(res.data) : {};
				// console.log("rk===>[传完了data]", res);
				// console.log("rk===>[传完了data]", data);
				if (data.length >0) {
					let back_url = data[0];
					back_url = back_url.replace(/\\/g,'/');
					// back_url = HTTP_REQUEST_URL + '/file/'+back_url;
					successCallback && successCallback(back_url)
				} else {
					showToast(data.msg);
					errorCallback && errorCallback(data);
				}
			} else {
				showToast(res.data);
			}
		},
		fail: function(res) {
			// console.log('=====errr==>',res)
			uni.hideLoading();
			showToast('上传图片失败')
		}
	})
}




/**
 * @description 获取元素节点信息（在组件中的元素必须要传ctx）
 *  在组件js首行添加： const ctx = getCurrentInstance()
 * @param  { String } selector 选择器 '.app' | '#app'
 * @param  { Boolean } all 是否多选
 * @param  { ctx } context 当前组件实例
 *  this.$utils.getRect('#list-el').then(res=>{
		console.log('rk_ui===>xxxx:' + JSON.stringify(res));
	});
 */
const getRect = (selector, all = false, context) => {
	return new Promise((resolve, reject) => {
		let qurey = uni.createSelectorQuery()
		if (context) {
			qurey = uni.createSelectorQuery().in(context)
		}
		qurey[all ? 'selectAll' : 'select'](selector)
			.boundingClientRect(function(rect) {
				if (all && Array.isArray(rect) && rect.length) {
					return resolve(rect)
				}
				if (!all && rect) {
					return resolve(rect)
				}
				reject('找不到元素')
			})
			.exec()
	})
}

/**
 * @description 是否为空
 * @param {unknown} value
 * @return {Boolean}
 */
const isEmpty = (value) => {
	return value == null && typeof value == 'undefined'
}

/**
 * @description 对象格式化为Query语法
 * @param { Object } params
 * @return {string} Query语法
 */
function objectToQuery(params) {
	let query = ''
	for (const props of Object.keys(params)) {
		const value = params[props]
		const part = encodeURIComponent(props) + '='
		if (!isEmpty(value)) {
			// console.log(encodeURIComponent(props), isObject(value))
			if (isObject(value)) {
				for (const key of Object.keys(value)) {
					if (!isEmpty(value[key])) {
						const params = props + '[' + key + ']'
						const subPart = encodeURIComponent(params) + '='
						query += subPart + encodeURIComponent(value[key]) + '&'
					}
				}
			} else {
				query += part + encodeURIComponent(value) + '&'
			}
		}
	}
	return query.slice(0, -1)
}

/**
 * @description 格式化输出价格
 * @param  { string } price 价格
 * @param  { string } take 小数点操作
 * @param  { string } prec 小数位补
 */
function formatPrice({
	price,
	take = 'all',
	prec = undefined
}) {
	let [integer, decimals = ''] = (price + '').split('.')

	// 小数位补
	if (prec !== undefined) {
		const LEN = decimals.length
		for (let i = prec - LEN; i > 0; --i) decimals += '0'
		decimals = decimals.substr(0, prec)
	}

	switch (take) {
		case 'int':
			return integer
		case 'dec':
			return decimals
		case 'all':
			return integer + '.' + decimals
	}
}

/**
 * 整数自动返回；小数保留两位
 */
function floatAutoDecimal2(x) {
	var prec = 2;

	var floatNum = parseFloat(x);
	if (isNaN(floatNum)) {
		return "";
	}
	var floatNum = Math.round(x * 100) / 100;

	var floatStr = floatNum.toString();
	var res = floatStr.indexOf('.');

	if (res > -1) {
		let [integer, decimals = ''] = (floatNum + '').split('.')
		// 小数位补
		if (prec !== undefined) {
			const LEN = decimals.length
			for (let i = prec - LEN; i > 0; --i) decimals += '0'
			decimals = decimals.substr(0, prec)
		}
		return integer + '.' + decimals;
	}
	return floatStr;
}

function gePrivateTel(tel) {
	/*
    let reg = /^(\d{3})\d{4}(\d{4})$/;
	let str = "$1****$2";
	return tel.replace(reg, str);
	*/
	let pre = 3;
	let suf = 7;
	if (String(tel).length != 11) {
		pre = 3;
		suf = String(tel).length - 2;
	}
	return tel.substring(0, pre) + "****" + tel.substr(suf);
}

 function fn_Guid(len, radix) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var uuid = [],
        i;
    radix = radix || chars.length;

    if (len) {
        // Compact form
        for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
    } else {
        // rfc4122, version 4 form
        var r;
    // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
        uuid[14] = '4';

        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16;
                uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
    }

    return uuid.join('');
}



module.exports = {
	setStorage,
	getStorage,
	removeStorage,
	clearStorage,
	showToast,
	showLoading,
	hideLoading,
	showModal,
	showSheet,
	scrollTo,
	getUserInfo,
	authorize,
	convertObj,
	throttle,
	chooseImage,
	serialize,
	formatDate,
	pathToBase64,
	base64ToPath,
	base64ToBlob,
	showWeekFirstDay,
	showMonthFirstDay,
	getQuarterStartDate,
	unique,
	uploadImageOne,
	uploadImgWithPath,
	getRect,
	isEmpty,
	// objectToQuery,
	formatPrice,
	gePrivateTel,
	floatAutoDecimal2,
	fn_Guid,
}