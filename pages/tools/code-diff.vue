<template>
  <ClientOnly>
    <v-container fluid>
      <!-- 麵包屑導航 -->
      <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-4">
        <template v-slot:divider>
          <v-icon icon="mdi-chevron-right" size="small"></v-icon>
        </template>
      </v-breadcrumbs>

      <!-- 工具欄 -->
      <v-card class="mb-4" variant="outlined">
        <v-card-text>
          <v-row>
            <v-col cols="12" sm="4">
              <v-select
                v-model="language"
                :items="languages"
                label="程式語言"
                density="compact"
                variant="outlined"
                hide-details
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4">
              <v-switch
                v-model="inlineDiff"
                label="行內差異"
                hide-details
                color="primary"
                density="compact"
              ></v-switch>
            </v-col>
            <v-col cols="12" sm="4" class="d-flex justify-end align-center">
              <v-btn
                color="primary"
                variant="outlined"
                class="mr-2"
                @click="clearAll"
                size="small"
              >
                清空
              </v-btn>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <!-- 差異編輯區域 -->
      <v-card variant="outlined">
        <v-card-title class="pb-0">
          <div class="d-flex align-center justify-space-between w-100">
            <div>
              <v-icon color="primary" class="mr-2">mdi-compare</v-icon>
              代碼比較
            </div>
            <v-btn
              size="small"
              color="primary"
              variant="text"
              prepend-icon="mdi-content-copy"
              @click="copyDiffResult"
            >
              複製
            </v-btn>
          </div>
        </v-card-title>
        <v-card-text>
          <MonacoDiffEditor
            v-model:original="originalCode"
            v-model:modified="modifiedCode"
            :language="language"
            :options="diffEditorOptions"
            @mount="handleMonacoMount"
            class="diff-editor"
          />
        </v-card-text>
      </v-card>
    </v-container>
  </ClientOnly>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'

useSeoMeta({
  title: '代碼比較工具',
  description: '快速對比兩段代碼的差異',
  ogTitle: '代碼比較工具',
  ogDescription: '快速對比兩段代碼的差異',
})

// 麵包屑導航
const breadcrumbs = [
  { title: '首頁', disabled: false, href: '/' },
  { title: '代碼比較', disabled: true },
]

// 程式語言選項
const languages = [
  { title: 'JavaScript', value: 'javascript' },
  { title: 'TypeScript', value: 'typescript' },
  { title: 'HTML', value: 'html' },
  { title: 'CSS', value: 'css' },
  { title: 'JSON', value: 'json' },
  { title: 'Python', value: 'python' },
  { title: 'Java', value: 'java' },
  { title: 'C#', value: 'csharp' },
  { title: 'PHP', value: 'php' },
  { title: 'SQL', value: 'sql' },
  { title: 'Markdown', value: 'markdown' },
  { title: 'YAML', value: 'yaml' },
  { title: 'Rust', value: 'rust' },
  { title: 'Go', value: 'go' },
  { title: 'Bash', value: 'shell' },
]

// 狀態變量
const language = ref('javascript')
const originalCode = ref('Hello World')
const modifiedCode = ref('Goodbye World')
const inlineDiff = ref(true)

// 存儲註冊的補全提供者
const isMonacoLoaded = ref(false)

// Monaco編輯器掛載事件
const handleMonacoMount = (monaco: any) => {
  isMonacoLoaded.value = true
  registerCompletionProvider(language.value, monaco)
}

// 根據語言註冊補全提供者
const registerCompletionProvider = (lang: string, monacoInstance: any) => {
  if (!monacoInstance) return

  // 定義不同語言的關鍵字
  const keywords: Record<string, { items: string[]; details?: string }[]> = {
    javascript: [
      {
        items: [
          'function',
          'const',
          'let',
          'var',
          'return',
          'if',
          'else',
          'for',
          'while',
          // ... 其他關鍵字 ...
        ],
        details: '關鍵字',
      },
      // ... 其他類別 ...
    ],
    // ... 其他語言 ...
  }

  // 獲取當前語言的關鍵字
  const currentLanguageKeywords = keywords[lang] || []

  // 註冊自動補全提供者
  return monacoInstance.languages.registerCompletionItemProvider(lang, {
    provideCompletionItems: function (model: any, position: any) {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      // 收集所有建議
      const suggestions = []

      // 添加當前語言的所有關鍵字
      currentLanguageKeywords.forEach((category) => {
        category.items.forEach((keyword) => {
          suggestions.push({
            label: keyword,
            kind: monacoInstance.languages.CompletionItemKind.Keyword,
            insertText: keyword,
            detail: category.details || '',
            range: range,
          })
        })
      })

      return {
        suggestions: suggestions,
      }
    },
    triggerCharacters: ['.', '<', ':', '@', '$'],
  })
}

// 監聽語言變化
watch(language, (newLanguage) => {
  if (isMonacoLoaded.value && window.monaco) {
    registerCompletionProvider(newLanguage, window.monaco)
  }
})

// 差異編輯器選項
const diffEditorOptions = computed(() => ({
  originalEditable: true,
  readOnly: false,
  renderSideBySide: true,
  enableSplitViewResizing: true,
  renderOverviewRuler: false,
  automaticLayout: true,
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  lineNumbers: 'on',
  wordWrap: 'on',
  diffWordWrap: 'on',
  renderLineHighlight: 'all',
  renderIndicators: true,
  ignoreTrimWhitespace: !inlineDiff.value,
  renderWhitespace: 'all',
  quickSuggestions: true,
  suggestOnTriggerCharacters: true,
  parameterHints: true,
  snippetSuggestions: 'inline',
  formatOnType: true,
  formatOnPaste: true,
  acceptSuggestionOnEnter: 'on',
  tabCompletion: 'on',
  suggest: {
    showMethods: true,
    showFunctions: true,
    showConstructors: true,
    showFields: true,
    showVariables: true,
    showClasses: true,
    showStructs: true,
    showInterfaces: true,
    showModules: true,
    showProperties: true,
    showEvents: true,
    showOperators: true,
    showUnits: true,
    showValues: true,
    showConstants: true,
    showEnums: true,
    showEnumMembers: true,
    showKeywords: true,
    showWords: true,
    showColors: true,
    showFiles: true,
    showReferences: true,
    showFolders: true,
    showTypeParameters: true,
    showSnippets: true,
    showUsers: true,
    showIssues: true,
  },
  folding: true,
  scrollbar: {
    verticalScrollbarSize: 10,
    horizontalScrollbarSize: 10,
  },
}))

// 清空所有內容
const clearAll = () => {
  originalCode.value = ''
  modifiedCode.value = ''
}

// 複製差異結果
const copyDiffResult = () => {
  const textToCopy = `原始代碼:\n${originalCode.value}\n\n修改後代碼:\n${modifiedCode.value}`

  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      alert('已複製到剪貼板')
    })
    .catch((err) => {
      console.error('複製失敗:', err)
    })
}

// 設置預設值，方便用戶看到效果
watch(
  language,
  () => {
    if (!originalCode.value && !modifiedCode.value) {
      if (language.value === 'javascript') {
        originalCode.value =
          'function hello() {\n  console.log("Hello World");\n  return true;\n}'
        modifiedCode.value =
          'function hello() {\n  console.log("Goodbye World");\n  return false;\n}'
      } else if (language.value === 'html') {
        originalCode.value =
          '<div>\n  <h1>Hello World</h1>\n  <p>This is a test</p>\n</div>'
        modifiedCode.value =
          '<div>\n  <h1>Goodbye World</h1>\n  <p>This is a test page</p>\n</div>'
      } else if (language.value === 'css') {
        originalCode.value =
          'body {\n  background-color: #f00;\n  color: #fff;\n}'
        modifiedCode.value =
          'body {\n  background-color: #00f;\n  color: #fff;\n  font-size: 14px;\n}'
      }
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.diff-editor {
  height: 70vh;
  min-height: 400px;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

.w-100 {
  width: 100%;
}
</style>
