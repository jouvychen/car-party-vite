import { vsSource } from '../common';
export const morph = {
  vsSource: vsSource,
  fsSource: `
        #ifdef GL_ES
        precision mediump float;
        #endif

        uniform float strength; // = 0.1


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


        vec4 transition (vec2 p) {
            vec4 ca = getFromColor(p);
            vec4 cb = getToColor(p);
            
            vec2 oa = (((ca.rg+ca.b)*0.5)*2.0-1.0);
            vec2 ob = (((cb.rg+cb.b)*0.5)*2.0-1.0);
            vec2 oc = mix(oa,ob,0.5)*strength;
            
            float w0 = progress;
            float w1 = 1.0-w0;
            return mix(getFromColor(p+oc*w0), getToColor(p-oc*w1), progress);
        }

        void main() {
            gl_FragColor =  transition(vUV);
        }
    `,
  uniforms: {
    strength: {
      value: 0.1
    }
  },
};