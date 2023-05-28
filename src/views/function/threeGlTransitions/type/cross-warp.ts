import { vsSource } from '../common';
export const crossWarp = {
  vsSource: vsSource,
  fsSource: `
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform sampler2D u_Sampler;
        uniform sampler2D u_Sampler1;
        varying vec2 vUV;

        uniform float progress;
        const float PI = 3.14159265358;
        vec4 getToColor(vec2  uv){
            return texture2D(u_Sampler1,uv);
        }
        vec4 getFromColor(vec2 uv){
            return texture2D(u_Sampler,uv);
        }

        vec4 transition (vec2 uv) {
            float x = progress;
            x=smoothstep(.0,1.0,(x*2.0+uv.x-1.0));
            return mix(getFromColor((uv-.5)*(1.-x)+.5), getToColor((uv-.5)*x+.5), x);
        }

        void main() {
            gl_FragColor =  transition(vUV);
        }
    `,
  uniforms: {},
};
