<template>
  <div class="index-page">
    <div class="banner">
      <div class="banner-title">
        欢迎使用数据核验平台
      </div>
      <div class="banner-content">
        通过结合有感、无感多种勘误方式，采用先进的机器学习及数据处理技
        术，在考虑用户体验的可操作性及便捷性上设计了友好的平台页面，创新了平台
        对接方式，实现勘误上报-处置-反馈全流程闭环管理。
      </div>
    </div>
    <div class="grid-container">
      <div v-for="(card, index) in cardList" :key="index" class="card-item">
        <span class="item-title">
          <span class="svg">
            <svg-icon :name="card.icon"></svg-icon>
          </span>
          <span class="title">{{ card.title }}</span>
        </span>
        <span class="item-content">
          {{ card.content }}
        </span>
      </div>
    </div>
  </div>
</template>
<script setup name="home">
import svgIcon from "@/components/svg/svg-icon.vue"
const cardList = [
  {
    icon: '人机可视化-默认',
    title: '无感监测',
    content: '提供姓名、手机号码无感化监测能力，提高嫌疑人信息录入准确性',
  },
  {
    icon: '通用信息-默认',
    title: '批量核验',
    content: '支持身份证号、人员编号两种方式对嫌疑人身份进行核验，自动核验、人工核验相结合的方式，最大程度确保嫌疑人身份信息准确可靠，业务部门提供更准确的数据支持。',
  },
  {
    icon: '首页-默认',
    title: '有感勘误',
    content: '通过人工主动填写工单或上报信息来采集勘误数据。业务人员在智慧搜页面上通过手动填写或点击的方式来提交勘误数据，再进行勘误实施及反馈，完成数据纠错，提高数据准确率。',
  },
  {
    icon: '有感勘误-选中',
    title: '智能工具',
    content: '收集智慧搜平台使用意见，提供意见共担录入，问题解答，常见问题下载等功能。获取各业务部门使用意见，从而有针对性的升级优化平台',
  },
  {
    icon: '',
    title: '',
    content: '待开发',
  }
]
</script>

<style scoped lang="less">
.index-page {
  background: #FFFFFF;
  border-radius: 4px;
  padding: 32px;
  text-align: left;

  .banner {
    padding: 60px 53px;
    background: #EDEFF5;
    border-radius: 8px;

    .banner-title {
      font-size: 24px;
      font-weight: bolder;
      color: rgba(0, 0, 0, 0.85);
      line-height: 33px;
      margin-bottom: 15px;
    }

    .banner-content {
      max-width: 50%;
      font-size: 14px;
      color: rgba(0, 0, 0, 0.65);
      line-height: 24px;
    }
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 24px;

    /* 控制元素之间的间隔 */
    margin-top: 32px;

    .card-item {
      height: 216px;
      border-radius: 4px;
      border: 1px solid #D8DDE4;
      padding: 32px;
      display: flex;
      flex-direction: column;
      max-width: 450px;
      width: 100%;
      cursor: pointer;
      transition: transform 0.15s ease-in-out;

      &:hover {
        transform: translateY(-4px) scale(1.0125);
        box-shadow: 0px 8px 20px 0px rgba(14, 37, 142, 0.24);
      }

      &:nth-child(3n) {
        margin-right: 0;
      }

      .item-title {
        margin-bottom: 8px;

        .svg {
          width: 20px;
          height: 20px;
          margin-right: 8px;
        }

        .title {
          font-size: 18px;
          font-weight: bolder;
          color: rgba(0, 0, 0, 0.85);
          line-height: 25px;
        }
      }

      .item-content {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.65);
        line-height: 20px;
      }
    }
  }
}

@keyframes floatBreath {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
    /* 卡片悬浮时向上浮动 */
  }
}</style>
