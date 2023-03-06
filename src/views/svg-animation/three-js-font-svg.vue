<template>
  <div class="three-js--font">
    <div id="svg-text" class="svg">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlns:xlink="http://www.w3.org/1999/xlink"
        fill="none"
        version="1.1"
        width="581"
        height="190"
        viewBox="0 0 581 190"
      >
        <path
          d="M19.5781,64.3438L16.8438,60L47.2344,60L45.3594,73L62.5,73L59.6094,86.9375L43.625,86.9375L38.875,120.062L52.7031,120.062L49.9688,134L19.5781,134Q15.4062,134,12.8125,131.266Q10.2188,128.516,11.2344,124.344L16.8438,86.9375L5.76562,86.9375L7.20312,73L18.4375,73L19.5781,64.3438Z"
          fill-opacity="0"
        />
        <path
          d="M110.7969,45L106.7656,74L150.9688,74L142.6094,135L114.9688,135L121.875,87.9375L105.3125,87.9375L98.4062,135L70.76562,135L83.1406,49.1875L80.4062,45L110.7969,45Z"
          fill-opacity="0"
        />
        <!-- </g> -->
        <path
          d="M195.875,74L193.1406,93.375L212.5781,74L240.2344,74L193.1406,115.641L190.4062,135L162.76562,135L170.8281,78.0469L167.9375,74L195.875,74Z"
          fill-opacity="0"
        />
        <path
          d="M317.2969,111.938L273.0781,111.938L271.6406,123.062L310.375,123.062L317.2969,117.578L313.1094,137L252.3438,137Q248.1719,137,246.07812,134.234Q244,131.469,244,127.266L250.9062,76L322.7656,76L317.2969,111.938ZM277.1094,89.9375L275.8125,98L292.375,98L293.8125,89.9375L277.1094,89.9375Z"
          fill-opacity="0"
        />
        <path
          d="M407.2969,109.938L363.0781,109.938L361.6406,121.062L400.375,121.062L407.2969,115.578L403.1094,135L342.3438,135Q338.1719,135,336.07812,132.234Q334,129.469,334,125.266L340.9062,74L412.7656,74L407.2969,109.938ZM367.1094,87.9375L365.8125,96L382.375,96L383.8125,87.9375L367.1094,87.9375Z"
          fill-opacity="0"
        />
        <path
          d="M452.7031,120.062L461.0625,57.5156L456.875,52L488.7031,52L479.0625,124.312Q477.9062,128.5,475.0156,131.25Q472.1406,134,467.9688,134L422.3125,134L425.0625,114.562L430.6719,120.062L452.7031,120.062Z"
          fill-opacity="0"
        />
        <path
          d="M543.6719,120.062L544.9688,110L503.5,110L509.1094,73L575.3594,73L572.6094,90.75L548.7188,90.75L549.1406,86.9375L532.5781,86.9375L531.1406,96.0625L571.3125,96.0625L568.4375,124.203Q567.4375,128.438,563.8281,131.219Q560.2344,134,556.0625,134L500.76562,134L503.5,114.359L507.6719,120.062L543.6719,120.062Z"
          fill-opacity="0"
        />
      </svg>
    </div>
  </div>
</template>
<script setup lang="ts">
const props = defineProps({
  sourcesNum: {
    type: Number,
    default: 0,
  },
  hasBeenLoaded: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(["onSvgComplete"]);

const eventList = [
  "webkitAnimationEnd",
  "mozAnimationEnd",
  "MSAnimationEnd",
  "oanimationend",
  "animationend",
];
let svgCompleteNumbers = 0;
onMounted(() => {
  const svgTextDom = document.querySelector("#svg-text");
  if (svgTextDom) {
    eventList.forEach((event) => {
      svgTextDom.addEventListener(
        event,
        () => {
          //动画结束时事件
          console.log(`${event}svg动画完成`);
          svgCompleteNumbers += 1;
          // 7是7个path动画刚好完成时, 8是最后一个缩放向上移动的动画
          svgCompleteNumbers === 8 && emits("onSvgComplete");
          // setTimeout(() => {
          //   eventList.forEach((event2) => {
          //     removeEventListener(
          //       event2,
          //       () => {
          //         console.log(`${event2}移除监听`);
          //       },
          //       false
          //     );
          //   });
          // }, 1000);
        },
        false
      );
    });
  }
});
</script>
<style scoped lang="less">
.three-js--font {
  width: 100%;
  height: 100%;
  background-color: #2c3e50;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .svg {
    animation-fill-mode: forwards;
    animation: moveScale 1.5s ease-in forwards 3s;

    //每个字母的描边动画执行时间和开始时间不同
    //animation: show 持续时间 动画从头到尾的速度是相同的(linear) 向前 开始时间
    path:nth-child(1) {
      stroke-dasharray: 426;
      stroke-dashoffset: 426;
      animation: path-animation 2.5s linear forwards 0.5s;
    }
    path:nth-child(2) {
      stroke-dasharray: 620;
      stroke-dashoffset: 620;
      animation: path-animation 2.5s linear forwards 0.5s;
    }
    path:nth-child(3) {
      stroke-dasharray: 426;
      stroke-dashoffset: 426;
      animation: path-animation 2.5s linear forwards 0.5s;
    }
    path:nth-child(4) {
      stroke-dasharray: 426;
      stroke-dashoffset: 426;
      animation: path-animation 2.5s linear forwards 0.5s;
    }
    path:nth-child(5) {
      stroke-dasharray: 620;
      stroke-dashoffset: 620;
      animation: path-animation 2.5s linear forwards 0.5s;
    }
    path:nth-child(6) {
      stroke-dasharray: 420;
      stroke-dashoffset: 420;
      animation: path-animation 2.5s linear forwards 0.5s;
    }

    path:nth-child(7) {
      stroke-dasharray: 560;
      stroke-dashoffset: 560;
      animation: path-animation 2.5s linear forwards 0.5s;
    }

    path:nth-child(8) {
      stroke-dasharray: 560;
      stroke-dashoffset: 560;
      animation: path-animation 2.5s linear forwards 0.5s;
    }
    path:nth-child(9) {
      stroke-dasharray: 526;
      stroke-dashoffset: 526;
      animation: path-animation 2.5s linear forwards 0.5s;
    }
    path:nth-child(10) {
      stroke-dasharray: 526;
      stroke-dashoffset: 526;
      animation: path-animation 2.5s linear forwards 0.5s;
    }
  }
}
svg {
  stroke: hsl(189, 68%, 75%);
  stroke-width: 1px;
  fill: hsl(189, 68%, 75%, 0%);
}

@keyframes path-animation {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes moveScale {
  to {
    transform: translateY(-100px) scale(0.7);
  }
}
</style>
