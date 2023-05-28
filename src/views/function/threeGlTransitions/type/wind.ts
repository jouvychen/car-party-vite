import { vsSource } from '../common';
export const wind = {
    vsSource: vsSource,
    fsSource: `
        #ifdef GL_ES
        precision mediump float;
        #endif
        uniform float size; // = 0.2
        uniform float tailLength; // = 43758.5453


        uniform sampler2D u_Sampler;
        uniform sampler2D u_Sampler1;
        uniform float progress;
        varying vec2 vUV;

        vec4 getToColor(vec2  uv){
            return texture2D(u_Sampler1,uv);
        }
        vec4 getFromColor(vec2 uv){
            return texture2D(u_Sampler,uv);
        }

        float rand (vec2 co) {
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * tailLength);
        }


        vec4 transition (vec2 uv) {
            float r = rand(vec2(0, uv.y));
            float m = smoothstep(0.0, -size, uv.x*(1.0-size) + size*r - (progress * (1.0 + size)));
            return mix(
                getFromColor(uv),
                getToColor(uv),
                m
            );
        }
        void main() {
            gl_FragColor =  transition(vUV);
        }
    `,
    uniforms: {
        size: {
            value: 0.1
        },
        tailLength: {
            value: 1.0 // 画布越宽, 数值越大
        }
    },
};
