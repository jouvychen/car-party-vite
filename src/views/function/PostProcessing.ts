//https://jsfiddle.net/prisoner849/jm0vb71c/, https://discourse.threejs.org/t/selective-bloom-parts-of-a-single-geometry/28683
// https://stackoverflow.com/questions/67014085/threejs-selective-bloom-for-specific-parts-of-one-object-using-emission-map


//https://github.com/vanruesc/postprocessing
interface BloomParams {
    strength: number;
    threshold: number;
    radius: number;
}

import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js';
import { vertexShader } from '../shaders/bloomShaders/vertex'
import { fragmentShader } from '../shaders/bloomShaders/fragment'
import Experience from './Experience.js'
import { CreateBasicThree } from './CreateBasicThree'
import { ObjectKeys } from '@/utils/interface'

import {
    useStoreApp,
  } from "@/store";
const appStore = useStoreApp();

export class PostProcessing {
    BLOOM_SCENE = 1;

    darkMaterial!: THREE.MeshBasicMaterial;
    materials!: ObjectKeys;
    bloomLayer!: THREE.Layers;
    bloomParams!: BloomParams;
    three!: CreateBasicThree;

    scene!: THREE.Scene;
    camera!: THREE.PerspectiveCamera;
    renderer!: THREE.WebGLRenderer;

    ramenShop!: THREE.Object3D;

    renderTarget!: THREE.WebGLRenderTarget;
    renderPass!: RenderPass;
    fxaaPass!: ShaderPass;
    bloomPass!: UnrealBloomPass;
    bloomComposer!: EffectComposer;
    finalPass!: ShaderPass;
    finalComposer!: EffectComposer;
    smaaPass!: SMAAPass;

    constructor(modal: THREE.Object3D, scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;



        this.three = new CreateBasicThree();

        this.ramenShop = modal
        this.setBloomConfig()
        this.setBloomObjects()
        this.setRenderTarget()
        this.setPasses()
        this.renderBloom()
    }

    setBloomConfig() {
        // 设置图层属性.当mesh的图层mask和摄像机的mask一样才会被渲染出来
        this.bloomLayer = new THREE.Layers();
        this.bloomLayer.set(this.BLOOM_SCENE);

        this.bloomParams = Object.create({
            strength: 1.2,
            threshold: 0.75,
            radius: 1,
        });

        this.darkMaterial = new THREE.MeshBasicMaterial({ color: "black" })
        this.materials = {}
    }

    setBloomObjects() {
        const mesh = this.ramenShop.getObjectByName('WellLeft001') as THREE.Mesh;
        // debugger
        mesh.layers.enable(this.BLOOM_SCENE)
    }

    setRenderTarget() {
        this.renderTarget = new THREE.WebGLRenderTarget
            (
                window.innerWidth,
                window.innerHeight,
                {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    format: THREE.RGBAFormat,
                    // type: THREE.HalfFloatType,
                    encoding: THREE.sRGBEncoding
                }
            )

        // Currently not working on metal (ios)

        // if(this.renderer.instance.capabilities.isWebGL2)
        // {
        //     this.renderTarget.samples = 4
        //     console.log('using WebGLMultiSampleRenderTarget')
        // }
        // else
        // {
        //     console.log('using WebGLRenderTarget')
        // }
    }

    setPasses() {
        this.renderPass = new RenderPass(this.scene, this.camera)

        // 抗锯齿
        this.fxaaPass = new ShaderPass(FXAAShader);
        //  this.smaaPass = new SMAAPass(window.innerWidth, window.innerHeight)
        

        // 第一次使用辉光渲染
        
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
        for (const [key, value] of Object.entries(this.bloomParams)) {
            this.bloomPass[key as keyof BloomParams] = value;
        }
        // this.bloomPass.threshold = this.bloomParams.threshold;
        // this.bloomPass.strength = this.bloomParams.strength;
        // this.bloomPass.radius = this.bloomParams.radius;
        this.bloomPass.needsSwap = true;

        // 渲染目标

        // 效果创造器(混合渲染器通道、辉光通道)
        this.bloomComposer = new EffectComposer(this.renderer)
        this.bloomComposer.renderToScreen = false;  // true将处理的结果保存到帧缓冲区，false直接显示在canvas画布上面
        this.bloomComposer.addPass(this.renderPass)
        this.bloomComposer.addPass(this.bloomPass)

        const pixelRatio = this.renderer.getPixelRatio(); // 获取设备像素比，高清屏不会太模糊
        this.fxaaPass.material.uniforms['resolution'].value.x = 1 / (window.innerWidth * pixelRatio);
        this.fxaaPass.material.uniforms['resolution'].value.y = 1 / (window.innerHeight * pixelRatio);
        this.fxaaPass.renderToScreen = false;

        // 着色器通道
        this.finalPass = new ShaderPass
            (
                new THREE.ShaderMaterial
                    ({
                        uniforms:
                        {
                            baseTexture: { value: null },
                            bloomTexture: { value: this.bloomComposer.renderTarget2.texture }
                        },
                        vertexShader: vertexShader,
                        fragmentShader: fragmentShader,
                        defines: {},
                        precision: 'lowp'
                    }),
                "baseTexture"
            )

        this.finalPass.needsSwap = true

        this.finalComposer = new EffectComposer(this.renderer, this.renderTarget)
        this.finalComposer.setSize(window.innerWidth, window.innerHeight)
        this.finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.finalComposer.addPass(this.renderPass)
        this.finalComposer.addPass(this.fxaaPass)
        // this.finalComposer.addPass(this.smaaPass)
        this.finalComposer.addPass(this.finalPass)

        // SMAA pass if WebGL2 is not available

        // if(!this.renderer.instance.capabilities.isWebGL2)
        // {
        //     this.smaaPass = new SMAAPass()
        //     this.finalComposer.addPass(this.smaaPass)
        //     console.log('Using SMAA')
        // }

        // this.smaaPass = new SMAAPass(window.innerWidth, window.innerHeight)
        // this.finalComposer.addPass(this.smaaPass)

        this.update()

    }

    renderBloom() {
        this.ramenShop.traverse((obj: THREE.Object3D) => this.darkenNonBloomed(obj))
        this.bloomComposer.render()
        this.ramenShop.traverse((obj: THREE.Object3D) => this.restoreMaterial(obj))
    }

    darkenNonBloomed(obj: THREE.Object3D) {
        if (obj instanceof THREE.Mesh && this.bloomLayer.test(obj.layers) === false) {
            this.materials[obj.uuid] = obj.material;
            obj.material = this.darkMaterial;
        }
    }

    restoreMaterial(obj: THREE.Object3D) {
        if (obj instanceof THREE.Mesh && this.materials[obj.uuid]) {
            obj.material = this.materials[obj.uuid];
            delete this.materials[obj.uuid];
        }
    }

    update() {
        // appStore.mode === 'night' && 
        this.renderBloom()
        this.finalComposer.render() // 关闭renderBloom, 只保留finalComposer可以制作一个单独的图层
    }

    resize() {
        debugger
        if (this.bloomComposer) { this.bloomComposer.setSize(window.innerWidth, window.innerHeight) }
        if (this.bloomComposer) { this.bloomComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) }
        if (this.finalComposer) { this.finalComposer.setSize(window.innerWidth, window.innerHeight) }
        if (this.finalComposer) { this.finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) }

    }
}

