// +—————————————————————————————————————————————————————————————————————
// | Created by 元岳科技
// +—————————————————————————————————————————————————————————————————————
// | Copyright (c) 2013~2023 http://www.yuanyuekj.com/ All rights reserved.
// +—————————————————————————————————————————————————————————————————————
// | GITEE: https://gitee.com/yuanyuekeji/stable-diffusion-mobileui
// +—————————————————————————————————————————————————————————————————————
// | GITHUB: https://github.com/yuanyuekeji/stable-diffusion-mobileui
// +—————————————————————————————————————————————————————————————————————
export default {
	token: state => state.app.token,
	isLogin: state => !!state.app.token,
	userInfo: state => state.app.userInfo || {},
	uid: state => state.app.uid,
	appConfig: state => state.app.appConfig || {},
	notice: state => state.app.appConfig?.notice || [],
	lora_dir: state => state.app.appCommon?.lora_dir || '',
	data_dir: state => state.app.appCommon?.data_dir.replace(/\\/g,'/') || '',
};