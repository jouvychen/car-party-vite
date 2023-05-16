import { defineStore } from 'pinia'
import * as THREE from 'three';
const useCarModalStore = defineStore('carModal', {
    state: () => {
        return {
            carModal: {} as THREE.Object3D,
            wheelStart: false, // 车轮动画,
            source: {
                texture: {
                  textureFlare0: {} as THREE.Texture,
                  textureFlare3: {} as THREE.Texture,
                },
              },
              
        }
    },
})

export default useCarModalStore