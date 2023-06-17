// 体积聚光灯

import { MovingHead } from './moving_head.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // 控制器
import { TWEEN } from "three/examples/jsm/libs/tween.module.min"; // 补间动画
import { getWorldPositionByName } from '../function/utils';

const threeDom: Ref<HTMLElement | null> = ref(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;

let t = new THREE.Vector3();
let la = new THREE.Vector3();
let mesh: THREE.Mesh;
let movingHead1: MovingHead;
let movingHead2: MovingHead;
let movingHead3: MovingHead;
let movingHead4: MovingHead;

export const initSpotLight = async (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => {

  // controls = new OrbitControls(camera, renderer.domElement);

  const textureLoader = new THREE.TextureLoader();
  const [texture] = await Promise.all([textureLoader.load('/visualizer/textures/environment/checkerboard_default.jpg')]);

  // let planeGeom = new THREE.PlaneGeometry(30, 30);
  // planeGeom.translate(0, 1, 0);

  // let planeMat = new THREE.MeshBasicMaterial({
  //   map: texture,
  //   side: THREE.DoubleSide,
  //   transparent: true,
  //   opacity: 1,
  //   // color: 0x00ff00,
  // });
  // mesh = new THREE.Mesh(planeGeom, planeMat);
  // mesh.position.set(0, 0, 0);
  // mesh.rotateX(Math.PI * 0.5);
  // scene.add(mesh);

  // lights
  // const alight = new THREE.AmbientLight(0xffffff);
  // alight.intensity = 0.9;
  // scene.add(alight);

  // const light = new THREE.PointLight(0xffffff, 1, 40);
  // light.intensity = 0.9;
  // light.position.set(0, 20, 0);
  // scene.add(light);

  const spotLightArray = [
    {
      minAngle: 0.0,
      maxAngle: 180.0,
      minTilt: 0.0,
      maxTilt: 0.9,
      minPan: 0.0,
      maxPan: 0.7,
      color: 'red',
      colorTemp: 800,
      intensity: 0.7,
      pan: 0.7,
      tilt: 0.1,
      goboWheel: [],
      colorWheel: [],
      mainScene: scene,
      angle: 10, // 聚光的角度
      tiltFine: 0,// 中间倾斜的角度
      panFine: 0,// 盘旋转的角度
      strobeFrequency: 20, // 脉冲
      position: new THREE.Vector3(8.35, 3.56, 2.06),
      rotation: new THREE.Vector3(4.74, 0, 1.6),
      instance: movingHead1,
    },
    {
      minAngle: 0.0,
      maxAngle: 180.0,
      minTilt: 0.0,
      maxTilt: 0.9,
      minPan: 0.0,
      maxPan: 0.7,
      color: 'red',
      colorTemp: 800,
      intensity: 0.7,
      pan: 0.7,
      tilt: 0.1,
      goboWheel: [],
      colorWheel: [],
      mainScene: scene,
      angle: 10, // 聚光的角度
      tiltFine: 0,// 中间倾斜的角度
      panFine: 0,// 盘旋转的角度
      strobeFrequency: 20, // 脉冲
      position: new THREE.Vector3(4.87, 3.56, -8.71),
      rotation: new THREE.Vector3(4.74, 0, 3.12),
      instance: movingHead2,
    },
    {
      minAngle: 0.0,
      maxAngle: 180.0,
      minTilt: 0.0,
      maxTilt: 0.9,
      minPan: 0.0,
      maxPan: 0.7,
      color: 'red',
      colorTemp: 800,
      intensity: 0.7,
      pan: 0.7,
      tilt: 0.1,
      goboWheel: [],
      colorWheel: [],
      mainScene: scene,
      angle: 10, // 聚光的角度
      tiltFine: 0,// 中间倾斜的角度
      panFine: 0,// 盘旋转的角度
      strobeFrequency: 20, // 脉冲
      position: new THREE.Vector3(-8.60, 3.56, -2.65),
      rotation: new THREE.Vector3(4.74, 0, 4.72),
      instance: movingHead3,
    },
    {
      minAngle: 0.0,
      maxAngle: 180.0,
      minTilt: 0.0,
      maxTilt: 0.9,
      minPan: 0.0,
      maxPan: 0.7,
      color: 'red',
      colorTemp: 800,
      intensity: 0.7,
      pan: 0.7,
      tilt: 0.1,
      goboWheel: [],
      colorWheel: [],
      mainScene: scene,
      angle: 10, // 聚光的角度
      tiltFine: 0,// 中间倾斜的角度
      panFine: 0,// 盘旋转的角度
      strobeFrequency: 20, // 脉冲
      position: new THREE.Vector3(0.06, 3.56, 8.36),
      rotation: new THREE.Vector3(4.74, 0, 3.15),
      instance: movingHead4,
    }
  ]

  const debugIndex = -4;
  const debugName = `聚光灯位置${debugIndex}`;

  spotLightArray.forEach((data, index) => {
    // 创建聚光灯实例
    data.instance = new MovingHead(data);
    MovingHead.prepareInstanciation(camera, scene);
    // const sp1 = getWorldPositionByName('聚光灯位置1');
    // data.instance.position = getWorldPositionByName('聚光灯位置1');
    // const matrix = new THREE.Matrix4();
    // matrix.setPosition(new THREE.Vector3(8.35, 3.56, 2.06));
    // data.instance.applyMatrix4(matrix);
    index === (debugIndex - 1) && (data.instance.position = getWorldPositionByName(debugName));
    index != (debugIndex - 1) && (data.instance.position = data.position);
    data.instance.rotation = data.rotation;
    data.instance.angle = data.angle; // 聚光的角度
    data.instance.tiltFine = data.tiltFine; // 中间倾斜的角度
    data.instance.panFine = data.panFine; // 盘旋转的角度
    data.instance.strobeFrequency = data.strobeFrequency; // 脉冲
    // data.instance.shutter = 1.2; // 脉冲

    data.instance.controlIntensityYoyo();

    index === (debugIndex - 1) && data.instance.debug();
  });

  // movingHead.highlighted = true; // 定位高亮

  render();
};
const clock = new THREE.Clock();
const render = () => {
//   // 加载渲染器 tankCamera targetCamera
//   renderer.render(scene, camera);
//   // 开始动画
//   TWEEN.update();
  MovingHead.update(clock.getDelta());
  requestAnimationFrame(render);
};

