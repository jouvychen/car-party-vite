<template>
  <div class="car-booth">
    <div v-show="loadManager.showMask" class="loading">
      <three-js-font-svg @onSvgComplete="onSvgComplete"></three-js-font-svg>
      
      <a-progress
        v-if="svgCompleted && loadManager.schedule !== 100"
        :stroke-color="{
          from: '#108ee9',
          to: '#87d068',
        }"
        style="position: absolute"
        :trailColor="'#9e9e9e1c'"
        :strokeWidth="5"
        :percent="loadManager.schedule"
        :showInfo="false"
      />

      <!-- <span style="position: absolute">{{ loadManager.schedule }}</span> -->
      <a-button
        v-if="loadManager.schedule === 100"
        style="position: absolute"
        @click="onPlay"
        >开始探索</a-button
      >
    </div>

    <revolver :revolver-list="revolverList"></revolver>

    <template v-for="o in revolverList" :key="o.uuid">
      <!-- 颜色控制面板 -->
      <color-control
        v-if="o.name === '颜色'"
        :float-window="o"
        @on-change-color="onChangeColor"
      ></color-control>

      <!-- 材质面板 -->
      <material-control
        v-if="o.name === '材质'"
        :float-window="o"
        @on-change-material="onChangeMaterial"
      ></material-control>

      <!-- 动画控制面板 -->
      <animation-control v-if="o.name === '动画'" :float-window="o" :boothModel="boothModel" :carModel="carModel" :hdrTexture="hdrTexture">
      </animation-control>

      <!-- 性能指标面板 -->
      <floatWindow v-if="o.name === '性能'" :float-window="o">
        <template #content>
          <div class="mt6">
            <div class="class">性能指标：</div>
            <div id="stats-container"></div>
          </div>
        </template>
      </floatWindow>

      <!-- 光照控制面板 -->
      <floatWindow v-if="o.name === '光照'" :float-window="o">
        <template #content>
          <div class="mt6">
            <div class="class">GUI面板：</div>
            <div id="gui-container"></div>
          </div>
        </template>
      </floatWindow>

      <floatWindow v-if="o.name === '贴图'" :float-window="o">
        <template #content>
          <div class="mt6">
            <div class="class">贴图面板：</div>
            <div id="gui-container"></div>
          </div>
        </template>
      </floatWindow>

      <!-- </template> -->
    </template>

    <div class="threejs-container">
      <div id="container"></div>
    </div>
  </div>
</template>

<script lang="ts" setup name="CarBooth">
import { message } from "ant-design-vue/es";
import { initWebWorker } from "@/utils/webWorker";
// 面镜 ['Object_77', 'Object_65']
// 色调映射 https://threejs.org/examples/#webgl_tonemapping
// threejs相关导入
import { TWEEN } from "three/examples/jsm/libs/tween.module.min"; // 补间动画
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // 控制器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // gltf加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { createGUI, createLightGUI } from "./gui";

import {
  Lensflare,
  LensflareElement,
} from "three/examples/jsm/objects/Lensflare.js";

// 工具类导入
import { debounce, uuid } from "@/utils/common";
import { EntranceAnimations } from "@/utils/entranceTweenClass";

// 常量导入
import { revolverList } from "./constan";

// 组件导入
import floatWindow from "../float-window/index.vue";
import revolver from "../revolver/index.vue";
import threeJsFontSvg from "../svg-animation/three-js-font-svg.vue";
import animationControl from "../control-window/animation-control.vue";
import colorControl from "../control-window/color-control.vue";

import materialControl from "../control-window/material-control.vue";

/**
 * 状态仓库
 */
import { useBoothModalStore, useCarModalStore, useThreejsModuleStore } from "@/store";
const boothStore = useBoothModalStore();
const carStore = useCarModalStore();
const threejsModule = useThreejsModuleStore();

// THREE.ColorManagement.enabled = true;

// 数据类型导入
import { Position, ObjectKeys } from "@/utils/interface";
// import { message } from "ant-design-vue";

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let stats: Stats;
let hdrTexture: THREE.Texture;

let grid: THREE.GridHelper;
let controls: OrbitControls;

let videoSource: HTMLVideoElement;

let boothModel: THREE.Object3D | null = null; // 展台
let carModel: THREE.Object3D | null = null;
const wheels: THREE.Object3D[] = [];




const entranceAnimations = new EntranceAnimations();

const svgCompleted = ref(false);
const loadManager = ref({
  name: "",
  schedule: 0,
  success: false,
  showMask: true,
});

let rectLight: THREE.RectAreaLight;

for (let i = 0, l = revolverList.length; i < l; i++) {
  revolverList[i].uuid = uuid();
  revolverList[i].unfoldClass.top = `${30 * i}px`;
  // revolverList[i].name = i.toString();
  // revolverList[i].name = i.toString();
  revolverList[i].unfoldClass.right = `${
    window.innerWidth -
    Number(
      revolverList[i].unfoldClass.width.slice(
        0,
        revolverList[i].unfoldClass.width.length - 2
      )
    )
  }px`;
}
uuid();

// 进场动画
const onPlay = () => {
  // renderer.setAnimationLoop(render);
  loadManager.value.showMask = false;
  loadManager.value.success = true;
  entranceAnimations.animateCamera(
    camera,
    controls,
    { x: 4.25, y: 1.4, z: 4.5 },
    { x: 0, y: 0.5, z: 0 },
    2400,
    () => {
      camera.position.set(4.25, 1.4, 4.5);
      videoSource.play();
    }
  );
};

const createGUIFun = () => {
  const infoContainer = document.getElementById(
    "gui-container"
  ) as HTMLDivElement;

  createGUI({ container: infoContainer });
  createLightGUI({ rectLight: rectLight });
};

// 展厅灯光管理
const rectAreaLight = () => {
  // WellLeft.001
  // Top.001
  const Top = scene.getObjectByName("Top001");
  const WellLeft = scene.getObjectByName("WellLeft001");
  const width = 12;
  const height = 12;
  const intensity = 10;
  rectLight = new THREE.RectAreaLight(0xffffff, intensity, width, height);
  const rectLight2 = new THREE.RectAreaLight(
    0xff00ff,
    intensity,
    width,
    height
  );
  rectLight.position.set(0, 4, 0);
  rectLight2.position.set(1, 0.3, 0);
  // rectLight.rotateX(Math.PI * 0.5);
  rectLight.lookAt(0, 0, 0);
  rectLight2.lookAt(0, 0, 0);
  scene.add(rectLight);
  // WellLeft.add(rectLight2);

  const rectLightHelper = new RectAreaLightHelper(rectLight);
  const rectLightHelper2 = new RectAreaLightHelper(rectLight2);
  rectLight.add(rectLightHelper);
  // rectLight2.add(rectLightHelper2);

  createGUIFun();
};

const init = async () => {
  const container = document.getElementById("container");

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85;
  container?.appendChild(renderer.domElement);

  stats = Stats();
  stats.dom.setAttribute("id", "stats");
  const infoContainer = document.getElementById("stats-container");
  infoContainer?.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);

  camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  threejsModule.camera = camera;
  // camera.position.set(4.25, 1.4, 4.5);
  camera.position.set(-40, 20, 40);

  container && (controls = new OrbitControls(camera, container));
  controls.enableDamping = true;
  // controls.maxDistance = 10; // 设置相机距离原点的最远距离
  // controls.maxPolarAngle = 1.55;
  // controls.minDistance = 1; // 设置相机距离原点的最远距离
  controls.target.set(0, 0.5, 0);
  controls.update();
  threejsModule.controls = controls;

  scene = new THREE.Scene();
  threejsModule.scene = scene;
  scene.background = new THREE.Color(0x333333);

  const axes = new THREE.AxesHelper(200);
  scene.add(axes);

  const textureLoader = new THREE.TextureLoader();
  const rgbeLoader = new RGBELoader().setPath("/textures/equirectangular/");
  const gltfLoader = new GLTFLoader().setPath("/models/");
  const dracoLoader = new DRACOLoader().setDecoderPath("/draco/");
  dracoLoader.setDecoderConfig({ type: "js" }); //使用兼容性强的draco_decoder.js解码器
  dracoLoader.preload();
  gltfLoader.setDRACOLoader(dracoLoader);

  // 默认加载
  THREE.DefaultLoadingManager.onProgress = async (url, loaded, total) => {
    let loadingType = url.split(".");
    if (loadingType[loadingType.length - 1] === "gltf" && loaded / total != 1) {
      return;
    } // gltf三层导出文件加载时，会先访问.gltf文件，若第一次“已加载/总需加载”!=1则返回，此时数据不准确
    loadManager.value.name = loadingType[loadingType.length - 1];
    if (Math.floor((loaded / total) * 100) === 100) {
      loadManager.value.schedule = 100;
    } else {
      loadManager.value.schedule = Math.floor((loaded / total) * 100);
    }
  };
  const [texture, boothGltf, gltf, textureFlare0, textureFlare3] =
    await Promise.all([
      rgbeLoader.loadAsync("venice_sunset_1k.hdr"),
      gltfLoader.loadAsync("车展台压缩.glb"),
      gltfLoader.loadAsync("兰博基尼碳纤维大牛压缩.glb"),
      textureLoader.load("/textures/lensflare/lensflare0.png"),
      textureLoader.load("/textures/lensflare/lensflare3.png"),
    ]);

  hdrTexture = texture;
  carStore.source.texture.textureFlare0 = textureFlare0;
  carStore.source.texture.textureFlare3 = textureFlare3;
  // source.texture.textureFlare0 = textureFlare0;
  // source.texture.textureFlare3 = textureFlare3;

  carStore.carModal = gltf.scene;

  scene.environment = texture;
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;
  console.log("场景信息scene.environment", scene.environment);
  scene.fog = new THREE.Fog(0x333333, 15, 20);

  grid = new THREE.GridHelper(20, 40, 0xffffff, 0xffffff);
  if (grid && grid.material instanceof THREE.Material) {
    grid.material.opacity = 0.2;
    grid.material.depthWrite = false;
    grid.material.transparent = true;
  }
  // scene.add(grid);

  // 建筑面材质
  let buildMaterial = new THREE.MeshBasicMaterial({
    color: "#009EFF", // 颜色
    transparent: true, // 是否开启使用透明度
    opacity: 0.8, // 透明度0.25
    depthWrite: false, // 关闭深度写入 透视效果
    side: THREE.DoubleSide, // 双面显示
  });

  // 建筑线材质
  let lineMaterial = new THREE.LineBasicMaterial({
    color: "#36BCFF",
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  // Car
  carModel = gltf.scene;
  console.log("车", carModel);

  // carModel.traverse((e: any) => {
  //   // 遍历模型中所有mesh
  //   let line;
  //   e.material = buildMaterial; // 赋模型材质
  //   // const tPosition = new THREE.Vector3();
  //   if (e.geometry) {
  //     // if (e instanceof THREE.Mesh) {
  //     //   e.getWorldPosition(tPosition);
  //     // }
  //     const edges = new THREE.EdgesGeometry(e.geometry);
  //     line = new THREE.LineSegments(
  //       edges,
  //       lineMaterial // 赋线条材质
  //     );
  //     line.position.set(e.position.x, e.position.y, e.position.z);

  //     line.name = e.name + "-copy";
  //     // line.parent = e.parent; // 要指定父节点才行
  //     // e.parent.children.push(line);
  //     e.parent.add(line);
  //   }
  // });

  boothModel = boothGltf.scene;
  boothModel.scale.set(1.2, 1.2, 1.2);
  const boothGroup = boothModel.getObjectByName("车承台父节点");
  // scene.add(boothModel);
  boothGroup?.add(carModel);
  scene.add(boothModel);

  createBackgroundVideo();

  const jingzi = boothModel.getObjectByName("超长镜面") as THREE.Mesh;
  jingzi.visible = false;
  const groundMirror = new Reflector(jingzi.geometry.scale(1.2, 1.5, 1.2), {
    clipBias: 0.0003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0xb5b5b5,
  });

  const mirrorPosition = new THREE.Vector3();
  jingzi?.getWorldPosition(mirrorPosition);

  groundMirror.position.x = mirrorPosition.x;
  groundMirror.position.y = mirrorPosition.y + 0.4;
  groundMirror.position.z = mirrorPosition.z;
  scene.add(groundMirror);

  // carModel.getObjectByName('车身').material = bodyMaterial;
  // carModel.getObjectByName('挡叶').material = bodyMaterial;
  // carModel.getObjectByName('前轮连接板').material = bodyMaterial;
  // carModel.getObjectByName('左车门内部').material = bodyMaterial;
  // carModel.getObjectByName('左车门外部').material = bodyMaterial;
  // carModel.getObjectByName('右车门内部').material = bodyMaterial;
  // carModel.getObjectByName('右车门外部').material = bodyMaterial;

  // carModel.getObjectByName('rim_fr').material = detailsMaterial;
  // carModel.getObjectByName('rim_rr').material = detailsMaterial;
  // carModel.getObjectByName('rim_rl').material = detailsMaterial;
  // carModel.getObjectByName('trim').material = detailsMaterial;

  // carModel.getObjectByName('glass').material = glassMaterial;

  wheels.push(
    carModel.getObjectByName("左前轮") as THREE.Object3D,
    carModel.getObjectByName("左后轮") as THREE.Object3D,
    carModel.getObjectByName("右前轮") as THREE.Object3D,
    carModel.getObjectByName("右后轮") as THREE.Object3D
  );

  // shadow
  // const mesh = new THREE.Mesh(
  //   new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
  //   new THREE.MeshBasicMaterial({
  //     // map: shadow,
  //     blending: THREE.MultiplyBlending,
  //     toneMapped: false,
  //     transparent: true,
  //   }),
  // );
  // mesh.rotation.x = -Math.PI / 2;
  // mesh.renderOrder = 2;
  // carModel.add(mesh);

  // scene.add(carModel);

  // const shadow = new THREE.TextureLoader().load('models/gltf/ferrari_ao.png');

  // const dracoLoader = new DRACOLoader();
  // dracoLoader.setDecoderPath('jsm/libs/draco/gltf/');

  // const loader = new GLTFLoader();
  // loader.setDRACOLoader(dracoLoader);

  // loader.load('models/gltf/ferrari.glb', function (gltf) {
  //   const carModel = gltf.scene.children[0];

  //   carModel.getObjectByName('rim_fl').material = detailsMaterial;
  //   carModel.getObjectByName('rim_fr').material = detailsMaterial;
  //   carModel.getObjectByName('rim_rr').material = detailsMaterial;
  //   carModel.getObjectByName('rim_rl').material = detailsMaterial;
  //   carModel.getObjectByName('trim').material = detailsMaterial;

  //   carModel.getObjectByName('glass').material = glassMaterial;

  //   wheels.push(
  //     carModel.getObjectByName('wheel_fl'),
  //     carModel.getObjectByName('wheel_fr'),
  //     carModel.getObjectByName('wheel_rl'),
  //     carModel.getObjectByName('wheel_rr'),
  //   );

  //   // shadow
  //   const mesh = new THREE.Mesh(
  //     new THREE.PlaneGeometry(0.655 * 4, 1.3 * 4),
  //     new THREE.MeshBasicMaterial({
  //       // map: shadow,
  //       blending: THREE.MultiplyBlending,
  //       toneMapped: false,
  //       transparent: true,
  //     }),
  //   );
  //   mesh.rotation.x = -Math.PI / 2;
  //   mesh.renderOrder = 2;
  //   carModel.add(mesh);

  //   scene.add(carModel);
  // });
  rectAreaLight();
};

// 颜色面板
const onChangeColor = (material: THREE.Material, array: string[]) => {
  console.log(array);
  console.log(material);
  array.forEach((o) => {
    const m = (carModel?.getObjectByName(o) as THREE.Mesh)?.material;
    if (m instanceof THREE.Material) {
      (carModel?.getObjectByName(o) as THREE.Mesh).material = material;
    }
  });
};

// 材质面板
const onChangeMaterial = () => {
  // console.log('打印', xxx);
};

function render() {
  controls.update();
  TWEEN.update();

  const time = -performance.now() / 1000;

  carStore.wheelStart && startWheel(time);
  // grid && (grid.position.z = time % 1);

  renderer.render(scene, camera);

  stats.update();
}

const startWheel = (time: number) => {
  for (let i = 0; i < wheels.length; i++) {
    wheels[i].rotation.x = -time * Math.PI * 2;
  }
};

/**
 * 包围盒全自动计算：模型整体居中
 */
const calcBoundingBox = () => {
  if (carModel) {
    let box3 = new THREE.Box3();
    // 计算层级模型model的包围盒
    // 模型model是加载一个三维模型返回的对象，包含多个网格模型
    box3.expandByObject(carModel);
    // 计算一个层级模型对应包围盒的几何体中心在世界坐标中的位置
    let center = new THREE.Vector3();
    box3.getCenter(center);
    // console.log('查看几何体中心坐标', center);

    // 重新设置模型的位置，使之居中。
    carModel.position.x = carModel.position.x - center.x;
    // carModel.position.y = carModel.position.y - center.y;
    carModel.position.z = carModel.position.z - center.z;
  }
};

const onWindowResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  calcBoundingBox();
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

const createBackgroundVideo = () => {
  // 舞台背景视频
  videoSource = document.createElement("video");
  videoSource.src = "/video/Lamborghini-Centenario-Lp-770-4.mp4";
  videoSource.loop = true; //循环播放
  // videoSource.oncanplaythrough = videoLoaded(); // 视频加载至一段时间内无卡顿播放执行

  // video对象作为VideoTexture参数创建纹理对象
  let stageBGVideoTexture = new THREE.VideoTexture(videoSource);
  stageBGVideoTexture.center.set(0.5, 0.5); // 2项配合将texture沿X翻转和拉伸占满
  stageBGVideoTexture.repeat.set(0.8, -0.9);
  let stageBGVideoGeo = new THREE.PlaneGeometry(38, 19); // 矩形平面
  // 视频贴图使用基础材质，其他材质会被光照影响
  let stageBGVideoMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    // side: THREE.DoubleSide,
    map: stageBGVideoTexture, // 设置纹理贴图
  });
  const bigScreen = boothModel?.getObjectByName("屏幕") as THREE.Mesh;

  const mirrorPosition = new THREE.Vector3();
  bigScreen?.getWorldPosition(mirrorPosition);

  bigScreen.material = stageBGVideoMat;

  // groundMirror.position.x = mirrorPosition.x;
  // groundMirror.position.y = mirrorPosition.y + 0.4;
  // groundMirror.position.z = mirrorPosition.z;
  // scene.add(groundMirror);
  // let stageBGVideoMeshLeft = new THREE.Mesh(stageBGVideoMat, stageBGVideoMat); // 网格模型对象Mesh
  // stageBGVideoMeshLeft.position.set(-35, 0, 0);
  // stageBGVideoMeshRight = stageBGVideoMeshLeft.clone();
  // stageBGVideoMeshRight.position.set(35, 0, 0);
  // stageBGVideoMeshGroup.add(stageBGVideoMeshLeft);
  // stageBGVideoMeshGroup.add(stageBGVideoMeshRight);
};

const onSvgComplete = () => {
  svgCompleted.value = true;
  // renderer.setAnimationLoop(render);
  init();
};

onMounted(() => {
  // init();
  // initWebWorker();
});

// onBeforeUnmount(() => {
//   debugger;
// });
// onUnmounted(() => {
//   debugger;
// });
</script>

<style scoped lang="less">
.loading {
  position: absolute;
  z-index: 999;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #444444;
  :deep(.ant-progress-outer) {
    width: 250px !important;
  }
}
.car-booth {
  :deep(.left-container) {
    min-width: 300px;
    padding: 24px 18px;
  }
  body {
    color: #bbbbbb;
    background: #333333;
  }
  a {
    color: #08f;
  }

  .threejs-container {
    position: absolute;
    z-index: 1;
  }
  .colorPicker {
    display: inline-block;
    margin: 0 10px;
  }
  .mt6 {
    margin-top: 6px;
  }
  // 性能容器
  :deep(#stats) {
    position: relative !important;
  }
}

// 禁用鼠标
.disabled {
  cursor: not-allowed;
}
</style>
