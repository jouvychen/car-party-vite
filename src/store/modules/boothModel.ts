import { defineStore } from 'pinia'

const useBoothModelStore = defineStore('boothModel', {
    state: () => {
        return {
            boothReady: false, // 标识展台是否升起完毕, 可以解锁动画、变色等其他操作
        }
    },
})

export default useBoothModelStore