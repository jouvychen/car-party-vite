<template>
  <div class="technology-proportion f-18">
    <div class="title">
      技术栈
    </div>
    <div class="class">
      <div class="chart-container-column">

        <div class="acquisitions-bar">
          <span class="bar-progress rejected" style="width:8%;"></span>
          <span class="bar-progress on-hold" style="width:10%;"></span>
          <span class="bar-progress shortlisted" style="width:18%;"></span>
          <span class="bar-progress applications" style="width:64%;"></span>
        </div>
        <div class="progress-bar-info">
          <span class="progress-color applications"></span>
          <span class="progress-type">Vue3</span>
          <span class="progress-amount">64%</span>
        </div>
        <div class="progress-bar-info">
          <span class="progress-color applications"></span>
          <span class="progress-type">Vue2</span>
          <span class="progress-amount">64%</span>
        </div>
        <div class="progress-bar-info">
          <span class="progress-color shortlisted"></span>
          <span class="progress-type">Echarts</span>
          <span class="progress-amount">18%</span>
        </div>
        <div class="progress-bar-info">
          <span class="progress-color on-hold"></span>
          <span class="progress-type">Three.js</span>
          <span class="progress-amount">10%</span>
        </div>
        <div class="progress-bar-info">
          <span class="progress-color rejected"></span>
          <span class="progress-type">TypeScript</span>
          <span class="progress-amount">8%</span>
        </div>

      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="TechnologyProportion">
</script>

<style scoped lang="less">
// 技术栈占比
.technology-proportion {
  width: 100%;

  .title {
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
  }
}

.chart-container-column {
  width: 100%;
  border-radius: 10px;
  padding: 6px 28px 28px;
  display: flex;
  align-items: center;
  flex-direction: column;
}

.acquisitions-bar {
  width: 100%;
  height: 4px;
  border-radius: 4px;
  margin-top: 16px;
  margin-bottom: 8px;
  display: flex;
}

.bar-progress {
  height: 4px;
  display: inline-block;

  &.applications {
    background-color: rgba(255, 125, 203, 1);
  }

  &.shortlisted {
    background-color: rgba(0, 207, 222, 1);
  }

  &.on-hold {
    background-color: rgba(253, 172, 66, 1);
  }

  &.rejected {
    background-color: rgba(255, 92, 92, 1);
  }
}

.progress-bar-info {
  display: flex;
  align-items: center;
  margin-top: 14px;
  width: 100%;
}

.progress-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;

  &.applications {
    background-color: rgba(255, 125, 203, 1);
  }

  &.shortlisted {
    background-color: rgba(0, 207, 222, 1);
  }

  &.on-hold {
    background-color: rgba(253, 172, 66, 1);
  }

  &.rejected {
    background-color: rgba(255, 92, 92, 1);
  }
}

.progress-type {
  color: @intro-secondary-color;
  font-size: inherit;
  line-height: 18px;
}

.progress-amount {
  color: @intro-secondary-color;
  font-size: inherit;
  line-height: 18px;
  margin-left: auto;
}
</style>
