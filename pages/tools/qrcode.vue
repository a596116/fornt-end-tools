<template>
  <ClientOnly>
    <v-container>
      <!-- 麵包屑導航 -->
      <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4">
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right" size="small"></v-icon>
        </template>
      </v-breadcrumbs>

      <!-- 修改行容器以保持一致高度 -->
      <v-row class="d-flex flex-row flex-fill">
        <!-- 左側：生成設置 -->
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="d-flex flex-column w-100">
            <v-card-title class="d-flex align-center">
              <v-icon
                icon="mdi-qrcode-edit"
                class="mr-2"
                color="primary"
              ></v-icon>
              生成設置
            </v-card-title>

            <v-card-text class="flex-grow-1">
              <v-form ref="generateForm">
                <v-textarea
                  v-model="qrText"
                  label="輸入文字內容"
                  variant="outlined"
                  hide-details="auto"
                  rows="4"
                  class="mb-4"
                  :rules="[(v) => !!v || '請輸入內容']"
                ></v-textarea>

                <v-row>
                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="qrSize"
                      :items="sizeOptions"
                      label="QR Code 大小"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mb-4"
                    ></v-select>
                  </v-col>

                  <v-col cols="12" sm="6">
                    <v-select
                      v-model="errorCorrectionLevel"
                      :items="errorCorrectionOptions"
                      label="容錯級別"
                      variant="outlined"
                      density="compact"
                      hide-details
                      class="mb-4"
                    ></v-select>
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" sm="12">
                    <p class="text-body-2 mb-1">前景顏色</p>
                    <div class="color-picker-container">
                      <v-color-picker
                        v-model="foregroundColor"
                        hide-inputs
                        hide-canvas
                        mode="hexa"
                        flat
                        class="mb-4 color-picker-small"
                        :swatches="colorSwatches"
                      ></v-color-picker>
                    </div>
                  </v-col>

                  <v-col cols="12" sm="12">
                    <p class="text-body-2 mb-1">背景顏色</p>
                    <div class="color-picker-container">
                      <v-color-picker
                        v-model="backgroundColor"
                        hide-inputs
                        hide-canvas
                        mode="hexa"
                        flat
                        class="mb-4 color-picker-small"
                        :swatches="colorSwatches"
                      ></v-color-picker>
                    </div>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>

            <!-- 生成按鈕 -->
            <v-card-actions>
              <v-row>
                <v-col cols="8">
                  <v-btn
                    color="primary"
                    block
                    @click="generateQRCode"
                    :loading="isGenerating"
                    :disabled="!qrText"
                  >
                    生成 QR Code
                  </v-btn>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    color="secondary"
                    block
                    variant="outlined"
                    @click="resetQRCode"
                    :disabled="!qrText && !qrCodeImage"
                  >
                    重置
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-card>
        </v-col>

        <!-- 右側：合併預覽與上傳為同一區域 -->
        <v-col cols="12" md="6" class="d-flex">
          <v-card class="d-flex flex-column w-100">
            <v-card-title class="d-flex align-center">
              <v-icon icon="mdi-qrcode" class="mr-2" color="primary"></v-icon>
              預覽與解析
            </v-card-title>

            <v-card-text class="flex-grow-1">
              <!-- 統一的預覽/上傳區域 -->
              <div class="unified-qr-container mb-4">
                <!-- 顯示生成的QR Code -->
                <div
                  v-if="qrCodeImage"
                  class="qr-display"
                  :style="{
                    'background-color': backgroundColor,
                    'border-radius': '8px',
                    padding: getPreviewPadding(),
                  }"
                >
                  <img :src="qrCodeImage" alt="QR Code" class="qr-image" />
                </div>

                <!-- 顯示上傳的圖片 -->
                <div
                  v-else-if="uploadedImageSrc"
                  class="uploaded-image-display"
                >
                  <img
                    :src="uploadedImageSrc"
                    alt="Uploaded QR Code"
                    class="uploaded-image"
                  />
                </div>

                <!-- 預設提示 -->
                <div
                  v-else
                  class="qr-placeholder d-flex flex-column align-center justify-center"
                >
                  <v-icon
                    icon="mdi-qrcode-scan"
                    size="64"
                    color="grey-lighten-1"
                  ></v-icon>
                  <span class="text-grey text-center mt-2">
                    生成QR Code或上傳圖片<br />進行解析
                  </span>
                </div>
              </div>

              <!-- 上傳控件 -->
              <v-file-input
                v-model="qrFileInput"
                accept="image/*"
                label="選擇QR Code圖片"
                variant="outlined"
                prepend-icon="mdi-camera"
                @update:model-value="handleFileUpload"
                :rules="[
                  (v) => !v || v.size < 5000000 || '圖片大小不能超過5MB',
                ]"
              ></v-file-input>

              <!-- 掃描結果提示 -->
              <v-alert
                v-if="scanMessage"
                :color="scanSuccess ? 'success' : 'error'"
                :icon="scanSuccess ? 'mdi-check-circle' : 'mdi-alert-circle'"
                variant="tonal"
                density="compact"
              >
                {{ scanMessage }}
              </v-alert>
            </v-card-text>

            <!-- 將按鈕移到卡片底部 -->
            <v-card-actions>
              <div class="d-flex gap-2 flex-wrap w-100">
                <v-btn
                  color="primary"
                  prepend-icon="mdi-download"
                  variant="outlined"
                  @click="downloadQRCode"
                  :disabled="!qrCodeImage"
                  class="flex-grow-1"
                >
                  下載 QR Code
                </v-btn>

                <v-btn
                  color="primary"
                  prepend-icon="mdi-qrcode-scan"
                  :loading="isScanning"
                  :disabled="!uploadedImageSrc"
                  @click="scanQRCodeAndFill"
                  class="flex-grow-1"
                >
                  解析 QR Code
                </v-btn>
              </div>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
// @ts-ignore
import QRCode from 'qrcode'
// @ts-ignore
import jsQR from 'jsqr'

// SEO 設置
useSeoMeta({
  title: 'QR Code 生成與解析',
  description: '生成自定義QR Code並解析QR Code圖片中的內容',
  ogTitle: 'QR Code 生成與解析',
  ogDescription: '生成自定義QR Code並解析QR Code圖片中的內容',
})

// 麵包屑導航
const breadcrumbs = [
  {
    title: '首頁',
    href: '/',
    disabled: false,
  },
  {
    title: 'QR Code 生成與解析',
    disabled: true,
  },
]

// 生成QR Code相關狀態
const qrText = ref('')
const qrSize = ref(200)
const errorCorrectionLevel = ref('M')
const foregroundColor = ref('#000000')
const backgroundColor = ref('#FFFFFF')
const qrCodeImage = ref('')
const isGenerating = ref(false)

// 掃描QR Code相關狀態
const qrFileInput = ref(null)
const uploadedImageSrc = ref('')
const isScanning = ref(false)
const scanSuccess = ref(false)
const scanMessage = ref('')

// 選項常量
const sizeOptions = [
  { title: '小 (100px)', value: 100 },
  { title: '中 (200px)', value: 200 },
  { title: '大 (300px)', value: 300 },
  { title: '特大 (400px)', value: 400 },
]

const errorCorrectionOptions = [
  { title: '低 (L) - 7%', value: 'L' },
  { title: '中 (M) - 15%', value: 'M' },
  { title: '高 (Q) - 25%', value: 'Q' },
  { title: '最高 (H) - 30%', value: 'H' },
]

const colorSwatches = [
  ['#000000', '#FFFFFF', '#FF0000', '#FF5722', '#FF9800'],
  ['#FFEB3B', '#8BC34A', '#4CAF50', '#2196F3', '#3F51B5'],
  ['#673AB7', '#9C27B0', '#E91E63', '#795548', '#607D8B'],
]

// 監視大小與容錯級別變更，在已有QR Code時自動更新
watch(
  [qrSize, errorCorrectionLevel, foregroundColor, backgroundColor],
  () => {
    // 只在已經有內容且已產生QR Code的情況下自動更新
    if (qrText.value && qrCodeImage.value) {
      generateQRCode()
    }
  },
  { deep: true }
)

// 生成QR Code
const generateQRCode = async () => {
  try {
    isGenerating.value = true

    const options = {
      width: qrSize.value,
      margin: 1,
      color: {
        dark: foregroundColor.value,
        light: backgroundColor.value,
      },
      errorCorrectionLevel: errorCorrectionLevel.value,
    }

    const url = await QRCode.toDataURL(qrText.value, options)
    qrCodeImage.value = url
  } catch (error) {
    console.error('生成QR Code失敗:', error)
    // 可以添加錯誤提示
  } finally {
    isGenerating.value = false
  }
}

// 下載QR Code圖片
const downloadQRCode = () => {
  if (!qrCodeImage.value) return

  const link = document.createElement('a')
  link.href = qrCodeImage.value
  link.download = `qrcode-${new Date().getTime()}.png`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 處理圖片上傳
const handleFileUpload = (file: any) => {
  if (!file) {
    uploadedImageSrc.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    uploadedImageSrc.value = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // 清除之前的掃描訊息
  scanMessage.value = ''
}

// 解析QR Code並填充到輸入框
const scanQRCodeAndFill = async () => {
  if (!uploadedImageSrc.value) return

  try {
    isScanning.value = true
    scanMessage.value = ''

    const image = new Image()
    image.src = uploadedImageSrc.value

    await new Promise((resolve) => {
      image.onload = resolve
    })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = image.width
    canvas.height = image.height
    context?.drawImage(image, 0, 0)

    const imageData = context?.getImageData(0, 0, canvas.width, canvas.height)
    const code = jsQR(imageData?.data!, imageData?.width!, imageData?.height!)

    if (code) {
      qrText.value = code.data // 將解析結果填充到輸入框
      scanSuccess.value = true
      scanMessage.value = '成功解析QR Code並填充到輸入框'

      // 也可以選擇自動生成QR Code
      generateQRCode()
    } else {
      // 可能不是QR Code或無法識別
      scanSuccess.value = false
      scanMessage.value = '無法識別QR Code，請確保圖片清晰且包含有效的QR Code'
    }
  } catch (error) {
    console.error('解析QR Code失敗:', error)
    scanSuccess.value = false
    scanMessage.value = '解析失敗，請嘗試上傳其他圖片'
  } finally {
    isScanning.value = false
  }
}

// 根據QR碼大小動態調整預覽區域的內邊距
const getPreviewPadding = () => {
  // 根據QR碼大小調整內邊距
  if (qrSize.value <= 100) {
    return '8px' // 小尺寸用更小的內邊距
  } else if (qrSize.value <= 200) {
    return '12px' // 中等尺寸用適中的內邊距
  } else {
    return '16px' // 大尺寸保持原有內邊距
  }
}

// 重置QR Code
const resetQRCode = () => {
  qrText.value = ''
  qrCodeImage.value = ''
  uploadedImageSrc.value = ''
  scanMessage.value = ''
  scanSuccess.value = false
}

// 組件掛載時初始化
onMounted(() => {
  // 這裡可以添加初始化邏輯，例如載入示例QR Code等
})
</script>

<style scoped>
.w-100 {
  width: 100%;
}

.unified-qr-container {
  min-height: 250px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px;
  position: relative;
}

.qr-display,
.uploaded-image-display {
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  width: fit-content;
  margin: 0 auto;
}

.qr-image,
.uploaded-image {
  max-width: 100%;
  max-height: 230px;
  display: block;
}

.qr-placeholder {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}

.color-picker-container {
  max-width: 100%;
  overflow: hidden;
}

.color-picker-small {
  max-width: 100%;
  max-height: 250px;
}

.color-picker-small :deep(.v-color-picker-swatches) {
  max-height: 150px;
  overflow-y: auto;
}

.color-picker-small :deep(.v-color-picker__controls) {
  padding: 0;
  max-width: 100%;
}

/* 確保響應式佈局 */
@media (max-width: 960px) {
  .unified-qr-container {
    width: 100%;
  }
}
</style>
