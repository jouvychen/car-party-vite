<template>
  <template v-for="(point, index) in hotPoints" :key="index">
    <div :class="['hot-point', `hot-point__${index}`]">
      <!-- Internal server error: v-model cannot be used on v-for or v-slot scope variables because they are not writable. -->
      <!-- so, use :model-value="point" but no v-model:model-value="" -->
      <svgButton :model-value="point" @click="onClickPoint(point)"></svgButton>
    </div>
  </template>
  <div class="hot-point close-point">
    <svgButton :model-value="closePointItem" @click="closeHotPoint"></svgButton>
  </div>
</template>
<script setup lang="ts">
import {
  useStoreApp,
  useThreejsModuleStore,
  useHtmlNodeModelStore
} from "@/store";
import { HotPoint } from '@/utils/interface';
import svgButton from './svg-button.vue';
import { hotPoints, closePointItem } from '@/config/data';
import { EntranceAnimations } from "@/utils/entranceTweenClass";
import { getWorldPositionByName } from '@/utils/threejsUtils';
// 摄像机和控制器复位
import { onResetCamera } from '@/utils/threejsUtils';

const appStore = useStoreApp();
const threejsModule = useThreejsModuleStore();
const htmlNodeModule = useHtmlNodeModelStore();
const entranceAnimations = new EntranceAnimations();
let closePoint: HTMLDivElement;
const onClickPoint = (point: HotPoint) => {

  if (appStore.focusSceneName != point.name) {
    htmlNodeModule.htmlNode.hidePoint();
    setTimeout(() => {
      hide();
    }, 2500)

    const meshPosition = getWorldPositionByName(point.meshName);
    const controlPosition = getWorldPositionByName(point.controlPName);
    entranceAnimations.animateCamera(
      threejsModule.camera,
      threejsModule.controls,
      { x: controlPosition.x, y: controlPosition.y, z: controlPosition.z }, // 从控点看向网格↓
      { x: meshPosition.x, y: meshPosition.y, z: meshPosition.z },
      2400,
      () => {
        onSwitchEnable(point.name);
        threejsModule.controls.enabled = false;
        closePoint?.classList.add('visible');
      }
    );
  }
  appStore.focusSceneName = point.name;
};

const onSwitchEnable = (name: string) => {
  switch (name) {
    case '播放宣传视频':
      {
        htmlNodeModule.promotionalFilm.onPlay();
      }
      break;

    default:
      break;
  }
};

const onSwitchClose = () => {
  switch (appStore.focusSceneName) {
    case '播放宣传视频':
      {
        htmlNodeModule.promotionalFilm.onPause();
      }
      break;

    default:
      break;
  }
};

const closeHotPoint = () => {
  onSwitchClose();
  closePoint?.classList.remove('visible');
  // 摄像机重置
  onResetCamera(3200).then(() => {
    // 恢复更新
    threejsModule.controls.enabled = true;
    htmlNodeModule.htmlNode.enabled = true;
    appStore.focusSceneName = '';
    show();
  });

};


// 解决热点隐藏后还有悬浮手势
const show = () => {
  hotPoints.value.map((o)=>{
    o.show = true;
  })
};
const hide = () => {
  hotPoints.value.map((o)=>{
    o.show = false;
  })
};

onMounted(() => {
  closePoint = document.querySelector('.close-point') as HTMLDivElement;
})

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
    transition: opacity 200ms ease-out;
  }

  &.visible .html-hp-btn {
    opacity: 1;
  }

}

.close-point {
  bottom: 50px;
  top: auto !important;
}
</style>
