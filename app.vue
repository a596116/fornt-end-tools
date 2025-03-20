<template>
  <v-app>
    <v-app-bar v-if="!isCodeToImagePage" color="primary" dark>
      <v-app-bar-title>
        <div class="d-flex align-center">
          <v-icon icon="mdi-toolbox" class="mr-2" />
          前端工具箱
        </div>
      </v-app-bar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-brightness-4</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main :class="{ 'pa-0': isCodeToImagePage }">
      <NuxtPage />
    </v-main>

    <v-footer v-if="!isCodeToImagePage" app padless class="mt-4">
      <v-container>
        <div class="text-center">
          &copy; {{ new Date().getFullYear() }} — 前端工具箱
        </div>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const isCodeToImagePage = computed(() => route.path === '/tools/code-to-image')
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background-color: #f5f7fa;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica,
    Arial, sans-serif;
}

#__nuxt {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 額外的全局樣式 */
.v-application {
  background-color: #f5f7fa;
}
</style>
