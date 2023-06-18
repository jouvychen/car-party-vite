import * as THREE from 'three';
/**
 * 状态仓库
 */
import {
  useThreejsModuleStore,
} from "@/store";
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

export { getWorldPositionByName, isMaterialWithColor }