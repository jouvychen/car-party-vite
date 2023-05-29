
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // 控制器
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"; // gltf加载器
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

interface LoadManager {
  name: string,
  schedule: number,
  success: boolean,
  showMask: boolean,
  total: number, // 总共加载的资源数(从默认加载器得知)
}

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
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.85; // 可以改变曝光度从而改变hdr贴图亮度，需要重新渲染

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
    this.scene.fog = new THREE.Fog(0x333333, 15, 20);
    this.scene.background = new THREE.Color(0x333333);

    this.initControl();

    this.loadProgress();
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
        textureLoader.load("lensflare0.png"),
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

    // 展台
    this.boothModel = boothGltf.scene;
    this.boothModel.scale.set(1.2, 1.2, 1.2);
    const boothGroup = this.boothModel.getObjectByName("车承台父节点");
    boothGroup?.add(this.carModel);
    this.scene.add(this.boothModel);

    this.calcBoundingBox();
  }
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
  // 事件触发
  updateProgress() {
    // 更新自定义事件的 detail 属性值
    this.loadEvent.detail.progress = this.loadManager;

    // 触发自定义事件
    window.dispatchEvent(this.loadEvent);
  }
}