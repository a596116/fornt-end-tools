<template>
  <div class="code-image-fullscreen">
    <!-- 小螢幕顯示的設定按鈕 -->
    <v-btn
      v-show="isMobile"
      icon="mdi-cog"
      color="primary"
      elevation="2"
      class="settings-toggle-btn"
      @click="settingsDrawer = true"
    ></v-btn>

    <!-- 麵包屑導航移到左上角 -->
    <div class="breadcrumb-nav">
      <v-breadcrumbs :items="breadcrumbs" density="compact">
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right" size="small"></v-icon>
        </template>
      </v-breadcrumbs>
    </div>

    <!-- 使用固定定位而不是柵格系統 -->
    <div class="editor-container">
      <!-- 預覽區域 -->
      <div class="preview-area">
        <div
          ref="codePreviewContainer"
          class="code-preview-container"
          :style="{ width: previewWidth + 'px' }"
        >
          <!-- 左側調整手柄 -->
          <div class="resize-handle left" @mousedown="startResize('left')">
            <div class="resize-dot"></div>
          </div>

          <div
            ref="codePreview"
            class="code-preview"
            :class="{ 'dark-mode': darkMode, 'no-bg': !showBackground }"
            :style="{
              padding: `${paddingSize}px`,
              backgroundColor: getBrandColor(),
            }"
          >
            <div class="code-window">
              <div v-if="showWindowControls" class="window-controls">
                <span class="control red"></span>
                <span class="control yellow"></span>
                <span class="control green"></span>
                <span class="window-title">{{ windowTitle }}</span>
              </div>

              <!-- 代碼編輯區 -->
              <div class="code-edit-area">
                <pre
                  ref="codeEditor"
                  class="code-content"
                  contenteditable="true"
                  spellcheck="false"
                  @input="handleCodeInput"
                  @paste="handlePaste"
                  @keydown="handleKeyDown"
                ><code v-html="highlightedCode"></code></pre>
              </div>
            </div>
          </div>

          <!-- 右側調整手柄 -->
          <div class="resize-handle right" @mousedown="startResize('right')">
            <div class="resize-dot"></div>
          </div>
        </div>

        <!-- 新增寬度指示器 -->
        <div class="width-indicator">
          <span>{{ previewWidth }}px</span>
        </div>
      </div>

      <!-- 右側控制面板 -->
      <div class="settings-panel d-none d-md-block">
        <v-card class="control-card h-100" flat>
          <v-card-text class="control-panel-content">
            <SettingsPanelContent
              v-model:selectedLanguage="selectedLanguage"
              v-model:selectedTheme="selectedTheme"
              v-model:windowTitle="windowTitle"
              v-model:paddingSize="paddingSize"
              v-model:showBackground="showBackground"
              v-model:darkMode="darkMode"
              v-model:showWindowControls="showWindowControls"
              v-model:selectedBrand="selectedBrand"
              :languageOptions="languageOptions"
              :themeOptions="themeOptions"
              :brands="brands"
              :isDownloading="isDownloading"
              @reset-code="resetCode"
              @load-example="loadExampleCode"
              @download-image="downloadImage"
            />
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- 設置抽屜 (在小螢幕上顯示) -->
    <ClientOnly>
      <v-navigation-drawer
        v-model="settingsDrawer"
        location="right"
        temporary
        width="280"
      >
        <v-toolbar color="primary" dark>
          <v-toolbar-title>設置參數</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon @click="settingsDrawer = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <div class="pa-4">
          <!-- 使用相同的設置面板內容組件 -->
          <SettingsPanelContent
            v-model:selectedLanguage="selectedLanguage"
            v-model:selectedTheme="selectedTheme"
            v-model:windowTitle="windowTitle"
            v-model:paddingSize="paddingSize"
            v-model:showBackground="showBackground"
            v-model:darkMode="darkMode"
            v-model:showWindowControls="showWindowControls"
            v-model:selectedBrand="selectedBrand"
            :languageOptions="languageOptions"
            :themeOptions="themeOptions"
            :brands="brands"
            :isDownloading="isDownloading"
            @reset-code="resetCode"
            @load-example="loadExampleCode"
            @download-image="downloadImage"
          />
        </div>
      </v-navigation-drawer>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  reactive,
  computed,
  watch,
  onMounted,
  nextTick,
  onBeforeUnmount,
} from 'vue'
import hljs from 'highlight.js'
// 導入 highlight.js 的默認樣式
import 'highlight.js/styles/atom-one-dark.css'
import html2canvas from 'html2canvas'
import SettingsPanelContent from '~/components/CodeToImage/SettingsPanelContent.vue'
import { ClientOnly } from '#components'

// 添加缺失的DOM元素引用
const codePreview = ref<HTMLElement | null>(null)
const codeEditor = ref<HTMLElement | null>(null)
const codePreviewContainer = ref<HTMLElement | null>(null)

// 添加麵包屑導航
const breadcrumbs = [
  {
    title: '首頁',
    href: '/',
    disabled: false,
  },
  {
    title: '代碼轉換圖片',
    disabled: true,
  },
]

// 狀態
const code = ref(`module.exports = leftpad;

function leftpad(str, len, ch) {
  str = String(str);
  var i = -1;

  if(!ch && ch !== 0) ch = " ";

  len = len - str.length;

  while (++i < len) {
    str = ch + str;
  }

  return str;
}`)

const selectedLanguage = ref('javascript')
const selectedTheme = ref('github-dark')
const selectedBrand = ref('supabase')
const paddingSize = ref('64')
const showWindowControls = ref(true)
const darkMode = ref(true)
const showBackground = ref(true)
const windowTitle = ref('leftpad.js')
const imageUrl = ref('')
const isGenerating = ref(false)
const isDownloading = ref(false)
const isEditing = ref(false)

// 設置抽屜狀態
const settingsDrawer = ref(false)

// 移動設備檢測
const isMobile = ref(false)

// 添加寬度調整相關變數
const previewWidth = ref(700)

// 初始寬度
const isResizing = ref(false)
const resizeSide = ref(null)
const startX = ref(0)
const startWidth = ref(0)

// 為游標位置保存新增變數
const selectionState = ref({
  startOffset: 0,
  endOffset: 0,
  startNode: null as Node | null,
  endNode: null as Node | null,
})

// 檢測窗口大小以決定是否顯示抽屜
const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 960 // 從1024px改為960px (md斷點)
}

onMounted(() => {
  // 初始檢測螢幕尺寸
  checkScreenSize()

  // 監聽窗口大小變化
  window.addEventListener('resize', checkScreenSize)

  // 添加窗口調整大小的處理
  window.addEventListener('resize', () => {
    // 在窗口尺寸變化時調整預覽容器最大尺寸
    if (previewWidth.value > window.innerWidth - 240) {
      previewWidth.value = Math.max(300, window.innerWidth - 240)
    }
  })
})

// 語言選項 (按字母順序排序)
const languageOptions = [
  { title: 'ABAP', value: 'abap' },
  { title: 'Ada', value: 'ada' },
  { title: 'Assembly', value: 'assembly' },
  { title: 'Bash', value: 'bash' },
  { title: 'C', value: 'c' },
  { title: 'C#', value: 'csharp' },
  { title: 'C++', value: 'cpp' },
  { title: 'Clojure', value: 'clojure' },
  { title: 'COBOL', value: 'cobol' },
  { title: 'CoffeeScript', value: 'coffeescript' },
  { title: 'Crystal', value: 'crystal' },
  { title: 'CSS', value: 'css' },
  { title: 'D', value: 'd' },
  { title: 'Dart', value: 'dart' },
  { title: 'Delphi', value: 'delphi' },
  { title: 'Elixir', value: 'elixir' },
  { title: 'Elm', value: 'elm' },
  { title: 'Erlang', value: 'erlang' },
  { title: 'F#', value: 'fsharp' },
  { title: 'Fortran', value: 'fortran' },
  { title: 'Go', value: 'go' },
  { title: 'GraphQL', value: 'graphql' },
  { title: 'Groovy', value: 'groovy' },
  { title: 'Haskell', value: 'haskell' },
  { title: 'HTML', value: 'html' },
  { title: 'Java', value: 'java' },
  { title: 'JavaScript', value: 'javascript' },
  { title: 'JSON', value: 'json' },
  { title: 'Julia', value: 'julia' },
  { title: 'Kotlin', value: 'kotlin' },
  { title: 'LaTeX', value: 'latex' },
  { title: 'Lisp', value: 'lisp' },
  { title: 'Lua', value: 'lua' },
  { title: 'Markdown', value: 'markdown' },
  { title: 'MATLAB', value: 'matlab' },
  { title: 'Objective-C', value: 'objectivec' },
  { title: 'OCaml', value: 'ocaml' },
  { title: 'Pascal', value: 'pascal' },
  { title: 'Perl', value: 'perl' },
  { title: 'PHP', value: 'php' },
  { title: 'PowerShell', value: 'powershell' },
  { title: 'Prolog', value: 'prolog' },
  { title: 'Python', value: 'python' },
  { title: 'R', value: 'r' },
  { title: 'React', value: 'jsx' },
  { title: 'ReScript', value: 'rescript' },
  { title: 'Ruby', value: 'ruby' },
  { title: 'Rust', value: 'rust' },
  { title: 'SAS', value: 'sas' },
  { title: 'Scala', value: 'scala' },
  { title: 'Scheme', value: 'scheme' },
  { title: 'SCSS', value: 'scss' },
  { title: 'ShaderLab', value: 'shaderlab' },
  { title: 'Shell', value: 'shell' },
  { title: 'Solidity', value: 'solidity' },
  { title: 'SQL', value: 'sql' },
  { title: 'Svelte', value: 'svelte' },
  { title: 'Swift', value: 'swift' },
  { title: 'Tcl', value: 'tcl' },
  { title: 'TypeScript', value: 'typescript' },
  { title: 'VB.NET', value: 'vbnet' },
  { title: 'Vue', value: 'vue' },
  { title: 'WebAssembly', value: 'wasm' },
  { title: 'XML', value: 'xml' },
  { title: 'YAML', value: 'yaml' },
]

// 主題選項列表
const themeOptions = [
  { title: 'GitHub Dark', value: 'github-dark' },
  { title: 'GitHub Light', value: 'github-light' },
  { title: 'Atom One Dark', value: 'atom-one-dark' },
  { title: 'Atom One Light', value: 'atom-one-light' },
  { title: 'Dracula', value: 'dracula' },
  { title: 'Nord', value: 'nord' },
  { title: 'Monokai', value: 'monokai' },
  { title: 'Solarized Dark', value: 'solarized-dark' },
  { title: 'Solarized Light', value: 'solarized-light' },
  { title: 'Tokyo Night', value: 'tokyo-night' },
  { title: 'Tokyo Night Light', value: 'tokyo-night-light' },
  { title: 'VS Code Dark', value: 'vs2015' },
  { title: 'VS Code Light', value: 'vs' },
]

// 主題路徑映射
const themePathMap = {
  'github-dark': 'github-dark',
  'github-light': 'github',
  'atom-one-dark': 'atom-one-dark',
  'atom-one-light': 'atom-one-light',
  dracula: 'dracula',
  nord: 'nord',
  monokai: 'monokai',
  'solarized-dark': 'solarized-dark',
  'solarized-light': 'solarized-light',
  'tokyo-night': 'tokyo-night-dark',
  'tokyo-night-light': 'tokyo-night-light',
  vs2015: 'vs2015',
  vs: 'vs',
} as any

// 當前加載的主題樣式表
let currentThemeStylesheet: any = null

// 監聽主題變更
watch(selectedTheme, async (newTheme) => {
  // 更新主題樣式表
  await loadThemeStylesheet(newTheme)

  // 重新生成高亮代碼
  nextTick(() => {
    if (codeEditor.value) {
      codeEditor.value.innerHTML = `<code>${highlightedCode.value}</code>`
    }
  })
})

// 加載主題樣式表
const loadThemeStylesheet = async (theme: any) => {
  // 如果已有樣式表，先移除
  if (currentThemeStylesheet) {
    document.head.removeChild(currentThemeStylesheet)
  }

  // 獲取主題的實際路徑名稱
  const themePath = themePathMap[theme] || 'atom-one-dark'

  // 創建新的樣式表鏈接
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://cdn.jsdelivr.net/npm/highlight.js@11.7.0/styles/${themePath}.min.css`

  // 等待樣式表加載完成
  await new Promise((resolve) => {
    link.onload = resolve
    link.onerror = resolve // 即使加載失敗也繼續
  })

  // 添加到文檔頭部
  document.head.appendChild(link)
  currentThemeStylesheet = link
}

// 確保代碼高亮正確
const highlightCode = (code: string, language: string) => {
  if (!language) {
    // 如果沒有選擇語言，嘗試自動檢測
    return hljs.highlightAuto(code).value
  }

  try {
    // 嘗試使用指定語言高亮
    return hljs.highlight(code, { language }).value
  } catch (e) {
    console.warn(`無法以 ${language} 進行高亮:`, e)
    // 出錯時嘗試自動檢測
    return hljs.highlightAuto(code).value
  }
}

// 更新 highlightedCode 計算屬性
const highlightedCode = computed(() => {
  if (!code.value.trim()) return ''
  return highlightCode(code.value, selectedLanguage.value)
})

// 品牌主題已更新為這樣的結構
const brands = [
  { title: '默認', value: 'default' },
  { title: 'GitHub', value: 'github' },
  { title: 'GitLab', value: 'gitlab' },
  { title: 'Bitbucket', value: 'bitbucket' },
  { title: 'Supabase', value: 'supabase' },
  { title: 'Vercel', value: 'vercel' },
  { title: 'Netlify', value: 'netlify' },
  { title: 'Firebase', value: 'firebase' },
  { title: 'AWS', value: 'aws' },
  { title: 'DigitalOcean', value: 'digitalocean' },
  { title: 'Heroku', value: 'heroku' },
  { title: 'Prisma', value: 'prisma' },
]

// 品牌顏色映射
const brandColors = {
  default: '#3B82F6', // 藍色
  github: '#24292e', // 黑色
  gitlab: '#FC6D26', // 橙色
  bitbucket: '#0052CC', // 藍色
  supabase: '#3ECF8E', // 綠色
  vercel: '#000000', // 黑色
  netlify: '#00C7B7', // 藍綠色
  railway: '#0B0D0E', // 黑色
  aws: '#FF9900', // 橙色
  digitalocean: '#0080FF', // 藍色
  heroku: '#430098', // 紫色
  prisma: '#2D3748', // 深灰色
} as any

// 獲取品牌顏色
const getBrandColor = () => {
  return brandColors[selectedBrand.value] || brandColors.default
}

// 擴充語言到副檔名的映射
const languageExtensions: any = {
  abap: 'abap',
  ada: 'ada',
  assembly: 'asm',
  bash: 'sh',
  c: 'c',
  csharp: 'cs',
  cpp: 'cpp',
  clojure: 'clj',
  cobol: 'cob',
  coffeescript: 'coffee',
  crystal: 'cr',
  css: 'css',
  d: 'd',
  dart: 'dart',
  delphi: 'pas',
  elixir: 'ex',
  elm: 'elm',
  erlang: 'erl',
  fsharp: 'fs',
  fortran: 'f90',
  go: 'go',
  graphql: 'graphql',
  groovy: 'groovy',
  haskell: 'hs',
  html: 'html',
  java: 'java',
  javascript: 'js',
  json: 'json',
  julia: 'jl',
  kotlin: 'kt',
  latex: 'tex',
  lisp: 'lisp',
  lua: 'lua',
  markdown: 'md',
  matlab: 'm',
  objectivec: 'm',
  ocaml: 'ml',
  pascal: 'pas',
  perl: 'pl',
  php: 'php',
  powershell: 'ps1',
  prolog: 'pl',
  python: 'py',
  jsx: 'jsx',
  rescript: 'res',
  ruby: 'rb',
  rust: 'rs',
  sas: 'sas',
  scala: 'scala',
  scheme: 'scm',
  scss: 'scss',
  shaderlab: 'shader',
  shell: 'sh',
  solidity: 'sol',
  sql: 'sql',
  svelte: 'svelte',
  swift: 'swift',
  tcl: 'tcl',
  typescript: 'ts',
  vbnet: 'vb',
  wasm: 'wasm',
  xml: 'xml',
  yaml: 'yml',
}

// 計算文件基本名稱 (不包含副檔名)
const fileBaseName = computed(() => {
  if (!windowTitle.value) return 'code' // 如果文件名包含點，取第一個點前的部分
  const dotIndex = windowTitle.value.indexOf('.')
  return dotIndex > 0
    ? windowTitle.value.substring(0, dotIndex)
    : windowTitle.value
})

// 監聽語言變更，更新副檔名
watch(selectedLanguage, (newLang) => {
  const ext = languageExtensions[newLang] || 'txt'
  windowTitle.value = `${fileBaseName.value}.${ext}`
})

// 處理代碼輸入，保存選區並應用高亮
const handleCodeInput = (event: any) => {
  if (isEditing.value) return
  isEditing.value = true

  // 保存選區位置
  const selection = window.getSelection()
  const range = selection?.getRangeAt(0)
  let cursorPosition = 0

  if (range) {
    // 獲取完整代碼並計算游標位置
    const preCaretRange = range.cloneRange()
    preCaretRange.selectNodeContents(codeEditor.value!)
    preCaretRange.setEnd(range.endContainer, range.endOffset)
    cursorPosition = preCaretRange.toString().length
  }

  // 獲取純文本內容並更新代碼
  const content = codeEditor.value?.textContent || ''
  code.value = content

  // 在下一個 tick 中，等待高亮應用後恢復游標位置
  nextTick(() => {
    if (codeEditor.value && cursorPosition >= 0) {
      // 重新定位游標
      setCursorPosition(cursorPosition)
      isEditing.value = false

      // 延遲生成圖片，避免頻繁渲染
      clearTimeout(autoGenerateTimeout.value)
      autoGenerateTimeout.value = setTimeout(() => {
        generateImage()
      }, 500)
    }
  })
}

// 添加自動生成圖片的延遲計時器
const autoGenerateTimeout = ref<any>(null)

// 設置游標位置的輔助函數
const setCursorPosition = (position: number) => {
  if (!codeEditor.value) return

  // 獲取所有文本節點
  const textNodes = []
  const walker = document.createTreeWalker(
    codeEditor.value,
    NodeFilter.SHOW_TEXT,
    null
  )

  let node
  while ((node = walker.nextNode())) {
    textNodes.push(node)
  }

  // 計算游標應該放在哪個節點和偏移位置
  let currentLength = 0
  let targetNode = null
  let targetOffset = 0

  for (let i = 0; i < textNodes.length; i++) {
    const node = textNodes[i]
    const nodeLength = node.textContent?.length || 0

    if (currentLength + nodeLength >= position) {
      targetNode = node
      targetOffset = position - currentLength
      break
    }

    currentLength += nodeLength
  }

  // 如果找到目標節點，設置游標位置
  if (targetNode) {
    const range = document.createRange()
    const selection = window.getSelection()

    range.setStart(targetNode, targetOffset)
    range.setEnd(targetNode, targetOffset)

    selection?.removeAllRanges()
    selection?.addRange(range)
  } else if (textNodes.length > 0) {
    // 如果無法找到精確位置，將游標放在最後一個節點的末尾
    const lastNode = textNodes[textNodes.length - 1]
    const lastNodeLength = lastNode.textContent?.length || 0

    const range = document.createRange()
    const selection = window.getSelection()

    range.setStart(lastNode, lastNodeLength)
    range.setEnd(lastNode, lastNodeLength)

    selection?.removeAllRanges()
    selection?.addRange(range)
  }
}

// 修改粘貼處理函數
const handlePaste = (event: any) => {
  event.preventDefault()

  // 獲取粘貼文本
  // @ts-ignore
  const text = (event.clipboardData || window.clipboardData).getData('text')
  const selection = window.getSelection()

  if (selection && selection.rangeCount > 0) {
    const range = selection.getRangeAt(0)
    range.deleteContents()

    // 插入純文本
    const textNode = document.createTextNode(text)
    range.insertNode(textNode)

    // 移動游標到插入文本後
    range.setStartAfter(textNode)
    range.collapse(true)
    selection.removeAllRanges()
    selection.addRange(range)

    // 更新代碼
    code.value = codeEditor.value?.textContent || ''

    // 延遲生成圖片
    clearTimeout(autoGenerateTimeout.value)
    autoGenerateTimeout.value = setTimeout(() => {
      generateImage()
    }, 500)
  }
}

// 處理按鍵事件
const handleKeyDown = (event: any) => {
  // 處理Tab鍵
  if (event.key === 'Tab') {
    event.preventDefault() // 在光標位置插入Tab（2個空格）
    const selection = window.getSelection()
    if (!selection) {
      console.warn('無法獲取選區')
      return
    }
    const range = selection.getRangeAt(0)
    const tabNode = document.createTextNode('  ')
    range.insertNode(tabNode) // 將光標移到插入的Tab之後
    range.setStartAfter(tabNode)
    range.collapse(true) // 確保選區存在
    if (selection) {
      selection.removeAllRanges()
      selection.addRange(range)
    } // 更新代碼值，先檢查元素是否存在
    if (codeEditor.value) {
      code.value = codeEditor.value.innerText
    }
  }
}

// 生成圖片的函數
const generateImage = async () => {
  if (!codePreviewContainer.value) return

  try {
    // 確保在截圖前應用所有樣式變更
    await nextTick()

    // 只截取代碼預覽窗口部分
    const options = {
      scale: 2, // 提高截圖質量
      useCORS: true, // 允許跨域圖片
      allowTaint: true, // 允許污染畫布
      backgroundColor: null, // 透明背景
      logging: false, // 關閉日誌
      // 改進文本渲染
      letterRendering: true,
      // 確保應用 CSS 樣式
      ignoreElements: (element: any) => {
        // 忽略調整手柄和寬度指示器
        return (
          element.classList.contains('resize-handle') ||
          element.classList.contains('width-indicator')
        )
      },
    }

    // 截取代碼預覽區域
    const canvas = await html2canvas(codePreview.value!, options)

    // 轉換為圖片URL
    const imgData = canvas.toDataURL('image/png')
    imageUrl.value = imgData

    return imgData
  } catch (error) {
    console.error('截圖失敗:', error)
    return null
  }
}

// 下載圖片函數
const downloadImage = async () => {
  isDownloading.value = true

  try {
    // 強制重新生成圖片以確保最新設置被應用
    const imgData = await generateImage()

    if (!imgData) {
      throw new Error('無法生成圖片')
    }

    // 創建下載連結
    const downloadLink = document.createElement('a')
    // 使用文件名或代碼窗口標題
    const fileBaseName = windowTitle.value
      ? windowTitle.value.replace(/\.\w+$/, '')
      : 'code-screenshot'

    // 添加語言擴展名作為文件名後綴
    const ext = languageExtensions[selectedLanguage.value] || 'txt'
    const fileName = `${fileBaseName}.png`

    downloadLink.href = imgData
    downloadLink.download = fileName

    // 觸發下載
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  } catch (error) {
    console.error('下載圖片失敗:', error)
  } finally {
    isDownloading.value = false
  }
}

// 修改載入範例代碼，設置合適的文件名
const loadExampleCode = () => {
  code.value = `module.exports = leftpad;

function leftpad(str, len, ch) {
  str = String(str);
  var i = -1;

  if(!ch && ch !== 0) ch = " ";

  len = len - str.length;

  while (++i < len) {
    str = ch + str;
  }

  return str;
}`
  selectedLanguage.value = 'javascript'
  windowTitle.value = 'leftpad.js'
  // 其他設置不變
}

// 重設代碼時也要重設文件名
const resetCode = () => {
  code.value = ''
  const ext = languageExtensions[selectedLanguage.value] || 'txt'
  windowTitle.value = `untitled.${ext}`

  // 清空後延遲生成空白圖片
  setTimeout(() => {
    generateImage()
  }, 100)
}

// 調整大小時清楚標記調整的是哪一側
const startResize = (side: any) => {
  isResizing.value = true
  resizeSide.value = side // 記錄當前調整的是哪一側
  // @ts-ignore
  startX.value = event?.clientX
  startWidth.value = previewWidth.value

  // 添加全局事件監聽
  window.addEventListener('mousemove', handleResize)
  window.addEventListener('mouseup', stopResize)

  // 添加調整中的樣式
  document.body.style.cursor = 'ew-resize'
  document.body.style.userSelect = 'none'
}

// 修改調整大小邏輯，修復方向問題
const handleResize = (event: any) => {
  if (!isResizing.value) return

  const delta = event.clientX - startX.value
  let newWidth

  // 根據調整的側面決定如何計算新寬度
  if (resizeSide.value === 'left') {
    // 左側調整 - 向左拖動增加寬度，向右拖動減少寬度
    newWidth = startWidth.value - delta * 2
  } else if (resizeSide.value === 'right') {
    // 右側調整 - 向右拖動增加寬度，向左拖動減少寬度
    newWidth = startWidth.value + delta * 2
  } else {
    // 兩側同時調整 - 以中心為基準縮放
    newWidth = startWidth.value + delta * (delta > 0 ? 1 : -1)
  }

  // 限制最小最大寬度
  previewWidth.value = Math.max(520, Math.min(1200, newWidth))

  // 調整預覽容器的位置
  if (codePreviewContainer.value) {
    codePreviewContainer.value.style.margin = '0 auto'
  }
}

const stopResize = () => {
  isResizing.value = false

  // 移除全局事件監聽
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)

  // 恢復正常游標
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 對於監聽器，我們不再需要保存 imageUrl，因為每次都是重新生成
watch(
  [
    selectedTheme,
    darkMode,
    showBackground,
    paddingSize,
    selectedBrand,
    showWindowControls,
    code, // 添加代碼變化的監聽
  ],
  async () => {
    // 延遲生成圖片，以確保樣式變更已應用
    clearTimeout(autoGenerateTimeout.value)
    autoGenerateTimeout.value = setTimeout(() => {
      generateImage()
    }, 300)
  }
)

// 監聽文件名稱變化
watch(windowTitle, () => {
  // 只有當顯示窗口控制按鈕時才自動生成
  if (showWindowControls.value) {
    setTimeout(() => {
      generateImage()
    }, 300)
  }
})

// 卸載時清理事件
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', handleResize)
  window.removeEventListener('mouseup', stopResize)
  window.removeEventListener('resize', handleResize)
  if (autoGenerateTimeout.value) {
    clearTimeout(autoGenerateTimeout.value)
  }
})

// 當組件掛載時，加載初始主題
onMounted(async () => {
  // 初始化主題
  if (selectedTheme.value) {
    await loadThemeStylesheet(selectedTheme.value)
  }

  // 確保初始代碼被正確高亮
  nextTick(() => {
    if (code.value && codeEditor.value) {
      // 強制更新高亮
      const highlighted = highlightCode(code.value, selectedLanguage.value)
      if (codeEditor.value.querySelector('code')) {
        codeEditor.value.querySelector('code')!.innerHTML = highlighted
      }
    }
  })
})
</script>

<style scoped>
.code-image-fullscreen {
  min-height: 100vh;
  width: 100%;
  padding: 0;
  background-color: #f5f7fa;
  position: relative;
}

.editor-container {
  display: flex;
  min-height: 100vh;
  position: relative;
  width: 100%;
  overflow: hidden; /* 防止意外的水平滾動 */
}

.preview-area {
  flex: 1;
  height: 100vh; /* 固定高度 */
  width: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 10px 100px; /* 增加頂部和底部間距 */
  box-sizing: border-box;
}

.settings-panel {
  width: 200px;
  height: 100vh;
  overflow-y: auto;
  background-color: white;
  border-left: 1px solid #eee;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.05);
  position: fixed;
  right: 0;
  top: 0;
  z-index: 5;
}

/* 修改麵包屑位置到左上角 */
.breadcrumb-nav {
  position: fixed;
  top: 16px;
  left: 20px;
  z-index: 100;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 4px 8px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (min-width: 960px) and (max-width: 1279px) {
  /* 在md斷點範圍內調整預覽容器的最大寬度 */
  .code-preview-container {
    max-width: calc(100vw - 220px);
  }

  /* 調整麵包屑位置 */
  .breadcrumb-nav {
    left: 10px;
  }
}

.control-panel {
  height: 100vh;
  overflow-y: auto;
  background-color: white;
  border-left: 1px solid #eee;
  max-width: 200px !important;
  position: fixed;
  right: 0;
  top: 0;
}

.control-panel-content {
  padding: 10px !important;
}

.control-card {
  border-radius: 0;
  box-shadow: none !important;
}

.h-100 {
  height: 100%;
}

.code-preview-container {
  position: relative;
  max-width: 1200px;
  min-width: 520px;
  transition: width 0.1s ease;
  margin: 0 auto;
}

.code-preview {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  background-color: #3ecf8e;
}

.code-preview.no-bg {
  background-color: transparent !important;
  box-shadow: none;
}

.code-preview.dark-mode .code-window {
  background-color: #1a1a1a;
  color: #f8f8f2;
}

.code-preview:not(.dark-mode) .code-window {
  background-color: #ffffff;
  color: #24292e;
}

.code-window {
  border-radius: 6px;
  overflow: visible; /* 從 hidden 改為 visible */
  background-color: #1a1a1a;
}

.window-controls {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #444;
}

.control {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
}

.control.red {
  background-color: #ff5f56;
}

.control.yellow {
  background-color: #ffbd2e;
}

.control.green {
  background-color: #27c93f;
}

.window-title {
  margin-left: 10px;
  font-size: 12px;
  color: #ababab;
}

.code-edit-area {
  height: auto; /* 從固定高度改為自適應 */
  min-height: 200px;
}

.code-content {
  margin: 0;
  padding: 16px;
  overflow: visible;
  font-family: 'Fira Code', 'Consolas', monospace;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  white-space: pre-wrap; /* 改為 pre-wrap 允許自動換行 */
  word-wrap: break-word; /* 在單詞內部換行 */
  word-break: break-word; /* 更現代的斷詞方式 */
  min-height: 200px;
  max-height: none;
}

/* 自訂品牌圖標 */
.mdi-prisma::before {
  content: '\F0B39';
}

.brand-chips-container {
  max-width: 100%;
  overflow-x: auto;
}

.brand-chips {
  display: flex;
  flex-wrap: wrap;
}

.brand-chips .v-chip {
  margin: 2px !important;
}

.settings-toggle-btn {
  position: fixed;
  right: 20px;
  top: 20px;
  z-index: 100;
}

/* 修改調整手柄樣式，改為始終顯示的圓點 */
.resize-handle {
  position: absolute;
  width: 20px; /* 增加寬度便於操作 */
  height: 100%;
  top: 0;
  background-color: transparent;
  cursor: ew-resize;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 圓點調整器樣式 */
.resize-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(33, 150, 243, 0.6);
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, background-color 0.2s ease;
}

.resize-handle:hover .resize-dot {
  transform: scale(1.2);
  background-color: rgba(33, 150, 243, 0.9);
}

.resize-handle.left {
  left: -10px; /* 調整手柄位置 */
}

.resize-handle.right {
  right: -10px; /* 調整手柄位置 */
}

/* 確保預覽區域正確佈局 */
.preview-area {
  display: flex;
  justify-content: center;
  align-items: flex-start; /* 從 center 改為 flex-start，確保頂部對齊 */
  width: 100%;
  max-height: 100vh;
  overflow-y: auto; /* 添加垂直滾動 */
  padding-top: 40px; /* 頂部增加間距 */
  padding-bottom: 60px; /* 底部增加間距 */
}

/* 新增寬度指示器樣式 */
.width-indicator {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-family: monospace;
  z-index: 5;
  margin-bottom: 10px;
}
</style>

<style>
/* 全局樣式，確保語法高亮正確顯示 */
.hljs {
  background: transparent !important;
  padding: 0 !important;
}

/* 可編輯區域的光標 */
[contenteditable] {
  cursor: text;
}

/* 避免編輯時顯示多餘標記 */
[contenteditable]:focus {
  outline: none;
}

/* 修復編輯器字體 */
@media screen and (max-width: 600px) {
  .code-content {
    font-size: 12px !important;
  }
}
</style>
