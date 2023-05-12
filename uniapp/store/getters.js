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