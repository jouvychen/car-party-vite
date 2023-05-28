<template>
  <div class="point point-0">
    <div class="label label-0">1</div>
    <div class="text">
      灯塔：矗立在海岸的岩石之上，白色的塔身以及红色的塔屋，在湛蓝色的天空和深蓝色大海的映衬下，显得如此醒目和美丽。
    </div>
  </div>
  <div class="point point-1">
    <div class="label label-1">2</div>
    <div class="text">
      小船：梦中又见那宁静的大海，我前进了，驶向远方，我知道我是船，只属于远方。这一天，我用奋斗作为白帆，要和明天一起飘扬，呼喊。
    </div>
  </div>
  <div class="point point-2">
    <div class="label label-2">3</div>
    <div class="text">
      沙滩：宇宙展开的一小角。不想说来这里是暗自疗伤，那过于矫情，只想对每一粒沙子，每一朵浪花问声你们好吗
    </div>
  </div>
</template>
<script setup lang="ts">
</script>

<style scoped lang="less">
.point {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;

  .label {
    position: absolute;
    top: -16px;
    left: -16px;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #00000077;
    border: 1px solid #ffffff77;
    color: #ffffff;
    font-family: Helvetica, Arial, sans-serif;
    text-align: center;
    line-height: 32px;
    font-weight: 100;
    font-size: 14px;
    cursor: help;
    transform: scale(0, 0);
    transition: transform 0.3s;
  }
  .text {
    position: absolute;
    top: 30px;
    left: -120px;
    width: 200px;
    padding: 20px;
    border-radius: 4px;
    background: rgba(0, 0, 0, 0.6);
    border: 1px solid #ffffff77;
    color: #ffffff;
    line-height: 1.3em;
    font-family: Helvetica, Arial, sans-serif;
    font-weight: 100;
    font-size: 14px;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    text-align: justify;
    text-align-last: left;
  }
  &:hover .text {
    opacity: 1;
  }
  &.visible .label {
    transform: scale(1, 1);
  }
}
</style>
