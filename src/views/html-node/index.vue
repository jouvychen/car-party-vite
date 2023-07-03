<template>
  <template v-for="(point, index) in hotPoints" :key="index">
    <div :class="['hot-point', `hot-point__${index}`]">
      <!-- Internal server error: v-model cannot be used on v-for or v-slot scope variables because they are not writable. -->
      <!-- so, use :model-value="point" but no v-model:model-value="" -->
      <svgButton :model-value="point" @click="onClickPoint(point)"></svgButton>
    </div>
  </template>
  <div v-show="appStore.focusSceneName" class="arrow-wrapper close-group align-center">
    <div v-show="['查看介绍'].includes(appStore.focusSceneName)">
      <svg class="arrow-svg arrow-pre" width="18px" height="17px" viewBox="0 0 18 17" version="1.1"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="prev" transform="translate(8.500000, 8.500000) scale(-1, 1) translate(-8.500000, -8.500000)">
          <polygon class="arrow"
            points="16.3746667 8.33860465 7.76133333 15.3067621 6.904 14.3175671 14.2906667 8.34246869 6.908 2.42790698 7.76 1.43613596">
          </polygon>
          <polygon class="arrow-fixed"
            points="16.3746667 8.33860465 7.76133333 15.3067621 6.904 14.3175671 14.2906667 8.34246869 6.908 2.42790698 7.76 1.43613596">
          </polygon>
          <path
            d="M-1.48029737e-15,0.56157424 L-1.48029737e-15,16.1929159 L9.708,8.33860465 L-2.66453526e-15,0.56157424 L-1.48029737e-15,0.56157424 Z M1.33333333,3.30246869 L7.62533333,8.34246869 L1.33333333,13.4327013 L1.33333333,3.30246869 L1.33333333,3.30246869 Z">
          </path>
        </g>
      </svg>
    </div>

    <div class="close-point">
      <svgButton :model-value="closePointItem" @click="closeHotPoint"></svgButton>
    </div>

    <div v-show="['查看介绍'].includes(appStore.focusSceneName)">
      <svg class="arrow-svg arrow-next" width="18px" height="17px" viewBox="-1 0 18 17" version="1.1"
        xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g>
          <polygon class="arrow"
            points="16.3746667 8.33860465 7.76133333 15.3067621 6.904 14.3175671 14.2906667 8.34246869 6.908 2.42790698 7.76 1.43613596">
          </polygon>
          <polygon class="arrow-fixed"
            points="16.3746667 8.33860465 7.76133333 15.3067621 6.904 14.3175671 14.2906667 8.34246869 6.908 2.42790698 7.76 1.43613596">
          </polygon>
          <path
            d="M-4.58892184e-16,0.56157424 L-4.58892184e-16,16.1929159 L9.708,8.33860465 L-1.64313008e-15,0.56157424 L-4.58892184e-16,0.56157424 Z M1.33333333,3.30246869 L7.62533333,8.34246869 L1.33333333,13.4327013 L1.33333333,3.30246869 L1.33333333,3.30246869 Z">
          </path>
        </g>
      </svg>
    </div>
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
    threejsModule.controls.enabled = false;
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
        closePoint?.classList.add('close-visible');
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
  closePoint?.classList.remove('close-visible');
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
  hotPoints.value.map((o) => {
    o.show = true;
  })
};
const hide = () => {
  hotPoints.value.map((o) => {
    o.show = false;
  })
};

onMounted(() => {
  closePoint = document.querySelector('.close-group') as HTMLDivElement;
})

</script>

<style scoped lang="less">
@ease: cubic-bezier(.2, 1, .3, 1);

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

.close-group {
  opacity: 0;
  bottom: 50px;
  top: auto !important;
  position: fixed;
  left: 50%;
  transform: translate(-50%, 0%);
}

.close-visible {
  opacity: 1;
  transition: opacity 200ms ease-out;
}

.arrow-wrapper {
  .arrow-svg {
    width: 26px;
    height: auto;
    margin: 0 2rem;
    cursor: pointer;
    overflow: visible;
    fill: rgba(255, 255, 255, 0.25);

    polygon,
    path {
      transition: all 0.5s @ease;
    }

    &:hover {

      polygon,
      path {
        transition: all 1s @ease;
        fill: #fff;
      }

      .arrow {
        animation: arrow-anim 2.5s @ease infinite;
      }

      .arrow-fixed {
        animation: arrow-fixed-anim 2.5s @ease infinite;
      }
    }

    &:active {

      path,
      polygon {
        transition: transform 0.3s ease;
        transform-origin: center;
        transform: scale(0.85);
      }
    }
  }

  .close-point {
    cursor: pointer;
    width: 40px;
  }

  @keyframes arrow-anim {
    0% {
      opacity: 1;
      transform: translateX(0);
    }

    5% {
      transform: translateX(-0.1rem);
    }

    100% {
      transform: translateX(1rem);
      opacity: 0;
    }
  }

  @keyframes arrow-fixed-anim {
    5% {
      opacity: 0;
    }

    20% {
      opacity: 0.4;
    }

    100% {
      opacity: 1;
    }
  }
}
</style>
