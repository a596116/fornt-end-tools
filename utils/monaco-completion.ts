import * as monaco from 'monaco-editor'

/**
 * 註冊自定義語法補全
 * @param language 語言類型
 * @returns 註冊的提供者實例（用於後續銷毀）
 */
export const registerCompletionProvider = (language: string) => {
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
          'switch',
          'case',
          'break',
          'continue',
          'try',
          'catch',
          'finally',
          'class',
          'import',
          'export',
          'console.log',
          'setTimeout',
          'Promise',
          'async',
          'await',
          'document',
          'window',
        ],
        details: '關鍵字',
      },
      {
        items: [
          'Array.forEach()',
          'Array.map()',
          'Array.filter()',
          'Array.reduce()',
          'String.split()',
          'String.substring()',
          'Object.keys()',
          'Object.values()',
        ],
        details: '常用方法',
      },
    ],
    typescript: [
      {
        items: [
          'interface',
          'type',
          'enum',
          'namespace',
          'implements',
          'extends',
          'readonly',
          'public',
          'private',
          'protected',
          'abstract',
          'as',
          'any',
          'boolean',
          'string',
          'number',
          'undefined',
          'null',
          'never',
          'void',
          'unknown',
        ],
        details: 'TypeScript關鍵字',
      },
    ],
    html: [
      {
        items: [
          '<div></div>',
          '<span></span>',
          '<p></p>',
          '<h1></h1>',
          '<h2></h2>',
          '<a href=""></a>',
          '<img src="" alt="">',
          '<button></button>',
          '<input type="text">',
          '<ul><li></li></ul>',
          '<table></table>',
          '<form></form>',
          '<section></section>',
        ],
        details: 'HTML標籤',
      },
    ],
    css: [
      {
        items: [
          'display: flex;',
          'display: grid;',
          'position: relative;',
          'position: absolute;',
          'margin: 0;',
          'padding: 0;',
          'color: #fff;',
          'background-color: #000;',
          'font-size: 14px;',
          'font-weight: bold;',
          'text-align: center;',
        ],
        details: 'CSS屬性',
      },
    ],
    sql: [
      {
        items: [
          'SELECT',
          'FROM',
          'WHERE',
          'JOIN',
          'INNER JOIN',
          'LEFT JOIN',
          'RIGHT JOIN',
          'GROUP BY',
          'ORDER BY',
          'HAVING',
          'LIMIT',
          'INSERT INTO',
          'UPDATE',
          'DELETE FROM',
          'CREATE TABLE',
          'ALTER TABLE',
          'DROP TABLE',
          'COUNT(*)',
          'SUM()',
          'AVG()',
        ],
        details: 'SQL關鍵字',
      },
    ],
    python: [
      {
        items: [
          'def',
          'class',
          'import',
          'from',
          'if',
          'elif',
          'else',
          'for',
          'while',
          'try',
          'except',
          'finally',
          'with',
          'as',
          'lambda',
          'return',
          'yield',
          'print()',
          'len()',
          'range()',
          'list()',
          'dict()',
          'set()',
          'tuple()',
        ],
        details: 'Python關鍵字',
      },
    ],
    java: [
      {
        items: [
          'public',
          'private',
          'protected',
          'class',
          'interface',
          'extends',
          'implements',
          'static',
          'final',
          'void',
          'int',
          'String',
          'boolean',
          'System.out.println()',
          'new',
          'try',
          'catch',
          'finally',
          'throw',
          'throws',
          'abstract',
          'enum',
        ],
        details: 'Java關鍵字',
      },
    ],
  }

  // 獲取當前語言的關鍵字，如果不存在則使用空數組
  const currentLanguageKeywords = keywords[language] || []

  // 註冊自動補全提供者
  const provider = monaco.languages.registerCompletionItemProvider(language, {
    provideCompletionItems: function (model, position) {
      const word = model.getWordUntilPosition(position)
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn,
      }

      // 收集所有建議
      const suggestions: monaco.languages.CompletionItem[] = []

      // 添加當前語言的所有關鍵字
      currentLanguageKeywords.forEach((category) => {
        category.items.forEach((keyword) => {
          suggestions.push({
            label: keyword,
            kind: monaco.languages.CompletionItemKind.Keyword,
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
    // 觸發補全的字符
    triggerCharacters: ['.', '<', ':', '@', '$'],
  })

  return provider
}
