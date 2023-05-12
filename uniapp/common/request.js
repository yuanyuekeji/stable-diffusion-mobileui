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
	HTTP_REQUEST_URL,
	HTTP_CONFIG_URL,
	HEADER,
	TOKENNAME
} from '@/config/app';
import utils from "@/common/utils";
import store from '../store';
import { urlToHttpOptions } from 'url';


function toLogin() {
	store.commit("LOGOUT");
	uni.showToast({
		title: '请登录',
		icon: 'none',
		duration: 1000
	});
}

/**
 * 发送请求
 */
function baseRequest(url, method, data, {
	noAuth = true,
	noVerify = false,
	noAlert = false,
	isCustomUrl = false,
}) {
	let Url = '',
		header = HEADER;
	
	// 请求地址处理
	if(isCustomUrl){
		Url = url;
		header = null;
	}else{
		Url = HTTP_REQUEST_URL + url;
	}
	if (!noAuth) {
		//登录过期自动登录
		if (!store.state.app.token) {
			toLogin();
			return Promise.reject({
				msg: '未登录'
			});
		}
	}

	if (store.state.app.token) {
		header[TOKENNAME] = store.state.app.token;
	}
	if (store.state.app.uid) {
		if (data) {
			data.user_id = store.state.app.uid;
		} else {
			data = {
				user_id: store.state.app.uid
			};
		}
	}
	
	return new Promise((reslove, reject) => {
		uni.request({
			url: Url,
			method: method || 'GET',
			header: header,
			data: data || {},
			success: (res) => {
				// console.log("rk===>[requst-suc-url]",Url,res);
				let statusCode = res.statusCode;
				if(statusCode == 200){
					reslove(res.data);
				}else{
					let showErr = '请求失败'+statusCode;
					if (!noAlert) {
						utils.showToast(showErr);
					}
					reject(showErr);
				}
			},
			fail: (message) => {
				console.log('rk===>[requst-fail-url]', Url);
				console.log("rk===>[requst-fail-msg]" + JSON.stringify(message));
				let showErr = '请求失败';
				if (!noAlert) {
					utils.showToast(showErr);
				}
				reject(showErr);
			}
		})
	});
}

const request = {};

['options', 'get', 'post', 'put', 'head', 'delete', 'trace', 'connect'].forEach((method) => {
	request[method] = (api, data, opt) => baseRequest(api, method, data, opt || {})
});

export default request;
