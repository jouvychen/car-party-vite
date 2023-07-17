import { defineStore } from 'pinia'
import * as THREE from 'three';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"; // 控制器
const useThreejsModuleStore = defineStore('threejsModule', {
    state: () => {
        return {
            // camera: new THREE.PerspectiveCamera(),
            camera: {} as THREE.PerspectiveCamera,
            // controls: {} as Partial<OrbitControls>, // Partial声明为部分类型
            controls: {} as OrbitControls, // Partial声明为部分类型
            scene: {} as THREE.Scene,
            renderer: {} as THREE.WebGLRenderer,
        }
    },
})

export default useThreejsModuleStore