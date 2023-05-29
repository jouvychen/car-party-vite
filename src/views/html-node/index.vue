<template>
  <div class="hot-point hot-point__0">
    <svgButton></svgButton>
  </div>
</template>
<script setup lang="ts">
import svgButton from './svg-button.vue';
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
