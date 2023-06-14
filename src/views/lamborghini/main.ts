
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // 控制器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // gltf加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { vertexShader } from '../shaders/bloomShaders/vertex'
import { fragmentShader } from '../shaders/bloomShaders/fragment'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { ObjectKeys } from '@/utils/interface';

import { createGUI, createMainStageGUI } from "./gui";

import { TWEEN } from "three/examples/jsm/libs/tween.module.min"; // 补间动画 
let scback = {
  bloomOn: new THREE.Color(0x000000),
  bloomOff: new THREE.Color(0x333333) // or define something else, a cubetexture, for example.
}
interface LoadManager {
  name: string,
  schedule: number,
  success: boolean,
  showMask: boolean,
  total: number, // 总共加载的资源数(从默认加载器得知)
}

const params = {
  exposure: 1,
  bloomStrength: 1.3,
  bloomThreshold: 0,
  bloomRadius: 1,
  scene: 'Scene with Glow',
};
const ENTIRE_SCENE = 0;
const BLOOM_SCENE = 1;
// 设置图层属性.当mesh的图层mask和摄像机的mask一样才会被渲染出来
const bloomLayer = new THREE.Layers();
bloomLayer.set(BLOOM_SCENE);
const darkMaterial = new THREE.MeshBasicMaterial({ color: 'black' });
let materials: ObjectKeys = {};
let darkMaterials: ObjectKeys = {};


export class MainThreeSetup {
  container: HTMLDivElement | Document["body"] | undefined;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  controls!: OrbitControls;
  controlChange!: boolean;
  loadManager!: LoadManager;
  hdrEnvironmentTexture!: THREE.Texture; // 环境hdr
  textureFlare0!: THREE.Texture; // 车灯光斑
  textureFlare3!: THREE.Texture;
  carModel!: THREE.Object3D;
  boothModel!: THREE.Object3D;

  loadEvent: CustomEvent; // 加载进度
  bloomPass!: UnrealBloomPass;
  finalComposer!: EffectComposer;
  bloomComposer!: EffectComposer;

  constructor(domId?: string) {
    // 自定义事件
    this.loadEvent = new CustomEvent('loadEvent', {
      detail: { progress: this.loadManager }, // 初始值为空
    });
    this.loadManager = {
      name: '',
      schedule: 0,
      success: false,
      showMask: true,
      total: 26, // 总共加载的资源数(从默认加载器得知)
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.autoClear = false;
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    // this.renderer.shadowMap.enabled = true;
    // this.renderer.shadowMap.needsUpdate = true;
    // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    // this.renderer.setAnimationLoop(()=>this.setAnimationLoop);
    // this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // this.renderer.toneMappingExposure = 0.25; // 可以改变曝光度从而改变hdr贴图亮度，需要重新渲染

    if (domId) {
      this.container = document.getElementById(domId) as HTMLDivElement;
      this.container.appendChild(this.renderer.domElement);
    } else {
      this.renderer.domElement.style.position = 'absolute';
      this.renderer.domElement.style.zIndex = '2';
      this.container = document.body;
      document.body.appendChild(this.renderer.domElement);
    }

    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    this.camera.position.set(-40, 20, 40);

    this.scene = new THREE.Scene();
    // 场景有雾气和背景色不为黑色影响辉光效果
    // this.scene.fog = new THREE.Fog(0x333333, 15, 20);
    // this.scene.background = new THREE.Color(0x333333);

    this.initControl();

    this.loadProgress();

    this.animate();
    // this.loadResource();

    window.addEventListener("resize", () => this.onWindowResize());

  };

  initControl() {
    this.controlChange = false;
    this.container && (this.controls = new OrbitControls(this.camera, this.container));
    this.controls.enableDamping = true;
    // this.controls.maxDistance = 10; // 设置相机距离原点的最远距离
    // this.controls.maxPolarAngle = 1.55;
    // this.controls.minDistance = 1; // 设置相机距离原点的最远距离
    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
    // this.controls.addEventListener('change', () => {
    //   this.controlChange = true;
    // });
    // this.controls.addEventListener('end', () => {
    //   this.controlChange = false;
    // });
  }
  onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.calcBoundingBox();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };
  async loadResource() {
    const textureLoader = new THREE.TextureLoader().setPath("/textures/lensflare/");
    const rgbeLoader = new RGBELoader().setPath("/textures/equirectangular/");
    const gltfLoader = new GLTFLoader().setPath("/models/");
    const dracoLoader = new DRACOLoader().setDecoderPath("/draco/");
    dracoLoader.setDecoderConfig({ type: "js" }); //使用兼容性强的draco_decoder.js解码器
    dracoLoader.preload();
    gltfLoader.setDRACOLoader(dracoLoader);

    const [texture, boothGltf, gltf, textureFlare0, textureFlare3] =
      await Promise.all([
        rgbeLoader.loadAsync("venice_sunset_1k.hdr"),
        gltfLoader.loadAsync("车展台压缩.glb"),
        gltfLoader.loadAsync("兰博基尼碳纤维大牛压缩.glb"),
        textureLoader.load("yJqeRxDXpr.png"),
        textureLoader.load("lensflare3.png"),
      ]);

    // 反射镜像
    const hdrEquirect = texture;
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;

    this.textureFlare0 = textureFlare0;
    this.textureFlare3 = textureFlare3;

    // carStore.source.texture.textureFlare0 = textureFlare0;
    // carStore.source.texture.textureFlare3 = textureFlare3;
    // carStore.carModel = gltf.scene;
    this.hdrEnvironmentTexture = texture;
    // hdrTexture = texture;
    this.scene.environment = texture;
    this.scene.environment.mapping = THREE.EquirectangularReflectionMapping;

    // 车
    this.carModel = gltf.scene;
    // 解决双面渲染时通过挡风玻璃看向2边车门玻璃出现不透明黑块(但在升起车门动画后要设置成双面渲染)
    const carGlass = this.carModel.getObjectByName('挡风玻璃') as THREE.Mesh;
    carGlass.material instanceof THREE.Material && (carGlass.material.side = THREE.FrontSide);

    const testMesh = boothGltf.scene.getObjectByName('顶部灯路') as THREE.Mesh;
    
    // const darkMaterial2 = new THREE.MeshLambertMaterial({ color: 'blue' });
    testMesh.material.fog = false;
    testMesh.material.roughness = 0.1;
    testMesh.receiveShadow = false;
    const infoContainer = document.getElementById(
      "gui-container"
    ) as HTMLDivElement;
    createGUI({ container: infoContainer });
    createMainStageGUI({material: testMesh.material});
    // debugger
    


    // 展台
    this.boothModel = boothGltf.scene;
    this.boothModel.scale.set(1.2, 1.2, 1.2);
    const boothGroup = this.boothModel.getObjectByName("车承台父节点");
    boothGroup?.add(this.carModel);
    this.scene.add(this.boothModel);

    // 后期处理渲染器通道
    const renderScene = new RenderPass(this.scene, this.camera);

    // 抗锯齿
    let fxaaPass = new ShaderPass(FXAAShader);
    // const copyPass = new ShaderPass(CopyShader);

    // 第一次使用辉光渲染
    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    this.bloomPass.threshold = params.bloomThreshold;
    this.bloomPass.strength = params.bloomStrength;
    this.bloomPass.radius = params.bloomRadius;
    this.bloomPass.needsSwap = true;
    

    const parameters = {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
      // type: THREE.FloatType,
      encoding: THREE.sRGBEncoding
    };

    const renderTarget = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, parameters );


    // 效果创造器(混合渲染器通道、辉光通道)
    this.bloomComposer = new EffectComposer(this.renderer);
    this.bloomComposer.renderToScreen = false; // true将处理的结果保存到帧缓冲区，false直接显示在canvas画布上面
    this.bloomComposer.addPass(renderScene);
    this.bloomComposer.addPass(this.bloomPass);

    const pixelRatio = this.renderer.getPixelRatio(); // 获取设备像素比，高清屏不会太模糊
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
    fxaaPass.renderToScreen = false;

    // 着色器通道
    const finalPass = new ShaderPass(
      new THREE.ShaderMaterial({
        uniforms: {
          baseTexture: { value: null },
          bloomTexture: { value: this.bloomComposer.renderTarget2.texture },
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        defines: {},
        precision: 'lowp',
      }),
      'baseTexture',
    );
    finalPass.needsSwap = true;

    

    // let renderTarget = new THREE.WebGLRenderTarget
    //   (
    //     window.innerWidth,
    //     window.innerHeight,
    //     {
    //       minFilter: THREE.LinearFilter,
    //       magFilter: THREE.LinearFilter,
    //       format: THREE.RGBAFormat,
    //       encoding: THREE.sRGBEncoding
    //     }
    //   )

    this.finalComposer = new EffectComposer(this.renderer, renderTarget);
    // this.finalComposer = new EffectComposer(this.renderer);
    this.finalComposer.addPass(renderScene);
    this.finalComposer.addPass(fxaaPass);
    // smaaPass = new SMAAPass();
    // this.finalComposer.addPass(smaaPass);
    this.finalComposer.addPass(finalPass);

    this.boothModel.traverse((child: THREE.Object3D) => {
      if (['WellLeft001', 'Top001'].includes(child.name)) {
        child.layers.enable(BLOOM_SCENE);
      }
    });

    this.calcBoundingBox();
  }
  darkenNonBloomed(obj: THREE.Object3D) {
    if (obj instanceof THREE.Mesh && bloomLayer.test(obj.layers) === false) {

      // if (obj.name.includes('镜头光晕')) {
      //   debugger
      //   obj.material = new THREE.MeshStandardMaterial({transparent: true});
      // }
      materials[obj.uuid] = obj.material;
      obj.material = darkMaterial;

    //   materials[obj.uuid] = obj.material;
    //   if (!darkMaterials[obj.material.type]) {const material = obj.material.clone();
    //     material.color = new THREE.Color(0x000000);
    //     darkMaterials[obj.material.type] = material;
    //   }
    //   obj.material = darkMaterials[obj.material.type];
      
    // }
    // if (obj.name === '测试灯具2') {
    //   debugger
    // }
    }
  };

  restoreMaterial(obj: THREE.Object3D) {
    if (obj instanceof THREE.Mesh && materials[obj.uuid]) {
      obj.material = materials[obj.uuid];
      // 镜头光晕Mesh-右车灯光晕点
      // if (obj.name.includes('光晕')) {
      //   debugger
      //   obj.material = new THREE.MeshStandardMaterial({color: '#ff0000', opacity: 0, transparent: true, depthTest: false, depthWrite: false});
      // }
      delete materials[obj.uuid];
    }
  };
  // 进度管理
  loadProgress() {
    THREE.DefaultLoadingManager.onProgress = async (url, loaded, total) => {
      console.log("total", total);
      // console.log('进度', Math.floor((loaded / loadManager.value.total) * 100));
      let loadingType = url.split(".");
      this.loadManager.name = loadingType[loadingType.length - 1];
      if (Math.floor((loaded / this.loadManager.total) * 100) === 100) {
        this.loadManager.schedule = 100;
      } else {
        // 这里不用回调里的total是因为模型压缩成bin后再解压后资源数量会变化
        this.loadManager.schedule = Math.floor(
          (loaded / this.loadManager.total) * 100
        );
      }
      this.updateProgress();
    };
  }
  calcBoundingBox() {
    if (this.carModel) {
      let box3 = new THREE.Box3();
      // 模型model是加载一个三维模型返回的对象，包含多个网格模型
      box3.expandByObject(this.carModel);
      // 计算一个层级模型对应包围盒的几何体中心在世界坐标中的位置
      let center = new THREE.Vector3();
      box3.getCenter(center);
      // 重新设置模型的位置，使之居中。
      this.carModel.position.x = this.carModel.position.x - center.x;
      this.carModel.position.z = this.carModel.position.z - center.z;
    }
  };
  // 必须手动调用
  setAnimationLoop(renderFunction: XRFrameRequestCallback) {
    this.renderer.setAnimationLoop(renderFunction);
  };
  animate() {
    // this.scene.background = scback.bloomOn; // must be pure black
    this.controls.update();
    TWEEN?.update();
    // stats?.update();

    // 递归是因为选择性辉光
    this.boothModel?.traverse((o) => this.darkenNonBloomed(o));
    this.bloomComposer?.render();
    this.boothModel?.traverse((o) => this.restoreMaterial(o));
    this.finalComposer?.render();

    // this.renderer?.render(this.scene, this.camera);
    // this.scene.background = scback.bloomOff; // must be pure black



    requestAnimationFrame(this.animate.bind(this));
  };
  renderFunction() {
    this.renderer?.render(this.scene, this.camera);
    this.finalComposer?.render();
  }
  // 事件触发
  updateProgress() {
    // 更新自定义事件的 detail 属性值
    this.loadEvent.detail.progress = this.loadManager;

    // 触发自定义事件
    window.dispatchEvent(this.loadEvent);
  }
  test222() {
    this.finalComposer?.render();
  }
}