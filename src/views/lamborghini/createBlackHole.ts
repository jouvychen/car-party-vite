import * as THREE from 'three';

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

// const clock = new THREE.Clock();
// requestAnimationFrame(function animate(nowMsec) {
//   // keep looping
//   requestAnimationFrame(animate);
//   tuniform.value.iTime.value += clock.getElapsedTime();
// })
export const tuniform = ref({
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
      '/textures/iChannel1.png',
    ),
  },
  iChannel2: {
    type: 't',
    value: new THREE.TextureLoader().load(
      '/textures/16pic_8211096_s.png',
    ),
  },
});

tuniform.value.iChannel0.value.wrapS = tuniform.value.iChannel0.value.wrapT = THREE.RepeatWrapping;
tuniform.value.iChannel1.value.wrapS = tuniform.value.iChannel1.value.wrapT = THREE.RepeatWrapping;
tuniform.value.iChannel2.value.wrapS = tuniform.value.iChannel2.value.wrapT = THREE.RepeatWrapping;

export const createShaderMat = () => {
  // 顶点着色器
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `;
  // 片元着色器
  const fragmentShader = `
      #include <common>
      #include <uv_pars_vertex>
      #include <uv2_pars_vertex>
      uniform vec3 iResolution;
      uniform float iTime;
      uniform sampler2D iChannel0;
      uniform sampler2D iChannel1;
      uniform sampler2D iChannel2;
      uniform vec2 iMouse;
      // 以上是旧的

      //Changed Galaxy3 by  FabriceNeyret2
      //---  Galaxy --- Fabrice NEYRET  august 2013

      const float RETICULATION = 3.;  // strenght of dust texture
      const float NB_ARMS = 5.;       // number of arms
      //const float ARM = 3.;         // contrast in/out arms
      const float COMPR = .1;         // compression in arms
      const float SPEED = 10.0;
      const float GALAXY_R = 1./2.;
      const float BULB_R = 1./2.5;
      const vec3 GALAXY_COL = vec3(.9,.9,1.); //(1.,.8,.5);
      const vec3 BULB_COL   = vec3(1.,1.0,1.0);
      const float BULB_BLACK_R = 1./4.;
      const vec3 BULB_BLACK_COL   = vec3(0,0,0);
      const vec3 SKY_COL    = .5*vec3(.1,.3,.5);
          
      #define Pi 3.1415927

      // --- base noise
      float tex(vec2 uv) 
      {
        float n = texture(iChannel0,uv).r;
        
      #define MODE 3  // kind of noise texture
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


      // --- perlin turbulent noise + rotation
      float noise(vec2 uv)
      {
        float v=0.;
        float a=-SPEED*iTime,	co=cos(a),si=sin(a); 
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
        vec2 uv = fragCoord.xy/iResolution.y-vec2(.8,.5);
        vec3 col;
        
        // spiral stretching with distance
        float rho = length(uv); // polar coords
        float ang = atan(uv.y,uv.x);
        float shear = 2.*log(rho); // logarythmic spiral
        float c = cos(shear), s=sin(shear);
        mat2 R = mat2(c,-s,s,c);

        // galaxy profile
        float r; // disk
        r = rho/GALAXY_R; float dens = exp(-r*r);
        r = rho/BULB_R;	  float bulb = exp(-r*r);
        r = rho/BULB_BLACK_R; float bulb_black = exp(-r*r);
        float phase = NB_ARMS*(ang-shear);
        // arms = spirals compression
        ang = ang-COMPR*cos(phase)+SPEED*iTime;
        uv = rho*vec2(cos(ang),sin(ang));
        // stretched texture must be darken by d(new_ang)/d(ang)
        float spires = 1.+NB_ARMS*COMPR*sin(phase);
        // pires = mix(1.,sin(phase),ARM);
        dens *= .7*spires;	
        
        // gaz texture
        float gaz = noise(.09*1.2*R*uv);
        float gaz_trsp = pow((1.-gaz*dens),2.);

        // stars
        //float a=SPEED*iTime, co=cos(a),si=sin(a); 
        //mat2 M = mat2(co,-si,si,co);
        // adapt stars size to display resolution
        // float ratio = .8*iResolution.y/iChannelResolution[0].y;
        float ratio = 1.0;
        float stars1 = texture(iChannel1,ratio*uv+.5).r, // M*uv
              stars2 = texture(iChannel0,ratio*uv+.5).r,
            stars = pow(1.-(1.-stars1)*(1.-stars2),5.);
        
        //stars = pow(stars,5.);
        
        // keybord controls (numbers)
        if (keyToggle(49)) gaz_trsp = 1./1.7;
        if (keyToggle(50)) stars = 0.;
        if (keyToggle(51)) bulb = 0.;
        if (keyToggle(52)) dens = .3*spires;
        
        // mix all	
        col = mix(SKY_COL,
              gaz_trsp*(1.7*GALAXY_COL) + 1.2*stars, 
              dens);
        col = mix(col, 2.*BULB_COL,1.2* bulb);

        col = mix(col, 1.2*BULB_BLACK_COL, 2.0*bulb_black);

          
        fragColor = vec4(col,1.);
      }

      // 一直替换到这
      varying vec2 vUv;
      
      void main( void ) {
          mainImage(gl_FragColor, vUv * iResolution.xy);
      }
  `;

  // 允许平铺
  // flowTexture.wrapS = THREE.RepeatWrapping;
  return new THREE.ShaderMaterial({
    uniforms: tuniform.value,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
  });
};