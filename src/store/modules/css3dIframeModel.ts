import { defineStore } from 'pinia'
import * as THREE from 'three';

const useCss3dIframeModelStore = defineStore('css3dIframeModel', {
    state: () => {
        return {
            transparency: 0, // 作者介绍透明度
        }
    },
    actions: {
        setTransparency(val: number) {
            this.transparency = val;
        }
    }
})

export default useCss3dIframeModelStore