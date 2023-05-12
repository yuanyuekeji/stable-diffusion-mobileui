import route from "./route";
import store from "../store/index.js"
import pagesJson from '@/pages.json'

// app初次启动是否跳转登陆
const isAllLogin = false;

// 登录页地址
// const loginPage = "/pages/test/test1";
const loginPage = "/pages/login/login";

// 配置白名单列表
const whiteList = [loginPage,"/pages/login/register"];


const handleOverwirteRoute = () => {
	// 重写switchTab、navigateBack
	const methodToPatch = ["switchTab", "navigateBack"];
	methodToPatch.map((type) => {
		// 通过遍历的方式分别取出，uni.switchTab、uni.navigateBack
		// 并且对相应的方法做重写
		const original = uni[type];
		uni[type] = function(options = {}) {
			const {
				url: path
			} = options;
			console.log("rk===>[分割线1]");
			console.log("rk===>[监听到类型]",type);
			console.log("rk===>[监听到1]" + path + "[ops]" + JSON.stringify(options));
			
			// 返回，并且token不存
			let pages = getCurrentPages();
			// console.log("rk===>[长度]" + JSON.stringify(pages.length));
			// console.log(pages[pages.length-1].route);
			let cur_path = '';
			if(pages.length>0){
				cur_path = pages[pages.length-1].route;
			}
			if(type == 'navigateBack' && !store.state.app.token && !cur_path.includes('register')){
				const page = pagesJson.pages[0];
				return uni.reLaunch({
					url: `/${page.path}`
				})
			}
			
			if (!whiteList.includes(path) && !store.state.app.token) {
				// 判断是否存在token，不存在重定向到登录页
				console.log("rk===>[无token]",loginPage);
				// uni.$e.go(loginPage);
				goLogin(path);
			} else {
				console.log("rk===>[有token]",store.state.app.token);
				return original.call(this, options);
			}
		};
	});
};


const install = function(Vue, options) {
	uni.$e = {
		go:route
	};
	Vue.prototype.$go = route;
	// 重写uni方法
	handleOverwirteRoute();
	// 路由拦截器
	uni.$e.routeIntercept = (routeConfig, resolve) => {
		const path = routeConfig.url.split("?")[0];
		
		console.log("rk===>[分割线2]");
		console.log("rk===>[监听到2]" + path);
		
		console.log("rk===>[333]",store.state.app.token);
		if (!whiteList.includes(path) && !store.state.app.token) {
			// uni.$e.go(loginPage,{direct:'/abcbbcb'});
			goLogin(path);
			return;
		}
		resolve(true);
	};
};

const appLaunch = function(){
	if(!store.state.app.token && isAllLogin){
		goLogin();
	}
}

function goLogin(oldPath){
	if(oldPath){
		uni.$e.go(loginPage,{directUrl:oldPath});
	}else {
		uni.$e.go(loginPage);
	}
}

export default {
	install,
	appLaunch
};
