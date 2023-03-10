<template>
  <!-- 控制颜色面板 -->
  <floatWindow :float-window="floatWindow1">
    <template #content>
      <span class="colorPicker">
        <!-- <input
          id="body-color"
          :disabled="!boothReady"
          type="color"
          value="#ff0000"
          :class="{ disabled: !boothReady }"
        /> -->
        <br />
        车体
      </span>
      <span class="colorPicker">
        <!-- <input
          id="details-color"
          :disabled="!boothReady"
          type="color"
          value="#ffffff"
          :class="{ disabled: !boothReady }"
        /> -->
        <br />
        车架
      </span>
      <span class="colorPicker">
        <!-- <input
          id="glass-color"
          :disabled="!boothReady"
          type="color"
          value="#ffffff"
          :class="{ disabled: !boothReady }"
        /> -->
        <br />
        Glass
      </span>
    </template>
  </floatWindow>
</template>
<script setup lang="ts">
import floatWindow from "../float-window/index.vue";
const props = defineProps({
  floatWindow: {
    type: Object,
    default: () => {}
  }
})
const floatWindow1 = props.floatWindow;
</script>

<style scoped lang="less">
.color-control {
  
}
</style>
