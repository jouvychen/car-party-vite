<template>
  <div class="author-introduction">
    <!-- 左侧 -->
    <div class="left">
      <!-- 个人信息与技术栈 -->
      <personal-info-technology-stack></personal-info-technology-stack>
      <!-- 技术栈组成 -->
      <technology-proportion></technology-proportion>
    </div>

    <!-- 右侧 -->
    <div class="right flex-1">
      <!-- 端类型占比 -->
      <application-proportion></application-proportion>

    </div>


  </div>
</template>

<script lang="ts" setup name="AuthorIntroduction">
import ApplicationProportion from './components/application-proportion.vue'
import TechnologyProportion from './components/technology-proportion.vue'
import PersonalInfoTechnologyStack from './components/personal-info-technology-stack.vue'

</script>

<style scoped lang="less">
// 作者介绍父组件
.author-introduction {
  // height: 1000px;
  display: flex;
  background: radial-gradient(circle, #051340 1%, #040f32 100%);

  .left {
    width: 100%;
    flex-grow: 0;
    position: relative;
    transition: 0.3s;
    transition: .3s;

    border-radius: 10px;
    max-width: 310px;
    width: 100%;
    display: flex;
    flex-direction: column;
    margin: 8px;
    align-items: center;
    background-color: @intro-main-bg;
    color: @intro-body-color;

  }

  .right {}
}
</style>
