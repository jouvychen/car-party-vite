<template>
  <!-- 控制颜色面板 -->
  <floatWindow :float-window="floatWindow1" class="color-control">
    <template #content>
      <div v-for="(item1, index1) in lamborghiniConfig" :key="index1" class="color-control__item mb20 pb20 bb1-cf">
        <div class="item-head align-center">
          <p class="sub-title">{{ item1.name }}</p>
          <a-checkbox v-model:checked="item1.pureColor">纯色模式</a-checkbox>
        </div>
        <div v-if="item1.children && item1.children.length > 0" class="class">
          <span v-for="(item2, index2) in item1.children" :key="index2" class="colorPicker">
            <input :disabled="!boothReady" type="color" value="#ffffff" :class="{ 'not-allow': !boothReady }"
              @change="onChangeColor($event, item1, item2)" />
            <br />
            {{ item2.name }}
          </span>
        </div>
      </div>
    </template>
  </floatWindow>
</template>
<script setup lang="ts" name="colorControl">
import * as THREE from "three";
import { useBoothModelStore, useCss3dIframeModelStore, useCarModelStore } from "@/store";
import { isMaterialWithColor } from "@/utils/threejsUtils";
import { ObjectKeys } from "@/utils/interface";
import type { Revolver } from "../revolver/typeStatement";

import floatWindow from "../float-window/index.vue";

const props = defineProps({
  floatWindow: {
    type: Object as PropType<Revolver>, // 断言、props类型自定义约束
    default: () => { },
  },
});

interface ColorConfigChild {
  key: string;
  name: string;
  meshNameList: string[];
  material: string;
  originMaterial: THREE.Material | null;
  level: number;
  children: any[];
}

interface ColorConfig {
  key: string;
    pureColor: boolean; // 纯净模式, 材质只使用纯色, 不使用原始的材质
    name: string;
    meshNameList: string[];
    material: string;
    level: number;
    children: ColorConfigChild[];
}

// 颜色配置
const lamborghiniConfig = ref<ColorConfig[]>([
  {
    key: "tyre",
    pureColor: false, // 纯净模式, 材质只使用纯色, 不使用原始的材质
    name: "轮胎结构",
    meshNameList: [],
    material: '',
    level: 1,
    children: [
      {
        key: "ring",
        name: "圆环",
        meshNameList: [
          "Object_10002",
          "Object_10",
          "Object_10003",
          "Object_10001",
        ],
        material: "ringMaterial",
        originMaterial: null,
        level: 2,
        children: [],
      },
      {
        key: "wheelHub",
        name: "轮毂",
        meshNameList: [
          "Object_4002",
          "Object_6002",
          "Object_4",
          "Object_6",
          "Object_4003",
          "Object_6003",
          "Object_4001",
          "Object_6001",
        ],
        material: "wheelHubMaterial",
        originMaterial: null,
        level: 2,
        children: [],
      },
      {
        key: "hubDecoration",
        name: "轮毂装饰",
        meshNameList: [
          "Object_5003",
          "Object_5001",
          "Object_5004",
          "Object_5002",
        ],
        material: "hubDecorationMaterial",
        originMaterial: null,
        level: 2,
        children: [],
      },
      {
        key: "caliper",
        name: "卡钳",
        meshNameList: ["左前轮碟刹", "左后轮碟刹", "右前轮碟刹", "右后轮碟刹"],
        material: "caliperMaterial",
        originMaterial: null,
        level: 2,
        children: [],
      },
      {
        key: "discBrake",
        name: "碟刹",
        meshNameList: ["Object_7002", "Object_7", "Object_7003", "Object_7001"],
        material: "discBrakeMaterial",
        originMaterial: null,
        level: 2,
        children: [],
      },
    ],
  },
  {
    key: "carBody",
    pureColor: false, // 纯净模式, 材质只使用纯色, 不使用原始的材质
    name: "车身结构",
    meshNameList: [],
    material: '',
    level: 1,
    children: [
      {
        key: "body",
        name: "车身",
        meshNameList: [
          "车身",
          "前轮连接板",
          "左车门内部",
          "左车门外部",
          "右车门内部",
          "右车门外部",
          "Object_68002",
          "挡叶",
        ],
        material: "bodyMaterial",
        originMaterial: null,
        level: 2,
        children: [],
      },
    ],
  },
  {
    key: "carFrame",
    pureColor: false, // 纯净模式, 材质只使用纯色, 不使用原始的材质
    name: "车架结构",
    meshNameList: [],
    material: '',
    level: 1,
    children: [
      {
        key: "frame",
        name: "车架",
        meshNameList: ["车架"],
        material: "frameMaterial",
        originMaterial: null,
        level: 2,
        children: [],
      },
    ],
  },
]);

// 轮胎纯色材质
let ringMaterial: THREE.MeshPhysicalMaterial;
let wheelHubMaterial: THREE.MeshPhysicalMaterial;
let hubDecorationMaterial: THREE.MeshPhysicalMaterial;
let caliperMaterial: THREE.MeshPhysicalMaterial;
let discBrakeMaterial: THREE.MeshPhysicalMaterial;
// 车身纯色材质
let bodyMaterial: THREE.MeshPhysicalMaterial;
let frameMaterial: THREE.MeshPhysicalMaterial;
// 细节和玻璃纯色材质
let detailsMaterial: THREE.MeshStandardMaterial;
let glassMaterial: THREE.MeshPhysicalMaterial;

ringMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff0000,
  metalness: 1.0,
  roughness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
  sheen: 0.5,
  side: THREE.DoubleSide,
});
detailsMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  metalness: 1.0,
  roughness: 0.5,
});
glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  metalness: 0.25,
  roughness: 0,
  transmission: 1.0,
});

wheelHubMaterial = ringMaterial.clone();
hubDecorationMaterial = ringMaterial.clone();
caliperMaterial = ringMaterial.clone();
discBrakeMaterial = ringMaterial.clone();
bodyMaterial = ringMaterial.clone();
frameMaterial = ringMaterial.clone();

const materials: ObjectKeys = {
  ringMaterial: ringMaterial,
  wheelHubMaterial: wheelHubMaterial,
  hubDecorationMaterial: hubDecorationMaterial,
  caliperMaterial: caliperMaterial,
  discBrakeMaterial: discBrakeMaterial,
  bodyMaterial: bodyMaterial,
  frameMaterial: frameMaterial,
  detailsMaterial: detailsMaterial,
  glassMaterial: glassMaterial,
};

const carStore = useCarModelStore();
const boothStore = useBoothModelStore();
const css3dIframeModel = useCss3dIframeModelStore();
const boothReady = computed(() => boothStore.boothReady);
const transparency = computed(()=>{
  console.log('--', css3dIframeModel.transparency);
  debugger
  return css3dIframeModel.transparency;
})
const floatWindow1 = props.floatWindow;

/**
 * 策略模式
 * 纯色材质和原始材质
 */

//  定义策略模式的公共方法和属性
interface ColorStrategy {

  apply: (event: Event, obj: string[]) => void;

}

/**
 * 创建多个实现了该接口或继承自该基类的策略类，每个类代表一个具体的策略
 */
// 使用纯色材质替换原始材质
class PureColorStrategy implements ColorStrategy {
  apply(event: Event, obj: any) {
    materials[obj.material].color.set((event.target as HTMLInputElement).value);
    obj.meshNameList.forEach((o: string) => {
      const mesh = carStore.carModel?.getObjectByName(o) as THREE.Mesh;
      if (mesh.material instanceof THREE.Material) {
        !obj.originMaterial && (obj.originMaterial = mesh.material.clone());
        (carStore.carModel?.getObjectByName(o) as THREE.Mesh).material =
          materials[obj.material];
      }
    });
  }
}

// 保留原始材质
class OriginColorStrategy implements ColorStrategy {
  apply(event: Event, obj: any) {
    obj.meshNameList.forEach((o: string) => {
      const mesh = carStore.carModel?.getObjectByName(o) as THREE.Mesh;
      if (!obj.originMaterial && isMaterialWithColor(mesh.material)) {
        mesh.material.color.set((event.target as HTMLInputElement).value);
      } else {
        const tempMaterial = obj.originMaterial.clone();
        tempMaterial.color.set((event.target as HTMLInputElement).value);
        mesh.material = tempMaterial;
      }
    });
  }
}

// 创建策略对象
const strategy: ObjectKeys = {
  pure: new PureColorStrategy(),
  origin: new OriginColorStrategy(),
};

// 使用策略模式
const applyColor = (event: Event, obj: any, strategyName: string) => {
  const selectedStrategy = strategy[strategyName];
  selectedStrategy.apply(event, obj);
};

const onChangeColor = (event: Event, obj1: any, obj2: any) => {
  // 调用策略方法
  applyColor(event, obj2, obj1.pureColor ? "pure" : "origin");
};
</script>

<style scoped lang="less">
.color-control {
  &__item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

    &:first-child {
      padding-top: 10px;
    }

    .item-head {
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      width: 100%;
      margin-bottom: 12px;
    }
  }

  .sub-title {
    margin: 4px 10px;
    font-size: 16px;
  }

  .colorPicker {
    display: inline-block;
    margin: 0 10px;
  }
}
</style>
