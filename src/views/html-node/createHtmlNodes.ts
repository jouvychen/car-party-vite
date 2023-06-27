
/**
 * 根据世界坐标绑定Html节点
 */
interface PointItem {
  position: THREE.Vector3,
  element: HTMLDivElement,
}
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

import * as THREE from 'three';
export class CreateHtmlNodes {
  public frustumBox!: THREE.Box3;
  public raycaster: THREE.Raycaster;
  public modal: THREE.Object3D;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public divClassList: string[]; // 定义的div容器
  public objectNameList: string[]; // 3d对象名称, 包括object3d和mesh
  public pointsList!: PointItem[]; // 定位到页面上的html节点信息
  public mousedown = false;

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, modal: THREE.Object3D, divClassList: string[], objectNameList: string[]) {
    this.raycaster = new THREE.Raycaster();
    this.scene = scene;
    this.camera = camera;
    this.modal = modal;
    this.divClassList = divClassList;
    this.objectNameList = objectNameList;
    this.getWorldPosition();
    this.createFrustumBox();

    // 监听鼠标左键按下事件
    window.addEventListener('mousedown', (event: MouseEvent) => {
      if (event.button === 0) {
        const target = event.target as HTMLElement; // 将 event.target 转换为 HTMLElement 类型
        const classListArray = Array.from(target.classList); // 将 classList 转换为数组
        const hasClass = classListArray.includes('html-hp-btn'); // 检查类名是否存在
        if (!hasClass) {
          // 只有点击热点按钮才算鼠标按下
          this.mousedown = true;
          for (let i = 0, l = this.pointsList.length; i < l; i++) {
            this.pointsList[i].element?.classList.remove('visible');
          }
        }
      }
    });

    // 监听鼠标左键松开事件
    window.addEventListener('mouseup', (event) => {
      if (event.button === 0) {
        this.mousedown = false;
      }
    });

  }

  // 建模时需要注意将Mesh的原点设置为"质心(表面)", 否则可能会被其他Mesh遮盖导致不能展示html-node
  getWorldPosition(precision = 2) {
    this.pointsList = [];

    for (let i = 0, l = this.objectNameList.length; i < l; i++) {
      const object = this.modal.getObjectByName(this.objectNameList[i]);
      let worldPosition = new THREE.Vector3();

      const pointNode = {
        position: object?.getWorldPosition(worldPosition) || new THREE.Vector3(0, 0, 0),
        element: document.querySelector(this.divClassList[i]) as HTMLDivElement,
      }
      this.pointsList.push(pointNode);
    }
  }

  createFrustumBox() {
    // 检查投影后的坐标是否在视野范围内
    // const pointInFrustum = (
    //   screenPosition.x >= -1 && screenPosition.x <= 1 &&
    //   screenPosition.y >= -1 && screenPosition.y <= 1 &&
    //   screenPosition.z >= -1 && screenPosition.z <= 1
    // );
    // 优化版本↓
    // 创建边界框，范围为 [-1, 1] 的立方体
    this.frustumBox = new THREE.Box3(
      new THREE.Vector3(-1, -1, -1),
      new THREE.Vector3(1, 1, 1)
    );
  }

  update() {
 
      for (let i = 0, l = this.pointsList.length; i < l; i++) {
        const point = this.pointsList[i];
        // 世界坐标转标准设备坐标(将点从世界坐标系投影到屏幕空间)
        const screenPosition = point.position.clone().project(this.camera);
  
        this.raycaster.setFromCamera(screenPosition, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
  
        // 检查投影后的坐标是否在视野范围内
        if (this.frustumBox.containsPoint(screenPosition)) {
          if (!this.mousedown && intersects.length === 0) {
            // 未找到相交点，显示
            point.element?.classList.add('visible');
          } else {
            // 找到相交点，获取相交点的距离和点的距离
            const intersectionDistance = (intersects instanceof Array && intersects.length > 0 ? intersects[0].distance : 0);
            const pointDistance = point.position.distanceTo(this.camera.position);
            // 相交点距离比点距离近，隐藏(与其他物体相交)；相交点距离比点距离远，显示(该点在更靠近摄像机的位置)
            (this.mousedown || intersectionDistance < pointDistance)
              ? point.element?.classList.remove('visible')
              : point.element?.classList.add('visible');
          }
        } else {
          point.element?.classList.remove('visible')
        }
  
        const translateX = screenPosition.x * sizes.width * 0.5;
        const translateY = -screenPosition.y * sizes.height * 0.5;
        point.element && (point.element.style.transform = `translateX(${translateX - 20}px) translateY(${translateY - 22}px)`); // 减去按钮宽和高一半
  
      }
    
  }

}