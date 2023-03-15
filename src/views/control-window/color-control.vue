<template>
  <!-- 控制颜色面板 -->
  <floatWindow :float-window="floatWindow1" class="color-control">
    <template #content>
      <span class="colorPicker">
        <input
          id="body-color"
          :disabled="!boothReady"
          type="color"
          value="#ff0000"
          :class="{ 'not-allow': !boothReady }"
        />
        <br />
        车体
      </span>
      <span class="colorPicker">
        <input
          id="details-color"
          :disabled="!boothReady"
          type="color"
          value="#ffffff"
          :class="{ 'not-allow': !boothReady }"
        />
        <br />
        车架
      </span>
      <!-- <span class="colorPicker">
        <input
          id="glass-color"
          :disabled="!boothReady"
          type="color"
          value="#ffffff"
          :class="{ 'not-allow': !boothReady }"
        />
        <br />
        Glass
      </span> -->
      <span v-for="o in Object.keys(lamborghini.tyre)" :key="o" class="colorPicker">
        <input
          :id="`tyre-${o}`"
          :disabled="!boothReady"
          type="color"
          value="#ffffff"
          :class="{ 'not-allow': !boothReady }"
          @change="onChangeColor($event, lamborghini.tyre[o])"
        />
        <br />
        {{lamborghini.tyre[o].name}}
      </span>
    </template>
  </floatWindow>
</template>
<script setup lang="ts">
import { useBoothModalStore } from "@/store";
import floatWindow from "../float-window/index.vue";
const props = defineProps({
  floatWindow: {
    type: Object,
    default: () => {},
  },
});
// 常量
const lamborghini = {
  // 轮胎结构
  tyre:{
    ring: {
      name: '圆环',
      value: ['Object_10.002', 'Object_10', 'Object_10.003', 'Object_10.001']
    },
    wheelHub: {
      name: '轮毂',
      value: ['Object_4.002', 'Object_6.002', 'Object_4', 'Object_6', 'Object_4.003', 'Object_6.003', 'Object_4.001', 'Object_6.001']
    },
    hubDecoration: {
      name: '轮毂装饰',
      value: ['Object_5.003', 'Object_5.001', 'Object_5.004', 'Object_5.002']
    },
    caliper: {
      name: '卡钳',
      value: ['左前轮碟刹', '左后轮碟刹', '右前轮碟刹', '右后轮碟刹']
    },
    discBrake: {
      name: '碟刹',
      value: ['Object_7.002', 'Object_7', 'Object_7.003', 'Object_7.001']
    }
  }
}

const boothStore = useBoothModalStore();
const boothReady = computed(() => boothStore.boothReady);
const floatWindow1 = props.floatWindow;
const emits = defineEmits(['onChangeColor'])

const onChangeColor = (xxx:any, obj: any) => {
  console.log('打印', xxx, obj);
  emits('onChangeColor', xxx, obj)
};
</script>

<style scoped lang="less">
.color-control {
  .colorPicker {
    display: inline-block;
    margin: 0 10px;
  }
}
</style>
