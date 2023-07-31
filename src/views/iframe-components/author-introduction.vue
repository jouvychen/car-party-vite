<template>
  <div class="author-introduction">
    <!-- 左侧 -->
    <div class="left account-wrapper">
      <!-- 头像姓名工作 -->
      <div class="account-profile">
        <img :src="avatar" alt="">
        <div class="blob-wrap">
          <div class="blob"></div>
          <div class="blob"></div>
          <div class="blob"></div>
        </div>
        <div class="account-name">jouvyChen</div>
        <div class="account-title">Frontend Developer</div>
      </div>
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
import { getAssetsUrlRelative } from "@/utils/common";
const avatar = getAssetsUrlRelative('../assets/images/iframe-page/about-me/', 'avatar.jpg');
</script>

<style scoped lang="less">
@bg-color: #252954;
@body-color: #9b9ca7;
@main-bg: #0e0e23;
@app-bg-dark: #01081f;
@secondary-color: #5e6a81;
@blue-text: #adb7cb;


.account {
  width: 100%;
  // height: 180px;
  margin-top: auto;
  flex-grow: 0;
  position: relative;
  transition: 0.3s;
  // cursor: pointer;
  transition: .3s;

  // &:hover {
  //   transform: scale(1.02);
  // }

  &:before {
    content: "";
    position: absolute;
    width: 24px;
    height: 24px;
    box-shadow: -15px 0 0 0 #ef8741;
    background: #ef415c;
    left: 42px;
    border-radius: 50%;
  }

  &-wrapper {
    border-radius: 10px;
    max-width: 310px;
    width: 100%;
    display: flex;
    flex-direction: column;
    margin: 8px;
    align-items: center;
    background-color: @main-bg;
    color: @body-color;
  }

  &-profile {
    margin: 36px 24px 24px;
    position: relative;
    text-align: center;
    position: relative;

    img {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      object-fit: cover;
      object-position: left;
      border: 3px solid #4255d3;
      padding: 5px;
    }

    .blob {
      position: absolute;
      border-radius: 50%;
      animation: fly 5.8s linear infinite alternate;

      &:nth-child(1) {
        width: 14px;
        height: 14px;
        top: 25px;
        left: -20px;
        background: #28327a;
        animation-delay: 0.9s;
      }

      &:nth-child(2) {
        width: 18px;
        height: 18px;
        background: #87344c;
        right: -20px;
        top: -20px;
        animation-delay: 0.2s;
      }

      &:nth-child(3) {
        width: 12px;
        height: 12px;
        background: #13645b;
        right: -35px;
        top: 50%;
        animation-delay: 1.8s;
      }
    }
  }

  &-name {
    margin: 20px 0 10px;
  }

  &-title {
    font-size: 14px;
  }
}

@keyframes fly {
  40% {
    transform: translate(-6px, -6px);
  }

  60% {
    transform: translate(-12px, -2px);
  }

  100% {
    transform: translate(0px, 0px);
  }
}


.author-introduction {
  display: flex;

  .left {}

  .right {

    

  }
}
</style>
