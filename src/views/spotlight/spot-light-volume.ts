// 体积聚光灯

import { MovingHead } from './moving_head.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'; // 控制器
import { TWEEN } from "three/examples/jsm/libs/tween.module.min"; // 补间动画

const threeDom: Ref<HTMLElement | null> = ref(null);
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let controls: OrbitControls;

let t = new THREE.Vector3();
let la = new THREE.Vector3();
let mesh: THREE.Mesh;
let movingHead: MovingHead;

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

  let data = {
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
  };

  // 创建聚光灯实例
  movingHead = new MovingHead(data);
  MovingHead.prepareInstanciation(camera, scene);
  movingHead.position = new THREE.Vector3(0, 2, 0);
  movingHead.angle = 10; // 聚光的角度
  movingHead.tiltFine = 45; // 中间倾斜的角度
  movingHead.panFine = 45; // 盘旋转的角度
  movingHead.strobeFrequency = 20; // 脉冲
  // movingHead.shutter = 1.2; // 脉冲

  movingHead.controlIntensityYoyo();

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

