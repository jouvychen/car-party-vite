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

      <div
        v-if="loadManager.schedule === 100"
        @click="onPlay"
        class="neon-button"
      >
        <a @click="onPlay">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          开始探索
        </a>
      </div>
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
      <animation-control
        v-if="o.name === '动画'"
        :float-window="o"
        :boothModel="boothModel"
        :carModel="carModel"
        :hdrTexture="hdrTexture"
      >
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

// 工具类导入
import { debounce, uuid, getAssetsUrlRelative } from "@/utils/common";
import { EntranceAnimations } from "@/utils/entranceTweenClass";

// 创建场景类导入
import { CreateFlag } from "../function/createFlag";
let flag: CreateFlag;
import { CreatePromotionalFilm } from "../function/createPromotionalFilm";
let promotionalFilm: CreatePromotionalFilm;

import {createTransitions} from '../function/createTransitions';

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
import {
  useBoothModalStore,
  useCarModalStore,
  useThreejsModuleStore,
} from "@/store";
const boothStore = useBoothModalStore();
const carStore = useCarModalStore();
const threejsModule = useThreejsModuleStore();

let camera: THREE.PerspectiveCamera;
let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let stats: Stats;
let hdrTexture: THREE.Texture;

let controls: OrbitControls;

let boothModel: THREE.Object3D | null = null; // 展台
let carModel: THREE.Object3D | null = null;
const wheels: THREE.Object3D[] = [];

const entranceAnimations = new EntranceAnimations();

/**
 * Threejs的文字svg动画
 */
const svgCompleted = ref(false);
// 加载信息
const loadManager = ref({
  name: "",
  schedule: 0,
  success: false,
  showMask: true,
  total: 26, // 总共加载的资源数(从默认加载器得知)
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
      // 播放视频
      setTimeout(() => {
        // promotionalFilm.onPlay();
      }, 3000);
    }
  );
};

const init = async () => {
  const container = document.getElementById("container");

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(render);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.85; // 可以改变曝光度从而改变hdr贴图亮度，需要重新渲染
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
  scene.fog = new THREE.Fog(0x333333, 15, 20);
  scene.background = new THREE.Color(0x333333);
  threejsModule.scene = scene;

  flag = new CreateFlag(scene, camera, renderer);
  flag.initFlag();

  const textureLoader = new THREE.TextureLoader();
  const rgbeLoader = new RGBELoader().setPath("/textures/equirectangular/");
  const gltfLoader = new GLTFLoader().setPath("/models/");
  const dracoLoader = new DRACOLoader().setDecoderPath("/draco/");
  dracoLoader.setDecoderConfig({ type: "js" }); //使用兼容性强的draco_decoder.js解码器
  dracoLoader.preload();
  gltfLoader.setDRACOLoader(dracoLoader);

  // 默认加载
  THREE.DefaultLoadingManager.onProgress = async (url, loaded, total) => {
    console.log("total", total);
    // console.log('进度', Math.floor((loaded / loadManager.value.total) * 100));
    let loadingType = url.split(".");
    loadManager.value.name = loadingType[loadingType.length - 1];
    if (Math.floor((loaded / loadManager.value.total) * 100) === 100) {
      loadManager.value.schedule = 100;
    } else {
      // 这里不用回调里的total是因为模型压缩成bin后再解压后资源数量会变化
      loadManager.value.schedule = Math.floor(
        (loaded / loadManager.value.total) * 100
      );
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

  // 反射镜像
  const hdrEquirect = texture;
  hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

  carStore.source.texture.textureFlare0 = textureFlare0;
  carStore.source.texture.textureFlare3 = textureFlare3;
  carStore.carModal = gltf.scene;

  hdrTexture = texture;
  scene.environment = texture;
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;

  // 车
  carModel = gltf.scene;
  // 解决双面渲染时通过挡风玻璃看向2边车门玻璃出现不透明黑块(但在升起车门动画后要设置成双面渲染)
  const carGlass = carModel.getObjectByName('挡风玻璃') as THREE.Mesh;
  carGlass.material instanceof THREE.Material && (carGlass.material.side = THREE.FrontSide);

  // 展台
  boothModel = boothGltf.scene;
  const transitionMesh = boothModel.getObjectByName("Glass002") as THREE.Mesh;
  createTransitions(transitionMesh);

  // 设置展台材质
  // const glass = boothModel.getObjectByName("Glass") as THREE.Mesh;
  // const glassParams = {
  //   color: 0xffffff,
  //   transmission: 1,
  //   opacity: 1,
  //   metalness: 0,
  //   roughness: 0,
  //   ior: 1.5,
  //   thickness: 0.01,
  //   specularIntensity: 1,
  //   specularColor: new THREE.Color(0xffffff),
  //   envMapIntensity: 1,
  //   lightIntensity: 1,
  //   exposure: 1,
  // };
  // const sphereMaterial = new THREE.MeshPhysicalMaterial({
  //   color: glassParams.color,
  //   metalness: glassParams.metalness,
  //   roughness: glassParams.roughness,
  //   ior: glassParams.ior,
  //   alphaMap: texture,
  //   envMap: hdrEquirect,
  //   envMapIntensity: glassParams.envMapIntensity,
  //   transmission: glassParams.transmission, // use material.transmission for glass materials
  //   specularIntensity: glassParams.specularIntensity,
  //   specularColor: glassParams.specularColor,
  //   opacity: glassParams.opacity,
  //   // side: THREE.DoubleSide,
  //   transparent: true,
  // });
  // glass.material = sphereMaterial;

  boothModel.scale.set(1.2, 1.2, 1.2);
  const boothGroup = boothModel.getObjectByName("车承台父节点");
  boothGroup?.add(carModel);
  scene.add(boothModel);

  // 创建视频
  promotionalFilm = new CreatePromotionalFilm(boothModel, "屏幕");

  /**
   * 创建镜子
   */
  const mirrorMesh = boothModel.getObjectByName("超长镜面") as THREE.Mesh;
  mirrorMesh.visible = false;
  const groundMirror = new Reflector(mirrorMesh.geometry.scale(1.2, 2.8, 1.2), {
    clipBias: 0.0003,
    textureWidth: window.innerWidth * window.devicePixelRatio,
    textureHeight: window.innerHeight * window.devicePixelRatio,
    color: 0xb5b5b5,
  });

  // 获取镜子的世界坐标
  const mirrorPosition = new THREE.Vector3();
  mirrorMesh?.getWorldPosition(mirrorPosition);

  groundMirror.position.x = mirrorPosition.x;
  groundMirror.position.y = mirrorPosition.y + 0.4;
  groundMirror.position.z = mirrorPosition.z;
  scene.add(groundMirror);

  // 创建灯光
  createLight();

  wheels.push(
    carModel.getObjectByName("左前轮") as THREE.Object3D,
    carModel.getObjectByName("左后轮") as THREE.Object3D,
    carModel.getObjectByName("右前轮") as THREE.Object3D,
    carModel.getObjectByName("右后轮") as THREE.Object3D
  );
};

/**
 * 展厅灯光管理
 */
const createLight = () => {
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

  // 创建完灯光后再创建GUI控制面板，因为依赖灯光实例
  createGUIFun();
};

/**
 * GUI控制面板
 */
const createGUIFun = () => {
  const infoContainer = document.getElementById(
    "gui-container"
  ) as HTMLDivElement;
  createGUI({ container: infoContainer });
  createLightGUI({ rectLight: rectLight });
};

/**
 * 子组件回调方法
 */
// 颜色控制组件回调
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

// 材质控制组件回调
const onChangeMaterial = () => {
  // console.log('打印', xxx);
};
const r = ref(false);
const render = () => {
  controls.update();
  TWEEN.update();
  stats.update();
  flag.flagUpdate();

  carStore.wheelStart && startWheel(-performance.now() / 1000);

  !r.value && renderer.render(scene, camera);
};

// setTimeout(()=>{
//     r.value = true;
//     console.log('变化');
//   }, 30000)

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
    // 模型model是加载一个三维模型返回的对象，包含多个网格模型
    box3.expandByObject(carModel);
    // 计算一个层级模型对应包围盒的几何体中心在世界坐标中的位置
    let center = new THREE.Vector3();
    box3.getCenter(center);
    // 重新设置模型的位置，使之居中。
    carModel.position.x = carModel.position.x - center.x;
    carModel.position.z = carModel.position.z - center.z;
  }
};

// 窗口大小变化
const onWindowResize = () => {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  calcBoundingBox();
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

const onSvgComplete = () => {
  svgCompleted.value = true;
  init();
};

onMounted(() => {
  // init();
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

.neon-button {
  position: absolute;

  a {
    position: relative;
    display: inline-block;
    padding: 10px 20px;
    color: #94deeb;
    font-size: 16px;
    text-decoration: none;
    text-transform: uppercase;
    overflow: hidden;
    transition: 0.5s;
    margin-top: 40px;
    letter-spacing: 4px;

    &:hover {
      background: #94deeb;
      color: #fff;
      border-radius: 5px;
      box-shadow: 0 0 5px #94deeb, 0 0 25px #94deeb, 0 0 50px #94deeb,
        0 0 100px #94deeb;
    }

    span {
      position: absolute;
      display: block;

      &:nth-child(1) {
        top: 0;
        left: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(90deg, transparent, #94deeb);
        animation: btn-anim1 1s linear infinite;
      }

      &:nth-child(2) {
        top: -100%;
        right: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(180deg, transparent, #94deeb);
        animation: btn-anim2 1s linear infinite;
        animation-delay: 0.25s;
      }

      &:nth-child(3) {
        bottom: 0;
        right: -100%;
        width: 100%;
        height: 2px;
        background: linear-gradient(270deg, transparent, #94deeb);
        animation: btn-anim3 1s linear infinite;
        animation-delay: 0.5s;
      }

      &:nth-child(4) {
        bottom: -100%;
        left: 0;
        width: 2px;
        height: 100%;
        background: linear-gradient(360deg, transparent, #94deeb);
        animation: btn-anim4 1s linear infinite;
        animation-delay: 0.75s;
      }
    }
  }

  @keyframes btn-anim1 {
    0% {
      left: -100%;
    }
    50%,
    100% {
      left: 100%;
    }
  }

  @keyframes btn-anim2 {
    0% {
      top: -100%;
    }
    50%,
    100% {
      top: 100%;
    }
  }

  @keyframes btn-anim3 {
    0% {
      right: -100%;
    }
    50%,
    100% {
      right: 100%;
    }
  }

  @keyframes btn-anim4 {
    0% {
      bottom: -100%;
    }
    50%,
    100% {
      bottom: 100%;
    }
  }
}
</style>
