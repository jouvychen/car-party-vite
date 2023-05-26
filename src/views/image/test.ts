
import * as THREE from 'three';
import { Transition } from '@/utils/interface'
import { isArrayOfStrings } from '@/utils/common';

const textureLoader = new THREE.TextureLoader();
// https://www.khronos.org/webgl/wiki/HandlingContextLost#:~:text=By%20default%20when%20a%20WebGL%20program%20loses%20the,canvas%20%3D%20document.getElementById%20%28%22myCanvas%22%29%3B%20canvas.addEventListener%20%28%22webglcontextlost%22%2C%20function%20

// https://registry.khronos.org/webgl/specs/latest/1.0/#5.15.3

export class WebglTransitions {
  private loadImageSelf = false;
  public vsSource = '';
  public fsSource = '';
  public textures: WebGLTexture[] = [];
  public playIndex = 0;
  public playPicIndex = 0; // 轮播次数
  public transitionList: Transition[];
  public carouselTime: number; // 轮播间隔时间, 单位ms
  public playPicList: string[] = []; // 轮播图片
  public playPicPreloadList: HTMLImageElement[] = []; // 轮播图片预加载存储列表
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private mesh!: THREE.Mesh;
  private shaderMaterial!: THREE.ShaderMaterial;
  private clock!: THREE.Clock;
  private progress = 0;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, mesh: THREE.Mesh, clock: THREE.Clock, transitionList: Transition[], playPicList: string[], carouselTime?: number) {
    this.checkInitResource(scene, camera, renderer, mesh, clock, transitionList, playPicList);
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.mesh = this.mesh ?? mesh;
    this.clock = this.clock ?? clock;
    this.transitionList = transitionList;

    // 判断加载图片的方式
    if (isArrayOfStrings(playPicList)) {
      // 用户传入的是在线图片的字符串数组
      this.playPicList = playPicList;
    } else {
      // 用户传入的是HTMLImageElement数组
      this.pasteImage(playPicList);
    }
    this.carouselTime = carouselTime || 3000;
  };

  // 用户自定义图片加载, 传入Image对象数组
  pasteImage(imagesList: HTMLImageElement[]) {
    this.loadImageSelf = true;
    this.playPicPreloadList = imagesList;
  }

  startCarousel() {

    // 设置材质的纹理
    this.shaderMaterial.uniforms.u_Sampler.value = this.textures[0];
    this.shaderMaterial.uniforms.u_Sampler1.value = this.textures[1];
    this.mesh.material = this.shaderMaterial;

    const animate = () => {

      requestAnimationFrame(animate);
      // 更新进度
      this.progress += 0.02;

      this.shaderMaterial.uniforms.progress.value = this.progress;

      // 切换到下一张图片(progress只能是1)
      if (this.progress >= 1) {

        this.progress = 0;

        if (this.playPicIndex === this.playPicPreloadList.length - 1) {
          this.playPicIndex = 0;
        } else {
          this.playPicIndex += 1;
        }

        if (this.playIndex === this.transitionList.length - 1) {
          this.playIndex = 0;
        } else {
          this.playIndex += 1;
        }

        const transition = this.transitionList[this.playIndex];
        this.vsSource = transition.vsSource;
        this.fsSource = transition.fsSource;

        if (this.playIndex % 2 === 0) {
          this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
              u_Sampler: { value: null }, // 设置为纹理
              u_Sampler1: { value: null }, // 设置为纹理
              progress: { value: 0.0 },

              scale: { value: 10.0 },
              smoothness: { value: 0.01 },
              seed: { value: 40.9898 },
              shadow_colour: { value: new THREE.Vector4(0, 0, 0, 1) },
              shadow_height: { value: 0.0 },
              bounces: { value: 0.0 },

            },
            vertexShader: this.vsSource,
            fragmentShader: this.fsSource,
          });
        } else {
          this.shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
              u_Sampler: { value: null }, // 设置为纹理
              u_Sampler1: { value: null }, // 设置为纹理
              progress: { value: 0.0 },
              size: { value: 0.04 },
              zoom: { value: 50.0 },
              colorSeparation: { value: 0.3 },
            },
            vertexShader: this.vsSource,
            fragmentShader: this.fsSource,
          });
        }

        // 更新材质的纹理和进度
        this.shaderMaterial.uniforms.u_Sampler.value = this.textures[this.playPicIndex];
        this.shaderMaterial.uniforms.u_Sampler1.value = this.textures[this.playPicIndex + 1 === this.playPicPreloadList.length ? 0 : this.playPicIndex + 1];

        this.mesh.material = this.shaderMaterial;

        return 0;

      }

      // 渲染场景
      this.renderer?.render(this.scene, this.camera);

    };

    animate();
  }

  async main() {
    const transition = this.transitionList[this.playIndex];
    this.vsSource = transition.vsSource;
    this.fsSource = transition.fsSource;
    this.initShaderProgram();

    // 只初始化获取一次图片资源
    if (!this.loadImageSelf) {
      await this.asyncLoadImage();
      // 创建纹理贴图
      await this.asyncCreateTextures();
    }

    // 开始轮播
    this.startCarousel();


  }

  initShaderProgram() {
    // 创建着色器材质
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        u_Sampler: { value: null }, // 设置为纹理
        u_Sampler1: { value: null }, // 设置为纹理
        progress: { value: 0.0 },

        scale: { value: 10.0 },
        smoothness: { value: 0.01 },
        seed: { value: 40.9898 },
        shadow_colour: { value: new THREE.Vector4(0, 0, 0, 1) },
        shadow_height: { value: 0.0 },
        bounces: { value: 0.0 },

      },
      vertexShader: this.vsSource,
      fragmentShader: this.fsSource,
    });
  }

  asyncLoadImage() {
    // 遍历数组的路径，预加载到浏览器中
    return new Promise((resolve: any) => {
      for (let i = 0, l = this.playPicList.length; i < l; i++) {
        const img = new Image();
        img.src = this.playPicList[i];
        img.setAttribute('crossOrigin', 'Anonymous');
        img.onload = () => {
          this.playPicPreloadList.push(img);
          if (this.playPicPreloadList.length === this.playPicList.length) {
            resolve(1);
          }
        };
      }
    });
  }

  asyncCreateTextures() {

    const loader = new THREE.TextureLoader();

    return new Promise<Number>((resolve: any) => {
      for (let i = 0, l = this.playPicPreloadList.length; i < l; i++) {
        loader.load(this.playPicPreloadList[i].src, (texture) => {

          // 设置纹理的旋转中心为其自身中心
          texture.center.set(0.5, 0.5);

          // 禁用纹理的 Y 轴反转
          texture.flipY = false;

          // 更新纹理
          texture.needsUpdate = true;

          this.textures.push(texture);
          if (this.textures.length === l) {
            resolve(1);
          }

        });
      }
    });

  }

  // 初始化校验
  checkInitResource(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, mesh: THREE.Mesh, clock: THREE.Clock, transitionList: Transition[], playPicList: string[]) {
    // scene
    if (!scene || !(scene instanceof THREE.Scene)) {
      throw new Error('初始化失败, 缺少scene');
    }

    // camera
    if (!camera) {
      throw new Error('初始化失败, 缺少camera');
    }
    if (!(camera instanceof THREE.PerspectiveCamera)) {
      throw new Error('初始化失败, camera不是THREE.PerspectiveCamera类型');
    }

    // renderer
    if (!renderer || !(renderer instanceof THREE.WebGLRenderer)) {
      throw new Error('初始化失败, 缺少renderer');
    }

    // mesh
    if (!mesh) {
      const geo = new THREE.PlaneGeometry(16, 9);
      const material = new THREE.MeshStandardMaterial({ color: '#ffffff', side: THREE.DoubleSide })
      this.mesh = new THREE.Mesh(geo, material);
    }
    if (!(mesh instanceof THREE.Mesh)) {
      throw new Error('初始化失败, mesh不是网格THREE.Mesh类型');
    }

    // clock
    if (!clock) {
      this.clock = new THREE.Clock();
    }
    if (!(clock instanceof THREE.Clock)) {
      throw new Error('初始化失败, clock不是网格THREE.Clock类型');
    }

    // transitionList
    if (transitionList?.length < 1) {
      throw new Error('初始化失败, 至少需要1种转场动画');
    }

    // playPicList
    if (playPicList?.length === 0) {
      throw new Error('初始化失败, 缺少参数playPicList转场图片');
    } else if (playPicList?.length < 2) {
      throw new Error('至少需要2张图片');
    }
  }
}