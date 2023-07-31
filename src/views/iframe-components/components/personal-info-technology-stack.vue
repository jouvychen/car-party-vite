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
  <div class="card">
    <div class="account-cash">$ 5637.04</div>
    <div class="account-income">Total Income</div>
    <div class="account-iban">**** **** **** 3060</div>
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
    font-size: 22px;
    font-weight: 500;
    margin-bottom: 6px;
    position: relative;
  }

  &-income {
    font-size: 14px;
  }

  &-iban {
    margin-top: auto;
    font-weight: 500;
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
