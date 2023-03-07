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

      <a-button
        v-if="loadManager.schedule === 100"
        style="position: absolute"
        @click="onPlay"
        >开始探索</a-button
      >
    </div>

    <revolver :revolver-list="revolverList"></revolver>

    <template v-for="o in revolverList" :key="o.uuid">
      <!-- 控制颜色面板 -->
      <floatWindow v-if="o.name === '颜色'" :float-window="o">
        <template #content>
          <!-- {{o}} -->
          <span class="colorPicker">
            <input
              id="body-color"
              :disabled="!boothReady"
              type="color"
              value="#ff0000"
              :class="{ disabled: !boothReady }"
            />
            <br />
            车体
          </span>
          <span class="colorPicker">
            <input
              id="details-color"
              :disabled="!boothReady"
              type="color"
              value="#ffffff"
              :class="{ disabled: !boothReady }"
            />
            <br />
            车架
          </span>
          <span class="colorPicker">
            <input
              id="glass-color"
              :disabled="!boothReady"
              type="color"
              value="#ffffff"
              :class="{ disabled: !boothReady }"
            />
            <br />
            Glass
          </span>
        </template>
      </floatWindow>

      <!-- 控制动画面板 -->
      <floatWindow v-if="o.name === '动画'" :float-window="o">
        <template #content>
          <div class="class">
            <a-button :disabled="!boothReady" @click="onTweenOpenDoor">{{
              tweenState.openDoor ? "关门" : "开门"
            }}</a-button>
            <a-button :disabled="!boothReady" @click="onTweenOpenTailWing">{{
              tweenState.openTailWing ? "降下尾翼" : "升起尾翼"
            }}</a-button>
            <a-button :disabled="!boothReady" @click="onTweenOpenCoolingGlass">
              {{
                tweenState.openCoolingGlass ? "降下散热玻璃" : "升起散热玻璃"
              }}
            </a-button>
            <a-button :disabled="!boothReady" @click="onTweenWheelSeeding">
              {{
                !tweenState.openWheelSeedingBroke &&
                !tweenState.openWheelSeeding
                  ? "开始轮播"
                  : tweenState.openWheelSeedingBroke
                  ? "继续轮播"
                  : "停止轮播"
              }}
            </a-button>
            <a-button :disabled="!boothReady" @click="onResetCamera"
              >视角复位</a-button
            >
            <a-button :disabled="!boothReady" @click="onTweenOpenLight">{{
              tweenState.openLight ? "关灯" : "开灯"
            }}</a-button>
            <a-button
              :disabled="!boothAnimationComplete"
              @click="onTweenOpenBooth"
              >{{ tweenState.openBooth ? "降下展台" : "升起展台" }}</a-button
            >
            <a-button :disabled="!boothReady" @click="onTweenOpenEngine">
              {{ wheelStart ? "关闭引擎" : "启动引擎" }}
            </a-button>
          </div>
        </template>
      </floatWindow>

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

// 面镜 ['Object_77', 'Object_65']

// threejs相关导入
import { TWEEN } from "three/examples/jsm/libs/tween.module.min"; // 补间动画
import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // 控制器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // gltf加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { RectAreaLightHelper } from "three/examples/jsm/helpers/RectAreaLightHelper.js";
import { createGUI, createLightGUI } from "./gui";
import { EntranceAnimations } from "@/utils/entranceTweenClass";
import {
  Lensflare,
  LensflareElement,
} from "three/examples/jsm/objects/Lensflare.js";

// 工具类导入
import { debounce, uuid } from "@/utils/common";

// 常量导入
import { revolverList } from "./constan";

// 组件导入
import floatWindow from "../float-window/index.vue";
import revolver from "../revolver/index.vue";
import threeJsFontSvg from "../svg-animation/three-js-font-svg.vue";

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

let boothModel: THREE.Object3D | null = null; // 展台
let carModel: THREE.Object3D | null = null;
const wheels: THREE.Object3D[] = [];
const wheelStart = ref(false); // 车轮动画
const boothReady = ref(false); // 展台已升起、就绪状态
const boothAnimationComplete = ref(true);
const boothAnimationDerection = ref(""); // 升降台动画方向 up / dowm

// 记录升降展台的原始位置, 初始值要为空, 否则下面赋值判断会不执行
let carBoothPosition: Position | null;
// 记录升降展台4块板材的原始位置, 初始值要为空, 否则下面赋值判断会不执行
let boothPosition: ObjectKeys = {
  booth1: null,
  booth2: null,
  booth3: null,
  booth4: null,
};

let bodyMaterial: THREE.MeshPhysicalMaterial;

const sideDragRef = ref(null);

let source: ObjectKeys = {
  texture: {
    textureFlare0: undefined,
    textureFlare3: undefined,
  },
};

const initialConfiguration = {
  cameraPosition: new THREE.Vector3(4.25, 1.4, 4.5),
  controlsPosition: new THREE.Vector3(0, 0.5, 0),
};

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
  renderer.setAnimationLoop(render);
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

const currentAnimationName = ref("");
const entranceAnimations = new EntranceAnimations();
// 动画状态管理
const tweenState = ref({
  openDoor: false,
  openTailWing: false,
  openCoolingGlass: false,
  openWheelSeeding: false,
  openWheelSeedingBroke: false, // 轮播被打断
  openLight: false,
  openBooth: false, // 升降展台
});

// 旋转知识 https://blog.csdn.net/weixin_39423672/article/details/116517571
const onTweenOpenDoor = () => {
  if (tweenState.value.openWheelSeeding) {
    entranceAnimations.stop(); // 停止轮播可能未完成的动画
    tweenState.value.openWheelSeedingBroke = true;
    tweenState.value.openWheelSeeding = false;
  }
  let leftDoorMesh = carModel?.getObjectByName("左门");
  const leftDoorDegParams = {
    degX: tweenState.value.openDoor ? Math.PI / 3 : 0,
    degY: tweenState.value.openDoor ? -Math.PI / 10 : 0,
    degZ: tweenState.value.openDoor ? Math.PI / 10 : 0,
  };
  const leftDoorDeg = new TWEEN.Tween(leftDoorDegParams);
  leftDoorDeg.to(
    {
      degX: tweenState.value.openDoor ? 0 : Math.PI / 3,
      degY: tweenState.value.openDoor ? 0 : -Math.PI / 10,
      degZ: tweenState.value.openDoor ? 0 : Math.PI / 10,
    },
    500
  );
  leftDoorDeg.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  leftDoorDeg.onUpdate(function () {
    leftDoorMesh?.rotation.set(
      leftDoorDegParams.degX,
      leftDoorDegParams.degY,
      leftDoorDegParams.degZ
    );
  });

  let rightDoorMesh = carModel?.getObjectByName("右门");
  const rightDoorDegParams = {
    degX: tweenState.value.openDoor ? Math.PI / 3 : 0,
    degY: tweenState.value.openDoor ? Math.PI / 10 : 0,
    degZ: tweenState.value.openDoor ? -Math.PI / 10 : 0,
  };
  const rightDoorDeg = new TWEEN.Tween(rightDoorDegParams);
  rightDoorDeg.to(
    {
      degX: tweenState.value.openDoor ? 0 : Math.PI / 3,
      degY: tweenState.value.openDoor ? 0 : Math.PI / 10,
      degZ: tweenState.value.openDoor ? 0 : -Math.PI / 10,
    },
    500
  );
  rightDoorDeg.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  rightDoorDeg.onUpdate(function () {
    rightDoorMesh?.rotation.set(
      rightDoorDegParams.degX,
      rightDoorDegParams.degY,
      rightDoorDegParams.degZ
    );
  });
  rightDoorDeg.onComplete(() => {
    tweenState.value.openDoor = !tweenState.value.openDoor;
  });

  leftDoorDeg.start();
  rightDoorDeg.start();
};

// 尾翼升降
const onTweenOpenTailWing = () => {
  if (tweenState.value.openWheelSeeding) {
    entranceAnimations.stop(); // 停止轮播可能未完成的动画
    tweenState.value.openWheelSeedingBroke = true;
    tweenState.value.openWheelSeeding = false;
  }
  const watchPoint = carModel?.getObjectByName("车后中观测点")?.position;
  const tailWingMesh = carModel?.getObjectByName("尾翼")?.position;
  const tailWingPointStart = carModel?.getObjectByName("尾翼位移点1")?.position;
  const tailWingPointEnd = carModel?.getObjectByName("尾翼位移点2")?.position;

  const tailWingParams = {
    px: tailWingMesh?.x,
    py: tailWingMesh?.y,
    pz: tailWingMesh?.z,
  };
  const tailWingTween = new TWEEN.Tween(tailWingParams);
  tailWingTween.to(
    {
      px: tweenState.value.openTailWing
        ? tailWingPointEnd?.x
        : tailWingPointStart?.x,
      py: tweenState.value.openTailWing
        ? tailWingPointEnd?.y
        : tailWingPointStart?.y,
      pz: tweenState.value.openTailWing
        ? tailWingPointEnd?.z
        : tailWingPointStart?.z,
    },
    500
  );
  tailWingTween.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  tailWingTween.onUpdate(function () {
    // tailWingMesh.translateOnAxis(vector3, tailWingParams.distance);
    tailWingMesh?.set(
      Number(tailWingParams.px),
      Number(tailWingParams.py),
      Number(tailWingParams.pz)
    );
  });
  tailWingTween.onComplete(() => {
    tweenState.value.openTailWing = !tweenState.value.openTailWing;
  });
  entranceAnimations.stop(); // 停止轮播可能未完成的动画
  if (currentAnimationName.value === "TailWing") {
    tailWingTween.start();
  } else {
    entranceAnimations.animateCamera(
      camera,
      controls,
      { x: watchPoint?.x, y: watchPoint?.y, z: watchPoint?.z }, // 轨道新位置
      {
        x: tailWingPointStart?.x,
        y: tailWingPointStart?.y,
        z: tailWingPointStart?.z,
      }, // 该点为目标点的相对位移
      1500,
      () => {
        currentAnimationName.value = "TailWing";
        tailWingTween.start();
      }
    );
  }
};

// 散热玻璃
const onTweenOpenCoolingGlass = () => {
  if (tweenState.value.openWheelSeeding) {
    entranceAnimations.stop(); // 停止轮播可能未完成的动画
    tweenState.value.openWheelSeedingBroke = true;
    tweenState.value.openWheelSeeding = false;
  }
  const watchPoint = carModel?.getObjectByName("车后中观测点")?.position;
  const coolingGlassObject = carModel?.getObjectByName("发动机玻璃");

  const coolingGlassParams = {
    degX: tweenState.value.openCoolingGlass ? -Math.PI / 18 : 0,
  };
  const coolingGlass = new TWEEN.Tween(coolingGlassParams);
  coolingGlass.to(
    {
      degX: tweenState.value.openCoolingGlass ? 0 : -Math.PI / 18,
    },
    500
  );
  coolingGlass.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  coolingGlassObject &&
    coolingGlass.onUpdate(function () {
      coolingGlassObject.rotation.x = coolingGlassParams.degX;
    });
  coolingGlass.onComplete(() => {
    tweenState.value.openCoolingGlass = !tweenState.value.openCoolingGlass;
  });

  if (currentAnimationName.value === "coolingGlass") {
    coolingGlass.start();
  } else {
    entranceAnimations.animateCamera(
      camera,
      controls,
      { x: watchPoint?.x, y: watchPoint?.y, z: Number(watchPoint?.z) + 1 }, // 从该点看向下面那个点
      {
        x: coolingGlassObject?.position.x,
        y: coolingGlassObject?.position.y,
        z: coolingGlassObject?.position.z,
      }, // 从上面的点看到这个点
      1500,
      () => {
        currentAnimationName.value = "coolingGlass";
        coolingGlass.start();
      }
    );
  }
};

// 摄像机轮播到有动画的节点
let wheelSeedingIndex = 0;
const onTweenWheelSeeding = () => {
  tweenState.value.openWheelSeeding = !tweenState.value.openWheelSeeding;
  if (tweenState.value.openWheelSeeding) {
    onTweenWheelSeedingFun();
    tweenState.value.openWheelSeedingBroke = false;
  } else {
    wheelSeedingIndex = 0;
    currentAnimationName.value = "";
    tweenState.value.openWheelSeedingBroke = false;
  }
};

// 执行轮播动画
const onTweenWheelSeedingFun = () => {
  if (!tweenState.value.openWheelSeeding) {
    return;
  }
  const wheelSeedingList = [
    "车前中观测点",
    "车前右观测点",
    "车中右观测点",
    "车后右观测点",
    "车后中观测点",
    "车后左观测点",
    "车中左观测点",
    "车前左观测点",
  ];
  let watchPoint: Position | undefined;
  watchPoint = carModel?.getObjectByName(
    wheelSeedingList[wheelSeedingIndex]
  )?.position;
  entranceAnimations.animateCamera(
    camera,
    controls,
    { x: watchPoint?.x, y: watchPoint?.y, z: watchPoint?.z },
    {
      x: 0,
      y: 0,
      z: 0,
    },
    2500,
    () => {
      if (
        !tweenState.value.openWheelSeeding ||
        tweenState.value.openWheelSeedingBroke
      ) {
        return;
      }
      currentAnimationName.value = "WheelSeeding";
      if (wheelSeedingIndex < wheelSeedingList.length - 1) {
        wheelSeedingIndex += 1;
      } else {
        wheelSeedingIndex = 0;
      }
      tweenState.value.openWheelSeeding && onTweenWheelSeedingFun();
    }
  );
};

const init = async () => {
  const container = document.getElementById("container");

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  // renderer.setAnimationLoop(render);
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
  // camera.position.set(4.25, 1.4, 4.5);
  camera.position.set(-40, 20, 40);

  container && (controls = new OrbitControls(camera, container));
  controls.enableDamping = true;
  // controls.maxDistance = 10; // 设置相机距离原点的最远距离
  // controls.maxPolarAngle = 1.55;
  // controls.minDistance = 1; // 设置相机距离原点的最远距离
  controls.target.set(0, 0.5, 0);
  controls.update();

  scene = new THREE.Scene();
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
  source.texture.textureFlare0 = textureFlare0;
  source.texture.textureFlare3 = textureFlare3;

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

  // materials

  bodyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xff0000,
    metalness: 1.0,
    roughness: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.03,
    sheen: 0.5,
  });

  const detailsMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 1.0,
    roughness: 0.5,
  });

  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    metalness: 0.25,
    roughness: 0,
    transmission: 1.0,
  });

  const bodyColorInput = document.getElementById("body-color");
  bodyColorInput?.addEventListener("input", (event: Event) => {
    bodyMaterial.color.set((event.target as HTMLInputElement).value);
    if (carModel) {
      changeBodyColor(
        [
          "车身",
          "前轮连接板",
          "左车门内部",
          "左车门外部",
          "右车门内部",
          "右车门外部",
          "Object_68002",
          "挡叶",
        ],
        bodyMaterial
      );
    }
  });

  const detailsColorInput = document.getElementById("details-color");
  detailsColorInput?.addEventListener("input", (event: Event) => {
    detailsMaterial.color.set((event.target as HTMLInputElement).value);
    if (carModel) {
      changeBodyColor(["车架"], detailsMaterial);
    }
  });

  const glassColorInput = document.getElementById("glass-color");
  glassColorInput?.addEventListener("input", (event: Event) => {
    glassMaterial.color.set((event.target as HTMLInputElement).value);
    if (carModel) {
      changeBodyColor(["挡风玻璃", "右车窗玻璃", "左车窗玻璃"], glassMaterial);
    }
  });

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

const changeBodyColor = (array: string[], material: THREE.Material) => {
  array.forEach((o) => {
    const m = (carModel?.getObjectByName(o) as THREE.Mesh)?.material;
    if (m instanceof THREE.Material) {
      (carModel?.getObjectByName(o) as THREE.Mesh).material = material;
    }
  });
};

function render() {
  controls.update();
  TWEEN.update();

  const time = -performance.now() / 1000;

  wheelStart.value && startWheel(time);
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

// 开关车前灯
const addLight = (
  mesh: THREE.Mesh,
  h: number,
  s: number,
  l: number,
  x: number,
  y: number,
  z: number,
  textureFlare0: THREE.Texture,
  textureFlare3: THREE.Texture
) => {
  const light = new THREE.PointLight(0xffffff, 1.5, 2000);
  light.name = `镜头光晕-${mesh.name}`;
  light.color.setHSL(h, s, l);
  light.position.set(x, y, z);
  mesh.attach(light); // 以childNode方式追加

  const lensflare = new Lensflare();
  lensflare.addElement(
    new LensflareElement(textureFlare0, 500, 0, light.color)
  );
  lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
  lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
  lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
  lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
  light.add(lensflare);
};
const onTweenOpenLight = () => {
  const lMesh = carModel?.getObjectByName("左车灯光晕点") as THREE.Mesh;
  const rMesh = carModel?.getObjectByName("右车灯光晕点") as THREE.Mesh;
  // 已经开灯, 则移除场景中的光晕节点
  if (tweenState.value.openLight) {
    lMesh?.remove(
      scene.getObjectByName(`镜头光晕-${lMesh.name}`) as THREE.Object3D
    );
    rMesh?.remove(
      scene.getObjectByName(`镜头光晕-${rMesh.name}`) as THREE.Object3D
    );
    scene.environment = hdrTexture;
  } else {
    if (tweenState.value.openWheelSeeding) {
      entranceAnimations.stop(); // 停止轮播可能未完成的动画
      tweenState.value.openWheelSeedingBroke = true;
      tweenState.value.openWheelSeeding = false;
    }

    const wlPosition = new THREE.Vector3();
    lMesh?.getWorldPosition(wlPosition);

    const wrPosition = new THREE.Vector3();
    rMesh?.getWorldPosition(wrPosition);

    // 当前正处于开灯动画位置(openLight)，则不需要镜头缓动动画
    if (currentAnimationName.value === "openLight") {
      scene.environment = null;
      addLight(
        lMesh,
        0.55,
        0.9,
        0.5,
        wlPosition.x,
        wlPosition.y,
        wlPosition.z,
        source.texture.textureFlare0,
        source.texture.textureFlare3
      );
      addLight(
        rMesh,
        0.55,
        0.9,
        0.5,
        wrPosition.x,
        wrPosition.y,
        wrPosition.z,
        source.texture.textureFlare0,
        source.texture.textureFlare3
      );
    } else {
      let watchPoint: Position | undefined;
      watchPoint = carModel?.getObjectByName("车前中观测点")?.position;
      entranceAnimations.animateCamera(
        camera,
        controls,
        { x: watchPoint?.x, y: watchPoint?.y, z: watchPoint?.z },
        {
          x: 0,
          y: 0,
          z: 0,
        },
        1500,
        () => {
          addLight(
            lMesh,
            0.55,
            0.9,
            0.5,
            wlPosition.x,
            wlPosition.y,
            wlPosition.z,
            source.texture.textureFlare0,
            source.texture.textureFlare3
          );
          addLight(
            rMesh,
            0.55,
            0.9,
            0.5,
            wrPosition.x,
            wrPosition.y,
            wrPosition.z,
            source.texture.textureFlare0,
            source.texture.textureFlare3
          );
          scene.environment = null;
          currentAnimationName.value = "openLight";
        }
      );
    }
  }

  tweenState.value.openLight = !tweenState.value.openLight;
};

// 升起/降下展台
const onTweenOpenBooth = () => {
  const booth4Time = 3000;
  const [
    originPosition,
    carBooth,
    boothOrigin,
    booth1,
    booth2,
    booth3,
    booth4,
  ] = [
    boothModel?.getObjectByName("原点")?.position,
    boothModel?.getObjectByName("车承台父节点"),
    boothModel?.getObjectByName("车闸父节点"),
    boothModel?.getObjectByName("车闸001"),
    boothModel?.getObjectByName("车闸002"),
    boothModel?.getObjectByName("车闸003"),
    boothModel?.getObjectByName("车闸004"),
  ];

  let booth1Vector: THREE.Vector3 = new THREE.Vector3();
  let booth2Vector: THREE.Vector3 = new THREE.Vector3();
  let booth3Vector: THREE.Vector3 = new THREE.Vector3();
  let booth4Vector: THREE.Vector3 = new THREE.Vector3();
  if (boothOrigin && booth1 && booth2 && booth3 && booth4) {
    [booth1Vector, booth2Vector, booth3Vector, booth4Vector] = [
      new THREE.Vector3(
        boothOrigin.position.x - booth1.position.x,
        booth1.position.y,
        boothOrigin.position.z - booth1.position.z
      ),
      new THREE.Vector3(
        boothOrigin.position.x - booth2.position.x,
        booth2.position.y,
        boothOrigin.position.z - booth2.position.z
      ),
      new THREE.Vector3(
        boothOrigin.position.x - booth3.position.x,
        booth3.position.y,
        boothOrigin.position.z - booth3.position.z
      ),
      new THREE.Vector3(
        boothOrigin.position.x - booth4.position.x,
        booth4.position.y,
        boothOrigin.position.z - booth4.position.z
      ),
    ];
  }

  // toFixed(4)是为了保证精度，因为他们的象限是正负号的
  if (!boothPosition.booth1) {
    boothPosition.booth1 = booth1Vector.clone();
    boothPosition.booth2 = new THREE.Vector3(
      Number(booth2Vector.x.toFixed(4)),
      Number(booth2Vector.y.toFixed(4)),
      Number(booth2Vector.z.toFixed(4))
    );
    boothPosition.booth3 = booth3Vector.clone();
    boothPosition.booth4 = new THREE.Vector3(
      Number(booth4Vector.x.toFixed(4)),
      Number(booth4Vector.y.toFixed(4)),
      Number(booth4Vector.z.toFixed(4))
    );
  }

  const [booth1EndVector, booth2EndVector, booth3EndVector, booth4EndVector] = [
    booth1Vector,
    new THREE.Vector3(
      Number(booth2Vector.x.toFixed(4)),
      Number(booth2Vector.y.toFixed(4)),
      Number(booth2Vector.z.toFixed(4))
    ),
    booth3Vector,
    new THREE.Vector3(
      Number(booth4Vector.x.toFixed(4)),
      Number(booth4Vector.y.toFixed(4)),
      Number(booth4Vector.z.toFixed(4))
    ),
  ].map((o) => {
    return new THREE.Vector3(o.x * 3, o.y, o.z * 3);
  });

  // 1
  const booth1Params = {
    x: Math.abs(booth1Vector.x),
    z: Math.abs(booth1Vector.z),
  };
  const booth1Tween = new TWEEN.Tween(booth1Params);
  booth1Tween.to(
    {
      x: Math.abs(
        tweenState.value.openBooth ? boothPosition.booth1.x : booth1EndVector.x
      ),
      z: Math.abs(
        tweenState.value.openBooth ? boothPosition.booth1.z : booth1EndVector.z
      ),
    },
    booth4Time
  );
  booth1Tween.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  booth1Tween.onUpdate(function () {
    booth1?.position.set(booth1Params.x, booth1Vector.y, booth1Params.z);
  });

  // 2 (本块对调x和z是因为所在象限有一个为负，上面与“原点”相减时导致相反)
  const booth2Params = {
    x: booth2Vector.x,
    z: booth2Vector.z,
  };
  const booth2Tween = new TWEEN.Tween(booth2Params);
  booth2Tween.to(
    {
      x: tweenState.value.openBooth
        ? Math.abs(boothPosition.booth2.x)
        : booth2EndVector.x,
      z: tweenState.value.openBooth
        ? -boothPosition.booth2.z
        : booth2EndVector.z,
    },
    booth4Time
  );
  booth2Tween.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  booth2Tween.onUpdate(function () {
    booth2?.position.set(booth2Params.x, booth2Vector.y, booth2Params.z);
  });

  // 3 (本块起点和终点都加负号是因为上面向量相减，而该块又在第三象限的缘故，都是负号，负负得正了)
  const booth3Params = {
    x: -booth3Vector.x,
    z: -booth3Vector.z,
  };
  const booth3Tween = new TWEEN.Tween(booth3Params);
  booth3Tween.to(
    {
      x: tweenState.value.openBooth
        ? -boothPosition.booth3.x
        : -booth3EndVector.x,
      z: tweenState.value.openBooth
        ? -boothPosition.booth3.z
        : -booth3EndVector.z,
    },
    booth4Time
  );
  booth3Tween.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  booth3Tween.onUpdate(function () {
    // console.log('booth3Params.x', booth3Params.x, 'booth3Params.z', booth3Params.z);
    booth3?.position.set(booth3Params.x, booth3Vector.y, booth3Params.z);
  });

  // 4
  const booth4Params = {
    x: booth4Vector.x,
    z: booth4Vector.z,
  };
  const booth4Tween = new TWEEN.Tween(booth4Params);
  booth4Tween.to(
    {
      x: tweenState.value.openBooth
        ? -boothPosition.booth4.x
        : booth4EndVector.x,
      z: tweenState.value.openBooth
        ? Math.abs(boothPosition.booth4.z)
        : booth4EndVector.z,
    },
    booth4Time
  );
  booth4Tween.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  booth4Tween.onUpdate(function () {
    // console.log('booth4Params.x', booth4Params.x, 'booth4Params.z', booth4Params.z);
    booth4?.position.set(booth4Params.x, booth4Vector.y, booth4Params.z);
  });

  // 整体微下沉和上浮
  const boothOriginParams = {
    y: tweenState.value.openBooth
      ? boothOrigin?.position.y
      : boothOrigin?.position.y,
  };
  const boothOriginParamsTween = new TWEEN.Tween(boothOriginParams);
  boothOriginParamsTween.to(
    {
      y: tweenState.value.openBooth
        ? Number(boothOrigin?.position.y) + 0.05
        : Number(boothOrigin?.position.y) - 0.05,
    },
    1000
  );
  boothOriginParamsTween.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  boothOrigin &&
    boothOriginParamsTween
      .onUpdate(function () {
        boothOrigin.position.y = boothOriginParams.y as number;
      })
      .onComplete(() => {
        tweenState.value.openBooth = !tweenState.value.openBooth;
        boothAnimationComplete.value = true; // 升降动画已完成
        message.success("下降完成");
      });

  // 载车承台升降
  if (!carBoothPosition) {
    carBoothPosition = carBooth?.position.clone() as Position;
  }
  const carBoothParams = {
    y: carBooth?.position.y,
  };
  const carBoothTween = new TWEEN.Tween(carBoothParams);
  carBoothTween.to(
    {
      y: tweenState.value.openBooth ? carBoothPosition.y : originPosition?.y,
    },
    3000
  );
  carBoothTween.easing(TWEEN.Easing.Sinusoidal.InOut).repeat(0);
  carBooth &&
    carBoothTween
      .onUpdate(function () {
        carBooth.position.y = Number(carBoothParams.y);
      })
      .onComplete(() => {
        tweenState.value.openBooth = !tweenState.value.openBooth;
        boothReady.value = true; // 展台已就绪
        boothAnimationComplete.value = true; // 升降动画已完成
        message.success("上升完成");
      });

  boothAnimationComplete.value = false; // 升降动画未完成
  // 上升
  if (!tweenState.value.openBooth) {
    boothAnimationDerection.value = "up";
    boothOriginParamsTween.start();
    boothOriginParamsTween.onComplete(() => {
      booth1Tween.start();
      booth2Tween.start();
      booth3Tween.start();
      booth4Tween.start();
    });
    booth1Tween.onComplete(() => {
      carBoothTween.start();
    });
  } else {
    // 下降
    boothAnimationDerection.value = "dowm"; // 展台动画方向是下降
    boothReady.value = false; // 展台未就绪
    carBoothTween.start();
    carBoothTween.onComplete(() => {
      booth1Tween.start();
      booth2Tween.start();
      booth3Tween.start();
      booth4Tween.start();
      booth1Tween.onComplete(() => {
        boothOriginParamsTween.start();
      });
    });
  }

  // tweenState.value.openBooth = !tweenState.value.openBooth;
};

// 引擎启动、车轮动画
const onTweenOpenEngine = () => {
  wheelStart.value = !wheelStart.value;
};

// 所有配置重置为初始值
const onResetCamera = () => {
  entranceAnimations.stop();
  tweenState.value.openWheelSeedingBroke = false;
  tweenState.value.openWheelSeeding = false;
  entranceAnimations.animateCamera(
    camera,
    controls,
    {
      x: initialConfiguration.cameraPosition.x,
      y: initialConfiguration.cameraPosition.y,
      z: initialConfiguration.cameraPosition.z,
    },
    {
      x: initialConfiguration.controlsPosition.x,
      y: initialConfiguration.controlsPosition.y,
      z: initialConfiguration.controlsPosition.z,
    },
    2400,
    () => {
      camera.position.set(
        initialConfiguration.cameraPosition.x,
        initialConfiguration.cameraPosition.y,
        initialConfiguration.cameraPosition.z
      );
      controls.update();
    }
  );
};

const onSvgComplete = () => {
  svgCompleted.value = true;
  // init();
};

onMounted(() => {
  init();
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
