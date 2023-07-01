import { createPinia } from 'pinia';

import useTestStore from "./modules/test";
import { useStoreApp } from './modules/app';
import useWindowControlStore from './modules/windowControl';
import useBoothModelStore from './modules/boothModel';
import useCarModelStore from './modules/carModel';
import useThreejsModuleStore from './modules/threejsModule';
import useHtmlNodeModelStore from './modules/htmlNodeModel';
import { useStoreCache } from './modules/cacheViews';

// 写在外面，加载完就不会再调用了，是一次性的
// const counter = useTestStore();

export { useStoreApp, useWindowControlStore, useBoothModelStore, useCarModelStore, useThreejsModuleStore, useHtmlNodeModelStore, useStoreCache };

// 通过属性调用，每次都保证拿到最新的 store
export const useStore = () => {
    return {
        test: useTestStore(),
        app: useStoreApp(),
        windowControl: useWindowControlStore(),
        booth: useBoothModelStore(),
        car: useCarModelStore(),
    };
};

export default createPinia();