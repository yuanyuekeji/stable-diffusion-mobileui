

const state = {
	token: uni.getStorageSync("yuanyue_token") || null,
	userInfo: uni.getStorageSync("yuanyue_user_info") || null,
	uid: uni.getStorageSync("yuanyue_uid") || null,
	appConfig: uni.getStorageSync("yuanyue_app_config_dict") || null,
	appCommon: uni.getStorageSync("yuanyue_app_common_dict") || null,
};

const mutations = {
	LOGIN(state, opt) {
		if(opt.token){
			state.token = opt.token;
			uni.setStorageSync("yuanyue_token",opt.token);
		}
		if(opt.id){
			state.uid = opt.id;
			uni.setStorageSync("yuanyue_uid",opt.id);
		}
		if(opt.token && opt.id && opt.nickname){
			state.userInfo = opt;
			uni.setStorageSync("yuanyue_user_info",opt);
		}
	},
	SETUID(state,val){
		state.uid = val;
		uni.setStorageSync("yuanyue_uid",val);
	},
	LOGOUT(state) {
		state.token = null;
		state.uid = null
		uni.removeStorageSync("yuanyue_token")
		uni.removeStorageSync("yuanyue_uid")
		uni.removeStorageSync("yuanyue_user_info")
		console.log("rk===>[清理完毕]");
	},
	SETUSERINFO(state, userInfo) {
		state.userInfo = userInfo;
		uni.setStorageSync("yuanyue_user_info",userInfo);
	},
	SETAPPCONFIG(state,appDict){
		// console.log("rk===>[获取到原始]" + JSON.stringify(appDict));
		// delete appDict.style
		
		// console.log("rk===>[获取到新的]" + JSON.stringify(appDict));
		state.appConfig = appDict;
		uni.setStorageSync("yuanyue_app_config_dict",appDict);
	},
	SETAPPCOMMON(state,appDict){
		// console.log("rk===>[获取到原始]" + JSON.stringify(appDict));
		// delete appDict.style
		
		// console.log("rk===>[获取到新的]" + JSON.stringify(appDict));
		state.appCommon = appDict;
		uni.setStorageSync("yuanyue_app_common_dict",appDict);
	}
	
};

const actions = {
	USERINFO({
		state,
		commit
	}, force) {
		if (state.userInfo !== null && !force)
			return Promise.resolve(state.userInfo);
		else
			return new Promise(reslove => {
				// getUserInfo().then(res => {
				// 	commit("UPDATE_USERINFO", res.data);
				// 	Cache.set(USER_INFO, res.data);
				// 	reslove(res.data);
				// }); 
			}).catch(() => {

			});
	}
};

export default {
	state,
	mutations,
	actions
};
