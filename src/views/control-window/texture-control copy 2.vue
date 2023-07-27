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
  // 设置渲染器尺寸
  mixerContext.rendererCss.setSize(window.innerWidth, window.innerHeight)
  
  // handle window resize for mixerContext
	window.addEventListener('resize', function(){
		mixerContext.rendererCss.setSize( window.innerWidth, window.innerHeight )
	}, false)

  // mixerContext configuration and dom attachement

  // set up rendererCss
  var rendererCss = mixerContext.rendererCss
  // set up rendererWebgl
  var rendererWebgl = mixerContext.rendererWebgl

  var css3dElement		= rendererCss.domElement
	css3dElement.style.position	= 'absolute'
	css3dElement.style.top		= '0px'
	css3dElement.style.width	= '100vw'
	css3dElement.style.height	= '100vh'
  const container = document.getElementById('container') as HTMLDivElement;
  container.appendChild(css3dElement);

  threejsModule.controls.domElement = css3dElement;
  threejsModule.controls.update();

  var webglCanvas = rendererWebgl.domElement
	webglCanvas.style.position	= 'absolute'
	webglCanvas.style.top		= '0px'
	webglCanvas.style.width		= '100vw'
	webglCanvas.style.height	= '100vh'
	webglCanvas.style.pointerEvents	= 'none'
	css3dElement.appendChild( webglCanvas )

  // create the iframe element
	var url		= 'http://threejs.org/';
	var domElement	= document.createElement('iframe')
	domElement.src	= url
	domElement.style.border	= 'none'
	// 解决追加到其他容器时出现左边距空白
	domElement.style.left	= '0'

	// create the plane
	var mixerPlane	= new THREEx.HtmlMixer.Plane(mixerContext, domElement)
	// mixerPlane.object3d.scale.multiplyScalar(4)
  // mixerPlane.object3d.translateX(-10)
  // new THREE.Mesh().translateX
	threejsModule.scene.add(mixerPlane.object3d)

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
