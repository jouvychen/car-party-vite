import { defineStore } from 'pinia'

const useWindowControlStore = defineStore('windowControl', {
    state: () => {
        return {
            colorWindow: {
                mode: 'pure', // { pure: '纯净模式, 只使用纯色', origin: '在原始材质上只改变颜色'}
            }
        }
    },
})

export default useWindowControlStore