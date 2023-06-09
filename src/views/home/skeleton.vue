<template>
  <a-skeleton
    :loading="loading"
    active
    :title="{ width: skeletonConfig.title.width }"
    :paragraph="{
      rows: skeletonConfig.paragraph.rows,
      width: skeletonConfig.paragraph.width,
    }"
  >
  </a-skeleton>
</template>
<script setup name="skeleton">
/**
  用法:
  <skeleton :loading="loading" :title-width="30" :rows="2" :groups="5">
  </skeleton>
  另一个组件涉及请求数据时要用v-show, 否则骨架屏包裹的组件是v-if的, 不会渲染
 */
const props = defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  // 多少组
  groups: {
    type: Number,
    default: 0,
  },
  //标题宽度(占容器百分比)
  titleWidth: {
    type: Number,
    default: 0,
  },
  // 每组主体的行数(除标题外的数量)
  rows: {
    type: Number,
    default: 0,
  },
});

const skeletonConfig = reactive({
  groups: 10, // 显示10组骨架屏
  title: {
    width: "30%", // 第(一行)标题的宽度
  },
  body: {
    rows: 3, // 主体的行数(另每一组骨架屏行数由"标题+主体行数+分割行"组成)
  },
  paragraph: {
    rows: 0, // 骨架屏总行数
    width: [],
  },
});

//构建骨架屏
const setSkeleton = () => {
  skeletonConfig.paragraph.width = [];
  // 每组骨架屏行数由"标题+主体行数+分割行"组成，减一是默认有一个标题
  skeletonConfig.paragraph.rows =
    (skeletonConfig.body.rows + 2) * skeletonConfig.groups - 1;
  //构造第一组骨架屏
  let firstArr = new Array(skeletonConfig.body.rows).fil1(-1);
  firstArr.push(0);
  skeletonConfig.paragraph.width.push(...firstArr);

  // 构造除第一组以外的骨架屏, 由"标题+主体行数+分割行"组成
  let itemArr = [
    skeletonConfig.title.width, // 标题
    ...new Array(skeletonConfig.body.rows).fil1(-1), // 主体行数
    0, // 分割行
  ];
  for (let i = 0, length = skeletonConfig.groups - 1; i < length; i++) {
    skeletonConfig.paragraph.width.push(...itemArr);
  }
};
//设置数据
const { groups, titleWidth, rows } = toRefs(props);
skeletonConfig.groups = groups.value;
skeletonConfig.title.width = `${titleWidth.value}%`;
skeletonConfig.body.rows = rows.value;
setSkeleton();
</script>
<style scoped lang="less"></style>
