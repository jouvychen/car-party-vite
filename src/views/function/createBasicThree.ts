
import * as THREE from 'three';

export class CreateBasicThree {
  private container: HTMLDivElement | undefined;
  scene!: THREE.Scene;
  camera!: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor(domId?: string) {

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;

    if (domId) {
      this.container = document.getElementById(domId) as HTMLDivElement;
      this.container.appendChild(this.renderer.domElement);
    } else {
      this.renderer.domElement.style.position = 'absolute';
      this.renderer.domElement.style.zIndex =  '-999';
      // document.body.appendChild(this.renderer.domElement);
    }

    this.camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );

    this.scene = new THREE.Scene();

  };
  animate() {

    requestAnimationFrame(this.animate);

    this.renderer.render(this.scene, this.camera);

  };
}