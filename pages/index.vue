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
        <NuxtLink :to="tool.path" class="text-decoration-none">
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
useSeoMeta({
  title: '前端工具箱',
  description: '一站式前端開發工具集合，提升您的開發效率',
  ogTitle: '前端工具箱',
  ogDescription: '一站式前端開發工具集合，提升您的開發效率',
  // ogImage: '/og-image.png',
  // ogUrl: 'https://tool.example.com',
})
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
  // {
  //   path: '/tools/qrcode',
  //   icon: 'mdi-qrcode',
  //   color: 'warning',
  //   title: '二維碼生成',
  //   description: '生成或解析二維碼',
  // },
  // {
  //   path: '/tools/color-generator',
  //   icon: 'mdi-palette',
  //   color: 'deep-purple',
  //   title: '顏色生成',
  //   description: '顏色選擇與調色板生成',
  // },
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
