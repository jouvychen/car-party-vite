<template>
  <!-- 控制贴图面板 -->
  <floatWindow :float-window="floatWindow1" class="texture-control">
    <template #content>
      <canvas id="fabric-canvas" width="300" height="300"></canvas>
    </template>
  </floatWindow>
</template>
<script setup lang="ts" name="colorControl">
import * as THREE from "three";
// import { Canvas, Rect } from 'fabric'; // browser
import * as fabric from 'fabric';

import {
  useBoothModelStore,
  useCarModelStore,
  useThreejsModuleStore,
} from "@/store";

const threejsModule = useThreejsModuleStore();

/**
 * Fabricjs
 * @type {fabric}
 */

var canvas = new fabric.Canvas("canvas");
canvas.backgroundColor = "#FFBE9F";

var rectangle = new fabric.Rect({
  top: 100,
  left: 100,
  fill: '#FF6E27',
  width: 100,
  height: 100,
  transparentCorners: false,
  centeredScaling: false, // ?
  borderColor: 'black',
  cornerColor: 'black',
  corcerStrokeColor: 'black'
});

canvas.add(rectangle);


/**
 * Threejs
 */

var containerHeight = "512";
var containerWidth = "512";
var container, texture, material, geometry;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var onClickPosition = new THREE.Vector2();

init();
animate();


/**
 * Configurator init function
 */

function init() {
  /**
   * Texture and material
   */

  texture = new THREE.Texture(document.getElementById("fabric-canvas"));
  texture.anisotropy = threejsModule.renderer.capabilities.getMaxAnisotropy();

  material = new THREE.MeshBasicMaterial({ map: texture });

}


/**
 * Configurator frame render function
 */

function animate() {
  requestAnimationFrame(animate);

  texture.needsUpdate = true;

  renderer.render(threejsModule.scene, threejsModule.camera);
}

</script>

<style scoped lang="less">
.texture-control {}
</style>
