<template>
  <div class="application-proportion">
    <div class="chart-container-wrapper flex-1">
      <div class="chart-container-align">
        <div class="chart-info-wrapper">
          <h2>Web</h2>
          <span>20.5 K</span>
        </div>
        <div class="chart-svg">
          <svg viewBox="0 0 36 36" class="circular-chart pink">
            <path class="circle-bg" d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"></path>
            <path class="circle" stroke-dasharray="30, 100" d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"></path>
            <text x="18" y="20.35" class="percentage">30%</text>
          </svg>
        </div>
      </div>
    </div>
    <div class="chart-container-wrapper flex-1">
      <div class="chart-container-align">
        <div class="chart-info-wrapper">
          <h2>小程序</h2>
          <span>5.5 K</span>
        </div>
        <div class="chart-svg">
          <svg viewBox="0 0 36 36" class="circular-chart blue">
            <path class="circle-bg" d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"></path>
            <path class="circle" stroke-dasharray="60, 100" d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"></path>
            <text x="18" y="20.35" class="percentage">60%</text>
          </svg>
        </div>
      </div>
    </div>
    <div class="chart-container-wrapper flex-1">
      <div class="chart-container-align">
        <div class="chart-info-wrapper">
          <h2>H5</h2>
          <span>10.5 K</span>
        </div>
        <div class="chart-svg">
          <svg viewBox="0 0 36 36" class="circular-chart orange">
            <path class="circle-bg" d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"></path>
            <path class="circle" stroke-dasharray="90, 100" d="M18 2.0845
          a 15.9155 15.9155 0 0 1 0 31.831
          a 15.9155 15.9155 0 0 1 0 -31.831"></path>
            <text x="18" y="20.35" class="percentage">90%</text>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="ApplicationProportion">
</script>

<style scoped lang="less">
// 项目类型占比
.application-proportion {
  display: flex;

  .chart-container-wrapper {
    padding: 8px;

    .chart-container-align {
      width: 100%;
      border-radius: 10px;
      background-color: @intro-app-bg-dark;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .chart-info-wrapper {
    flex-shrink: 0;
    flex-basis: 120px;

    h2 {
      color: @intro-blue-text;
      font-size: 14px;
      line-height: 16px;
      font-weight: 600;
      text-transform: uppercase;
      margin: 0 0 8px 0;
    }

    span {
      color: #ffffff;
      font-size: 24px;
      line-height: 32px;
      font-weight: 500;
    }
  }
}

// svg图表
.chart-svg {
  position: relative;
  max-width: 90px;
  min-width: 40px;
  width: 70px;

  .circle-bg {
    fill: none;
    stroke: #eee;
    stroke-width: 1.2;
  }

  .circle {
    fill: none;
    stroke-width: 1.6;
    stroke-linecap: round;
    animation: progress 1s ease-out forwards;
  }

  .circular-chart {
    &.orange {
      .circle {
        stroke: #ff9f00;
      }

      .circle-bg {
        stroke: #776547;
      }
    }

    &.blue {
      .circle {
        stroke: #00cfde;
      }

      .circle-bg {
        stroke: #557b88;
      }
    }

    &.pink {
      .circle {
        stroke: #ff7dcb;
      }

      .circle-bg {
        stroke: #6f5684;
      }
    }
  }

  .percentage {
    fill: #fff;
    font-size: 0.5em;
    text-anchor: middle;
    font-weight: 400;
  }

  @keyframes progress {
    0% {
      stroke-dasharray: 0 100;
    }
  }
}
</style>
