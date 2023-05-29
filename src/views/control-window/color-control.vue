<template>
  <!-- 控制颜色面板 -->
  <floatWindow :float-window="floatWindow1" class="color-control">
    <template #content>
      <div
        v-for="(item1, index1) in lamborghini"
        :key="index1"
        class="color-control__item mb20 pb20 bb1-cf"
      >
        <p class="sub-title">{{ item1.name }}</p>
        <div v-if="item1.children && item1.children.length > 0" class="class">
          <span
            v-for="(item2, index2) in item1.children"
            :key="index2"
            class="colorPicker"
          >
            <input
              :disabled="!boothReady"
              type="color"
              value="#ffffff"
              :class="{ 'not-allow': !boothReady }"
              @change="onChangeColor($event, item2)"
            />
            <br />
            {{ item2.name }}
          </span>
        </div>
      </div>
    </template>
  </floatWindow>
</template>
<script setup lang="ts">
import * as THREE from "three";
import { useBoothModelStore } from "@/store";
import floatWindow from "../float-window/index.vue";
const props = defineProps({
  floatWindow: {
    type: Object,
    default: () => {},
  },
});
// 常量
const lamborghini = [
  {
    key: "tyre",
    name: "轮胎结构",
    value: [],
    material: "",
    level: 1,
    children: [
      {
        key: "ring",
        name: "圆环",
        value: ["Object_10002", "Object_10", "Object_10003", "Object_10001"],
        material: "bodyMaterial",
        level: 2,
        children: [],
      },
      {
        key: "wheelHub",
        name: "轮毂",
        value: [
          "Object_4002",
          "Object_6002",
          "Object_4",
          "Object_6",
          "Object_4003",
          "Object_6003",
          "Object_4001",
          "Object_6001",
        ],
        material: "bodyMaterial",
        level: 2,
        children: [],
      },
      {
        key: "hubDecoration",
        name: "轮毂装饰",
        value: ["Object_5003", "Object_5001", "Object_5004", "Object_5002"],
        material: "bodyMaterial",
        level: 2,
        children: [],
      },
      {
        key: "caliper",
        name: "卡钳",
        value: ["左前轮碟刹", "左后轮碟刹", "右前轮碟刹", "右后轮碟刹"],
        material: "bodyMaterial",
        level: 2,
        children: [],
      },
      {
        key: "discBrake",
        name: "碟刹",
        value: ["Object_7002", "Object_7", "Object_7003", "Object_7001"],
        material: "bodyMaterial",
        level: 2,
        children: [],
      },
    ],
  },
  {
    key: "carBody",
    name: "车身结构",
    value: [],
    material: "",
    level: 1,
    children: [
      {
        key: "body",
        name: "车身",
        value: [
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
        level: 2,
        children: [],
      },
    ],
  },
  {
    key: "carFrame",
    name: "车架结构",
    value: [],
    material: "",
    level: 1,
    children: [
      {
        key: "frame",
        name: "车架",
        value: ["车架"],
        material: "bodyMaterial",
        level: 2,
        children: [],
      },
    ],
  },
];

let bodyMaterial: THREE.MeshPhysicalMaterial;
let detailsMaterial: THREE.MeshStandardMaterial;
let glassMaterial: THREE.MeshPhysicalMaterial;
bodyMaterial = new THREE.MeshPhysicalMaterial({
  color: 0xff0000,
  metalness: 1.0,
  roughness: 0.5,
  clearcoat: 1.0,
  clearcoatRoughness: 0.03,
  sheen: 0.5,
  side: THREE.DoubleSide
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
const materials = {
  bodyMaterial: bodyMaterial,
  detailsMaterial: detailsMaterial,
  glassMaterial: glassMaterial,
};

const boothStore = useBoothModelStore();
const boothReady = computed(() => boothStore.boothReady);
const floatWindow1 = props.floatWindow;
const emits = defineEmits(["onChangeColor"]);

const onChangeColor = (event: Event, obj: any) => {
  console.log("打印", (event.target as HTMLInputElement).value, obj);
  materials[obj.material].color.set((event.target as HTMLInputElement).value);
  emits("onChangeColor", materials[obj.material], obj.value);
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
