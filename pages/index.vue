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
      <!-- 代碼轉換圖片工具 -->
      <v-col cols="12" sm="6" md="4">
        <NuxtLink to="/tools/code-to-image" class="text-decoration-none">
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon
                  icon="mdi-code-tags"
                  size="large"
                  color="primary"
                ></v-icon>
              </template>
              <v-card-title>代碼轉換圖片</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>將代碼轉換為圖片分享到社交媒體</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>

      <!-- HTML轉Markdown工具 -->
      <v-col cols="12" sm="6" md="4">
        <NuxtLink to="/tools/html-to-markdown" class="text-decoration-none">
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon
                  icon="mdi-language-html5"
                  size="large"
                  color="error"
                ></v-icon>
              </template>
              <v-card-title>HTML轉Markdown</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>將HTML內容轉換為Markdown格式</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>

      <!-- 代碼格式化工具 -->
      <v-col cols="12" sm="6" md="4">
        <NuxtLink to="/tools/code-formatter" class="text-decoration-none">
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon
                  icon="mdi-format-align-left"
                  size="large"
                  color="success"
                ></v-icon>
              </template>
              <v-card-title>代碼格式化</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>支持多種語言的代碼格式化工具</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>

      <!-- 代碼比較工具 -->
      <v-col cols="12" sm="6" md="4">
        <NuxtLink to="/tools/code-diff" class="text-decoration-none">
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon
                  icon="mdi-file-compare"
                  size="large"
                  color="info"
                ></v-icon>
              </template>
              <v-card-title>代碼比較</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>對比兩段代碼的差異</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>

      <!-- 二維碼生成器 -->
      <v-col cols="12" sm="6" md="4">
        <NuxtLink to="/tools/qrcode" class="text-decoration-none">
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-qrcode" size="large" color="warning"></v-icon>
              </template>
              <v-card-title>二維碼生成</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>生成或解析二維碼</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>

      <!-- 顏色生成器 -->
      <v-col cols="12" sm="6" md="4">
        <NuxtLink to="/tools/color-generator" class="text-decoration-none">
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon
                  icon="mdi-palette"
                  size="large"
                  color="deep-purple"
                ></v-icon>
              </template>
              <v-card-title>顏色生成</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>顏色選擇與調色板生成</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>

      <!-- 圖片轉Base64 -->
      <v-col cols="12" sm="6" md="4">
        <NuxtLink to="/tools/img-to-base64" class="text-decoration-none">
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-image" size="large" color="teal"></v-icon>
              </template>
              <v-card-title>圖片轉Base64</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>將圖片轉換為Base64編碼</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>

      <!-- SVG轉React -->
      <v-col cols="12" sm="6" md="4">
        <NuxtLink to="/tools/svg-to-react" class="text-decoration-none">
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-react" size="large" color="cyan"></v-icon>
              </template>
              <v-card-title>SVG轉React</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>將SVG轉換為React組件</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>

      <!-- JSON轉TypeScript -->
      <v-col cols="12" sm="6" md="4">
        <NuxtLink to="/tools/json-to-ts" class="text-decoration-none">
          <v-card class="h-100 card-hover" hover>
            <v-card-item>
              <template v-slot:prepend>
                <v-icon icon="mdi-json" size="large" color="amber"></v-icon>
              </template>
              <v-card-title>JSON轉TypeScript</v-card-title>
            </v-card-item>

            <v-card-text>
              <p>將JSON轉換為TypeScript接口定義</p>
            </v-card-text>
          </v-card>
        </NuxtLink>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// 首頁邏輯
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
