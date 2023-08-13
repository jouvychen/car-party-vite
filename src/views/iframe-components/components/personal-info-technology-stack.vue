<template>
  <!-- 头像和工作 -->
  <div class="account-profile">
    <img :src="avatar" alt="">
    <div class="blob-wrap">
      <div class="blob"></div>
      <div class="blob"></div>
      <div class="blob"></div>
    </div>
    <div class="account-name f-18">jouvyChen</div>
    <div class="account-title f-18">Frontend Developer</div>
  </div>
  <!-- 联系方式 -->
  <div class="card f-18">
    <div class="account-cash flex-center">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" class="account-svg">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <span>广东广州</span>
    </div>
    <div class="account-income flex-center">
      <svg class="account-svg" viewBox="0 0 512 512" fill="currentColor">
        <path
          d="M467 76H45a45 45 0 00-45 45v270a45 45 0 0045 45h422a45 45 0 0045-45V121a45 45 0 00-45-45zm-6.3 30L287.8 278a44.7 44.7 0 01-63.6 0L51.3 106h409.4zM30 384.9V127l129.6 129L30 384.9zM51.3 406L181 277.2l22 22c14.2 14.1 33 22 53.1 22 20 0 38.9-7.9 53-22l22-22L460.8 406H51.3zM482 384.9L352.4 256 482 127V385z">
        </path>
      </svg>
      <span>jouvy1755@163.com</span>
    </div>
    <div class="account-income flex-center">
      <svg class="account-svg" viewBox="0 0 512 512" fill="currentColor">
        <path
          d="M467 76H45a45 45 0 00-45 45v270a45 45 0 0045 45h422a45 45 0 0045-45V121a45 45 0 00-45-45zm-6.3 30L287.8 278a44.7 44.7 0 01-63.6 0L51.3 106h409.4zM30 384.9V127l129.6 129L30 384.9zM51.3 406L181 277.2l22 22c14.2 14.1 33 22 53.1 22 20 0 38.9-7.9 53-22l22-22L460.8 406H51.3zM482 384.9L352.4 256 482 127V385z">
        </path>
      </svg>
      <span>jouvychen@gmail.com</span>
    </div>
  </div>
</template>

<script lang="ts" setup name="PersonalInfoTechnologyStack">
import { getAssetsUrlRelative } from "@/utils/common";
const avatar = getAssetsUrlRelative('../assets/images/iframe-page/about-me/', 'avatar.jpg');
</script>

<style scoped lang="less">
// 个人信息与技术栈
.account {

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
      cursor: pointer;
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

  // 联系方式
  &-cash {
    margin-bottom: 6px;
    position: relative;
  }

  &-income {
    font-size: 16px;
  }

  &-svg {
    width: 16px;
    margin-right: 6px;
  }
}

.card {
  width: -webkit-fill-available;
  margin: 0 28px 28px;
  background: radial-gradient(circle, #1a2049 0%, #13162f 100%);
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
</style>
