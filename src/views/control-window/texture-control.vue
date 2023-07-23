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
import { message } from "ant-design-vue";
import * as THREE from "three";
import * as fabric from 'fabric';
import { THREEx } from '@/assets/libs/threex.htmlmixer.js';
import type { Revolver } from "../revolver/typeStatement";

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
  // css3dElement.style.zIndex = '9999'
  css3dElement.style.width = '100%'
  css3dElement.style.height = '100%'
  document.body.appendChild(css3dElement)

  var webglCanvas = rendererWebgl.domElement
  webglCanvas.style.position = 'absolute'
  webglCanvas.style.top = '0px'
  // webglCanvas.style.zIndex = '9999'
  webglCanvas.style.width = '100%'
  webglCanvas.style.height = '100%'
  webglCanvas.style.pointerEvents = 'none'
  css3dElement.appendChild(webglCanvas)

  // create a Plane for THREEx.HtmlMixer

  var url = getImageUrl('bg_member.jpg');
  var domElement = THREEx.HtmlMixerHelpers.createImageDomElement(url)

  mixerPlane = new THREEx.HtmlMixer.Plane(mixerContext, domElement)
  threejsModule.scene.add(mixerPlane.object3d)

  // Comment
  switchValue('default')


  // handle resize

  window.addEventListener('resize', function () {
    // notify the renderer of the size change
    threejsModule.renderer.setSize(window.innerWidth, window.innerHeight)
    // update the camera
    threejsModule.camera.aspect = window.innerWidth / window.innerHeight
    threejsModule.camera.updateProjectionMatrix()
  }, false)


  // render the scene
  onRenderFcts.push(function () {
    mixerContext?.update()
  })
  onRenderFcts.push(function () {
    threejsModule.renderer.render(threejsModule.scene, threejsModule.camera);
  })

}

function switchValue(value: string) {
  threejsModule.scene.remove(mixerPlane.object3d)
  if (value === 'default') {
    var url = 'https://threejs.org/';
    var domElement = THREEx.HtmlMixerHelpers.createIframeDomElement(url)
    mixerPlane = new THREEx.HtmlMixer.Plane(mixerContext, domElement)
    // threejsModule.scene.add(mixerPlane.object3d)
    const mesh = boothModel.boothModel?.getObjectByName('作者面板') as THREE.Mesh;
    mixerPlane.object3d.rotateY(Math.PI * 0.25)
    // mixerPlane.object3d.position.set(-2, -2, -2)
    mesh.attach(mixerPlane.object3d);
  }
}


function onResize() {
  // notify the renderer of the size change
  threejsModule.renderer.setSize(window.innerWidth, window.innerHeight)
  // update the camera
  threejsModule.camera.aspect = window.innerWidth / window.innerHeight
  threejsModule.camera.updateProjectionMatrix()
}
window.addEventListener('resize', onResize, false)


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
