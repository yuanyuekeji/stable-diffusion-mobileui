import request from "@/common/request.js";
import {
	HTTP_CONFIG_URL,
	HTTP_TRANSLATE_URL,
} from '@/config/app';
/**
 * 公共配置
 */
export function getConfig(data) {
	return request.get( HTTP_CONFIG_URL + '/data.json', data, {
		isCustomUrl: true
	});
}

/**
 * 翻译
 */
export function getTranslate(data) {
	return request.get( HTTP_TRANSLATE_URL + '/translate', data, {
		isCustomUrl: true
	});
}

/**
 * 全局信息
 */
export function getCmdFlags(data){
	return request.get('/sdapi/v1/cmd-flags',data);
}

/**
 * 获取模型
 */
export function getSdModels(data){
	return request.get('/sdapi/v1/sd-models',data);
}
/**
 * 获取模板
 */
export function getSdLoRA(data){
	return request.get('/file=extensions/a1111-sd-webui-tagcomplete/tags/temp/lora.txt',data);
}
/**
 * 获取采样方法
 */
export function getSdSamplers(data){
	return request.get('/sdapi/v1/samplers',data);
}
/**
 * 文生图
 */
export function postTxt2img(data){
	return request.post('/sdapi/v1/txt2img',data);
}
/**
 * 图生文
 */
export function postPreprocess(data){
	return request.post('/sdapi/v1/preprocess',data);
}
/**
 * 解析文本结果
 */
export function getAnalysRes(fileDir,name){
	return request.get(`/file=${fileDir}/${name}.txt`);
}