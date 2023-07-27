import * as THREE from "three";
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';

interface PlaneOptions {
  elementW?: number;
  planeW?: number;
  planeH?: number;
  object3d?: THREE.Mesh | null;
}

export namespace THREEx.HtmlMixer {
  export class Context {
    private updateFcts: (() => void)[] = [];
    public rendererCss: CSS3DRenderer;
    public rendererWebgl: THREE.WebGLRenderer;
    public cssScene: THREE.Scene;
    public cssFactor: number = 1000;
    public autoUpdateObjects: boolean = true;

    constructor(rendererWebgl: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera) {
      this.rendererCss = new CSS3DRenderer();
      this.rendererWebgl = rendererWebgl;

      const cssCamera = new THREE.PerspectiveCamera(camera.fov, camera.aspect, camera.near * this.cssFactor, camera.far * this.cssFactor);

      this.updateFcts.push(() => {
        cssCamera.quaternion.copy(camera.quaternion);
        cssCamera.position.copy(camera.position).multiplyScalar(this.cssFactor);
      });

      this.cssScene = new THREE.Scene();

      this.updateFcts.push(() => {
        if (!this.autoUpdateObjects) return;
        this.cssScene.traverse(function (cssObject) {
          if (cssObject instanceof THREE.Scene) return;
          const mixerPlane = (cssObject as any).userData.mixerPlane;
          if (mixerPlane === undefined) return;
          mixerPlane.update();
        });
      });

      this.updateFcts.push(() => {
        this.rendererCss.render(this.cssScene, cssCamera);
      });
    }

    public update(): void {
      this.updateFcts.forEach(updateFct => updateFct());
    }
  }

  export class Plane {
    domElement: HTMLElement;
    object3d: THREE.Mesh;
    cssObject: CSS3DObject;
    elementWidth: number;
    elementHeight: number;
    mixerContext: THREEx.HtmlMixer.Context;
  
    constructor(mixerContext: THREEx.HtmlMixer.Context, domElement: HTMLElement, opts: PlaneOptions = {}) {
      this.mixerContext = mixerContext;
      this.domElement = domElement;
      this.object3d = opts.object3d || this.createObject3D(opts);
  
      const { planeW, planeH } = opts;
      this.elementWidth = opts.elementW || 768;
      this.elementHeight = this.elementWidth * (planeH || 3 / 4);
  
      this.setDomElementSize();
  
      this.cssObject = new CSS3DObject(this.domElement);
      this.cssObject.scale.set(1, 1, 1).multiplyScalar(mixerContext.cssFactor / (this.elementWidth / (planeW || 1)));
      this.cssObject.userData.mixerPlane = this;
  
      this.addEventListeners(mixerContext);
  
      this.update();
    }
  
    createObject3D(opts: PlaneOptions): THREE.Mesh {
      const { planeW = 1, planeH = 3 / 4, object3d = null } = opts;
      if (object3d === null) {
        const planeMaterial = new THREE.MeshBasicMaterial({
          opacity: 0,
          color: new THREE.Color('black'),
          blending: THREE.NoBlending,
          side: THREE.DoubleSide,
        });
        const geometry = new THREE.PlaneGeometry(planeW, planeH);
        return new THREE.Mesh(geometry, planeMaterial);
      } else {
        return object3d;
      }
    }
  
    setDomElementSize() {
      this.domElement.style.width = this.elementWidth + "px";
      this.domElement.style.height = this.elementHeight + "px";
    }
  
    addEventListeners(mixerContext: THREEx.HtmlMixer.Context) {
      const { object3d, cssObject } = this;
      object3d.addEventListener('added', function(event) {
        mixerContext.cssScene.add(cssObject);
      });
      object3d.addEventListener('removed', function(event) {
        mixerContext.cssScene.remove(cssObject);
      });
    }
  
    update() {
      const { object3d, cssObject } = this;
  
      // get world position
      object3d.updateMatrixWorld();
      const worldMatrix = object3d.matrixWorld;
  
      // get position/quaternion/scale of object3d
      const position = new THREE.Vector3();
      const scale = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      worldMatrix.decompose(position, quaternion, scale);
  
      // handle quaternion
      cssObject.quaternion.copy(quaternion);
  
      // handle position
      cssObject.position
        .copy(position)
        .multiplyScalar(this.mixerContext.cssFactor);
  
      // handle scale
      const boundingBox = new THREE.Box3().setFromObject(object3d);
      const width = boundingBox.max.x - boundingBox.min.x;
      const scaleFactor = this.elementWidth / width;
      cssObject.scale.set(1, 1, 1).multiplyScalar(this.mixerContext.cssFactor / scaleFactor);
    }
  
    setDomElement(newDomElement: HTMLElement) {
      const { domElement, cssObject } = this;
  
      // remove the oldDomElement
      if (domElement.parentNode) {
        domElement.parentNode.removeChild(domElement);
      }
  
      // update local variables
      this.domElement = newDomElement;
      cssObject.element = newDomElement;
  
      // reset the size of the domElement
      this.setDomElementSize();
    }
  }

}

// export namespace THREEx.HtmlMixerHelpers {
//   export function createIframeDomElement(url: string): HTMLElement {
//     const domElement = document.createElement('iframe');
//     domElement.src = url;
//     domElement.style.border = 'none';

//     const onIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
//     if (onIos) {
//       domElement.style.width = '100%';
//       domElement.style.height = '100%';

//       if (domElement.style.overflow === undefined) {
//         // For older iOS versions that do not support `overflow: scroll`
//         const container = document.createElement('div');
//         container.appendChild(domElement);
//         container.style.overflow = 'scroll';
//         return container;
//       } else {
//         domElement.style.overflow = 'scroll';
//       }
//     }

//     return domElement;
//   }

//   export function setIframeSrc(mixerPlane: THREEx.HtmlMixer.Plane, url: string): void {
//     if (THREEx.HtmlMixer && mixerPlane instanceof THREEx.HtmlMixer.Plane) {
//       mixerPlane.planes.forEach(plane => {
//         THREEx.HtmlMixerHelpers.setIframeSrc(plane, url);
//       });
//       return;
//     }

//     console.assert(mixerPlane instanceof THREEx.HtmlMixer.Plane);
//     const domElement = mixerPlane.domElement;
//     const onIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
//     if (onIos) {
//       domElement = mixerPlane.domElement.firstChild;
//     }

//     console.assert(domElement instanceof HTMLIFrameElement);
//     domElement.src = url;
//   }

//   export function createImageDomElement(url: string): HTMLImageElement {
//     const domElement = document.createElement('img');
//     domElement.src = url;

//     return domElement;
//   }
// }
