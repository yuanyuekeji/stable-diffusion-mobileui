// +—————————————————————————————————————————————————————————————————————
// | Created by 元岳科技
// +—————————————————————————————————————————————————————————————————————
// | Copyright (c) 2013~2023 http://www.yuanyuekj.com/ All rights reserved.
// +—————————————————————————————————————————————————————————————————————
// | GITEE: https://gitee.com/yuanyuekeji/stable-diffusion-mobileui
// +—————————————————————————————————————————————————————————————————————
// | GITHUB: https://github.com/yuanyuekeji/stable-diffusion-mobileui
// +—————————————————————————————————————————————————————————————————————

import Vue from "vue";
import Vuex from "vuex";
import modules from "./modules";
import getters from "./getters";

Vue.use(Vuex);
const debug = process.env.NODE_ENV !== "production";

export default new Vuex.Store({
  modules,
  getters,
  strict: debug
});
