import { defineStore } from 'pinia';

import { State, View } from '@/utils/interface';

export const useStoreCache = defineStore('cacheView', () => {
  const state = reactive<State>({
    cachedViews: [],
  });
  const mutations = {
    addCachedView: (view: View) => {
      if (state.cachedViews.includes(view.name)) {
        return;
      }
      if (view.meta.keepAlive) {
        state.cachedViews.push(view.name);
      }
    },
    delCachedView: (view: View) => {
      const index = state.cachedViews.indexOf(view.name);
      index > -1 && state.cachedViews.splice(index, 1);
    },
    delOthersCachedViews: (view: View) => {
      const index = state.cachedViews.indexOf(view.name);
      if (index > -1) {
        state.cachedViews = state.cachedViews.slice(index, index + 1);
      } else {
        state.cachedViews = [];
      }
    },
    delAllCachedViews: (state: State) => {
      state.cachedViews = [];
    },
  };

  return {
    ...mutations,
    ...toRefs(state),
  };
});
