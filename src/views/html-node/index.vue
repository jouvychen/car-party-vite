<template>
  <div class="hot-point hot-point__0">
    <svgButton id="111" key="111" v-model:model-value="btn1"></svgButton>
  </div>
  <div class="hot-point hot-point__1">
    <svgButton id="222" key="222" v-model:model-value="btn2"></svgButton>
  </div>
</template>
<script setup lang="ts">
import svgButton from './svg-button.vue';
const btn1 = reactive({
  show: true,
  type: 'add',
  name: '按钮说明文字'
})
const btn2 = reactive({
  show: true,
  type: 'play',
  name: '按钮说明文字2'
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
  }
  &.visible .html-hp-btn {
    opacity: 1;
    transition: opacity 200ms ease-out;
  }

}
</style>
