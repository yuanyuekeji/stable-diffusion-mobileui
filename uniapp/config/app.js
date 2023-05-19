// +—————————————————————————————————————————————————————————————————————
// | Created by 元岳科技
// +—————————————————————————————————————————————————————————————————————
// | Copyright (c) 2013~2023 http://www.yuanyuekj.com/ All rights reserved.
// +—————————————————————————————————————————————————————————————————————
// | GITEE: https://gitee.com/yuanyuekeji/stable-diffusion-mobileui
// +—————————————————————————————————————————————————————————————————————
// | GITHUB: https://github.com/yuanyuekeji/stable-diffusion-mobileui
// +—————————————————————————————————————————————————————————————————————

// SD站点域名
let http_api_sd = 'http://127.0.0.1:7860'
// MJ站点域名
let http_api_mj = '参考README文档：2.3 配置midjourney'


http_api_sd = 'https://sd.nps.gt520.com'
http_api_mj = 'https://sduiapi.gt520.com'


module.exports = {
	// 请求域名 格式： https://您的域名
	HTTP_URL_SD: http_api_sd,
	HTTP_URL_MJ: http_api_mj,
	HEADER: {
		'content-type': 'application/json',
		//#ifdef H5
		'Form-type': navigator.userAgent.toLowerCase().indexOf("micromessenger") !== -1 ? 'wechat' : 'h5',
		//#endif
		//#ifdef MP
		'Form-type': 'routine',
		//#endif
		//#ifdef APP-PLUS
		'Form-type': 'app',
		//#endif
	},
	// 回话密钥名称 请勿修改此配置
	TOKENNAME: 'token',
};
