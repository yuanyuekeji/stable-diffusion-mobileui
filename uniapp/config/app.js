
// 站点域名
let httpApi = 'http://sd.nps.gt520.com'
httpApi = 'http://127.0.0.1:7860'

// H5域名==>[打包发布时将httpApi置空,运行时保留真实地址]
// #ifdef H5
// httpApi = ''
// #endif

module.exports = {
	// 请求域名 格式： https://您的域名
	// #ifdef MP || APP-PLUS
	HTTP_REQUEST_URL: httpApi,
	// #endif
	// #ifdef H5
	//H5接口是浏览器地址
	HTTP_REQUEST_URL: httpApi || window.location.protocol + "//" + window.location.host,
	// #endif
	// 公共配置地址
	HTTP_CONFIG_URL:"https://sduiapi.leafrainy.cc",
	// 翻译地址
	HTTP_TRANSLATE_URL:"https://fanyi.leafrainy.cc",
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
