//https://jsfiddle.net/prisoner849/jm0vb71c/, https://discourse.threejs.org/t/selective-bloom-parts-of-a-single-geometry/28683
// https://stackoverflow.com/questions/67014085/threejs-selective-bloom-for-specific-parts-of-one-object-using-emission-map


//https://github.com/vanruesc/postprocessing


import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { vertexShader } from '../shaders/bloomShaders/vertex'
import { fragmentShader } from '../shaders/bloomShaders/fragment'
import Experience from './Experience.js'
import { CreateBasicThree } from './CreateBasicThree'
import { ObjectKeys } from '@/utils/interface'

export class PostProcessing {
    BLOOM_SCENE = 2;

    darkMaterial!: THREE.MeshBasicMaterial;
    materials!: ObjectKeys;
    bloomLayer!: THREE.Layers;
    bloomParams!: ObjectKeys;
    three!: CreateBasicThree;
    ramenShop!: THREE.Object3D;

    renderTarget!: THREE.WebGLRenderTarget;
    renderPass!: RenderPass;
    bloomPass!: UnrealBloomPass;
    bloomComposer!: EffectComposer;
    finalPass!: ShaderPass;
    finalComposer!: EffectComposer;
    smaaPass!: SMAAPass;
    constructor(modal: THREE.Object3D) {
        this.three = new CreateBasicThree();

        this.ramenShop = modal
        this.setBloomConfig()
        this.setBloomObjects()
        this.setRenderTarget()
        this.setPasses()
        this.renderBloom()
    }

    setBloomConfig() {
        this.BLOOM_SCENE = 2
        this.bloomLayer = new THREE.Layers()
        this.bloomLayer.set(this.BLOOM_SCENE)

        this.bloomParams = {}
        this.bloomParams.bloomStrength = 1.3
        this.bloomParams.bloomThreshold = 0
        this.bloomParams.bloomRadius = 1

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
                800,
                600,
                {
                    minFilter: THREE.LinearFilter,
                    magFilter: THREE.LinearFilter,
                    format: THREE.RGBAFormat,
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
        this.renderPass = new RenderPass(this.three.scene, this.three.camera)

        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(1920, 1080), 1.5, 0.4, 0.85)
        this.bloomPass.threshold = this.bloomParams.bloomThreshold
        this.bloomPass.strength = this.bloomParams.bloomStrength
        this.bloomPass.radius = this.bloomParams.bloomRadius

        this.bloomComposer = new EffectComposer(this.three.renderer, this.renderTarget)
        this.bloomComposer.renderToScreen = false
        this.bloomComposer.addPass(this.renderPass)
        this.bloomComposer.addPass(this.bloomPass)


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
        this.finalComposer = new EffectComposer(this.three.renderer, this.renderTarget)

        this.finalComposer.setSize(1920, 1080)
        this.finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

        this.finalComposer.addPass(this.renderPass)
        this.finalComposer.addPass(this.finalPass)

        // SMAA pass if WebGL2 is not available

        // if(!this.renderer.instance.capabilities.isWebGL2)
        // {
        //     this.smaaPass = new SMAAPass()
        //     this.finalComposer.addPass(this.smaaPass)
        //     console.log('Using SMAA')
        // }

        this.smaaPass = new SMAAPass(1920, 1080)
        this.finalComposer.addPass(this.smaaPass)

        this.update()

    }

    renderBloom() {
        this.three.scene.traverse((obj: THREE.Object3D) => this.darkenNonBloomed(obj))
        this.bloomComposer.render()
        this.three.scene.traverse((obj: THREE.Object3D) => this.restoreMaterial(obj))
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
        this.renderBloom()
        this.finalComposer.render()
    }

    resize() {
        if (this.bloomComposer) { this.bloomComposer.setSize(1920, 1080) }
        if (this.bloomComposer) { this.bloomComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) }
        if (this.finalComposer) { this.finalComposer.setSize(1920, 1080) }
        if (this.finalComposer) { this.finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2)) }

    }
}

