<template>
  <v-container>
    <!-- 頂部標題區域 -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-6" variant="flat" color="transparent">
          <v-card-text class="text-center">
            <h1 class="text-h4 font-weight-bold mb-2">前端工具箱</h1>
            <p class="text-subtitle-1 text-grey-darken-1">
              一站式前端開發工具集合，提升您的開發效率
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- 工具卡片網格 -->
    <v-row>
      <v-col
        cols="12"
        sm="6"
        md="4"
        v-for="(tool, index) in toolsList"
        :key="index"
      >
        <NuxtLink
          :to="tool.path || undefined"
          :href="tool.href || undefined"
          :target="tool.href ? '_blank' : undefined"
          class="text-decoration-none"
        >
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon
                  :icon="tool.icon"
                  size="large"
                  :color="tool.color"
                ></v-icon>
              </template>
              <v-card-title>{{ tool.title }}</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>{{ tool.description }}</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// 工具列表數據
const toolsList = [
  {
    path: '/tools/code-to-image',
    icon: 'mdi-code-tags',
    color: 'primary',
    title: '代碼轉換圖片',
    description: '將代碼轉換為圖片分享到社交媒體',
  },
  {
    path: '/tools/code-diff',
    icon: 'mdi-file-compare',
    color: 'info',
    title: '代碼比較',
    description: '對比兩段代碼的差異',
  },
  {
    path: '/tools/qrcode',
    icon: 'mdi-qrcode',
    color: 'warning',
    title: 'QrCode生成',
    description: '生成或解析QrCode',
  },
  {
    href: 'https://nuxt3-auth-demo.vercel.app/',
    icon: 'mdi-account-group',
    title: 'Nuxt 3 Auth',
    description:
      '基於 Nuxt 3 和 Auth.js 的第三方登入示範，集成了 Google、GitHub、Facebook、Line 和 Apple 登入功能，提供完整的用戶認證流程實現範例。',
  },
  {
    href: 'https://linewebhook.vercel.app/',
    icon: 'mdi-chat',
    title: 'LINE BOT Webhook',
    description: 'LINE BOT Webhook 更新工具',
  },
  // {
  //   path: '/tools/img-to-base64',
  //   icon: 'mdi-image',
  //   color: 'teal',
  //   title: '圖片轉Base64',
  //   description: '將圖片轉換為Base64編碼',
  // },
  // {
  //   path: '/tools/json-to-ts',
  //   icon: 'mdi-json',
  //   color: 'amber',
  //   title: 'JSON轉TypeScript',
  //   description: '將JSON轉換為TypeScript接口定義',
  // },
]
</script>

<style scoped>
.h-100 {
  height: 100%;
}

.card-hover {
  transition: transform 0.3s, box-shadow 0.3s;
}

.card-hover:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
}
</style>
