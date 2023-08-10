import * as THREE from 'three';
import { initialConfiguration } from '@/config/data';
/**
 * 状态仓库
 */
import {
  useThreejsModuleStore,
} from "@/store";
import { EntranceAnimations } from './entranceTweenClass';
import { resolve } from 'path';
import { rejects } from 'assert';
const threejsModule = useThreejsModuleStore();

/**
 * 获取对象在场景中的世界坐标
 * @param name 3D对象的名称
 * @returns 在场景中的世界坐标THREE.Vector3
 */
const getWorldPositionByName = (name: string): THREE.Vector3 => {
  const temp = threejsModule.scene?.getObjectByName(name);
  const object = temp?.clone();
  let worldPosition = new THREE.Vector3();
  object?.getWorldPosition(worldPosition);
  // worldPosition = worldPosition.multiplyScalar(1.2);
  return worldPosition;
}

/**
 * 判断材质是否有颜色属性
 * @param material 
 * @returns 
 */
const isMaterialWithColor = (material: any): material is THREE.Material & { color: THREE.Color } => {
  return 'color' in material && material.color instanceof THREE.Color;
}

/**
 * 重置摄像机和控制器成预设状态
 * 如果当前有动画在执行并希望重置动作打断当前动画, 则传入当前缓动动画实例
 */
const onResetCamera = (entranceAnimations = new EntranceAnimations(), time?: number): Promise<boolean> => {

  return new Promise((resolve) => {
    // 停止未执行完的动画
    entranceAnimations.stop();
    entranceAnimations.animateCamera(
      threejsModule.camera,
      threejsModule.controls,
      {
        x: initialConfiguration.cameraPosition.x,
        y: initialConfiguration.cameraPosition.y,
        z: initialConfiguration.cameraPosition.z,
      },
      {
        x: initialConfiguration.controlsPosition.x,
        y: initialConfiguration.controlsPosition.y,
        z: initialConfiguration.controlsPosition.z,
      },
      time ?? 2400,
      () => {
        threejsModule.camera.position.set(
          initialConfiguration.cameraPosition.x,
          initialConfiguration.cameraPosition.y,
          initialConfiguration.cameraPosition.z
        );
        threejsModule.controls?.update();
        resolve(true);
      }
    );
  })
};

/**
 * 计算 Mesh 包围盒的宽度和高度，适用于不规则和经过变换后的mesh。
 * @param {THREE.Mesh} mesh - 包含顶点数组的 Mesh 对象。
 * @param {boolean} [visible=false] - 包围盒是否可见，默认为false
 * @returns {{ width: number; height: number }} 返回包围盒的宽度和高度。
 * @throws {Error} 如果顶点数组为空，则抛出错误。
 */
function calculateBoundingBox(mesh: THREE.Mesh, visible = false): { width: number; height: number } {

  const geometry = mesh.geometry;

  if (geometry instanceof THREE.BufferGeometry) {
    // 获取 Geometry 的顶点数据
    const positionAttribute = geometry.attributes.position as THREE.BufferAttribute;
    const positions = positionAttribute.array;

    // 创建新的 BufferAttribute 用于存放经过变换后的顶点数据
    const transformedPositions = new Float32Array(positions.length);

    // 获取 Mesh 的世界矩阵
    const worldMatrix = mesh.matrixWorld;

    // 应用世界矩阵到顶点数据上
    for (let i = 0; i < positions.length; i += 3) {
      const vertex = new THREE.Vector3(positions[i], positions[i + 1], positions[i + 2]);
      vertex.applyMatrix4(worldMatrix);
      transformedPositions[i] = vertex.x;
      transformedPositions[i + 1] = vertex.y;
      transformedPositions[i + 2] = vertex.z;
    }

    // 创建包围盒
    const boundingBox = new THREE.Box3().setFromArray(transformedPositions);
    // 获取包围盒的最小和最大点的坐标
    const min = boundingBox.min;
    const max = boundingBox.max;

    // 计算包围盒的宽度和高度
    const width = max.x === min.x ? max.z - min.z : max.x - min.x; // 修复建模时mesh计算宽度问题
    const height = max.y - min.y;

    // 可视化包围盒
    const boxHelper = new THREE.Box3Helper(boundingBox, new THREE.Color(0xff0000));
    !visible && mesh.add(boxHelper);

    return { width, height }
  } else {
    // 如果不是 BufferGeometry，无法计算包围盒
    throw new Error('Mesh 的 Geometry 必须是 BufferGeometry 类型。');
  }
}

export { getWorldPositionByName, isMaterialWithColor, onResetCamera, calculateBoundingBox }