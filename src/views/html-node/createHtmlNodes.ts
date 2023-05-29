
/**
 * 根据世界坐标绑定Html节点
 */
interface ObjectPositionItem {
  name: string,
  position: string,
  x: Number,
  y: Number,
  z: Number,
}
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
  public raycaster: THREE.Raycaster;
  public modal: THREE.Object3D;
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public divClassList: string[]; // 定义的div容器
  public objectNameList: string[]; // 3d对象名称, 包括object3d和mesh
  public pointsList!: PointItem[]; // 定位到页面上的html节点信息
  // public objectList!: ObjectPositionItem[];

  constructor(scene: THREE.Scene, camera: THREE.PerspectiveCamera, modal: THREE.Object3D, divClassList: string[], objectNameList: string[]) {
    this.raycaster = new THREE.Raycaster();
    this.scene = scene;
    this.camera = camera;
    this.modal = modal;
    this.divClassList = divClassList;
    this.objectNameList = objectNameList;
    this.getWorldPosition();

  }

  getWorldPosition(precision = 2) {
    this.pointsList = [];

    for (let i = 0, l = this.objectNameList.length; i < l; i++) {
      const object = this.modal.getObjectByName(this.objectNameList[i]);
      let worldPosition = new THREE.Vector3();
      // let worldPositionObj: ObjectPositionItem = {
      //   name: '',
      //   position: '',
      //   x: 0,
      //   y: 0,
      //   z: 0,
      // };
      // worldPositionObj = Object.assign(worldPositionObj, {
      //   name: object?.name,
      //   position: JSON.stringify(object?.getWorldPosition(worldPosition)),
      //   x: Number(object?.getWorldPosition(worldPosition).x.toFixed(precision)),
      //   y: Number(object?.getWorldPosition(worldPosition).y.toFixed(precision)),
      //   z: Number(object?.getWorldPosition(worldPosition).z.toFixed(precision)),
      // });
      // console.log(`${object?.name}的世界坐标`, worldPositionObj);
      // this.objectList.push(worldPositionObj);

      const pointNode = {
        position: object?.getWorldPosition(worldPosition) || new THREE.Vector3(0, 0, 0),
        element: document.querySelector(this.divClassList[i]) as HTMLDivElement,
      }
      this.pointsList.push(pointNode);

    }
  }

  update() {
    for (let i = 0, l = this.pointsList.length; i < l; i++) {
      // 获取2D屏幕位置
      const screenPosition = this.pointsList[i].position.clone();
      screenPosition.project(this.camera); // 世界坐标转标准设备坐标

      this.raycaster.setFromCamera(screenPosition, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children, true);
      if (intersects.length === 0) {
        // 未找到相交点，显示
        this.pointsList[i].element?.classList.add('visible');
      } else {
        // 找到相交点
        // 获取相交点的距离和点的距离
        const intersectionDistance = intersects[0].distance;
        const pointDistance = this.pointsList[i].position.distanceTo(this.camera.position);
        // 相交点距离比点距离近，隐藏；相交点距离比点距离远，显示
        intersectionDistance < pointDistance
          ? this.pointsList[i].element?.classList.remove('visible')
          : this.pointsList[i].element?.classList.add('visible');
      }
      const translateX = screenPosition.x * sizes.width * 0.5;
      const translateY = -screenPosition.y * sizes.height * 0.5;
      this.pointsList[i].element && (this.pointsList[i].element.style.transform = `translateX(${translateX - 20}px) translateY(${translateY - 22}px)`); // 减去按钮宽和高一半

    }
  }

}