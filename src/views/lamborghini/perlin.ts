export const perlin = {
  vsSource: `
  varying vec3 vPosition;
  varying vec2 vUV;
  void main() {
      // 顶点着色器计算后的Position
      vPosition = position;
      // 到时候通过它把uv数据传递给片元
      vUV = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
    `,
  fsSource: `
  // 设置浮点数精度
    precision mediump float;
    
    // uniform 变量
    uniform float scale;
    uniform float smoothness;
    uniform float seed;
    uniform sampler2D u_Sampler;
    uniform sampler2D u_Sampler1;
    uniform vec4 shadow_colour; 
    uniform float shadow_height; 
    uniform float bounces; 
    uniform float progress;
    
    // 传递给片段着色器的变量
    varying vec2 vUV;
    
    // 获取目标颜色
    vec4 getToColor(vec2 uv) {
        return texture2D(u_Sampler1, uv);
    }
    
    // 获取源颜色
    vec4 getFromColor(vec2 uv) {
        return texture2D(u_Sampler, uv);
    }
    
    // 随机数生成函数
    float random(vec2 co) {
        highp float a = seed;
        highp float b = 78.233;
        highp float c = 43758.5453;
        highp float dt = dot(co.xy, vec2(a, b));
        highp float sn = mod(dt, 3.14);
        return fract(sin(sn) * c);
    }
    
    // 噪声函数
    float noise(in vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
    
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
    
        vec2 u = f * f * (3.0 - 2.0 * f);
    
        return mix(a, b, u.x) +
                (c - a) * u.y * (1.0 - u.x) +
                (d - b) * u.x * u.y;
    }
    
    // 过渡函数
    vec4 transition(vec2 uv) {
        vec4 from = getFromColor(uv);
        vec4 to = getToColor(uv);
        float n = noise(uv * scale);
        
        float p = mix(-smoothness, 1.0 + smoothness, progress);
        float lower = p - smoothness;
        float higher = p + smoothness;
        
        float q = smoothstep(lower, higher, n);
        
        return mix(from,  to, 1.0 - q);
      }
      
      void main() {
          gl_FragColor = transition(vUV);
      }
    `,
  assignmentList: [
    {
      key: 'scale',
      value: [4.0],
    }, {
      key: 'smoothness',
      value: [0.01],
    }, {
      key: 'seed',
      value: [12.9898],
    },
  ],
};
