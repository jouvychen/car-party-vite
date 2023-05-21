import * as THREE from 'three';
import { getImageUrlRelative } from '@/utils/common'
export class CreatFlag {
  public camera: THREE.PerspectiveCamera;
  public scene: THREE.Scene;
  public renderer: THREE.WebGLRenderer;
  private flag!: THREE.Mesh;
  private sizeW = 6;
  private sizeH = 4;
  private segW = 6;
  private segH = 6;  //旗的大小，分割数
  private horizontal = 0.3;
  private vertical = 0.2;
  private swing = 0.2;
  private speed = 0.1;
  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;

    //光源为白色
    const light = new THREE.DirectionalLight("#FFFFFF");
    light.position.set(10, 50, 100);
    this.scene.add(light);
    //场景光的颜色是灰色的
    const ambientLight = new THREE.AmbientLight("#999999");
    this.scene.add(ambientLight);

  }
  initFlag() {
    const flagGeometry = new THREE.PlaneGeometry(this.sizeW, this.sizeH, this.segW, this.segH);
    // 创建材质 使用贴图(注意加载图片静态资源的相对路径是基于该方法所在文件目录，而不是引用它的文件目录)
    const loader = new THREE.TextureLoader();
    const flagTexture = loader.load(getImageUrlRelative('../assets/images/poster/', 'Lamborghini-Centenario-poster.jpg'));
    flagTexture.magFilter = THREE.LinearFilter;
    flagTexture.minFilter = THREE.LinearFilter;
    const flagMaterial = new THREE.MeshPhongMaterial({
      map: flagTexture,
    });
    this.flag = new THREE.Mesh(flagGeometry, flagMaterial);
    this.flag.scale.multiplyScalar(0.4);
    this.flag.position.set(-8.5, 2.0,-1.05);
    this.flag.rotateY(Math.PI * 0.5)
    this.scene.add(this.flag);
  }

  flagUpdate() {
    for (let y = 0, yLength = this.segH + 1; y < yLength; y++) {
      for (let x = 0, xLength = this.segW + 1; x < xLength; x++) {
        const index = x * yLength + y;
        const time = Date.now() * this.speed / 50;
        // 旧版
        // const vertex = this.flag.geometry.vertices[index];
        // vertex.z = Math.sin(h * x + v * y - time) * w * x / 4;
        // 新版
        // 获取顶点数据
        const positionAttribute = this.flag.geometry.getAttribute('position');
        const positions = positionAttribute.array;
        // 需要直接修改 x 坐标，不能先构造数组再取下标去改
        positions[index * 3 + 2] = Math.sin(this.horizontal * x + this.vertical * y - time) * this.swing * x / 4;
        positionAttribute.needsUpdate = true;
        this.flag.geometry.computeVertexNormals();
      }
    }
  }
}