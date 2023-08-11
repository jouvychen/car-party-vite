import * as THREE from 'three';
import { getAssetsUrlRelative } from "@/utils/common";
import { calculateBoundingBox } from '@/utils/threejsUtils';
import { ObjectKeys } from '@/utils/interface';

// 着色器输入
// uniform vec3      iResolution;           // viewport resolution (in pixels)
// uniform float     iTime;                 // shader playback time (in seconds)
// uniform float     iTimeDelta;            // render time (in seconds)
// uniform float     iFrameRate;            // shader frame rate
// uniform int       iFrame;                // shader playback frame
// uniform float     iChannelTime[4];       // channel playback time (in seconds)
// uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
// uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click
// uniform samplerXX iChannel0..3;          // input channel. XX = 2D/Cube
// uniform vec4      iDate;                 // (year, month, day, time in seconds)
// uniform float     iSampleRate;           // sound sample rate (i.e., 44100)

export class CreateBlackHole {
  public vertexShader!: string;
  public fragmentShader!: string;
  public blackHoleMaterial!: THREE.ShaderMaterial;
  public static uniform: ObjectKeys;
  // 纹理的宽度和高度
  private static iChannelResolution = {
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  };
  private static myImageTexture: THREE.Texture;


  constructor(mesh: THREE.Mesh) {
    this.setAvatar();
    this.setUniform();

    // 计算传入mesh的包围盒，设置采样所需纹理尺寸数据
    const { width, height } = calculateBoundingBox(mesh, true);

    this.setVertexShader(width, height);
    this.setFragmentShader();

    this.createMaterial();
  }

  setAvatar() {
    const avatar = getAssetsUrlRelative('../assets/images/iframe-page/about-me/', 'avatar.jpg');
    const texture = new THREE.TextureLoader().load('/textures/iChannel0.png', () => {
      // 纹理加载完成后，获取纹理的宽度和高度
      CreateBlackHole.iChannelResolution.width = texture.image.width;
      CreateBlackHole.iChannelResolution.height = texture.image.height;
    });
    CreateBlackHole.myImageTexture = new THREE.TextureLoader().load(avatar);
  }

  setUniform() {
    CreateBlackHole.uniform = {
      iTime: {
        value: 0.0,
      },
      iResolution: {
        value: new THREE.Vector3(window.innerWidth, window.innerHeight, 1.0), // 宽度、高度和深度，用于纹理采样
      },
      iChannel0: {
        type: 't',
        value: new THREE.TextureLoader().load(
          '/textures/iChannel0.png',
        ),
      },
      iChannel1: {
        type: 't',
        value: new THREE.TextureLoader().load(
          '/textures/iChannel1.jpg',
        ),
      },
      iChannel2: {
        type: 't',
        value: new THREE.TextureLoader().load(
          '/textures/iChannel2.png',
        ),
      },
      avatariIChannel: {
        type: 't',
        value: CreateBlackHole.myImageTexture,
      },
      transparency: {
        value: 1.0,
      },
    }
    CreateBlackHole.uniform.iChannel0.value.wrapS = CreateBlackHole.uniform.iChannel0.value.wrapT = THREE.RepeatWrapping;
    CreateBlackHole.uniform.iChannel1.value.wrapS = CreateBlackHole.uniform.iChannel1.value.wrapT = THREE.RepeatWrapping;
    CreateBlackHole.uniform.iChannel2.value.wrapS = CreateBlackHole.uniform.iChannel2.value.wrapT = THREE.RepeatWrapping;
  }

  setVertexShader(width: number, height: number) {
    this.vertexShader = `
      varying vec2 vUv;
      void main() {
        // 比例应该是mesh的，而不是屏幕分辨率
        vec2 aspectRatio = vec2(${width.toFixed(6)} / ${height.toFixed(6)}, 1.0);
        vec2 scaledUV = uv * aspectRatio; // 对纹理坐标进行缩放
        vec2 offset = (vec2(1.0) - aspectRatio) * 0.5; // 计算偏移量
        // vUv = vec2(scaledUV.x, uv.y); // 保持星系的形状不变
        vUv = scaledUV + offset; // 对纹理坐标进行偏移
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `
  }

  setFragmentShader() {
    this.fragmentShader = `
    uniform vec3 iResolution;
    uniform float iTime;
    uniform float transparency;
    uniform sampler2D iChannel0;
    uniform sampler2D iChannel1;
    uniform sampler2D iChannel2;
    uniform sampler2D avatariIChannel;
    varying vec2 vUv;
  
    const float RETICULATION = 1.;  // 粉尘质地强度
    const float NB_ARMS = 5.;       // 星臂数
    const float COMPR = .1;         // 星臂内压缩程度
    const float SPEED = .1;
    const float GALAXY_R = 1./2.; // 星系磁盘样的半径
    const float BULB_R = 1./2.8; // 星系黑洞的半径
    const vec3 GALAXY_COL = vec3(.9,.9,1.); //(1.,.8,.5);
    const vec3 BULB_COL   = vec3(1.,1.0,1.0);
    const float BULB_BLACK_R = 1./4.; // 星系黑洞的另一个形状的半径
    const vec3 BULB_BLACK_COL   = vec3(0,0,0);
    const vec3 SKY_COL    = .5*vec3(.1,.3,.5);
    
    // 宏定义
    #define Pi 3.1415927
    #define t iTime
  
    // 基础噪音
    float tex(vec2 uv) 
    {
      float n = texture(iChannel0,uv).r;
      
      #define MODE 3  // 噪音类型
      #if MODE==0         // unsigned
        #define A 2.
        return n;
      #elif MODE==1       // signed
        #define A 3.
        return 2.*n-1.;
      #elif MODE==2       // bulbs
        #define A 3.
        return abs(2.*n-1.);
      #elif MODE==3       // wires
        #define A 1.5
        return 1.-abs(2.*n-1.);
      #endif
    }
  
  
    // 柏林湍流噪声+旋转
    float noise(vec2 uv)
    {
      float v=0.;
      float a=-SPEED*t,	co=cos(a),si=sin(a); 
      mat2 M = mat2(co,-si,si,co);
      const int L = 7;
      float s=1.;
      for (int i=0; i<L; i++)
      {
        uv = M*uv;
        float b = tex(uv*s);
        v += 1./s* pow(b,RETICULATION); 
        s *= 2.;
      }
      
      return v/2.;
    }
  
    bool keyToggle(int ascii) 
    {
      return (texture(iChannel2,vec2((.5+float(ascii))/256.,0.75)).x > 0.);
    }
  
    void mainImage( out vec4 fragColor, in vec2 fragCoord )
    {
      // 采样中心
      vec2 uv = vUv - vec2(0.5);
      vec3 col;
      
      // 螺旋形随距离拉伸
      float rho = length(uv); // 极坐标
      float ang = atan(uv.y,uv.x);
      float shear = 2.*log(rho); // 螺旋层数/圈数
      float c = cos(shear), s=sin(shear);
      mat2 R = mat2(c,-s,s,c);
  
      // 星系概要
      float r; // 星系磁盘样
      r = rho/GALAXY_R; float dens = exp(-r*r);
      r = rho/BULB_R;	  float bulb = exp(-r*r);
      r = rho/BULB_BLACK_R; float bulb_black = exp(-r*r);
      float phase = NB_ARMS*(ang-shear);
      // arms = spirals compression
      ang = ang-COMPR*cos(phase)+SPEED*t;
      uv = rho*vec2(cos(ang),sin(ang));
      // 拉伸后的纹理必须变暗 d(new_ang)/d(ang)
      float spires = 1.+NB_ARMS*COMPR*sin(phase);
      dens *= .7*spires;
      
      // gaz texture
      float gaz = noise(.09*1.2*R*uv);
      float gaz_trsp = pow((1.-gaz*dens),2.);
  
      // stars
      // 屏幕高度与第一个纹理高度之间的比例值，用于调整纹理采样的位置
      // iChannelResolution是一个uniform数组，表示各个纹理（iChannel0、iChannel1等）的分辨率
      float ratio = .8*iResolution.y/${CreateBlackHole.iChannelResolution.height.toFixed(1)};
      float stars1 = texture(iChannel1,ratio*uv+.5).r, // M*uv
            stars2 = texture(iChannel0,ratio*uv+.5).r,
          stars = pow(1.-(1.-stars1)*(1.-stars2),5.);
      
      // 键盘控制效果交互
      if (keyToggle(49)) gaz_trsp = 1./1.7;
      if (keyToggle(50)) stars = 0.;
      if (keyToggle(51)) bulb = 0.;
      if (keyToggle(52)) dens = .3*spires;
      
      // 混合所有效果	
      col = mix(SKY_COL,
            gaz_trsp*(1.7*GALAXY_COL) + 1.2*stars, 
            dens);
      col = mix(col, 2.*BULB_COL,1.2* bulb);
  
      col = mix(col, 1.2*BULB_BLACK_COL, 2.0*bulb_black);
  
      // 头像
      // 将头像裁剪成圆形
      vec2 center = vec2(0.5, 0.5); // 头像中心点的uv坐标
      float radius = 0.2; // 圆形半径
      float dist = distance(vUv, center);
      float avatarMask = step(dist, radius); // 判断是否在头像圆形区域内，是则为1.0，否则为0.0
  
      // if (dist > radius) {
      //     discard; // 不在圆形内的像素丢弃
      // }
  
      // 缩小头像
      float scale = 2.5; // 缩小比例
      vec2 scaledUV = (vUv - center) * scale + center;
      scaledUV.y = 1.0 - scaledUV.y; // 反转头像的Y轴方向

      // 计算随时间变化的旋转角度
      float rotationSpeed = 0.5; // 旋转速度
      float angle = t * rotationSpeed;

      // 计算旋转中心的偏移
      float centerX = 0.5; // 旋转中心X坐标
      float centerY = 0.5; // 旋转中心Y坐标

      // 逆时针旋转头像
      vec2 rotatedUV = vec2(
        // 计算绕旋转中心逆时针旋转后的 X 坐标。scaledUV.x - centerX 表示将头像的 X 坐标相对于旋转中心进行偏移，然后通过 cos(angle) 和 sin(angle) 计算了旋转后的 X 坐标。
        cos(angle) * (scaledUV.x - centerX) - sin(angle) * (scaledUV.y - centerY),
        // 计算绕旋转中心逆时针旋转后的 Y 坐标。scaledUV.y - centerY 表示将头像的 Y 坐标相对于旋转中心进行偏移，然后通过 sin(angle) 和 cos(angle) 计算了旋转后的 Y 坐标。
        sin(angle) * (scaledUV.x - centerX) + cos(angle) * (scaledUV.y - centerY)
      ) + vec2(centerX, centerY);
      // 用于将旋转后的坐标还原到以 (centerX, centerY) 为中心的坐标系中。因为在计算旋转后的坐标时，是相对于 (centerX, centerY) 进行旋转的，所以最后需要添加 vec2(centerX, centerY) 这个补偿
  
      // 获取缩小后的头像颜色
      vec3 avatarColor = texture(avatariIChannel, rotatedUV).rgb;
      
      // 添加头像边缘的渐变效果
      float avatarAlpha = texture(avatariIChannel, vUv).a;
      float gradient = smoothstep(radius, radius - 0.02, dist); // 控制圆形边缘的渐变程度
      avatarMask *= gradient;
  
      // 将头像设置于最上层
      col = mix(col, avatarColor, avatarAlpha * avatarMask);
  
      fragColor = vec4(col, transparency);
    }
    
    void main( void ) {
        mainImage(gl_FragColor, vUv * iResolution.xy);
        // 直接将加载成功的贴图以图片纹理展示
        // vec4 texColor = texture(iChannel2, vUv);
        // gl_FragColor = texColor;
    }
  `
  }

  createMaterial() {
    this.blackHoleMaterial = new THREE.ShaderMaterial({
      uniforms: CreateBlackHole.uniform,
      // transparent: true,
      // depthWrite: false,
      // depthTest: true,
      // side: THREE.DoubleSide,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
    });
  }


};