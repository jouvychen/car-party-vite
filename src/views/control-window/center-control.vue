<template>
  <!-- 中心控制面板 -->
  <floatWindow :float-window="floatWindowObj" class="center-control">
    <template #content>
      <div class="class">
        <a-button @click="onControlGlobalMode">{{
          appStore.mode === 'day' ? "夜晚模式" : "白天模式"
        }}</a-button>
      </div>
    </template>
  </floatWindow>
</template>
<script setup lang="ts">
import {
  useStoreApp,
} from "@/store";
const appStore = useStoreApp();
import floatWindow from "../float-window/index.vue";
const props = defineProps({
  floatWindow: {
    type: Object,
    default: () => {},
  },
});
const floatWindowObj = props.floatWindow;

const onControlGlobalMode = () => {
  appStore.mode = appStore.mode === 'day' ? 'night' : 'day';
};
</script>

<style scoped lang="less">
.center-control {
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
