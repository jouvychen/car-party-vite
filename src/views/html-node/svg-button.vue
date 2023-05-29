<template>
  <button
    type="button"
    class="html-btn Cta__wrapper styles__font-size-cta styles__align-center styles__justify-center Cta__isHotPoint hp-visible"
  >
    <div class="Cta__hexagon-wrapper">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 36 40"
        class="Cta__outline"
      >
        <defs>
          <clipPath id="cp-162">
            <rect data-name="mask" width="36" height="40"></rect>
          </clipPath>
        </defs>
        <g transform="translate(2, 2)">
          <path
            d="M0,8,16,0,32,8V28L16,36,0,28Z"
            vector-effect="non-scaling-stroke"
            opacity="0.25"
            stroke-width="2"
            stroke="#fff"
            fill="none"
          ></path>
          <g clip-path="url(#cp-162)">
            <path
              d="M0,8,16,0,32,8V28L16,36,0,28Z"
              vector-effect="non-scaling-stroke"
              opacity="1"
              stroke-width="2"
              stroke="#fff"
              fill="none"
            ></path>
          </g>
        </g>
      </svg>

      <div class="Cta__hexagonHaloWrapper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 36 40"
          class="Cta__hexagonHalo"
        >
          <defs>
            <clipPath>
              <rect data-name="mask" width="36" height="40"></rect>
            </clipPath>
          </defs>
          <g transform="translate(2, 2)">
            <path
              d="M0,8,16,0,32,8V28L16,36,0,28Z"
              vector-effect="non-scaling-stroke"
              opacity="0.25"
              stroke-width="1.5"
              stroke="#fff"
              fill="none"
            ></path>
            <g clip-path="url(#null)">
              <path
                d="M0,8,16,0,32,8V28L16,36,0,28Z"
                vector-effect="non-scaling-stroke"
                opacity="1"
                stroke-width="1.5"
                stroke="#fff"
                fill="none"
              ></path>
            </g>
          </g>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 36 40"
          class="Cta__hexagonHalo"
        >
          <defs>
            <clipPath>
              <rect data-name="mask" width="36" height="40"></rect>
            </clipPath>
          </defs>
          <g transform="translate(2, 2)">
            <path
              d="M0,8,16,0,32,8V28L16,36,0,28Z"
              vector-effect="non-scaling-stroke"
              opacity="0.25"
              stroke-width="1.5"
              stroke="#fff"
              fill="none"
            ></path>
            <g clip-path="url(#null)">
              <path
                d="M0,8,16,0,32,8V28L16,36,0,28Z"
                vector-effect="non-scaling-stroke"
                opacity="1"
                stroke-width="1.5"
                stroke="#fff"
                fill="none"
              ></path>
            </g>
          </g>
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 36 40"
          class="Cta__hexagonHalo"
        >
          <defs>
            <clipPath>
              <rect data-name="mask" width="36" height="40"></rect>
            </clipPath>
          </defs>
          <g transform="translate(2, 2)">
            <path
              d="M0,8,16,0,32,8V28L16,36,0,28Z"
              vector-effect="non-scaling-stroke"
              opacity="0.25"
              stroke-width="1.5"
              stroke="#fff"
              fill="none"
            ></path>
            <g clip-path="url(#null)">
              <path
                d="M0,8,16,0,32,8V28L16,36,0,28Z"
                vector-effect="non-scaling-stroke"
                opacity="1"
                stroke-width="1.5"
                stroke="#fff"
                fill="none"
              ></path>
            </g>
          </g>
        </svg>
      </div>
    </div>

    <!-- 加号svg -->
    <svg width="1em" height="1em" viewBox="0 0 100 100" class="Cta__icon">
      <path d="M20 31l30-15 30 15v37.5l-30 15-30-15z" fill="#fff"></path>
      <g data-name="plus" fill="none" stroke="#000" stroke-width="4">
        <path data-name="Line 2" d="M50 39v22"></path>
        <path data-name="Line 5" d="M61 50H39"></path>
      </g>
    </svg>

    <!-- 关闭svg -->
    <!-- <svg
      width="1em"
      height="1em"
      viewBox="0 0 100 100"
      class="Cta__icon"
    >
      <defs>
        <clipPath id="close_svg__a"><path d="M0 0h100v100H0z"></path></clipPath>
      </defs>
      <g
        fill="none"
        stroke="#fff"
        stroke-width="4"
        clip-path="url(#close_svg__a)"
      >
        <path data-name="Line 28" d="M39.653 60.347l20.693-20.693"></path>
        <path data-name="Line 29" d="M39.653 39.653l20.693 20.693"></path>
      </g>
    </svg> -->

    <!-- 视频播放svg -->
    <!-- <svg width="1em" height="1em" viewBox="0 0 100 100" class="Cta__icon">
      <defs>
        <clipPath id="audio_svg__a">
          <path d="M0 0h100v100H0z"></path>
        </clipPath>
      </defs>
      <g clip-path="url(#audio_svg__a)">
        <path d="M20 31l30-15 30 15v37.5l-30 15-30-15z" fill="#fff"></path>
        <path
          data-name="Icon open-audio-spectrum"
          d="M51.571 37v25.143h3.143V37zm-6.285 3.143V59h3.143V40.143zm12.571 3.143v12.571H61V43.286zM39 46.429v6.286h3.143v-6.286z"
        ></path>
      </g>
    </svg> -->

    <span class="Cta__label Cta__label-bottom"
      ><span class="Cta__line">按钮说明文字</span></span
    >
  </button>
</template>
<script setup lang="ts">
</script>

<style scoped lang="less">
.Cta__wrapper {
  position: relative;
}
.styles__font-size-cta {
  font-weight: 700;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.styles__align-center {
  display: flex;
  align-items: center;
}
.styles__justify-center {
  display: flex;
  justify-content: center;
}
.Cta__isHotPoint {
  pointer-events: auto;
}
.Cta__hexagon-wrapper .Cta__outline {
  width: 100%;
  height: auto;
}
.Cta__wrapper.Cta__isHotPoint .Cta__outline [data-name="inner"] {
  fill: #fff;
  transform: scale(0.5);
  transform-origin: center;
}

.Cta__wrapper.Cta__isHotPoint .Cta__outline [data-name="border"] {
  fill: rgba(255, 255, 255, 0.50196);
}

.Cta__wrapper.Cta__isHotPoint .Cta__outline [data-name="inner"] {
  fill: #fff;
  transform: scale(0.5);
  transform-origin: center;
}

.Cta__wrapper.Cta__isHotPoint .Cta__outline [data-name="border"] {
  fill: rgba(255, 255, 255, 0.50196);
}

.Cta__wrapper.Cta__isHotPoint .Cta__icon [data-name="plus"] {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: 50% 50%;
  will-change: transform;
  transform: rotate(0);
}

.Cta__wrapper.Cta__isHotPoint .Cta__hexagon-wrapper {
  width: var(--hot-point-width);
}

.Cta__wrapper.Cta__isHotPoint .Cta__line {
  transform: translateY(100%);
}

@media (hover: hover) {
  .Cta__wrapper.Cta__isHotPoint:hover .Cta__icon [data-name="plus"] {
    transform: rotate(180deg);
  }

  .Cta__wrapper.Cta__isHotPoint:hover .Cta__line {
    transform: translateY(0%);
  }

  .Cta__wrapper.Cta__isHotPoint:hover .Cta__hexagonHalo {
    -webkit-animation: Cta__halo 2s cubic-bezier(0.22, 1, 0.36, 1)
      var(--scale-delay) infinite;
    animation: Cta__halo 2s cubic-bezier(0.22, 1, 0.36, 1) var(--scale-delay)
      infinite;
  }
}

.hp-visible {
  opacity: 1;
  pointer-events: auto;
  transition: opacity 200ms ease-out;
}

.hp-hidden,
.hp-hidden.hp-visible {
  opacity: 0;
  pointer-events: none !important;
}

.scene-transition .hp-visible,
.layer-open .hp-visible,
.orbit-drag .hp-visible {
  opacity: 0;
  pointer-events: none !important;
}

body.webgl-app-started:not(.orbit-drag):not(.layer-open) .hp-visible {
  transition-delay: 400ms;
}

body:not(.webgl-app-started) .hp-visible {
  transition-delay: 1600ms;
}

.Cta__hexagon-wrapper {
  position: relative;
  font-size: 0;
  width: 40px;
  height: auto;
}

.Cta__hexagon-wrapper .Cta__outline {
  width: 100%;
  height: auto;
}

.Cta__wrapper.Cta__isIn .Cta__hexagonHaloWrapper {
  opacity: 1;
}

.Cta__wrapper.Cta__isOut .Cta__hexagonHaloWrapper {
  opacity: 0;
  transition: opacity 0.25s;
}
.Cta__hexagonHaloWrapper {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  z-index: 1;
}

.Cta__hexagonHalo {
  --scale-target: 1.4;
  --scale-delay: 0.4s;
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  transform: scale(1);
  z-index: -1;
  width: 100%;
  height: auto;
}

.Cta__hexagonHalo.Cta__animation:hover .Cta__hexagonHalo {
  -webkit-animation: Cta__halo 2s cubic-bezier(0.22, 1, 0.36, 1)
    var(--scale-delay) 1;
  animation: Cta__halo 2s cubic-bezier(0.22, 1, 0.36, 1) var(--scale-delay) 1;
}

.Cta__hexagonHalo:nth-of-type(2) {
  --scale-target: 1.6;
  --scale-delay: 0.2s;
}

.Cta__hexagonHalo:nth-of-type(3) {
  --scale-target: 1.8;
  --scale-delay: 0s;
}

.Cta__icon [data-name="plus"] {
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transform-origin: 50% 50%;
  will-change: transform;
  transform: rotate(0);
}

.Cta__icon,
.Cta__label {
  position: absolute;
  pointer-events: none;
}

.Cta__wrapper.Cta__isHotPoint:active .Cta__icon {
  transition: transform 0.3s ease;
  transform-origin: center;
  transform: scale(0.85);
}

.Cta__label {
  height: 1.4em;
  white-space: nowrap;
  overflow: hidden;
  color: #fff;
}

.Cta__label-left {
  right: calc(4px + (16 - 4) * ((100vw - 320px) / (1920 - 320)));
}

.Cta__label-right {
  left: calc(4px + (16 - 4) * ((100vw - 320px) / (1920 - 320)));
}

.Cta__label-bottom {
  top: calc(4px + (16 - 4) * ((100vw - 320px) / (1920 - 320)));
}

.Cta__label-top {
  bottom: calc(4px + (16 - 4) * ((100vw - 320px) / (1920 - 320)));
}

.Cta__icon {
  width: 100%;
  height: 100%;
}

@keyframes Cta__halo {
  0% {
    opacity: 0;
    transform: scale(1);
  }
  50% {
    opacity: 0.2;
  }
  100% {
    opacity: 0;
    transform: scale(var(--scale-target));
  }
}

button {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border: none;
  background: none;
  cursor: pointer;
  color: currentColor;
  text-transform: inherit;
  letter-spacing: inherit;
  font: inherit;
  padding: 0;
  width: 100%;

  &:focus {
    outline: none;
  }
}

.Cta__label-bottom {
  top: 60px;
}

.Cta__line {
  transform: translateY(0%);
}

@media (hover: hover) {
  .Cta__wrapper:hover .Cta__line {
    transform: translateY(-100%);
  }

  .Cta__wrapper:hover svg [data-name="mask"] {
    transform: scale(1, 1);
  }
}

.Cta__wrapper.Cta__hovered .Cta__line {
  transform: translateY(-100%);
}

.Cta__wrapper.Cta__hovered svg [data-name="mask"] {
  transform: scale(1, 1);
}

.Cta__wrapper.Cta__toggle .Cta__line {
  transform: translateY(100%);
}

@media (hover: hover) {
  .Cta__wrapper.Cta__toggle:hover .Cta__line {
    transform: translateY(0%);
  }
}

.Cta__wrapper.Cta__toggle.Cta__isActive .Cta__line {
  transform: translateY(-100%);
}

.Cta__wrapper.Cta__isHotPoint .Cta__line {
  transform: translateY(100%);
}

@media (hover: hover) {
  .Cta__wrapper.Cta__isHotPoint:hover .Cta__icon [data-name="plus"] {
    transform: rotate(180deg);
  }

  .Cta__wrapper.Cta__isHotPoint:hover .Cta__line {
    transform: translateY(0%);
  }

  .Cta__wrapper.Cta__isHotPoint:hover .Cta__hexagonHalo {
    -webkit-animation: Cta__halo 2s cubic-bezier(0.22, 1, 0.36, 1)
      var(--scale-delay) infinite;
    animation: Cta__halo 2s cubic-bezier(0.22, 1, 0.36, 1) var(--scale-delay)
      infinite;
  }
}

.Cta__line {
  position: relative;
  display: inline-block;
  will-change: transform;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transform: translateY(0%);
  height: 1.4em;
}

.Cta__line:after {
  content: attr(data-text);
  position: relative;
  display: block;
  left: 0;
}

/* 悬浮svg变粗 */
.Cta__wrapper svg [data-name="mask"] {
  transform: scale(1, 0);
  transform-origin: 0 17px;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
</style>
