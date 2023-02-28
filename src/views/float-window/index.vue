<template>
  <div
    v-if="floatWindow.uuid"
    :id="`window${floatWindow.uuid}`"
    class="box blurred-bg tinted"
    @mousedown="move"
  >
    <div class="container">
      <div class="container-controls">
        {{ floatWindow.name }}
        <span
          class="control-item control-minimize js-minimize"
          @mousedown="onMinimize"
          >‒</span
        >
        <!-- <span class="control-item js-maximize">□</span>
        <span class="control-item js-close">˟</span> -->
      </div>
      <div class="container-content">
        <div class="container-cursor">
          <!-- {{ floatWindow.uuid }}--{{ test }} -->
          <slot name="content"></slot>
        </div>
      </div>
    </div>
    <div class="prompt-shortcut i-prompt hidden js-open"></div>
  </div>
</template>
<script setup lang="ts">
import $ from "jquery";
import { MouseMove } from "./tools";
import { PropType } from "vue";
import { message } from "ant-design-vue/es";
import type { Revolver } from "../revolver/typeStatement";
import EventsBus from "@/utils/eventBus";

// const store = useStore();
// const revolverSelected = computed(() => store.state.revolverSelected); // 暂时没用
const test = ref(false);

EventsBus.on("onBusRevolver", (value) => {
  const val = value as Revolver;
  if (val.uuid === props.floatWindow.uuid) {
    test.value = !test.value;

    if (test.value) {
      $(`#window${val.uuid}`).animate({
        left: val.unfoldClass.right,
        top: val.unfoldClass.top,
        width: val.unfoldClass.width,
        height: val.unfoldClass.height,
      });
    } else {
      $(`#window${props.floatWindow.uuid}`).animate({
        left: 30,
        top: 30,
        width: 0,
        height: 0,
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

onMounted(() => {
  var prompt = {
    // window: $(`#window${random.value}`),
    window: $(`#window${props.floatWindow.uuid}`),
    shortcut: $(".prompt-shortcut"),
    input: $(".js-prompt-input"),

    init: function () {
      $(".js-minimize").click(prompt.minimize);
      $(".js-maximize").click(prompt.maximize);
      $(".js-close").click(prompt.close);
      $(".js-open").click(prompt.open);
      prompt.input.focus();
      prompt.input.blur(prompt.focus);
    },
    focus: function () {
      prompt.input.focus();
    },
    minimize: function () {
      // prompt.window.removeClass('window--maximized');
      // prompt.window.toggleClass('window--minimized');
    },
    maximize: function () {
      // prompt.window.removeClass('window--minimized');
      // prompt.window.toggleClass('window--maximized');
      // prompt.focus();
    },
    close: function () {
      prompt.window.addClass("window--destroyed");
      prompt.window.removeClass("window--maximized window--minimized");
      prompt.shortcut.removeClass("hidden");
      prompt.input.val("");
    },
    open: function () {
      prompt.window.removeClass("window--destroyed");
      prompt.shortcut.addClass("hidden");
      prompt.focus();
    },
  };
  $(document).ready(prompt.init);
});
</script>

<style scoped lang="less">
.mytest {
  &:hover {
    transform: translateX(20);
    box-shadow: 2px 6px 10px rgba(0, 0, 0, 0.5);
    transition: box-shadow transform 0.5s ease;
  }
}
.window--minimized {
  height: 25px !important;
  width: 180px !important;
}

.box-shadow {
  box-shadow: 0 20px 30px rgba(0, 0, 0, 0.6);
  transition: box-shadow 0.3s ease;
}

.box {
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  position: absolute;
  border-radius: 5px;
  z-index: 999;

  padding-top: 25px;
  text-align: center;
  display: flex;

  background: #dfdfdf;
  overflow: hidden;

  &:active {
    cursor: move;

    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.9);
  }

  .container {
    width: 100%;
    height: 100%;
    padding: 8px;
    background-color: #ffffff;
    transition: all ease-in-out 0.3s;
  }

  .container.window--maximized {
    width: 100%;
    flex-grow: 1;
  }

  .container.window--destroyed {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .container-controls {
    display: flex;
    height: 25px;
    justify-content: flex-end;
    align-items: center;
    background-color: #eee;
    width: 100%;
    position: absolute;
    right: 0;
    top: 0;

    pointer-events: none;
  }

  .container-controls .control-item {
    width: 25px;
    height: 25px;
    text-align: center;
    color: #333;
    transition: all ease-in 0.15s;
    cursor: pointer;

    &:hover {
      background-color: #ccc;
    }
  }

  .control-item.control-minimize {
    line-height: 22px;
  }

  .container-content {
    :deep(.ant-btn) {
      span {
        top: 0 !important;
        left: 0 !important;
      }
    }
  }

  .container-cursor {
    display: flex;
    margin: 5px;
    .i-cursor-indicator {
      color: #fff;
      font-size: 1em;
      font-family: "Consolas", monospace;
      margin: 0 2px 0 5px;
    }
    .i-cursor-underscore {
      width: 10px;
      height: 3px;
      background-color: #fff;
      align-self: flex-end;
      margin-right: 5px;
      animation: blink 1s steps(2, start) infinite;
    }
  }
  .container-input {
    background-color: inherit;
    border: none;
    outline: 0;
    color: transparent;
    text-shadow: 0 0 0 #fff;
    font-family: "Consolas", monospace;
    flex: 1;

    &:focus {
      outline: none;
    }
  }

  .i-prompt {
    width: 62px;
    height: 62px;
    background: url("https://cdn4.iconfinder.com/data/icons/small-n-flat/24/terminal-48.png")
      no-repeat center;
    background-color: rgba(0, 0, 0, 0.35);
    border-radius: 10px;
    box-shadow: 0 3px 1px rgba(0, 0, 0, 0.25);
    cursor: pointer;
    transition: all ease-in-out 0.15s;
    &:hover {
      background-position: center 4px;
    }
  }
  .i-prompt.hidden {
    width: 0;
    height: 0;
    opacity: 0;
  }

  @keyframes blink {
    to {
      visibility: hidden;
    }
  }
}
</style>
