// author: Gunnar Roth
// based on work from natewave
// https://gl-transitions.com/editor/GlitchMemories
import { vsSource } from '../common';
export const glitchMemories = {
  vsSource: vsSource,
  fsSource: `
        #ifdef GL_ES
        precision mediump float;
        #endif
        // 固定
        uniform sampler2D u_Sampler;
        uniform sampler2D u_Sampler1;
        uniform float progress;
        varying vec2 vUV;
        
        // 自定义uniform及其它产量
        
        // 固定方法
        vec4 getToColor(vec2  uv){
            return texture2D(u_Sampler1,uv);
        }
        vec4 getFromColor(vec2 uv){
            return texture2D(u_Sampler,uv);
        }

        vec4 transition (vec2 uv) {
          vec2 block = floor(uv.xy / vec2(16));
          vec2 uv_noise = block / vec2(64);
          uv_noise += floor(vec2(progress) * vec2(1200.0, 3500.0)) / vec2(64);
          vec2 dist = progress > 0.0 ? (fract(uv_noise) - 0.5) * 0.3 *(1.0 -progress) : vec2(0.0);
          vec2 red = uv + dist * 0.2;
          vec2 green = uv + dist * .3;
          vec2 blue = uv + dist * .5;
        
          return vec4(mix(getFromColor(red), getToColor(red), progress).r,mix(getFromColor(green), getToColor(green), progress).g,mix(getFromColor(blue), getToColor(blue), progress).b,1.0);
        }

        void main() {
            gl_FragColor =  transition(vUV);
        }
    `,
  uniforms: {},
  intervalTime: 100,
};
