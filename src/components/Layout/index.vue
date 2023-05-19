<template>
  <router-view v-slot="{ Component }">
    <Transition name="fade">
      <div>
        <KeepAlive :include="storeCache['cachedViews']">
          <component :is="Component" />
        </KeepAlive>
      </div>
    </Transition>
  </router-view>
</template>

<script name="Layout" setup>
import { useStoreCache } from "@/store";
const storeCache = useStoreCache();
</script>

<style scoped lang="less"></style>
