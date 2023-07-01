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

import { HotPoint } from '@/utils/interface';
import { message } from 'ant-design-vue';
import svgButton from './svg-button.vue';
import { hotPoints } from '@/config/data';

const onClickPoint = (point: HotPoint) => {
  message.success(point.name);
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
