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

const boothModel = useBoothModelStore();
const carModule = useCarModelStore();
const threejsModule = useThreejsModuleStore();
const windowControlModule = useWindowControlStore();
const inited = ref(false);

/**
 * Configurator init function
 */

function init() {
  inited.value = true;

  /**
   * Fabricjs
   * @type {fabric}
   */

  var canvas = new fabric.Canvas("fabric-canvas");
  canvas.backgroundColor = "#ffffff";

  var rectangle = new fabric.Rect({
    top: 0,
    left: 0,
    fill: '#ffffff',
    width: 50,
    height: 50,
    transparentCorners: false,
    centeredScaling: false, // ?
    borderColor: 'white',
    cornerColor: 'white',
    corcerStrokeColor: 'white'
  });

  canvas.add(rectangle);

  const text = new fabric.IText('Three.js\n+\nFaBric.js', {
    fontSize: 40,
    textAlign: 'center',
    fontWeight: 'bold',
    left: 128,
    top: 128,
    angle: 30,
    originX: 'center',
    originY: 'center',
    shadow: 'blue -5px 6px 5px',
    styles: {
      0: {
        0: {
          fontSize: 60,
          fontFamily: 'Impact',
          fontWeight: 'normal',
          fill: 'orange'
        }
      },
      1: {
        0: {
          fill: "blue"
        }
      },
      2: {
        0: {
          textBackgroundColor: 'red'
        },
        2: {
          fill: 'fuchsia',
          stroke: 'orange',
          strokeWidth: 1
        }
      }
    }
  });
  text.setSelectionStyles({
    fontStyle: 'italic',
    fill: '',
    stroke: 'red',
    strokeWidth: 2
  }, 1, 5);
  canvas.add(text);
  canvas.setActiveObject(text);

  /**
   * Texture and material
   */

  const canvasTexture = new THREE.Texture(document.getElementById("fabric-canvas") as HTMLCanvasElement);
  canvasTexture.wrapS = THREE.RepeatWrapping;
  canvasTexture.wrapT = THREE.RepeatWrapping;
  canvasTexture.repeat.set(2, 2);
  // canvasTexture.anisotropy = threejsModule.renderer.capabilities.getMaxAnisotropy();
  windowControlModule.textureWindow.texture = canvasTexture;

  const material = new THREE.MeshBasicMaterial({ map: windowControlModule.textureWindow.texture });

  const mesh = boothModel.boothModel?.getObjectByName('作者面板') as THREE.Mesh;
  mesh.material instanceof THREE.Material && (mesh.material.transparent = true) && (mesh.material.opacity = 0); // 如果需要透明效果

  const newMesh = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), material);
  newMesh.rotateY(Math.PI * 0.5);
  newMesh.material = material;
  newMesh.material.side = THREE.DoubleSide;
  mesh.add(newMesh);

  // canvas.on("after:render", function () {
  //   mesh.material instanceof THREE.Material && (mesh.material.needsUpdate = true);
  // });

}

EventsBus.on("onBusRevolver", (value) => {
  const revolver = value as Revolver;
  if (!inited.value && revolver.uuid === props.floatWindow.uuid) {
    // init();
    // message.success('初始化')
  }
});

</script>

<style scoped lang="less">
.texture-control {}
</style>
