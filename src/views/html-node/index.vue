<template>
  <template v-for="(point, index) in hotPoints" :key="index">
    <div :class="['hot-point', `hot-point__${index}`]">
      <!-- Internal server error: v-model cannot be used on v-for or v-slot scope variables because they are not writable. -->
      <!-- so, use :model-value="point" but no v-model:model-value="" -->
      <svgButton :model-value="point" @click="onClickPoint(point)"></svgButton>
    </div>
  </template>
</template>
<script setup lang="ts">
import {
  useStoreApp,
  useThreejsModuleStore,
  useHtmlNodeModelStore
} from "@/store";
import { HotPoint } from '@/utils/interface';
import svgButton from './svg-button.vue';
import { hotPoints } from '@/config/data';
import { EntranceAnimations } from "@/utils/entranceTweenClass";
import { CreatePromotionalFilm } from "../function/createPromotionalFilm";

const appStore = useStoreApp();
const threejsModule = useThreejsModuleStore();
const htmlNodeModule = useHtmlNodeModelStore();
const entranceAnimations = new EntranceAnimations();

const onClickPoint = (point: HotPoint) => {
  appStore.focusSceneName = point.name;

  entranceAnimations.animateCamera(
    threejsModule.camera,
    threejsModule.controls,
    { x: 4.25, y: 1.4, z: 4.5 },
    { x: 0, y: 0.5, z: 0 },
    2400,
    () => {
      threejsModule.camera.position.set(4.25, 1.4, 4.5);
      // 播放视频
      setTimeout(() => {
        htmlNodeModule.promotionalFilm.onPlay();
      }, 3000);
    }
  );

};

</script>

<style scoped lang="less">
.hot-point {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  cursor: pointer;
  width: 40px;

  // button样式
  .html-hp-btn {
    opacity: 0;
  }

  &.visible .html-hp-btn {
    opacity: 1;
    transition: opacity 200ms ease-out;
  }

}
</style>
