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
      <v-btn icon @click="toggleTheme">
        <v-icon>mdi-brightness-4</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main :class="{ 'pa-0': isCodeToImagePage, 'theme--dark': isDark }">
      <NuxtPage />
    </v-main>

    <footer v-if="!isCodeToImagePage" class="footer-container">
      <div class="footer-content">
        <div class="footer-logo mb-2">
          <v-icon icon="mdi-toolbox" class="mr-2" size="small" />
          <span class="font-weight-medium">前端工具箱</span>
        </div>
        <div class="footer-copyright">
          &copy; {{ new Date().getFullYear() }} — 前端工具箱 • 版權所有
        </div>
      </div>
    </footer>
  </v-app>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTheme } from 'vuetify'

const route = useRoute()
const isCodeToImagePage = computed(() => route.path === '/tools/code-to-image')

// 主題切換功能
const theme = useTheme()
const isDark = ref(false)

// 切換主題
const toggleTheme = () => {
  isDark.value = !isDark.value
  theme.global.name.value = isDark.value ? 'dark' : 'light'

  // 添加或移除主題類
  if (isDark.value) {
    document.documentElement.classList.add('theme--dark')
  } else {
    document.documentElement.classList.remove('theme--dark')
  }

  // 保存主題設置到本地儲存
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

// 在組件掛載時讀取保存的主題設置
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
    theme.global.name.value = isDark.value ? 'dark' : 'light'

    // 初始化主題類
    if (isDark.value) {
      document.documentElement.classList.add('theme--dark')
    } else {
      document.documentElement.classList.remove('theme--dark')
    }
  }
})
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
  background-color: var(--background-primary);
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
  background-color: var(--background-primary);
}

/* 暗色主題樣式 */
.theme--dark {
  background-color: var(--background-primary) !important;
  color: var(--text-primary) !important;
}

.theme--dark .v-application {
  background-color: var(--background-primary) !important;
}

.theme--dark .v-card {
  background-color: var(--background-card) !important;
  color: var(--text-primary) !important;
}

/* 修正深色主題下的白色區塊 */
.theme--dark .v-container {
  background-color: var(--background-primary) !important;
}

.theme--dark .v-footer {
  background-color: var(--background-footer) !important;
  color: var(--text-primary) !important;
}

.theme--dark .v-main {
  background-color: var(--background-primary) !important;
}

/* 確保整個應用背景一致 */
.theme--dark #app {
  background-color: var(--background-primary) !important;
}

.theme--dark body {
  background-color: var(--background-primary) !important;
}

/* Footer 樣式 */
.footer-container {
  height: 80px !important;
  padding: 12px 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--background-footer) !important;
  border-top: 1px solid var(--border-light);
}

.theme--dark .footer-container {
  background-color: var(--background-footer) !important;
  border-top: 1px solid var(--border-light);
}

.footer-content {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.footer-logo {
  display: flex;
  align-items: center;
  font-size: 16px;
}

.footer-links {
  margin: 10px 0;
}

.footer-link {
  color: var(--footer-link);
  text-decoration: none;
  margin: 0 10px;
  font-size: 14px;
  transition: color 0.3s;
}

.theme--dark .footer-link {
  color: var(--footer-link);
}

.footer-link:hover {
  color: var(--footer-link-hover);
}

.theme--dark .footer-link:hover {
  color: var(--footer-link-hover);
}

.footer-copyright {
  font-size: 13px;
  color: var(--text-footer);
}

.theme--dark .footer-copyright {
  color: var(--text-footer);
}
</style>
