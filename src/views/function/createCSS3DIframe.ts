import { getWorldPositionByName } from '@/utils/threejsUtils';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

import {
  useThreejsModuleStore,
} from "@/store";
const threejsModule = useThreejsModuleStore();

export class CreateCSS3DIframe {
  private static initialized: boolean = false; // 配置设置为单例模式
  public url: string;
  public meshName: string;
  public dom!: HTMLIFrameElement;
  public css3dObject!: CSS3DObject;
  private css3dRenderer!: CSS3DRenderer;

  constructor(url: string, meshName?: string) {
    this.url = url;
    this.meshName = meshName || '';

    // 混合使用静态属性和实例属性
    if (!CreateCSS3DIframe.initialized) {
      CreateCSS3DIframe.initialized = true;
      this.initConfig();
    }

    this.init();
  }

  initConfig() {
    this.css3dRenderer = new CSS3DRenderer();
    this.css3dRenderer.setSize(window.innerWidth, window.innerHeight);
    this.css3dRenderer.domElement.style.position = "absolute";
    this.css3dRenderer.domElement.style.top = '0';
    const container = document.getElementById("container") as HTMLDivElement;
    container.appendChild(this.css3dRenderer.domElement);

    // 更改控制器的domElement
    const css3dElement = this.css3dRenderer.domElement
    threejsModule.controls.domElement = css3dElement;
    threejsModule.controls.update();
  }

  init() {
    this.dom =  document.createElement('iframe');
    this.css3dObject = new CSS3DObject(this.dom);
    this.dom.src = this.url;
    this.dom.style.border = 'none';
    // 解决追加到其他容器时出现左边距空白
    this.dom.style.left = '0';
    if (this.meshName) {
      const p2 = getWorldPositionByName(this.meshName);
      this.css3dObject.position.set(p2?.x, p2?.y, p2?.z);
    } else {
      this.css3dObject.position.set(0, 2, 0);
    }
    threejsModule.scene.add(this.css3dObject);
  }

  update() {
    this.css3dRenderer?.render(threejsModule.scene, threejsModule.camera);
  }
}