import * as THREE from 'three';
interface ObjectKey {
  [key: string]: any;
}

// 过渡动画对象类型
interface Transition {
  vsSource: string,
  fsSource: string,
  assignmentList: any[],
  intervalTime?: number,
}

// index.ts中动态导入的过渡动画返回Promise所需类型
interface TransitionObj {
  [key: string]: Transition;
}

/**
* index.ts interface
*/
// 需要赋值给自定义uniform的参数
interface AssignmentList {
  key: string,
  value: number[],
}

interface ParentDom {
  domId: string,
  width?: string | number | undefined,
  height?: string | number | undefined,
}

export class WebglTransitions {
  private loadImageSelf = false;
  private numberOfLostContext = 0;
  private analogLossContentCounts = 0;
  private parent: ParentDom = { domId: '', width: undefined, height: undefined };
  private parentId: string = '';
  private canvasId: string = '';
  private canvas: HTMLCanvasElement | null = null;
  private vsSource = '';
  private fsSource = '';
  private assignmentList: AssignmentList[] = [];
  private textures: WebGLTexture[] = [];
  private playIndex = 0;
  private transitionList: Transition[];
  private playPicIndex = 0; // 轮播次数
  private carouselTime: number; // 轮播间隔时间, 单位ms
  private playPicList: string[] = []; // 轮播图片
  private playPicPreloadList: HTMLImageElement[] = []; // 轮播图片预加载存储列表
  private stopPlaying = false;
  private shaderMaterial: THREE.ShaderMaterial | null = null;
  private vertexBuffer: THREE.BufferGeometry | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private clock: THREE.Clock | null = null;

  constructor(
    parent: ParentDom,
    transitionList: Transition[],
    playPicList: string[],
    carouselTime?: number
  ) {
    this.checkInitResource(parent.domId, transitionList);
    this.canvasId = `webgl-transition-${Math.random().toString().slice(2, 10)}`;
    this.parentId = parent.domId;
    this.parent.domId = parent.domId;
    this.parent.width = typeof parent.width === 'string' ? Number(parent.width) : parent.width;
    this.parent.height = typeof parent.height === 'string' ? Number(parent.height) : parent.height;

    this.canvas = document.createElement('canvas');
    this.canvas.id = this.canvasId;
    const parentDom = document.querySelector(parent.domId);

    if (this.parent.width && this.parent.height) {
      const { clientWidth, clientHeight } = { clientWidth: this.parent.width, clientHeight: this.parent.height };
      this.canvas.width = clientWidth;
      this.canvas.height = clientHeight;
    } else {
      const { clientWidth, clientHeight } = parentDom ? parentDom : { clientWidth: 1920, clientHeight: 1080 };
      this.canvas.width = clientWidth;
      this.canvas.height = clientHeight;
    }
    document.querySelector(parent.domId)?.appendChild(this.canvas);

    let that = this;
    this.canvas.addEventListener(
      'webglcontextlost',
      function (event) {
        console.log('WebGL上下文丢失');

        // inform WebGL that we handle context restoration
        // 通知WebGL我们处理上下文恢复
        event.preventDefault();
        console.log('3秒后重新渲染');

        setTimeout(() => {
          // that.restart();
        }, 3000);

        // Stop rendering
        // window.cancelAnimationFrame(requestId);
      },
      false
    );

    this.transitionList = transitionList;
    if (carouselTime) {
      this.carouselTime = carouselTime;
    } else {
      this.carouselTime = 5000; // 默认轮播间隔时间为5秒
    }

    if (playPicList.length === 0) {
      throw new Error('playPicList不能为空！');
    }

    this.playPicList = playPicList;

    // 预加载轮播图片
    if (playPicList[0] instanceof HTMLImageElement) {
      this.playPicPreloadList = playPicList as HTMLImageElement[];
      this.loadImageSelf = true;
    } else {
      this.playPicPreloadList = [];
      playPicList.forEach((src) => {
        const image = new Image();
        image.src = src;
        this.playPicPreloadList.push(image);
      });
    }

    // 初始化渲染器
    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.width, this.canvas.height);

    // 创建场景
    this.scene = new THREE.Scene();

    // 创建相机
    this.camera = new THREE.PerspectiveCamera(45, this.canvas.width / this.canvas.height, 0.1, 100);
    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(this.scene.position);

    // 创建时钟
    this.clock = new THREE.Clock();

    // 加载着色器源代码
    this.vsSource = `
      attribute vec3 position;
      attribute vec2 uv;
      varying vec2 vUv;
      
      void main() {
        gl_Position = vec4(position, 1.0);
        vUv = uv;
      }
    `;

    this.fsSource = `
      precision highp float;
      uniform sampler2D texture1;
      uniform sampler2D texture2;
      uniform float progress;
      varying vec2 vUv;
      
      void main() {
        vec4 texel1 = texture2D(texture1, vUv);
        vec4 texel2 = texture2D(texture2, vUv);
        gl_FragColor = mix(texel1, texel2, progress);
      }
    `;

    // 创建着色器材质
    this.shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        texture1: { value: null },
        texture2: { value: null },
        progress: { value: 0 },
      },
      vertexShader: this.vsSource,
      fragmentShader: this.fsSource,
    });

    // 创建顶点缓冲区
    this.vertexBuffer = new THREE.BufferGeometry();
    const positions = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0]);
    const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);
    this.vertexBuffer.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.vertexBuffer.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    // 创建网格对象
    const mesh = new THREE.Mesh(this.vertexBuffer, this.shaderMaterial);
    this.scene.add(mesh);

    // 加载纹理
    this.loadTextures();

    // 开始渲染
    this.animate();
  }

    private checkInitResource(domId: string, transitionList: Transition[]) {
      const canvas = document.getElementById(domId) as HTMLCanvasElement;
      if (!canvas) {
        throw new Error(`找不到id为${domId}的canvas元素！`);
      }
  
      if (!transitionList || transitionList.length === 0) {
        throw new Error('transitionList不能为空！');
      }
  
      this.canvas = canvas;
      this.transitionList = transitionList;
  
      // 初始化资源
      this.initResources();
    }
  
    private loadTextures() {
      const loader = new THREE.TextureLoader();
  
      const texturePromises = this.playPicPreloadList.map((image) => {
        return new Promise<THREE.Texture>((resolve) => {
          loader.load(image.src, (texture) => {
            resolve(texture);
          });
        });
      });
  
      Promise.all(texturePromises).then((textures) => {
        this.textures = textures;
  
        // 设置材质的纹理
        this.shaderMaterial.uniforms.texture1.value = this.textures[0];
        this.shaderMaterial.uniforms.texture2.value = this.textures[1];
  
        // 开始轮播
        this.startCarousel();
      });
    }
  
    private startCarousel() {
      let currentIndex = 0;
      let nextIndex = 1;
      let startTime = this.clock.getElapsedTime();
  
      const animate = () => {
        requestAnimationFrame(animate);
  
        const elapsedTime = this.clock.getElapsedTime();
        const progress = (elapsedTime - startTime) / this.transitionList[currentIndex].duration;
  
        // 切换到下一张图片
        if (progress >= 1) {
          currentIndex = nextIndex;
          nextIndex = (nextIndex + 1) % this.textures.length;
          startTime = elapsedTime;
        }
  
        // 更新材质的纹理和进度
        this.shaderMaterial.uniforms.texture1.value = this.textures[currentIndex];
        this.shaderMaterial.uniforms.texture2.value = this.textures[nextIndex];
        this.shaderMaterial.uniforms.progress.value = progress;
  
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
      };
  
      animate();
    }
  }
  