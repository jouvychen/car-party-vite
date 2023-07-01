import { defineStore } from 'pinia'
import * as THREE from 'three';
import { CreatePromotionalFilm } from "@/views/function/createPromotionalFilm";
const useHtmlNodeModelStore = defineStore('htmlNodeModel', {
    state: () => {
        return {
            promotionalFilm: {} as CreatePromotionalFilm, // 视频播放对象
        }
    },
})

export default useHtmlNodeModelStore