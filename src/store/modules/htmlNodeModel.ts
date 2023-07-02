import { defineStore } from 'pinia'
import * as THREE from 'three';
import { CreateHtmlNodes } from "@/views/html-node/createHtmlNodes";
import { CreatePromotionalFilm } from "@/views/function/createPromotionalFilm";
const useHtmlNodeModelStore = defineStore('htmlNodeModel', {
    state: () => {
        return {
            htmlNode: {} as CreateHtmlNodes, // 热点对象
            promotionalFilm: {} as CreatePromotionalFilm, // 视频播放对象
        }
    },
})

export default useHtmlNodeModelStore