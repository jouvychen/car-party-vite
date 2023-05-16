<template>
  <div v-if="floatWindow.uuid" :id="`window${floatWindow.uuid}`" class="drag">
    <div class="title">
      <h2>
        {{ floatWindow.name }}-{{ sizeStatus }} {{ oldPosition.width
        }}{{ oldPosition.height }}
      </h2>
      <div>
        <a class="min" href="javascript:;" title="最小化"></a>
        <a class="max" href="javascript:;" title="最大化"></a>
        <a class="revert" href="javascript:;" title="还原"></a>
        <a class="close" href="javascript:;" title="关闭"></a>
      </div>
    </div>
    <div class="resizeL"></div>
    <div class="resizeT"></div>
    <div class="resizeR"></div>
    <div class="resizeB"></div>
    <div class="resizeLT"></div>
    <div class="resizeTR"></div>
    <div class="resizeBR"></div>
    <div class="resizeLB"></div>
    <div class="content">
      <slot name="content"></slot>
    </div>
  </div>
</template>
<script setup lang="ts" name="floatWindow">
import $ from "jquery";
import { MouseMove } from "./tools";
import { PropType } from "vue";
import { message } from "ant-design-vue/es";
import type { Revolver } from "../revolver/typeStatement";
import EventsBus from "@/utils/eventBus";

const sizeStatus = ref("自适应"); // 上一次历史, 自适应, 最小化, 最大化, 关闭
const oldPosition = ref({
  left: 0,
  top: 0,
  width: 0,
  height: 0,
});
let disX = 0;
let disY = 0;
let dragMinWidth = 250;
let dragMinHeight = 124;
const rightSafeMargin = 5;

// 代码整理：懒人之家 lanrenzhijia.com
/*-------------------------- +
  获取id, class, tagName
 +-------------------------- */
var get = {
  byId: function (id: any) {
    return typeof id === "string" ? document.getElementById(id) : id;
  },
  byClass: function (sClass: any, oParent: any) {
    var aClass = [];
    var reClass = new RegExp("(^| )" + sClass + "( |$)");
    var aElem = this.byTagName("*", oParent);
    for (var i = 0; i < aElem.length; i++)
      reClass.test(aElem[i].className) && aClass.push(aElem[i]);
    return aClass;
  },
  byTagName: function (elem: any, obj: any) {
    return (obj || document).getElementsByTagName(elem);
  },
};

/*-------------------------- +
  拖拽函数
 +-------------------------- */
function drag(oDrag: any, handle: any) {
  var oMin = get.byClass("min", oDrag)[0];
  var oMax = get.byClass("max", oDrag)[0];
  var oRevert = get.byClass("revert", oDrag)[0];
  var oClose = get.byClass("close", oDrag)[0];
  handle = handle || oDrag;
  handle.style.cursor = "move";
  handle.onmousedown = function (event: any) {
    var event = event || window.event;
    disX = event.clientX - oDrag.offsetLeft;
    disY = event.clientY - oDrag.offsetTop;

    document.onmousemove = function (event) {
      var event = event || window.event;
      var iL = event.clientX - disX;
      var iT = event.clientY - disY;
      var maxL = document.documentElement.clientWidth - oDrag.offsetWidth - rightSafeMargin;
      var maxT = document.documentElement.clientHeight - oDrag.offsetHeight;

      iL <= 0 && (iL = 0);
      iT <= 0 && (iT = 0);
      iL >= maxL && (iL = maxL);
      iT >= maxT && (iT = maxT);

      oDrag.style.left = iL + "px";
      oDrag.style.top = iT + "px";

      return false;
    };

    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;
      // this.releaseCapture && this.releaseCapture()
    };
    this.setCapture && this.setCapture();
    return false;
  };
  //最大化按钮
  oMax.onclick = function () {
    oldPosition.value.left = oDrag.style.left;
    oldPosition.value.top = oDrag.style.top;
    let dayu = false;
    if (
      Number(oDrag.style.width.split("px")[0]) >
        document.documentElement.clientWidth ||
      Number(oDrag.style.height.split("px")[0]) >
        document.documentElement.clientHeight
    ) {
      dayu = true;
    }
    // 最小化的时候不保存宽高
    if (sizeStatus.value !== "最小化" && !dayu) {
      oldPosition.value.height = oDrag.style.height;
      oldPosition.value.width = oDrag.style.width;
    }
    oDrag.style.top = oDrag.style.left = 0;
    oDrag.style.width = document.documentElement.clientWidth - 2 + "px";
    oDrag.style.height = document.documentElement.clientHeight - 2 + "px";
    this.style.display = "none";
    // 最大化时不显示最小化按钮
    let oMin = get.byClass("min", oDrag)[0];
    oMin.style.display = "none";
    oRevert.style.display = "block";
    sizeStatus.value = "最大化";
  };
  //还原按钮
  oRevert.onclick = function () {
    sizeStatus.value = "上一次历史";
    // oDrag.style.width = dragMinWidth + "px";
    // oDrag.style.height = dragMinHeight + "px";
    // oDrag.style.width = "auto";
    // oDrag.style.height = "auto";
    oDrag.style.top = oldPosition.value.top;
    oDrag.style.left = oldPosition.value.left;
    oDrag.style.width = oldPosition.value.width;
    oDrag.style.height = oldPosition.value.height;
    this.style.display = "none";
    oMax.style.display = "block";
    // 恢复
    // 右下角
    const oBR = get.byClass("resizeBR", oDrag)[0];
    oBR.style.display = "block";
    // 显示最小化按钮
    let oMin = get.byClass("min", oDrag)[0];
    oMin.style.display = "block";
  };
  //最小化按钮
  oMin.onclick = function () {
    test.value = !test.value;
    if (sizeStatus.value === "最小化") {
      oDrag.style.width = oldPosition.value.width;
      oDrag.style.height = oldPosition.value.height;
      const oBR = get.byClass("resizeBR", oDrag)[0];
      oBR.style.display = "block";
      sizeStatus.value = "上一次历史";
    } else {
      // 不等于最大化时才记录，否则尺寸以后都变不回来
      if (sizeStatus.value !== "最大化") {
        oldPosition.value.width = oDrag.style.width;
        oldPosition.value.height = oDrag.style.height;
      }
      oDrag.style.height = "33px";
      oDrag.style.overflow = "hidden";
      const oBR = get.byClass("resizeBR", oDrag)[0];
      oBR.style.display = "none";
      sizeStatus.value = "最小化";
    }
  };
  //关闭按钮
  oClose.onclick = function () {
    sizeStatus.value = "关闭";
    oDrag.style.display = "none";
    test.value = !test.value;
  };
  //阻止冒泡
  oMin.onmousedown =
    oMax.onmousedown =
    oClose.onmousedown =
      function (event: any) {
        this.onfocus = function () {
          this.blur();
        };
        (event || window.event).cancelBubble = true;
      };
}
/*-------------------------- +
  改变大小函数
 +-------------------------- */
function resize(
  oParent: any,
  handle: any,
  isLeft: any,
  isTop: any,
  lockX: any,
  lockY: any
) {
  handle.onmousedown = function (event: any) {
    var event = event || window.event;
    var disX = event.clientX - handle.offsetLeft;
    var disY = event.clientY - handle.offsetTop;
    var iParentTop = oParent.offsetTop;
    var iParentLeft = oParent.offsetLeft;
    var iParentWidth = oParent.offsetWidth;
    var iParentHeight = oParent.offsetHeight;

    document.onmousemove = function (event) {
      var event = event || window.event;

      var iL = event.clientX - disX;
      var iT = event.clientY - disY;
      var maxW = document.documentElement.clientWidth - oParent.offsetLeft - 2;
      var maxH = document.documentElement.clientHeight - 5;

      var iW = isLeft ? iParentWidth - iL : handle.offsetWidth + iL;
      var iH = isTop ? iParentHeight - iT : handle.offsetHeight + iT;

      isLeft && (oParent.style.left = iParentLeft + iL + "px");
      isTop && (oParent.style.top = iParentTop + iT + "px");

      iW < dragMinWidth && (iW = dragMinWidth);
      iW > maxW && (iW = maxW);
      lockX || (oParent.style.width = iW + "px");

      iH < dragMinHeight && (iH = dragMinHeight);
      iH > maxH && (iH = maxH);

      lockY || (oParent.style.height = iH + "px");

      if ((isLeft && iW == dragMinWidth) || (isTop && iH == dragMinHeight)) {
        document.onmousemove = null;
      }

      if (isTop && iH == maxH) {
        document.onmousemove = null;
      }

      return false;
    };
    document.onmouseup = function () {
      document.onmousemove = null;
      document.onmouseup = null;

      let oDrag = document.getElementById(`window${props.floatWindow.uuid}`);
      const maxL = document.documentElement.clientWidth - Number(oDrag?.offsetWidth) - rightSafeMargin;

      if (oDrag && maxL < oDrag?.offsetLeft) {
        oDrag && (oDrag.style.left = maxL + "px");
      }

      
    };
    return false;
  };
}

const test = ref(false);

EventsBus.on("onBusRevolver", (value) => {
  const val = value as Revolver;
  if (val.uuid === props.floatWindow.uuid) {
    test.value = !test.value;

    var oDrag = document.getElementById(`window${props.floatWindow.uuid}`);
    var oTitle = get.byClass("title", oDrag)[0];
    var oL = get.byClass("resizeL", oDrag)[0];
    var oT = get.byClass("resizeT", oDrag)[0];
    var oR = get.byClass("resizeR", oDrag)[0];
    var oB = get.byClass("resizeB", oDrag)[0];
    var oLT = get.byClass("resizeLT", oDrag)[0];
    var oTR = get.byClass("resizeTR", oDrag)[0];
    var oBR = get.byClass("resizeBR", oDrag)[0];
    var oLB = get.byClass("resizeLB", oDrag)[0];

    drag(oDrag, oTitle);
    //四角
    resize(oDrag, oLT, true, true, false, false);
    resize(oDrag, oTR, false, true, false, false);
    resize(oDrag, oBR, false, false, false, false);
    resize(oDrag, oLB, true, false, false, false);
    //四边
    resize(oDrag, oL, true, false, false, true);
    resize(oDrag, oT, false, true, true, false);
    resize(oDrag, oR, false, false, false, true);
    resize(oDrag, oB, false, false, true, false);

    if (test.value && oDrag) {
      // 绝对居中
      // oDrag.style.left =
      //   (document.documentElement.clientWidth - oDrag.offsetWidth) / 2 + "px";
      // oDrag.style.top =
      //   (document.documentElement.clientHeight - oDrag.offsetHeight) / 2 + "px";

      oDrag.style.display = "block";
      oDrag.style.width = `${dragMinWidth}px`;
      // oDrag.style.height = `${dragMinHeight}px`;
      oDrag.style.height = 'auto';
      oDrag.style.left =
        document.documentElement.clientWidth - oDrag.offsetWidth + "px";
      oDrag.style.top =
        document.documentElement.clientHeight - oDrag.offsetHeight + "px";
      // 重置右下角缩放块
      const oBR = get.byClass("resizeBR", oDrag)[0];
      oBR.style.display = "block";
      // 显示最小化按钮
      let oMin = get.byClass("min", oDrag)[0];
      oMin.style.display = "block";
    }

    if (test.value) {
      // $(`#window${val.uuid}`).removeClass('add_transform');
      $(`#window${val.uuid}`).animate({
        left: document.documentElement.clientWidth - Number(oDrag?.offsetWidth) - rightSafeMargin,
        top: val.unfoldClass.top,
      });
    } else {
      // $(`#window${val.uuid}`).toggleClass('add_transform');
      $(`#window${props.floatWindow.uuid}`).animate({
        left: document.documentElement.clientWidth - Number(oDrag?.offsetWidth) - rightSafeMargin,
        top: document.documentElement.clientHeight + 20,
      });
    }
  }
});

const props = defineProps({
  floatWindow: {
    type: Object as PropType<Revolver>, // 断言、props类型自定义约束
    default: () => null,
  },
});

const move = (e: MouseEvent) => {
  const move = new MouseMove(e);
};

// 窗口最小化
const onMinimize = () => {
  // 回调函数之前可以加个动画时常,800,
  $(`#window${props.floatWindow.uuid}`)
    .animate(
      {
        left: 30,
        top: 30,
        width: 0,
        height: 0,
      },
      function () {
        // message.success("动画完成");
        test.value = !test.value;
      }
    )
    .addClass("mytest");
};
</script>

<style scoped lang="less">
@charset "utf-8";
.add_transform {
  transform: scale(0);
  -ms-transform: scale(0); /* IE9 */
  -moz-transform: scale(0); /* Firefox */
  -webkit-transform: scale(0); /* Safari和Chrome */
  -o-transform: scale(0); /* Opera */
  transition: all 1.2s ease-in-out;
  -moz-transition: all 1.2s ease-in-out; /*Firefox 4 */
  -webkit-transition: all 1.2s ease-in-out; /* Safari和Chrome */
  -o-transition: all 1.2s ease-in-out; /* Opera */
}
.remove_transform {
  transform: scale(1);
  -ms-transform: scale(1); /* IE9 */
  -moz-transform: scale(1); /* Firefox */
  -webkit-transform: scale(1); /* Safari和Chrome */
  -o-transform: scale(1); /* Opera */
  transition: all 1.2s ease-in-out;
  -moz-transition: all 1.2s ease-in-out; /*Firefox 4 */
  -webkit-transition: all 1.2s ease-in-out; /* Safari和Chrome */
  -o-transition: all 1.2s ease-in-out; /* Opera */
}
/* 代码整理：懒人之家 lanrenzhijia.com */
body,
div,
h2 {
  margin: 0;
  padding: 0;
}
body {
  font: 12px/1.5 \5fae\8f6f\96c5\9ed1;
  color: #333;
}
// 初始位置
.drag {
  z-index: 999;
  position: absolute;
  top: 0;
  left: -999px;
  width: 300px;
  height: 160px;
  background: #e9e9e9;
  border: 1px solid #444;
  border-radius: 5px;
  box-shadow: 0 1px 3px 2px #666;
  overflow: hidden;
}
.drag .title {
  position: relative;
  height: 27px;
  margin: 5px;
}
.drag .title h2 {
  font-size: 14px;
  height: 27px;
  line-height: 24px;
  border-bottom: 1px solid #a1b4b0;
}
.drag .title div {
  position: absolute;
  height: 19px;
  top: 2px;
  right: 0;
}
.drag .title a,
a.open {
  float: left;
  width: 21px;
  height: 19px;
  display: block;
  margin-left: 5px;
  background: url(./tool.png) no-repeat;
}
a.open {
  position: absolute;
  top: 10px;
  left: 50%;
  margin-left: -10px;
  background-position: 0 0;
}
a.open:hover {
  background-position: 0 -29px;
}
.drag .title a.min {
  background-position: -29px 0;
}
.drag .title a.min:hover {
  background-position: -29px -29px;
}
.drag .title a.max {
  background-position: -60px 0;
}
.drag .title a.max:hover {
  background-position: -60px -29px;
}
.drag .title a.revert {
  background-position: -149px 0;
  display: none;
}
.drag .title a.revert:hover {
  background-position: -149px -29px;
}
.drag .title a.close {
  background-position: -89px 0;
}
.drag .title a.close:hover {
  background-position: -89px -29px;
}
.drag .content {
  overflow: auto;
  margin: 0 5px 5px;
}
.drag .resizeBR {
  position: absolute;
  width: 14px;
  height: 14px;
  right: 0;
  bottom: 0;
  overflow: hidden;
  cursor: nw-resize;
  background: url(./resize.png) no-repeat;
}
.drag .resizeL,
.drag .resizeT,
.drag .resizeR,
.drag .resizeB,
.drag .resizeLT,
.drag .resizeTR,
.drag .resizeLB {
  position: absolute;
  background: #000;
  overflow: hidden;
  opacity: 0;
  filter: alpha(opacity=0);
}
.drag .resizeL,
.drag .resizeR {
  top: 0;
  width: 5px;
  height: 100%;
  cursor: w-resize;
}
.drag .resizeR {
  right: 0;
}
.drag .resizeT,
.drag .resizeB {
  width: 100%;
  height: 5px;
  cursor: n-resize;
}
.drag .resizeT {
  top: 0;
}
.drag .resizeB {
  bottom: 0;
}
.drag .resizeLT,
.drag .resizeTR,
.drag .resizeLB {
  width: 8px;
  height: 8px;
  background: #ff0;
}
.drag .resizeLT {
  top: 0;
  left: 0;
  cursor: nw-resize;
}
.drag .resizeTR {
  top: 0;
  right: 0;
  cursor: ne-resize;
}
.drag .resizeLB {
  left: 0;
  bottom: 0;
  cursor: ne-resize;
}
</style>
