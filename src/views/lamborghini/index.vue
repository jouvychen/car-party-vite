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
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  MeshBVH,
  MeshBVHVisualizer,
  StaticGeometryGenerator,
} from "three-mesh-bvh";

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
import {
  useBoothModalStore,
  useCarModalStore,
  useThreejsModuleStore,
} from "@/store";
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

let environment: any;
let collider: any;
let visualizer: any;
let clock: any;
let player: any;
let playerIsOnGround = false;
let fwdPressed = false;
let bkdPressed = false;
let lftPressed = false;
let rgtPressed = false;
let playerVelocity = new THREE.Vector3();
let upVector = new THREE.Vector3(0, 1, 0);
let tempVector = new THREE.Vector3();
let tempVector2 = new THREE.Vector3();
let tempBox = new THREE.Box3();
let tempMat = new THREE.Matrix4();
let tempSegment = new THREE.Line3(
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(0, 0, 0)
);
const params = {
  firstPerson: false,

  displayCollider: false,
  displayBVH: false,
  visualizeDepth: 10,
  gravity: -30,
  playerSpeed: 10,
  physicsSteps: 5,

  reset: reset,
};

function reset() {
  playerVelocity.set(0, 0, 0);
  player.position.set(4, 10, 0);
  camera.position.sub(controls.target);
  controls.target.copy(player.position);
  camera.position.add(player.position);
  controls.update();
}

function updatePlayer(delta: number) {
  if (playerIsOnGround) {
    playerVelocity.y = delta * params.gravity;
  } else {
    playerVelocity.y += delta * params.gravity;
  }

  player.position.addScaledVector(playerVelocity, delta);

  // 移动玩家
  const angle = controls.getAzimuthalAngle();
  if (fwdPressed) {
    tempVector.set(0, 0, -1).applyAxisAngle(upVector, angle);
    player.position.addScaledVector(tempVector, params.playerSpeed * delta);
  }

  if (bkdPressed) {
    tempVector.set(0, 0, 1).applyAxisAngle(upVector, angle);
    player.position.addScaledVector(tempVector, params.playerSpeed * delta);
  }

  if (lftPressed) {
    tempVector.set(-1, 0, 0).applyAxisAngle(upVector, angle);
    player.position.addScaledVector(tempVector, params.playerSpeed * delta);
  }

  if (rgtPressed) {
    tempVector.set(1, 0, 0).applyAxisAngle(upVector, angle);
    player.position.addScaledVector(tempVector, params.playerSpeed * delta);
  }

  player.updateMatrixWorld();

  // 根据碰撞调整球员位置
  const capsuleInfo = player.capsuleInfo;
  tempBox.makeEmpty();
  tempMat.copy(collider.matrixWorld).invert();
  tempSegment.copy(capsuleInfo.segment);

  // 获得胶囊在碰撞器的局部空间中的位置
  tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);
  tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);

  // 获取胶囊的轴对齐边界框
  tempBox.expandByPoint(tempSegment.start);
  tempBox.expandByPoint(tempSegment.end);

  tempBox.min.addScalar(-capsuleInfo.radius);
  tempBox.max.addScalar(capsuleInfo.radius);

  collider.geometry.boundsTree.shapecast({
    intersectsBounds: (box: any) => box.intersectsBox(tempBox),

    intersectsTriangle: (tri: any) => {
      // 检查三角形是否与胶囊相交，如果相交则调整胶囊位置。
      const triPoint = tempVector;
      const capsulePoint = tempVector2;

      const distance = tri.closestPointToSegment(
        tempSegment,
        triPoint,
        capsulePoint
      );
      if (distance < capsuleInfo.radius) {
        const depth = capsuleInfo.radius - distance;
        const direction = capsulePoint.sub(triPoint).normalize();

        tempSegment.start.addScaledVector(direction, depth);
        tempSegment.end.addScaledVector(direction, depth);
      }
    },
  });

  // 在检查三角形碰撞并移动后，获得胶囊碰撞器在世界空间中的调整位置。假设capsule . info .segment.start是玩家模型的原点。
  const newPosition = tempVector;
  newPosition.copy(tempSegment.start).applyMatrix4(collider.matrixWorld);

  // 检查碰撞器移动了多少
  const deltaVector = tempVector2;
  deltaVector.subVectors(newPosition, player.position);

  // 如果玩家主要是垂直调整，我们就会认为它是在地面上
  playerIsOnGround = deltaVector.y > Math.abs(delta * playerVelocity.y * 0.25);

  const offset = Math.max(0.0, deltaVector.length() - 1e-5);
  deltaVector.normalize().multiplyScalar(offset);

  // 调整玩家模型
  player.position.add(deltaVector);

  if (!playerIsOnGround) {
    deltaVector.normalize();
    playerVelocity.addScaledVector(
      deltaVector,
      -deltaVector.dot(playerVelocity)
    );
  } else {
    playerVelocity.set(0, 0, 0);
  }

  // 调整摄像机
  camera.position.sub(controls.target);
  controls.target.copy(player.position);
  camera.position.add(player.position);

  // 如果玩家跌得太低，将他们的位置重置到起点
  if (player.position.y < -25) {
    reset();
  }
}

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
  total: 20, // 总共加载的资源数(从默认加载器得知)
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
      // videoSource.play();
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
  renderer.toneMappingExposure = 0.85;
  container?.appendChild(renderer.domElement);

  stats = Stats();
  stats.dom.setAttribute("id", "stats");
  const infoContainer = document.getElementById("stats-container");
  infoContainer?.appendChild(stats.dom);

  window.addEventListener("resize", onWindowResize);

  window.addEventListener("keydown", function (e) {
    switch (e.code) {
      case "KeyW":
        fwdPressed = true;
        break;
      case "KeyS":
        bkdPressed = true;
        break;
      case "KeyD":
        rgtPressed = true;
        break;
      case "KeyA":
        lftPressed = true;
        break;
      case "Space":
        if (playerIsOnGround) {
          playerVelocity.y = 10.0;
          playerIsOnGround = false;
        }

        break;
    }
  });

  window.addEventListener("keyup", function (e) {
    switch (e.code) {
      case "KeyW":
        fwdPressed = false;
        break;
      case "KeyS":
        bkdPressed = false;
        break;
      case "KeyD":
        rgtPressed = false;
        break;
      case "KeyA":
        lftPressed = false;
        break;
    }
  });

  clock = new THREE.Clock();

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
    // gltf三层导出文件加载时，会先访问.gltf文件，若第一次“已加载/总需加载”!=1则返回，此时数据不准确
    if (loadingType[loadingType.length - 1] === "gltf" && loaded / total != 1) {
      return;
    }
    loadManager.value.name = loadingType[loadingType.length - 1];
    if (Math.floor((loaded / total) * 100) === 100) {
      loadManager.value.schedule = 100;
    } else {
      // 不用这里的total是因为模型压缩成bin解压后资源数量会变化
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

  carStore.source.texture.textureFlare0 = textureFlare0;
  carStore.source.texture.textureFlare3 = textureFlare3;
  carStore.carModal = gltf.scene;
  const gltfScene = boothGltf.scene;

  // 视觉几何设置
  const toMerge: any = {};
  gltfScene.traverse((c: THREE.Object3D) => {
    // if (c.name === '顶部灯路') {
    //   debugger
    // }
    if (c.isMesh && c.name === '顶部灯路') {
      const hex = c.material.color.getHex();
      toMerge[hex] = toMerge[hex] || [];
      toMerge[hex].push(c);
    }
  });

  environment = new THREE.Group();
  for (const hex in toMerge) {
    const arr = toMerge[hex];
    let visualGeometries: any[] = [];
    arr.forEach((mesh: THREE.Mesh) => {
      if (mesh.material.emissive.r !== 0) {
        environment.attach(mesh);
      } else {
        const geom = mesh.geometry.clone();
        geom.applyMatrix4(mesh.matrixWorld);
        visualGeometries.push(geom);
      }
    });

    if (visualGeometries.length) {
      const newGeom =
        BufferGeometryUtils.mergeBufferGeometries(visualGeometries);
      const newMesh = new THREE.Mesh(
        newGeom,
        new THREE.MeshStandardMaterial({ color: parseInt(hex), shadowSide: 2 })
      );
      newMesh.castShadow = true;
      newMesh.receiveShadow = true;
      newMesh.material.shadowSide = 2;

      environment.add(newMesh);
    }
  }

  const staticGenerator = new StaticGeometryGenerator(environment);
  staticGenerator.attributes = ["position"];

  const mergedGeometry = staticGenerator.generate();
  mergedGeometry.boundsTree = new MeshBVH(mergedGeometry, {
    lazyGeneration: false,
  });

  collider = new THREE.Mesh(mergedGeometry);
  collider.material.wireframe = true;
  collider.material.opacity = 0.5;
  collider.material.transparent = true;

  visualizer = new MeshBVHVisualizer(collider, params.visualizeDepth);
  scene.add(visualizer);
  scene.add(collider);
  scene.add(environment);

  // 人物胶囊
  player = new THREE.Mesh(
    new RoundedBoxGeometry(1.0, 2.0, 1.0, 10, 0.5),
    new THREE.MeshStandardMaterial()
  );
  player.geometry.translate(0, -0.5, 0);
  player.capsuleInfo = {
    radius: 0.5,
    segment: new THREE.Line3(
      new THREE.Vector3(),
      new THREE.Vector3(0, -1.0, 0.0)
    ),
  };
  player.castShadow = true;
  player.receiveShadow = true;
  player.material.shadowSide = 2;
  scene.add(player);
  reset();

  hdrTexture = texture;
  scene.environment = texture;
  scene.environment.mapping = THREE.EquirectangularReflectionMapping;

  // 车
  carModel = gltf.scene;

  // 展台
  boothModel = boothGltf.scene;
  boothModel.scale.set(1.2, 1.2, 1.2);
  const boothGroup = boothModel.getObjectByName("车承台父节点");
  boothGroup?.add(carModel);
  scene.add(boothModel);

  // 创建视频
  createBackgroundVideo();

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

const render = () => {
  controls.update();
  TWEEN.update();
  stats.update();

  if (collider) {
    const delta = Math.min(clock.getDelta(), 0.1);
    collider.visible = params.displayCollider;
    visualizer.visible = params.displayBVH;

    const physicsSteps = params.physicsSteps;

    for (let i = 0; i < physicsSteps; i++) {
      updatePlayer(delta / physicsSteps);
    }
  }

  const time = -performance.now() / 1000;

  carStore.wheelStart && startWheel(time);

  renderer.render(scene, camera);
};

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

/**
 * 创建视频
 */
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
    map: stageBGVideoTexture, // 设置纹理贴图
  });
  const bigScreen = boothModel?.getObjectByName("屏幕") as THREE.Mesh;

  const mirrorPosition = new THREE.Vector3();
  bigScreen?.getWorldPosition(mirrorPosition);

  bigScreen.material = stageBGVideoMat;
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
