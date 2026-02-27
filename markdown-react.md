## 1. Preparar estrutura de arquivos

- Criar data/markdown/ com subpastas `changelog/` e `blog/` (futura)
- Converter conteúdo de logs.js em arquivos .md individuais:
  - `data/markdown/changelog/v0.0.5.md`
  - `data/markdown/changelog/v1.0.0.md`
  - etc
- Manter metadados (título, versão, data) em um arquivo índice: `data/markdown/changelog/index.js` que importará os .md como strings

## 2. Instalar dependências

- `react-markdown` - renderização de markdown como componentes React
- `remark-gfm` - suporte a GitHub Flavored Markdown (tabelas, strikethrough)
- `react-syntax-highlighter` - destaque de sintaxe para code blocks
- Opcional: `remark-remarkjs` para processamento adicional

## 3. Criar sistema de carregamento de .md

- Usar Vite's `import.meta.glob()` ou `?raw` assertion para importar arquivos .md como strings
- Criar utilitário em utils (ex: `useMarkdown.jsx` ou `markdownLoader.js`) que:
  - Carrega os arquivos .md
  - Parse metadados (se em front matter YAML)
  - Retorna estrutura: `{meta: {...}, content: "markdown string"}`

## 4. Criar componente `MarkdownRenderer`

- Novo componente em src/components/MarkdownRenderer.jsx que:
  - Recebe string markdown
  - Renderiza com <ReactMarkdown> + plugins
  - Customiza styling das tags (headings, code blocks, tables)

## 5. Atualizar Changelog.jsx

- Remover import direto de logs.js
- Integrar novo sistema de carregamento
- Usar `<MarkdownRenderer>` para renderizar conteúdo
- Manter estrutura de layout (grid de posts)

## 6. Atualizar estilos

- Estender Changelog.css com:
  - Estilos para tabelas markdown (borders, padding)
  - Code blocks (background, fonte monospace, overflow)
  - Blockquotes (border-left, itálico)
  - Links markdown

## 7. Links Úteis

- [react-markdown demo](https://remarkjs.github.io/react-markdown/) & [react-markdown repositório](https://github.com/remarkjs/react-markdown): Documentação oficial da lib
- [Rendering Markdown in React with React-Markdown](https://app.studyraid.com/en/courses/11460/rendering-markdown-in-react-with-react-markdown): Mini curso de como implementar react-markdown
- [React-Markdown - Complete Guide](https://markdown-tools.com/react-markdown): Guia de como implementar react-markdown