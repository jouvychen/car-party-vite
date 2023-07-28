<template>
  <!-- 控制贴图面板 -->
  <floatWindow :float-window="floatWindow1" class="texture-control">
    <template #content>
      <canvas id="fabric-canvas" width="1024" height="1024"></canvas>
    </template>
  </floatWindow>
</template>
<script setup lang="ts" name="textureControl">
import EventsBus from "@/utils/eventBus";
import floatWindow from "../float-window/index.vue";
import * as THREE from "three";
// import { THREEx } from '@/assets/libs/threex.htmlmixer.js';
import { THREEx } from '@/assets/libs/htmlmixer';
import type { Revolver } from "../revolver/typeStatement";
import { getWorldPositionByName } from '@/utils/threejsUtils';

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

/**
 * Configurator init function
 */

function init() {
  inited.value = true;

  // create THREEx.HtmlMixer

  mixerContext = new THREEx.HtmlMixer.Context(threejsModule.renderer, threejsModule.scene, threejsModule.camera)
  // 设置渲染器尺寸
  mixerContext.rendererCss.setSize(window.innerWidth, window.innerHeight)

  // handle window resize for mixerContext
  window.addEventListener('resize', function () {
    mixerContext.rendererCss.setSize(window.innerWidth, window.innerHeight)
  }, false)

  // mixerContext configuration and dom attachement

  // set up rendererCss
  var rendererCss = mixerContext.rendererCss
  // set up rendererWebgl
  var rendererWebgl = mixerContext.rendererWebgl

  var css3dElement = rendererCss.domElement
  css3dElement.style.position = 'absolute'
  css3dElement.style.top = '0px'
  css3dElement.style.width = '100vw'
  css3dElement.style.height = '100vh'
  // css3dElement.style.background = 'none'
  const container = document.getElementById('container') as HTMLDivElement;
  container.appendChild(css3dElement);

  threejsModule.controls.domElement = css3dElement;
  threejsModule.controls.update();

  var webglCanvas = rendererWebgl.domElement
  webglCanvas.style.position = 'absolute'
  webglCanvas.style.top = '0px'
  webglCanvas.style.width = '100vw'
  webglCanvas.style.height = '100vh'
  webglCanvas.style.pointerEvents = 'none'
  // webglCanvas.style.background = 'none'
  css3dElement.appendChild(webglCanvas)

  // create the iframe element
  // var url		= 'http://threejs.org/';
  var url = 'http://127.0.0.1:5173/#/svg-button';

  var domElement = document.createElement('iframe')
  domElement.src = url
  domElement.style.border = 'none'
  // 解决追加到其他容器时出现左边距空白
  domElement.style.left = '0'
  webglCanvas.style.background = '#ff000000'


  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(10, 6), new THREE.MeshBasicMaterial({
    opacity: 0,
    color: new THREE.Color('black'),
    blending: THREE.NoBlending,
    side: THREE.DoubleSide,
    transparent: true
  }))
  const plane = {
    elementW: 1920, // 需和定义的dom大小一样
    planeW: 10,
    planeH: 8,
    object3d: mesh,
  }
  mesh.rotation.y = 30;
  // create the plane
  var mixerPlane = new THREEx.HtmlMixer.Plane(mixerContext, domElement)
  // mixerPlane.object3d.scale.set(0.14, 0.24, 0.1)
  // const p = getWorldPositionByName('控制页面挂点');
  const p = getWorldPositionByName('音乐挂点');
  // mixerPlane.object3d.position.set(p.x, p.y - 0.6, p.z);
  
  mixerPlane.object3d.rotateY(-Math.PI * 0.5)
  // mixerPlane.object3d.translateX(-10)
  // new THREE.Mesh().translateX
  boothModel.boothModel.getObjectByName('音乐挂点')?.attach(mixerPlane.object3d);
  // boothModel.boothModel.getObjectByName('音乐挂点')?.rotateX(Math.PI * 0.1)


  // threejsModule.scene.add(mixerPlane.object3d)

}

requestAnimationFrame(function animate(nowMsec) {
  // keep looping
  requestAnimationFrame(animate);
  mixerContext?.update()
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
