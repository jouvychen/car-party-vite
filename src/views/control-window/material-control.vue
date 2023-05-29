<template>
  <!-- 控制材质面板 -->
  <floatWindow :float-window="floatWindow1" class="color-control">
    <template #content>
      材质
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
const emits = defineEmits(["onChangeMaterial"]);

const onChangeMaterial = () => {
  // emits("onChangeMaterial", materials[obj.material], obj.value);
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
