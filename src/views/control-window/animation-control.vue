<template>
  <!-- 动画控制面板 -->
  <floatWindow :float-window="floatWindow1" class="color-control">
    <template #content>
      <div class="class">
        <a-button :disabled="!boothReady" @click="onTweenOpenDoor">{{
          tweenState.openDoor ? "关门" : "开门"
        }}</a-button>
        <a-button :disabled="!boothReady" @click="onTweenOpenTailWing">{{
          tweenState.openTailWing ? "降下尾翼" : "升起尾翼"
        }}</a-button>
        <a-button :disabled="!boothReady" @click="onTweenOpenCoolingGlass">
          {{ tweenState.openCoolingGlass ? "降下散热玻璃" : "升起散热玻璃" }}
        </a-button>
        <a-button :disabled="!boothReady" @click="onTweenWheelSeeding">
          {{
            !tweenState.openWheelSeedingBroke && !tweenState.openWheelSeeding
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
</template>
<script setup lang="ts">
/**
 * Threejs依赖
 */
import * as THREE from "three";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min"; // 补间动画
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // 控制器
// import {
//   Lensflare,
//   LensflareElement,
// } from "three/examples/jsm/objects/Lensflare.js";
import {
  Lensflare,
  LensflareElement,
} from "./test111.js";

/**
 * Antd依赖
 */
// import { message } from "ant-design-vue/es";

/**
 * 数据类型导入
 */
import { Position, ObjectKeys } from "@/utils/interface";

/**
 * 公共(工具)方法
 */
import { EntranceAnimations } from "@/utils/entranceTweenClass";

/**
 * 组件
 */
import floatWindow from "../float-window/index.vue";

/**
 * 常量
 */
//  let source: ObjectKeys = {
//   texture: {
//     textureFlare0: undefined,
//     textureFlare3: undefined,
//   },
// };

const initialConfiguration = {
  cameraPosition: new THREE.Vector3(4.25, 1.4, 4.5),
  controlsPosition: new THREE.Vector3(0, 0.5, 0),
};

/**
 * 通信
 */
const props = defineProps({
  floatWindow: {
    type: Object,
    default: () => {},
  },
  boothModel: {
    type: [THREE.Object3D, null] as PropType<THREE.Object3D | null>,
    default: () => {},
  },
  carModel: {
    type: [THREE.Object3D, null] as PropType<THREE.Object3D | null>,
    default: () => {},
  },
  hdrTexture: {
    type: [THREE.Texture] as PropType<THREE.Texture>,
    default: () => {},
  },
});
const floatWindow1 = props.floatWindow;
let hdrTexture: THREE.Texture;

/**
 * 状态仓库
 */
import {
  useBoothModelStore,
  useCarModelStore,
  useThreejsModuleStore,
} from "@/store";
import { Light, LinearEncoding, sRGBEncoding } from "three";
const boothStore = useBoothModelStore();
const carStore = useCarModelStore();
const threejsModule = useThreejsModuleStore();

const currentAnimationName = ref("");
const entranceAnimations = new EntranceAnimations();

/**
 * Threejs
 */
let scene = computed<THREE.Scene>(() => threejsModule.scene);
let camera = computed<THREE.PerspectiveCamera>(() => threejsModule.camera);
let controls = computed<OrbitControls | null>(() => threejsModule.controls || null);

/**
 * 展台数据
 */
let boothModel: THREE.Object3D;
const boothReady = ref(false); // 展台已升起、就绪状态
// const boothReady = computed(() => boothStore.boothReady); // 展台就绪
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

/**
 * 车辆数据
 */
// let carModel: THREE.Object3D;

const carModel = computed(() => carStore.carModel);
const source = computed(() => carStore.source);
const wheelStart = computed(() => carStore.wheelStart);
// 车辆动画状态管理
const tweenState = ref({
  openDoor: false,
  openTailWing: false,
  openCoolingGlass: false,
  openWheelSeeding: false,
  openWheelSeedingBroke: false, // 轮播被打断
  openLight: false,
  openBooth: false, // 升降展台
});

// const emits = defineEmits(["onChangeMaterial"]);
// const onChangeMaterial = () => {
//   // emits("onChangeMaterial", materials[obj.material], obj.value);
// };

// 迁移

// 旋转知识 https://blog.csdn.net/weixin_39423672/article/details/116517571
const onTweenOpenDoor = () => {
  if (tweenState.value.openWheelSeeding) {
    entranceAnimations.stop(); // 停止轮播可能未完成的动画
    tweenState.value.openWheelSeedingBroke = true;
    tweenState.value.openWheelSeeding = false;
  }
  const carGlass = carModel.value?.getObjectByName('挡风玻璃') as THREE.Mesh;
  let leftDoorMesh = carModel.value?.getObjectByName("左门");
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

  let rightDoorMesh = carModel.value?.getObjectByName("右门");
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
    // 解决双面渲染时通过挡风玻璃看向2边车门玻璃出现不透明黑块(但在升起车门动画后要设置成双面渲染)
    !tweenState.value.openDoor && carGlass.material instanceof THREE.Material && (carGlass.material.side = THREE.FrontSide);
  });

  !tweenState.value.openDoor && carGlass.material instanceof THREE.Material && (carGlass.material.side = THREE.DoubleSide);

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
  const watchPoint = carModel.value?.getObjectByName("车后中观测点")?.position;
  const tailWingMesh = carModel.value?.getObjectByName("尾翼")?.position;
  const tailWingPointStart = carModel.value?.getObjectByName("尾翼位移点1")?.position;
  const tailWingPointEnd = carModel.value?.getObjectByName("尾翼位移点2")?.position;

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
      camera.value,
      controls.value,
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
  const watchPoint = carModel.value?.getObjectByName("车后中观测点")?.position;
  const coolingGlassObject = carModel.value?.getObjectByName("发动机玻璃");

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
      camera.value,
      controls.value,
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
  watchPoint = carModel.value?.getObjectByName(
    wheelSeedingList[wheelSeedingIndex]
  )?.position;
  entranceAnimations.animateCamera(
    camera.value,
    controls.value,
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

// 开关车前灯
const addLight = (
  mesh: THREE.Object3D,
  h: number,
  s: number,
  l: number,
  x: number,
  y: number,
  z: number,
  textureFlare0: THREE.Texture,
  textureFlare3: THREE.Texture
) => {
  const light = new THREE.PointLight(0xffffff, 1.5, 10);
  light.name = `镜头光晕-${mesh.name}`;
  light.color.setHSL(h, s, l);
  light.position.set(x, y, z);
  // light.renderOrder = light.renderOrder + 3;
  mesh.attach(light); // 以childNode方式追加

  // 不用srgb编码，后处理时光晕透明材质有问题
  // textureFlare0.encoding = sRGBEncoding;
  // textureFlare3.encoding = sRGBEncoding;

  const lensflare = new Lensflare();
  lensflare.name = `镜头光晕Mesh-${mesh.name}`;
  lensflare.material = new THREE.MeshStandardMaterial({color: '#ff0000', opacity: 0, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide});
  // lensflare.visible = false;

  lensflare.addElement(
    new LensflareElement(textureFlare0, 1000, 0, light.color)
  );
  lensflare.addElement(new LensflareElement(textureFlare3, 60, 0.6));
  lensflare.addElement(new LensflareElement(textureFlare3, 70, 0.7));
  lensflare.addElement(new LensflareElement(textureFlare3, 120, 0.9));
  lensflare.addElement(new LensflareElement(textureFlare3, 70, 1));
  light.add(lensflare);
  // debugger
  // const mesh1 = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshStandardMaterial({map: textureFlare0, transparent: true, opacity: 0.2}))
  // mesh1.name = `镜头光晕Mesh-${mesh.name}`;
  // mesh.attach(mesh1);
};
const onTweenOpenLight = () => {
  const lMesh = carModel.value?.getObjectByName("左车灯光晕点") as THREE.Object3D;
  const rMesh = carModel.value?.getObjectByName("右车灯光晕点") as THREE.Object3D;

  // 已经开灯, 则移除场景中的光晕节点
  if (tweenState.value.openLight) {
    lMesh?.remove(
      scene.value.getObjectByName(`镜头光晕-${lMesh.name}`) as THREE.Object3D
    );
    rMesh?.remove(
      scene.value.getObjectByName(`镜头光晕-${rMesh.name}`) as THREE.Object3D
    );
    scene.value.environment = hdrTexture;
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

    // 开灯操作
    // 当前正处于开灯动画位置(openLight)，则不需要镜头缓动动画
    if (currentAnimationName.value === "openLight") {
      scene.value.environment = null;
      addLight(
        lMesh,
        0.55,
        0.9,
        0.5,
        wlPosition.x,
        wlPosition.y,
        wlPosition.z,
        source.value.texture.textureFlare0,
        source.value.texture.textureFlare3
      );
      addLight(
        rMesh,
        0.55,
        0.9,
        0.5,
        wrPosition.x,
        wrPosition.y,
        wrPosition.z,
        source.value.texture.textureFlare0,
        source.value.texture.textureFlare3
      );
    } else {
      let watchPoint: Position | undefined;
      watchPoint = carModel.value?.getObjectByName("车前中观测点")?.position;
      entranceAnimations.animateCamera(
        camera.value,
        controls.value,
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
            source.value.texture.textureFlare0,
            source.value.texture.textureFlare3
          );
          addLight(
            rMesh,
            0.55,
            0.9,
            0.5,
            wrPosition.x,
            wrPosition.y,
            wrPosition.z,
            source.value.texture.textureFlare0,
            source.value.texture.textureFlare3
          );
          scene.value.environment = null;
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
        boothStore.boothReady = true;
        boothAnimationComplete.value = true; // 升降动画已完成
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
    boothStore.boothReady = false;
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
  carStore.wheelStart = !carStore.wheelStart;
};

// 视角复位
const onResetCamera = () => {
  entranceAnimations.stop();
  tweenState.value.openWheelSeedingBroke = false;
  tweenState.value.openWheelSeeding = false;
  entranceAnimations.animateCamera(
    camera.value,
    controls.value,
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
      camera.value.position.set(
        initialConfiguration.cameraPosition.x,
        initialConfiguration.cameraPosition.y,
        initialConfiguration.cameraPosition.z
      );
      controls.value?.update();
    }
  );
};

/**
 * 数据监听
 */
watch(
  () => props.boothModel,
  (booth) => {
    booth && (boothModel = booth);
  }
);
watch(
  () => props.hdrTexture,
  (texture) => {
    texture && (hdrTexture = texture);
  }
);
</script>

<style scoped lang="less">
.color-control {
  &__item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    &:first-child {
      padding-top: 10px;
    }
  }

  .sub-title {
    margin: 4px 10px;
    font-size: 16px;
  }
  .colorPicker {
    display: inline-block;
    margin: 0 10px;
  }
}
</style>
