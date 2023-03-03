<template>
  <section class="menu menu--circle">
    <input id="menu__active" type="checkbox" />
    <label for="menu__active" class="menu__active">
      <div class="menu__toggle" @click="onMenuToggle">
        <div class="icon">
          <div class="hamburger"></div>
        </div>
      </div>
      <input id="degree--up-0" type="radio" name="arrow--up" />
      <div class="menu__listings">
        <ul v-if="revolverList.length > 0" class="circle">
          <li v-for="(o, i) in revolverList" :key="i">
            <div class="placeholder">
              <div class="upside">
                <!-- 轮盘展示文字或下标，以后可以使用插槽拓展成展示svg或图片 -->
                <span class="button" @click="onClickRevolver(o)">{{
                  o.name ? o.name.slice(0, 1) : i
                }}</span>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div class="menu__arrow menu__arrow--button">
        <ul>
          <li>
            <label for="degree--up-0"
              ><div class="arrow to--up" @click="onMousewheel('up')"></div
            ></label>
          </li>

          <li>
            <label for="degree--up-1"
              ><div class="arrow to--down" @click="onMousewheel('down')"></div
            ></label>
          </li>
        </ul>
      </div>
    </label>
  </section>
</template>

<script setup lang="ts">
// const store = useStore();
// import { SAVE_REVOLVER_SELECTED } from '@/store/mutation-types';

import { message } from "ant-design-vue/es";
import $ from "jquery";
import EventsBus from "@/utils/eventBus";
import type { Revolver } from "./typeStatement";
import { debounce } from "@/utils/common";

defineProps({
  revolverList: {
    type: Array,
    default: () => [],
  },
});

const onClickRevolver = (o: Revolver) => {
  // 此状态暂时无用
  // store.commit(SAVE_REVOLVER_SELECTED, o);

  // 向事件总线发起广播
  EventsBus.emit("onBusRevolver", o);
};

let menuState = false;

// 菜单展开关闭
const onMenuToggle = () => {
  menuState = !menuState;
  if (menuState) {
    $(".hamburger").addClass("hamburger-active");
    $(".menu__toggle").addClass("menu__toggle-active");
    $(".menu__listings").addClass("menu__listings-transform");
    $(".menu__arrow").addClass("menu__arrow-active");
  } else {
    $(".hamburger").removeClass("hamburger-active");
    $(".menu__toggle").removeClass("menu__toggle-active");
    $(".menu__listings").removeClass("menu__listings-transform");
    $(".menu__listings").removeAttr("style"); // 移除添加的旋转行内样式
    $(".menu__arrow").removeClass("menu__arrow-active");
  }
};

let scrollTop = 0;
let scrollTopOld = 0;
let scrollReg = 10; // menu__listings初始值
let direction = "";

// div滚轮事件
const onMousewheel = (direction1: string) => {
  direction = direction1;
  onDebounce();
};

const onDebounce = debounce(() => {
  // 向上
  if (direction === "up") {
    $(".menu__listings").animate({}, 1000, () => {
      $(".menu__listings").removeClass("menu__listings-transform");
      $(".menu__listings").css({ transform: `rotate(${scrollReg + 90}deg)` });
    });
    scrollReg += 90;
  } else {
    $(".menu__listings").animate({}, 1000, () => {
      $(".menu__listings").removeClass("menu__listings-transform");
      $(".menu__listings").css({ transform: `rotate(${scrollReg - 90}deg)` });
    });
    scrollReg -= 90;
  }

  scrollTopOld = scrollTop;
}, 150);

onMounted(() => {
  // 点击'---',添加滚轮展开样式
  // $('.button').click(() => {
  //   $('.menu__listings').addClass('test');
  // });
  // 点击'x',移除滚轮展开样式
  // $('.menu__toggle').click(() => {
  //   $('.menu__listings').removeClass('test');
  // });
});
</script>

<style scoped lang="less">
.menu__listings-transform {
  transform: rotate(10deg) scale(1) !important;
  transition: transform 1s !important;
}

// 滚轮展开直角扇形区域动画
.hamburger-active {
  // &:extend(.hamburger);

  border-color: transparent !important;
  transition: border-color 0.333333333333333s !important;

  &:after {
    top: -2px !important;
    border-color: #fff !important;
    transform: translateX(-50%) rotate(45deg) !important;
    transition-property: top, transform !important;
    transition-duration: 0.25s, 1s !important;
  }

  &:before {
    bottom: -2px !important;
    border-color: #fff !important;
    transform: translateX(-50%) rotate(-45deg) !important;
    transition-property: bottom, transform !important;
    transition-duration: 0.25s, 1s !important;
  }
}

.menu__toggle-active {
  background-color: #392338 !important;
  transition: all 1s !important;
}

.icon {
  position: absolute;
  top: 70%;
  left: 70%;
  transform: translateX(-50%) translateY(-50%);
}
.hamburger {
  content: " ";
  position: relative;
  width: 20px;
  border: 2px solid #392338;
  border-radius: 5px;
  transition: all 0.333333333333333s ease;
}
.hamburger:after,
.hamburger:before {
  content: " ";
  position: absolute;
  left: 50%;
  width: 100%;
  border: 2px solid #392338;
  border-radius: 5px;
  transform: translateX(-50%);
  transition-property: top, bottom, transform;
  transition-duration: 1s, 1s, 0.25s;
}
.hamburger:after {
  top: -8px;
}
.hamburger:before {
  bottom: -8px;
}
.menu {
  pointer-events: none;
}
.menu--circle {
  position: absolute;
  top: 0;
  z-index: 999;
  width: 243.33333333333334px;
  height: 243.33333333333334px;
  overflow: hidden;
}
.menu__active {
  position: absolute;
  left: 0;
}
.menu__toggle {
  touch-action: none;
  z-index: 11;
  position: absolute;
  top: -50px;
  left: -50px;
  width: 100px;
  height: 100px;
  background-color: #fff;
  border-radius: 50%;
  transition: transform 1.3s;
  cursor: pointer;
  pointer-events: auto;
}
.menu__listings {
  z-index: 10;
  position: absolute;
  top: -100px;
  left: -100px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  // transform: scale(0.1);
  transform: scale(0.1) rotate(150deg);
  transition: transform 1s;
}

.menu__arrow-active {
  visibility: visible !important;
  transition: all 1s 1.111111111111111s;
}
.menu__arrow {
  visibility: hidden;
  position: absolute;
}
.menu__arrow input[type="radio"] {
  position: fixed;
  top: -99999px;
  left: -99999px;
}
.menu__arrow ul {
  padding: 0;
  margin: 0;
  list-style: none;
}
.menu__arrow--button {
  top: 0.5em;
  left: 110px;
}
.menu__arrow--button .to--up {
  transform: rotate(-45deg);
}
.menu__arrow--button .to--down {
  transform: rotate(-225deg);
}
.arrow {
  width: 15px;
  height: 15px;
  border-right: 5px solid #fff;
  border-top: 5px solid #fff;
  border-radius: 3px;
  border-color: greenyellow;
  transition: border-color 0.3s;
  cursor: pointer;
  pointer-events: auto;
}
.arrow:hover {
  border-color: #ff947f;
  transition: border-color 0.3s;
}

.circle {
  position: relative;
  padding: 0;
  margin: 0;
  height: 100%;
  width: 100%;
  background-color: #fff;
  border-radius: 50%;
  transform: rotate(108deg);
  overflow: hidden;
  list-style: none;
}
.circle li {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 50%;
  transform-origin: 0 100%;
}
.circle li .placeholder {
  position: absolute;
  left: -92%;
  padding-top: 1.5em;
  width: 200%;
  height: 200%;
  text-align: center;
  transform: skewY(54deg) rotate(18deg);
}
.circle li .placeholder .upside {
  transform: rotate(180deg);
}
.circle li .placeholder span {
  text-decoration: none;
  pointer-events: auto;
}

.circle li .placeholder button {
  pointer-events: auto;
}
.circle li .placeholder .button {
  font-size: 20px;
  background-color: transparent;
  border: none;
  color: #392338;
  cursor: pointer;
  position: relative;
  left: 5px;
}
// 一直减36
.circle li:nth-child(1) {
  transform: rotate(30deg) skewY(-54deg);
  background-color: #fff;
}
.circle li:nth-child(2) {
  transform: rotate(0deg) skewY(-54deg);
  background-color: #fff;
}
.circle li:nth-child(3) {
  transform: rotate(-30deg) skewY(-54deg);
  background-color: #fff;
}
.circle li:nth-child(4) {
  transform: rotate(-60deg) skewY(-54deg);
  background-color: #fff;
}
.circle li:nth-child(5) {
  transform: rotate(-90deg) skewY(-54deg);
  background-color: #fff;
}
.circle li:nth-child(6) {
  transform: rotate(-120deg) skewY(-54deg);
  background-color: #fff;
}
.circle li:nth-child(7) {
  transform: rotate(-150deg) skewY(-54deg);
  background-color: #fff;
}
.circle li:nth-child(8) {
  transform: rotate(-180deg) skewY(-54deg);
  background-color: #fff;
}
.circle li:nth-child(9) {
  transform: rotate(-210deg) skewY(-54deg);
  background-color: #fff;
}
// .circle li:nth-child(10) {
//   transform: rotate(324deg) skewY(-54deg);
//   background-color: #fff;
// }
#menu__active {
  position: fixed;
  top: -99999px;
  left: -99999px;
}
// 滚轮展开
// #menu__active:checked ~ label .menu__listings {
//   transform: rotate(10deg) scale(0.1);
//   transition: transform 1s;
// }

#menu__active:checked ~ label .button:hover {
  color: #c1264e;
}
// #menu__active:checked ~ label .menu__arrow {
//   visibility: visible;
//   transition: all 1s 1.111111111111111s;
// }
</style>
