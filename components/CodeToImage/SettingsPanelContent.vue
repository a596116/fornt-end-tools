<script setup lang="ts">
import { ref, computed } from 'vue'
import SvgIcon from '~/components/global/SvgIcon.vue'

// 使用 defineProps 和 defineEmits 實現組件間通信
const props = defineProps({
  selectedLanguage: String,
  selectedTheme: String,
  windowTitle: String,
  paddingSize: [String, Number],
  showBackground: Boolean,
  darkMode: Boolean,
  showWindowControls: Boolean,
  selectedBrand: String,
  languageOptions: Array,
  themeOptions: Array,
  brands: Array,
  isDownloading: Boolean,
})

const emit = defineEmits([
  'update:selectedLanguage',
  'update:selectedTheme',
  'update:windowTitle',
  'update:paddingSize',
  'update:showBackground',
  'update:darkMode',
  'update:showWindowControls',
  'update:selectedBrand',
  'reset-code',
  'load-example',
  'download-image',
])

// 自定義過濾函數
const customFilter = (item: any, query: any, itemText: any) => {
  if (!query) return true

  query = query.toString().toLowerCase()
  const title = item.title.toLowerCase()
  const value = item.value.toLowerCase()

  return title.includes(query) || value.includes(query)
}

// 雙向綁定處理
const selectedLanguageModel = computed({
  get: () => props.selectedLanguage,
  set: (value) => emit('update:selectedLanguage', value),
})
</script>

<template>
  <div class="settings-panel-content">
    <!-- 下載按鈕改進樣式 -->
    <v-btn
      block
      color="primary"
      prepend-icon="mdi-download"
      class="mb-5 download-btn"
      elevation="2"
      rounded
      @click="$emit('download-image')"
      :loading="isDownloading"
    >
      下載圖片
    </v-btn>

    <!-- 使用 Vuetify 內建過濾功能的語言選擇器 -->
    <v-card-title>語言</v-card-title>
    <v-select
      v-model="selectedLanguageModel"
      :items="props.languageOptions"
      item-title="title"
      item-value="value"
      label="選擇語言"
      variant="outlined"
      density="compact"
      hide-details
      class="mb-3"
      clearable
      autocomplete="off"
    ></v-select>

    <v-text-field
      :model-value="windowTitle"
      @update:model-value="$emit('update:windowTitle', $event)"
      label="文件名稱"
      variant="outlined"
      density="compact"
      :disabled="!showWindowControls"
      hide-details
      class="mb-3"
    ></v-text-field>

    <div class="mb-3">
      <div class="d-flex align-center justify-space-between flex-wrap">
        <span class="text-body-2 font-weight-medium">邊距</span>
        <v-btn-toggle
          :model-value="paddingSize"
          @update:model-value="$emit('update:paddingSize', $event)"
          mandatory
          color="primary"
          density="compact"
          divided
        >
          <v-btn size="x-small" value="16">16</v-btn>
          <v-btn size="x-small" value="32">32</v-btn>
          <v-btn size="x-small" value="64">64</v-btn>
          <v-btn size="x-small" value="128">128</v-btn>
        </v-btn-toggle>
      </div>
    </div>

    <div class="mb-3">
      <!-- 開關選項 -->
      <v-switch
        :model-value="showBackground"
        @update:model-value="$emit('update:showBackground', $event)"
        label="背景"
        color="primary"
        density="compact"
        hide-details
        class="my-1"
      ></v-switch>

      <v-switch
        :model-value="darkMode"
        @update:model-value="$emit('update:darkMode', $event)"
        label="暗色"
        color="primary"
        density="compact"
        hide-details
        class="my-1"
      ></v-switch>

      <v-switch
        :model-value="showWindowControls"
        @update:model-value="$emit('update:showWindowControls', $event)"
        label="窗口"
        color="primary"
        density="compact"
        hide-details
        class="my-1"
      ></v-switch>
    </div>

    <div class="mb-3">
      <span class="text-body-2 font-weight-medium d-block mb-2">品牌主題</span>
      <v-list density="compact" class="brand-list pa-0" rounded>
        <v-list-item
          v-for="brand in brands"
          :key="brand.value"
          :value="brand.value"
          :active="selectedBrand === brand.value"
          @click="$emit('update:selectedBrand', brand.value)"
          class="brand-list-item"
          :class="{ 'selected-brand': selectedBrand === brand.value }"
          rounded
        >
          <template v-slot:prepend>
            <v-avatar size="x-small" class="me-2">
              <SvgIcon :name="brand.value" size="16" />
            </v-avatar>
          </template>

          <v-list-item-title>{{ brand.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </div>

    <v-divider class="my-4"></v-divider>

    <!-- 修復底部按鈕區域 -->
    <div class="action-buttons-container">
      <v-btn
        color="error"
        variant="tonal"
        prepend-icon="mdi-eraser"
        class="action-btn"
        @click="$emit('reset-code')"
      >
        清空代碼
      </v-btn>
      <v-btn
        color="info"
        variant="tonal"
        prepend-icon="mdi-code-tags"
        class="action-btn"
        @click="$emit('load-example')"
      >
        載入範例
      </v-btn>
    </div>
  </div>
</template>

<style scoped>
.brand-chips {
  display: flex;
  flex-wrap: wrap;
}

.brand-chips .v-chip {
  margin: 2px !important;
}

/* 添加品牌列表樣式 */
.brand-list {
  max-height: 180px;
  overflow-y: auto;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}

.brand-list-item {
  min-height: 36px !important;
  margin: 2px 0;
  transition: all 0.2s ease;
}

.brand-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.brand-list-item.selected-brand {
  background-color: rgba(33, 150, 243, 0.1);
  border-left: 3px solid #2196f3;
}

.brand-color-dot {
  width: 12px !important;
  height: 12px !important;
  border-radius: 50%;
}

/* 添加下載按鈕的漸變樣式 */
.download-btn {
  background: linear-gradient(45deg, #2196f3, #00bcd4) !important;
  color: white !important;
  font-weight: bold;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  margin-bottom: 20px !important;
}

.download-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2) !important;
}

/* 修復底部按鈕區域 */
.action-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 5px;
  margin-bottom: 10px;
}

.action-btn {
  width: 100%;
}

/* 更新品牌圖標樣式 */
.brand-list-item .v-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
