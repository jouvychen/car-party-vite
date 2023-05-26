import * as THREE from 'three';
import RULE from './rules';
import { Transition, AssignmentList, ParentDom } from './interface'
import { isArrayOfStrings } from './utils';

const textureLoader = new THREE.TextureLoader();
// https://www.khronos.org/webgl/wiki/HandlingContextLost#:~:text=By%20default%20when%20a%20WebGL%20program%20loses%20the,canvas%20%3D%20document.getElementById%20%28%22myCanvas%22%29%3B%20canvas.addEventListener%20%28%22webglcontextlost%22%2C%20function%20

// https://registry.khronos.org/webgl/specs/latest/1.0/#5.15.3

export class WebglTransitions {
  private loadImageSelf = false;
  private numberOfLostContext = 0;
  private analogLossContentCounts = 0;
  private parent: ParentDom = { domId: '', width: undefined, height: undefined };
  private parentId: string = '';
  private canvasId: string = '';
  private canvas: HTMLCanvasElement | null = null;
  private vertexShader: WebGLShader | null = null;
  private fragmentShader: WebGLShader | null = null;
  public firstInit = true;
  public timer: NodeJS.Timeout | undefined | null = undefined;
  public intervalTime = 100; // 过渡动画多少毫秒绘制一帧
  public vsSource = '';
  public fsSource = '';
  public textures: WebGLTexture[] = [];
  public playIndex = 0;
  public transitionList: Transition[];
  public playPicIndex = 0; // 轮播次数
  public carouselTime: number; // 轮播间隔时间, 单位ms
  public playPicList: string[] = []; // 轮播图片
  public playPicPreloadList: HTMLImageElement[] = []; // 轮播图片预加载存储列表
  public stopPlaying = false;
  public shaderProgram: WebGLProgram | null = null;
  public vertexBuffer: WebGLBuffer | null = null;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer | null = null;
  private mesh: THREE.Mesh = new THREE.Mesh();
  private shaderMaterial!: THREE.ShaderMaterial;
  private clock!: THREE.Clock;
  private progress = 0;


  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, mesh: THREE.Mesh, clock: THREE.Clock, transitionList: Transition[], playPicList: string[], carouselTime?: number) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    // this.mesh = mesh;
    const g = new THREE.PlaneGeometry(3.26, 2.38);
    // const mesh1 = new THREE.Mesh(g, mesh.material);

    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: '#ffffff',
      opacity: 0,
      // side: THREE.DoubleSide,
      transparent: true,
    });

    this.mesh = mesh;

    // mesh.material = sphereMaterial;

    // this.mesh = new THREE.Mesh(g, mesh.material);

    // mesh.attach(this.mesh);

    // // 获取 mesh 的世界矩阵
    // const worldMatrix = new THREE.Matrix4().copy(mesh.matrixWorld);

    // // 获取 this.mesh 的父级对象的世界矩阵
    // const parentWorldMatrix = new THREE.Matrix4().copy(mesh.matrixWorld);

    // // 计算相对于 this.mesh 的局部矩阵
    // const relativeMatrix = worldMatrix.multiply(parentWorldMatrix.invert());

    // // 将相对矩阵赋值给 this.mesh
    // this.mesh.matrix.copy(relativeMatrix);

    // // 更新 this.mesh 的位置和旋转
    // this.mesh.matrix.decompose(this.mesh.position, this.mesh.quaternion, this.mesh.scale);

    // this.mesh.rotateY(Math.PI * 0.5)

    // // 更新 this.mesh 的世界矩阵
    // this.mesh.updateMatrixWorld(true);

    this.clock = clock;
    this.playPicList = playPicList;
    // this.checkInitResource(parent.domId, transitionList, playPicList);

    this.transitionList = transitionList;
    // if (isArrayOfStrings(playPicList)) {
    //   this.playPicList = playPicList;
    // } else {
    //   this.asyncLoadImageSelf(playPicList);
    // }
    this.carouselTime = carouselTime || 3000;
  };

  // 初始化校验
  checkInitResource(domId: string, transitionList: Transition[], playPicList: string[] | HTMLImageElement[]) {
    if (!domId || typeof domId !== 'string') {
      throw new Error('WebglTransitions初始化失败, 缺少Dom元素ID');
    }
    if (transitionList?.length < 1) {
      throw new Error('WebglTransitions初始化失败, 至少需要1种转场动画');
    }
    if (playPicList?.length === 0) {
      throw new Error('WebglTransitions初始化失败, 缺少参数playPicList转场图片');
    } else if (playPicList?.length < 2) {
      throw new Error('至少需要2张图片');
    }
  }

  asyncLoadImage() {
    // 遍历数组的路径，预加载到浏览器中
    return new Promise((resolve: any) => {
      let c = 0;
      for (let i = 0; i < this.playPicList.length; i++) {
        const img = new Image();

        img.src = this.playPicList[i];
        img.setAttribute('crossOrigin', 'Anonymous');

        img.onload = () => {
          c++;
          this.playPicPreloadList.push(img);
          if (this.playPicPreloadList.length === this.playPicList.length) {
            resolve(1);
          }
        };
      }
    });
  }

  // 自定义图片加载, 需要返回Image的数组
  asyncLoadImageSelf(imagesList: HTMLImageElement[]) {
    this.loadImageSelf = true;
    this.playPicPreloadList = imagesList;
  }

  loadTextures() {
    const loader = new THREE.TextureLoader();

    const texturePromises = this.playPicList.map((image) => {
      return new Promise<THREE.Texture>((resolve) => {
        loader.load(`/textures/${image}`, (texture) => {
          resolve(texture);
        });
      });
    });

    Promise.all(texturePromises).then((textures) => {
      debugger
      this.textures = textures;

      // 设置材质的纹理
      this.shaderMaterial.uniforms.u_Sampler.value = this.textures[0];
      this.shaderMaterial.uniforms.u_Sampler1.value = this.textures[1];
      this.shaderMaterial.uniforms.u_Sampler.value.warpS = this.shaderMaterial.uniforms.u_Sampler.value.warpT = THREE.RepeatWrapping;

      this.mesh.material = this.shaderMaterial;

      // 开始轮播
      this.startCarousel();
    });
  }

  startCarousel() {

    let currentIndex = 0;
    let nextIndex = 1;
    let startTime = this.clock.getElapsedTime();

    const animate = () => {
      // debugger
      requestAnimationFrame(animate);

      const elapsedTime = this.clock.getElapsedTime();
      // debugger;
      // const progress = (elapsedTime - startTime) / (currentIndex + 1);
      this.progress += 0.02;

      // 切换到下一张图片
      if (this.progress >= 1) {
        this.progress = 0;
        currentIndex = nextIndex;
        nextIndex = (nextIndex + 1) % this.textures.length;
        startTime = elapsedTime;

        // 更新材质的纹理和进度
        this.shaderMaterial.uniforms.u_Sampler.value = this.textures[currentIndex];
        this.shaderMaterial.uniforms.u_Sampler1.value = this.textures[nextIndex];

      }

      this.shaderMaterial.uniforms.progress.value = this.progress;

      // 渲染场景
      this.renderer?.render(this.scene, this.camera);
    };

    animate();
    // this.renderer?.render(this.scene, this.camera);
  }

  async main() {

    // 只初始化获取一次图片资源
    // if (!this.loadImageSelf && this.playPicPreloadList.length != this.playPicList.length) {
    //   await Promise.all([this.asyncLoadImage()]);
    // }

    const e = this.transitionList[this.playIndex];
    // console.log('当前动画', this.playIndex, e);
    // console.log('当前动画', e, this.playIndex);

    this.vsSource = e.vsSource;
    this.fsSource = e.fsSource;

    this.intervalTime = e.intervalTime || 100;

    this.initShaderProgram();

    // 绑定材质
    // debugger;
    const aa = new THREE.MeshBasicMaterial({
      alphaTest: 0.5,
      color: 0xff0000
    });
    // this.mesh.material = aa;
    // this.mesh.material = this.shaderMaterial;

    // 加载纹理贴图
    this.loadTextures();
  }

  initShaderProgram() {
    // 创建着色器材质
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        scale: { value: 4.0 },
        smoothness: { value: 0.01 },
        seed: { value: 12.9898 },
        u_Sampler: { value: null }, // 设置为纹理
        u_Sampler1: { value: null }, // 设置为纹理
        shadow_colour: { value: new THREE.Vector4(0, 0, 0, 1) },
        shadow_height: { value: 0.0 },
        bounces: { value: 0.0 },
        progress: { value: 0.0 },
        textureScale: {
          value: new THREE.Vector2(0.5, 0.5),
        },
        textureOffset: {
          value: new THREE.Vector2(0, 0),
        },
      },
      vertexShader: this.vsSource,
      fragmentShader: this.fsSource,
      // side: THREE.DoubleSide,
    });
  }
}