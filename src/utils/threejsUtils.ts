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
  const object = threejsModule.scene?.getObjectByName(name) as THREE.Object3D;
  const worldPosition = new THREE.Vector3();
  object?.getWorldPosition(worldPosition);
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
 * 计算不规则 Mesh 的长方形包围盒的宽度和高度。
 * @param {THREE.Mesh} mesh - 包含顶点数组的 Mesh 对象。
 * @returns {{ width: number; height: number }} 返回包围盒的宽度和高度。
 * @throws {Error} 如果顶点数组为空，则抛出错误。
 */
function calculateBoundingBox(mesh: THREE.Mesh): { width: number; height: number } {
  // // 使用 Mesh 的 getBoundingBox() 方法获取包围盒
  const boundingBox = new THREE.Box3().setFromObject(mesh);

  // 获取包围盒的最小和最大点的坐标
  const min = boundingBox.min;
  const max = boundingBox.max;

  // 计算包围盒的宽度和高度
  const width = max.z - min.z;
  const height = max.y - min.y;

  return { width, height };
}

export { getWorldPositionByName, isMaterialWithColor, onResetCamera, calculateBoundingBox }