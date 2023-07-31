<template>
  <!-- 控制贴图面板 -->
  <floatWindow :float-window="floatWindow1" class="texture-control">
    <template #content>
      <canvas id="fabric-canvas" width="1024" height="1024"></canvas>
    </template>
  </floatWindow>
</template>
<script setup lang="ts" name="textureControl">
// https://codepen.io/jouvychen/pen/zYMMyKp
import EventsBus from "@/utils/eventBus";
import floatWindow from "../float-window/index.vue";
import * as THREE from "three";
// import { THREEx } from '@/assets/libs/threex.htmlmixer.js';
import { THREEx } from '@/assets/libs/htmlmixer';
import type { Revolver } from "../revolver/typeStatement";
import { getWorldPositionByName } from '@/utils/threejsUtils';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

const props = defineProps({
  floatWindow: {
    type: Object as PropType<Revolver>, // 断言、props类型自定义约束
    default: () => { },
  },
});

const floatWindow1 = props.floatWindow;

import {
  useCarModelStore,
  useBoothModelStore,
  useWindowControlStore,
  useThreejsModuleStore,
} from "@/store";
import { getImageUrl } from "@/utils/common";

const boothModel = useBoothModelStore();
const carModule = useCarModelStore();
const threejsModule = useThreejsModuleStore();
const windowControlModule = useWindowControlStore();
const inited = ref(false);

var onRenderFcts: any[] = [];
var mixerPlane: THREEx.HtmlMixer.Plane;
var mixerContext: THREEx.HtmlMixer.Context;
let labelRenderer: CSS3DRenderer;
/**
 * Configurator init function
 */

function init() {
  inited.value = true;

  labelRenderer = new CSS3DRenderer();
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
  labelRenderer.domElement.style.position = "absolute";
  labelRenderer.domElement.style.top = '0';
  // labelRenderer.domElement.style.width = '100vw'
  // labelRenderer.domElement.style.height = '100vh'
  const container = document.getElementById("container") as HTMLDivElement;
  container.appendChild(labelRenderer.domElement);

  var css3dElement = labelRenderer.domElement
  threejsModule.controls.domElement = css3dElement;
  threejsModule.controls.update();

  // create the iframe element
  // var url		= 'http://threejs.org/';
  // var url = 'http://127.0.0.1:5173/#/svg-button';

  // var domElement = document.createElement('iframe')
  // domElement.src = url
  // domElement.style.border = 'none'
  // // 解决追加到其他容器时出现左边距空白
  // domElement.style.left = '0'

  // let domEle = document.createElement("div");
  // domEle.innerHTML = "<div class='domBox'><iframe src='https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene'></iframe></div>"
  var url = 'http://threejs.org/';

  var domEle = document.createElement('iframe')
  domEle.src = url
  domEle.style.width = '1366px'
  domEle.style.height = '619px'
  domEle.style.border = 'none'
  // 解决追加到其他容器时出现左边距空白
  domEle.style.left = '0'
  /**
   * 将创建的Dom元素用过CSS3DObject包装成3D对象
   * @type {CSS3DObject}
   */
  let domEleObj = new CSS3DObject(domEle);
  domEleObj.position.set(5, 5, -5);
  domEleObj.scale.multiplyScalar(0.001)
  domEleObj.rotateY(-Math.PI * 0.5)
  threejsModule.scene.add(domEleObj);

  // 第2个挂点
  var url2 = 'http://127.0.0.1:5173/#/author-introduction';
  var domEle2 = document.createElement('iframe')
  domEle2.id = 'iframe2'
  domEle2.src = url2
  domEle2.style.width = '1366px'
  domEle2.style.height = '700px'
  domEle2.style.border = 'none'
  // domEle2.style.backgroundColor = 'transparent'; // 设置背景透明
  // 解决追加到其他容器时出现左边距空白
  domEle2.style.left = '0'
  let domEleObj2 = new CSS3DObject(domEle2);
  const p2 = getWorldPositionByName('作者面板');
  domEleObj2.position.set(p2.x, p2.y, p2.z);
  domEleObj2.scale.multiplyScalar(0.0026)
  domEleObj2.rotateY(-Math.PI * 0.5)
  threejsModule.scene.add(domEleObj2);

  // const p = getWorldPositionByName('音乐挂点');
  // mixerPlane.object3d.position.set(p.x, p.y - 0.6, p.z);

  // mixerPlane.object3d.rotateY(-Math.PI * 0.5)
  // mixerPlane.object3d.translateX(-10)
  // new THREE.Mesh().translateX
  // boothModel.boothModel.getObjectByName('音乐挂点')?.attach(mixerPlane.object3d);
  // boothModel.boothModel.getObjectByName('音乐挂点')?.rotateX(Math.PI * 0.1)


  // threejsModule.scene.add(mixerPlane.object3d)

}

requestAnimationFrame(function animate(nowMsec) {
  // keep looping
  requestAnimationFrame(animate);
  // mixerContext?.update()
  labelRenderer?.render(threejsModule.scene, threejsModule.camera);
})

EventsBus.on("onBusRevolver", (value) => {
  const revolver = value as Revolver;
  if (!inited.value && revolver.uuid === props.floatWindow.uuid) {
    init();
    // message.success('初始化')
  }
});

</script>

<style scoped lang="less">
.texture-control {}
</style>