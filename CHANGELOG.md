# Changelog — Relatório Técnico Detalhado

Análise completa de todos os arquivos e mudanças do projeto desde o primeiro commit.
Inclui detalhes técnicos não documentados nos logs internos do site.

---

## Infraestrutura e Configuração

### Ferramentas de build e desenvolvimento

- **Vite** como bundler/dev server (`vite.config.js`)
  - Plugin `@vitejs/plugin-react` habilitado
  - `base` configurada como `/zweihander` (necessário para GitHub Pages com subpath)
- **Bun** como gerenciador de pacotes (lockfile `bun.lock`)
  - Scripts disponíveis: `dev`, `build`, `lint`, `preview`
- **ESLint** (`eslint.config.js`)
  - Configuração flat config (nova API ESLint 9+)
  - Plugins: `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
  - Regra customizada: `no-unused-vars` ignora variáveis em CAPS (ex: componentes importados mas não usados explicitamente)
  - Ignora a pasta `dist`

### Deploy automatizado — GitHub Actions (`.github/workflows/deploy.yml`)

Completamente não documentado nos logs internos. Detalhes:

- Triggered em push para `main` ou via `workflow_dispatch` (execução manual)
- Grupo de concorrência `"pages"` com `cancel-in-progress: false` (evita deploys paralelos)
- Permissões: `contents: read`, `pages: write`, `id-token: write`
- Job `build`:
  - Usa `oven-sh/setup-bun@v2` para instalar o Bun
  - Roda `bun install` e `bun run build`
  - Faz upload do artefato a partir de `./dist`
- Job `deploy`:
  - Depende do job `build`
  - Usa `actions/deploy-pages@v4`
  - Publica em GitHub Pages

### SPA Routing no GitHub Pages (`public/404.html` + `index.html`)

Mecanismo não documentado em lugar nenhum. O GitHub Pages não suporta SPA por padrão — qualquer URL direta retorna 404. A solução implementada:

1. **`public/404.html`**: quando o GitHub Pages retorna 404, este arquivo executa um script que redireciona para a raiz, codificando o caminho original como query string. `pathSegmentsToKeep = 1` preserva o segmento `/zweihander/`.
2. **`index.html`**: contém um script inline que decodifica a query string de volta ao caminho original via `window.history.replaceState`, antes que o React Router monte. Isso faz o React Router receber o URL correto.

### `.gitignore`

- Ignora `node_modules`, `dist`, `dist-ssr`, arquivos `*.local`
- Ignora diretórios de IDEs: `.vscode` (exceto `extensions.json`), `.idea`
- Ignora arquivos de log comuns de npm, yarn, pnpm

---

## Dependências

### Produção (`package.json` → `dependencies`)

| Pacote | Versão | Uso |
|---|---|---|
| `react` | ^19.2.0 | UI library |
| `react-dom` | ^19.2.0 | Renderização no DOM |
| `react-router-dom` | ^7.13.1 | Roteamento client-side |
| `react-markdown` | ^10.1.0 | Renderização de Markdown |
| `remark-gfm` | ^4.0.1 | GFM: tabelas, checkbox, strikethrough |
| `rehype-highlight` | ^7.0.2 | Syntax highlight via highlight.js |
| `highlight.js` | ^11.11.1 | Tema de cores para blocos de código |
| `react-syntax-highlighter` | ^16.1.1 | Instalado mas não usado diretamente |

### Desenvolvimento (`devDependencies`)

| Pacote | Versão | Uso |
|---|---|---|
| `vite` | ^8.0.0-beta.13 | Build tool (versão beta, override forçado) |
| `@vitejs/plugin-react` | ^5.1.1 | Suporte JSX no Vite |
| `eslint` | ^9.39.1 | Linter |
| `@eslint/js` | ^9.39.1 | Configuração base ESLint |
| `eslint-plugin-react-hooks` | ^7.0.1 | Regras de React Hooks |
| `eslint-plugin-react-refresh` | ^0.4.24 | Compatibilidade com HMR |
| `globals` | ^16.5.0 | Globals de browser para ESLint |
| `@types/react` / `@types/react-dom` | ^19.x | Tipagem TypeScript (usado pelo editor) |

---

## Sistema de Design e Estilos Globais (`src/styles/main.css`)

### Tipografia

- **Fonte primária**: IBM Plex Sans (`--primary-font`) — usada em títulos, TOC, cabeçalhos
- **Fonte secundária**: Inter (`--secondary-font`) — usada em corpo de texto
- Ambas carregadas via Google Fonts com `@import url(...)`

### Reset CSS

- `margin: 0; padding: 0; box-sizing: border-box` aplicado globalmente via `*`
- Scrollbar customizada globalmente:
  - `scrollbar-width: thin` (Firefox)
  - `::-webkit-scrollbar` com largura/altura de 8px (Chromium)
  - Thumb com gradiente `rgba(255,255,255,0.35)` → `rgba(255,255,255,0.12)`, bordas arredondadas
  - Thumb hover com gradiente mais brilhante

### Background dinâmico

- Mesh gradient com 4 gradientes radiais usando CSS custom properties:
  - `--color01` (81% 13%), `--color02` (16% 91%), `--color03` (24% 16%), `--color04` (66% 4%)
  - Fallback de cor sólida `var(--color01)`
- 10 temas pré-definidos em `src/data/themes.js` (ver seção Temas)

### Design system: Glassmorphism

Padrão aplicado em todos os containers principais:

```css
background: rgba(24, 24, 24, 0.2);
backdrop-filter: blur(10px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.1);
border-radius: 2rem;
box-shadow: 0 8px 32px rgba(24,24,24,0.2), inset 0 4px 20px rgba(24,24,24,0.2);
```

---

## Sistema de Temas (`src/data/themes.js`)

Não documentado nos logs internos. Detalhes:

- Array de 10 objetos, cada um com 4 variáveis CSS: `color01`, `color02`, `color03`, `color04`
- Aplicados aleatoriamente a cada carregamento de página via `App.jsx`:
  ```js
  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
  Object.entries(randomTheme).forEach(([key, value]) => {
    document.documentElement.style.setProperty(`--${key}`, value);
  });
  ```
- O hint "Tente dar F5 na página 😉" na Home page é referência direta a essa funcionalidade
- Cores baseadas em combinações do site [Gradienty](https://gradienty.codes/mesh-gradients) (creditado em Bookmarks)

Paletas disponíveis (todas com `color01`–`color04`):

| # | color01 | color02 | color03 | color04 |
|---|---|---|---|---|
| 1 | #200f21 | #382039 | #5a3d5c | #f638dc |
| 2 | #4f3961 | #ea728c | #fc9d9d | #a89696 |
| 3 | #fc4100 | #00215e | #ffc55a | #2c4e80 |
| 4 | #6f4a8e | #221f3b | #050505 | #ebebeb |
| 5 | #ba135d | #f4cca4 | #d99879 | #000000 |
| 6 | #1a2634 | #203e5f | #ffcc00 | #fee5b1 |
| 7 | #1a2849 | #505bda | #b063c5 | #ffaac3 |
| 8 | #ea047e | #ff6d28 | #d8b4f8 | #00f5ff |
| 9 | #e966a0 | #6554af | #9575de | #2b2730 |
| 10 | #125c13 | #3e7c17 | #d7c0ae | #e8e1d9 |

---

## Roteamento (`src/App.jsx` + `src/main.jsx`)

- `BrowserRouter` com `basename="/zweihander"` (necessário para GitHub Pages)
- Rotas registradas:

| Caminho | Componente | Layout |
|---|---|---|
| `/` | `Home` | `Default` (com MusicPlayer + TOC) |
| `/videos` | `Videos` | `Standalone` (apenas TOC) |
| `/bookmarks` | `Bookmarks` | `Standalone` |
| `/changelog` | `Changelog` | `Standalone` |
| `/profile` | `Profile` | Nenhum (layout próprio, **stub**) |
| `/*` | `NotFound` | `Standalone` |

- `/profile` está registrado no router mas **não aparece na navegação (TOC)**

---

## Layouts (`src/layouts/`)

### `Default` (`Default.jsx` + `Default.layout.css`)

- Grid CSS de 2 colunas: `minmax(260px, 27.5%)` (sidebar) + `minmax(0, 1fr)` (conteúdo)
- Sidebar esquerda: `MusicPlayer` + `TOC` em coluna com gap de `1rem`
- Área de conteúdo: largura máxima `900px`, altura fixa `462px`
- Responsivo: colapsa para 1 coluna em `max-width: 900px` (mas a classe CSS usada está incorreta — referencia `.layout` em vez de `main.default`)

### `Standalone` (`Standalone.jsx` + `Standalone.layout.css`)

- Mesma estrutura de grid do `Default`, mas sem o `MusicPlayer` na sidebar
- Sidebar esquerda: apenas `TOC`
- `TOC` no `Standalone` tem altura `462px` (mesmo que a área de conteúdo), enquanto no `Default` tem `240px`
- `overflow-y: auto` e `overflow-x: hidden` na área de conteúdo
- Responsivo: colapsa para 1 coluna em `max-width: 900px`

---

## Componentes

### `MusicPlayer` (`src/components/MusicPlayer.jsx` + `src/styles/MusicPlayer.css`)

Usa o hook `useMusicPlayer` para toda a lógica. UI:

- **Track info**: capa do álbum (`80x80px`, `border-radius: 1rem`) + nome da faixa + artista/álbum
- **Overflow marquee**: título e artista/álbum usam `useTextOverflow`; quando overflow, classe `is-overflowing` ativa animação CSS `marquee` (translação de `0%` a `-100%` em 5s, infinita, ativada no `:hover`)
- **Controles**: 3 botões (anterior, play/pause, próximo) com ícones SVG inline (Heroicons), sem biblioteca externa de ícones
- **Seek bar**: `<input type="range">` com estilo customizado via CSS pseudo-elements (`::-webkit-slider-runnable-track`, `::-moz-range-track`); progresso visual via CSS custom property `--progress` em `linear-gradient`
- **Tempo**: display `currentTime / totalDuration` abaixo da seek bar

Detalhes CSS não documentados:
- Volume inicial: `0.3` (30%) — definido via `useEffect` no hook
- Thumb do slider é **transparente** (sem ponto visível, apenas a track colorida indica posição)

### `Modal` (`src/components/Modal.jsx` + `src/styles/Modal.css`)

Não documentado tecnicamente nos logs internos:

- Renderizado via `React.createPortal` direto em `document.body` (evita problemas de z-index e overflow)
- **Fechar com Escape**: `useEffect` adiciona listener `keydown` quando `isOpen=true`, removido no cleanup
- **Fechar clicando fora**: click no overlay (`modal-overlay`) chama `onClose`; `e.stopPropagation()` no conteúdo evita propagação acidental
- Animações:
  - Overlay: `fadeIn` (opacity 0→1, 0.2s)
  - Conteúdo: `scaleIn` (scale 0.95→1 + opacity 0→1, 0.2s)
- Botão de fechar (X): ícone SVG inline, posicionado absoluto no canto superior direito, hover com `scale(1.1)`
- Aceita `className` como prop para customização por contexto (ex: `changelog-modal`)
- Responsivo: padding e tamanhos reduzidos em `max-width: 900px` e `max-width: 600px`

### `TOC` (`src/components/TOC.jsx` + `src/styles/TOC.css`)

- Navegação com `NavLink` do React Router — aplica classe `active` automaticamente na rota atual
- Estado ativo com fundo `rgba(255,255,255,0.12)` e borda `rgba(255,255,255,0.2)`
- Hover com transição suave `0.1s ease`
- Ícones SVG inline (Material Design Icons adaptados) — **sem dependência de biblioteca de ícones**
- 4 itens de navegação: Home, Vídeos, Bookmarks, Changelog
- `/profile` **não está na navegação** apesar de ter rota

### `MarkdownRenderer` (`src/components/MarkdownRenderer.jsx` + `src/styles/MarkdownRenderer.css`)

Componente central para renderização de Markdown. Detalhes técnicos não documentados:

**Tecnologia:**
- `ReactMarkdown` com plugins `remark-gfm` e `rehype-highlight`
- Tema de syntax highlight: `highlight.js/styles/gradient-dark.css` (importado via CSS)

**Customizações de componentes (`components` prop):**

| Tag | Comportamento especial |
|---|---|
| `h1`–`h6` | Classes `.md-h1` a `.md-h6` com tamanhos, pesos e bordas inferiores distintos |
| `p` | Detecta se o único filho é um `<img>` e renderiza como `<div>` em vez de `<p>` (evita HTML inválido) |
| `a` | Sempre abre em `target="_blank"` com `rel="noopener noreferrer"` |
| `code` | Distingue inline vs block via prop `inline` — estilos diferentes |
| `pre` | Substituído por wrapper customizado com header (nome da linguagem + botão copiar) |
| `input` | Sub-componente `MarkdownInput`: checkboxes GFM renderizados como `readOnly` |
| `img` | Renderiza com `max-width: 100%` centralizado |
| `table`, `th`, `td` | Estilos com borders, alternância de fundo em linhas pares/ímpares |

**Botão "copiar código":**
- Extrai texto do bloco de código navegando na árvore de children do React
- Suporta children string, array ou objeto aninhado
- Usa `navigator.clipboard.writeText` (pode falhar em HTTP sem HTTPS)
- Exibe símbolo `⧉`, hover com fundo leve

**CSS do MarkdownRenderer:**
- Cabeçalhos (`h1`–`h3`): uppercase, borda inferior `rgba(255,255,255,0.1)`, família IBM Plex Sans
- `h4`–`h6`: sem uppercase, sem borda
- Links: cor `#fafafa`, underline, hover com `opacity: 0.7`
- Blockquote: borda esquerda `4px solid rgba(255,255,255,0.8)`, itálico
- Tabelas: borders `rgba(255,255,255,0.2)`, fundo alternado, border-radius nos cantos
- Checkbox customizado: aparência removida (`appearance: none`), borda `rgba(255,255,255,0.5)`, checked com checkmark CSS puro via `::after`

---

## Hooks Utilitários (`src/utils/`)

### `useMusicPlayer` (`useMusicPlayer.jsx`)

Lógica completa do player de música. **Não documentado tecnicamente:**

- **Estado**: `trackIndex`, `isPlaying`, `currentTime` (string formatada), `totalDuration` (string formatada), `seekValue` (0–100), `progress` (0–100)
- **Refs**: `audioRef` (elemento `<audio>`), `seekSliderRef`, `trackTitleRef`, `trackAlbumRef`
- **`formatTime(seconds)`**: converte segundos em `m:ss`, retorna `"0:00"` para `NaN`
- **Atualização de progresso**: `setInterval` a cada 1000ms lê `audio.currentTime` e `audio.duration`
- **Auto-advance**: `ended` event listener no `<audio>` avança para a próxima faixa automaticamente
- **Troca de faixa**: usa `setTimeout(100ms)` antes de chamar `.play()` para dar tempo ao React re-renderizar o `src` do `<audio>`
- **Seek**: calcula `audio.currentTime = duration * (value / 100)` diretamente
- **Volume inicial**: `0.3` definido uma vez via `useEffect` sem deps (executa somente na montagem)
- **Overflow**: integrado com `useTextOverflow` para título e álbum

### `useTextOverflow` (`useTextOverflow.jsx`)

- Recebe array de `{ key, ref }` e opcionalmente `dependencies`
- Retorna objeto `{ [key]: boolean }` onde `true` = texto está com overflow
- Detecção: `ref.current.scrollWidth > ref.current.clientWidth`
- Re-executa em `window resize` (listener adicionado e removido corretamente)
- Segundo argumento `dependencies` passado ao `useEffect` (permite re-checar quando dados mudam)

---

## Dados (`src/data/`)

### Músicas (`tracks.js`)

5 faixas na playlist, todas hospedadas externamente em [file.garden](https://filegarden.com/):

| Faixa | Artista | Álbum | Formato |
|---|---|---|---|
| Amém, Amém (Deekapz Remix) | BK & Deekapz | PRODUTO DO AMBIENTE | `.m4a` |
| Não Adianta Chorar | BK & JXNV$ | Diamantes, Lágrimas e Rostos para esquecer | `.mp3` |
| ABAIXO DO RADAR | Febem, CESRV & Smile | ABAIXO DO RADAR | `.mp3` |
| NIGHTS LIKE THIS | The Kid LAROI | THE FIRST TIME | `.mp3` |
| Like Him | Tyler, The Creator | CHROMAKOPIA | `.m4a` |

Capas importadas localmente de `src/assets/images/`.

### Vídeos (`videos.js`)

9 vídeos importados localmente de `src/assets/videos/`, com thumbnails em `src/assets/videos/thumbnails/`:

| Título | Data | Arquivo |
|---|---|---|
| midrangemaster 5.0 | 26/02/2026 | `26-02-2026-1.mp4` |
| midrangemaster 4.0 | 23/02/2026 | `23-02-2026-1.mp4` |
| hustle | 23/02/2026 | `23-02-2026-2.mp4` |
| midrangemaster 3.0 | 20/02/2026 | `20-02-2026-1.mp4` |
| midrangemaster 2.0 | 09/02/2026 | `09-02-2026-1.mp4` |
| choradinha | 01/12/2025 | `01-12-2025-1.mp4` |
| pump fake | 03/11/2025 | `03-11-2025-1.mp4` |
| tava quente esse dia | 13/10/2025 | `13-10-2025-2.mp4` |
| midrangemaster 1.0 | 13/10/2025 | `13-10-2025-1.mp4` |

### Changelog (`data/changelog/`)

- `index.js`: exporta array `logs` com 8 entradas (incluindo o "lista de afazeres" fixado)
- Cada entrada: `{ title, version, date, description, content }` onde `content` é importado via `?raw` (string Markdown)
- Arquivos `.md`: `v0.1.1.md`, `v0.1.2.md`, `v0.1.3.md`, `v0.1.4.md`, `v0.1.5.md`, `v0.1.6.md`, `v1.0.0.md`, `todo.md`

---

## Páginas (`src/pages/`)

### `Home.jsx`

- Layout: `Default` (com MusicPlayer + TOC)
- Texto de boas-vindas com link para `/videos`
- Hint para pressionar F5 (re-randomiza o tema)
- Sem conteúdo funcional além da apresentação

### `Videos.jsx`

- Layout: `Standalone`
- Grid responsivo: 3 colunas → 2 colunas (`max-width: 900px`) → 1 coluna (`max-width: 600px`)
- Cards com thumbnail `aspect-ratio: 16/9`, título uppercase, data
- Clique no card abre `Modal` com `<video>` em `autoPlay + loop + muted`
- Informações do vídeo no modal com `border-top` separador

### `Bookmarks.jsx`

- Layout: `Standalone`
- Atualmente contém apenas 1 categoria: **Créditos**
- 4 créditos linkados externamente:
  - [glass ui](https://ui.glass/generator/) — gerador de glassmorphism
  - [adilene's music player](https://codepen.io/jinsouls/pen/WNYRogj) — código base do player
  - [gradienty](https://gradienty.codes/mesh-gradients) — combinações de cores dos temas
  - [file garden](https://filegarden.com/) — hospedagem das músicas
- Classes CSS `bookmarks-zweihander-topic` e `bookmarks-inspo-topic` existem no CSS mas **não são usadas** na página atual (preparadas para futuras categorias)

### `Changelog.jsx`

- Layout: `Standalone`
- Lista todos os logs de `data/changelog/index.js`
- Detecta overflow no título de cada log via `useTextOverflow` com refs individuais
- Clique em qualquer log abre `Modal` com `MarkdownRenderer`
- Modal tem header com título (uppercase), versão (itálico) e data
- Modal content tem `min-height: 462px; max-height: 462px; overflow-y: auto`

### `Profile.jsx`

- **Página stub** — contém apenas placeholders `"a"`, `"b"`, `"c"`
- Layout próprio: grid `2fr + 1fr` (colunas) e `35% + auto` (linhas), altura `462px`
- 3 seções: `profile-top-left`, `profile-top-right`, `profile-main`
- **Não está na navegação (TOC)**

### `NotFound.jsx`

- Layout: `Standalone`
- Mensagem simples: "Ops... Esta página talvez não exista."
- Capturada pela rota `/*` no App

---

## Arquivos de Documentação/Planejamento Commitados

### `markdown-react.md`

- Arquivo de planejamento da implementação do sistema de Markdown
- Commitado no repositório junto com o código final
- Contém plano de 7 etapas: estrutura de arquivos, dependências, sistema de carregamento, componente, integração com Changelog, estilos e links úteis

---

## Problemas Técnicos Identificados na Análise

1. **`MusicPlayer.jsx` — atributos HTML inválidos em JSX**: propriedades como `fill-rule` (deveria ser `fillRule`), `clip-rule` (`clipRule`) e `class` (`className`) no SVG do botão pause estão incorretas no código JSX, mas funcionam porque o React os passa ao DOM como atributos desconhecidos (sem erro visível).

2. **`Default.layout.css` — media query com seletor errado**: a regra `@media (max-width: 900px)` referencia `.layout` e `.layout-main` em vez de `main.default` e `.default-main`, tornando o layout responsivo não funcional.

3. **`react-syntax-highlighter`** está nas dependências mas não é usado no código (o highlight é feito via `rehype-highlight` + `highlight.js`).

4. **`useTextOverflow` no Changelog**: `titleRefs` é criado via `useState(() => logs.map(() => ({ current: null })))` — array de refs inicializado uma vez. As refs são atribuídas via callback `ref={(el) => { titleRefs[index].current = el; }}`. Funcional, mas o array de overflowRefs é recriado a cada render (objeto novo), o que pode causar re-execução desnecessária do hook.

5. **Botão copiar código**: `navigator.clipboard` requer contexto seguro (HTTPS). Em `http://` o botão silenciosamente não funciona.

6. **Profile page**: está registrada no router (`/profile`) mas não tem link na TOC e o conteúdo é todo placeholder.

