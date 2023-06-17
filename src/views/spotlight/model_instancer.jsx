import * as THREE from 'three';
window.THREE = THREE;
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'; // gltf加载器
// import axios from 'axios';

/**
 * GLTF加载器的全局处理程序
 *
 * @constant loader
 */
const loader = new GLTFLoader();

/**
 * @class
 * @classdesc 单例3D模型实例。处理3D模型预加载和实例化。
 */
class ModelInstancer {

  constructor() {
    if (!instance) { // 确保singlelessness
      this._ready = false; // 在启动时将readystate设置为false
      this._models = {}; // 准备模型容器对象
      this._path = '';
    }
    instance = this;
  }

  /**
   * @property {Object} models 实例模型列表
   */
  get models() {
    return this._models;
  }

  /**
   * 初始化模型实例
   * 使用提供的json格式的模型列表路径加载模型列表
   *
   * @public
   * @async
   * @param {String} path json格式的模型列表的路径
   */
  async init(path) {
    if (!this._ready) {
      this._path = path;
      // let modelList = await this.loadModelList();
      this._models = await this.parseList('/visualizer/models/scenography/moving_head_lowpoly.glb');
      this._ready = true;
    }
  }

  /**
   * 从静态资产中获取模型列表
   *
   * @public
   * @async
   * @returns {Object} 模型列表
   */
  async loadModelList() {
  //   try {
  //     let res = await axios.get(this._path);
  //     return res.data;
  //   } catch (e) {
  //     throw new Error(`在 ${this._path}中无法找到模型列表`, e);
  //   }
  }

  /**
   * 递归地解析和加载模型实例
   *
   * @public
   * @async
   * @param {Object} data to be parsed
   * @param {String} url 当前静态资产路径位置的递归方法
   * @returns {Object} 3D models instances list
   */
  async parseList(url = '') {
    // for (let i = 0; i < Object.keys(listData).length; i++) {
    //   let model = Object.keys(listData)[i];
    //   if (typeof listData[model] === 'object') {
    //     url += `/${model}`;
    //     listData[model] = await this.parseList(listData[model], url);
    //   } else if (typeof listData[model] === 'string') {
    //     url += `/${listData[model]}`;
    //     let gltf = await loader.loadAsync(`${url}`);
    //     listData[model] = gltf.scene.children[0];
    //   } else {
    //     throw new Error({
    //       msg: 'model_list.json中的语法错误',
    //     });
    //   }
    // }
    let gltf = await loader.loadAsync(`${url}`);
    return gltf.scene.children[0];
  }

}

var instance = new ModelInstancer();
export default instance;
