# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

---

## [1.0.0] - 28/02/2026

**Primeira versão estável.**

### Adicionado

#### Suporte a Markdown
- Adicionado suporte a `checkbox` com `remark-gfm`
- Adicionado suporte a `table` com `remark-gfm`
- Adicionado suporte a `strikethrough` com `remark-gfm`
- Adicionado suporte a `img`
- Adicionado suporte a Syntax Highlight com `rehype-highlight`

#### Changelog
- Adicionado modal que renderiza Markdown

#### Player de Música
- Adicionado botões básicos: Voltar, pular e pausar/rodar faixa
- Adicionada playlist personalizada
- Músicas adicionadas:
  - BK & Deekapz - Amém, Amém (Deekapz Remix)
  - BK & JXNV$ - Não Adianta Chorar
  - Febem, CESRV & Smile - ABAIXO DO RADAR
  - The Kid LAROI - NIGHTS LIKE THIS
  - Tyler, The Creator - Like Him

### Alterado

#### Suporte a Markdown
- Revisado estilo do `h1`
- Revisado estilo do `h2`
- Revisado estilo do `h3`
- Revisado estilo do `p`
- Revisado estilo do `ul`
- Revisado estilo do `ol`
- Revisado estilo do `li`
- Revisado estilo do `a`
- Revisado estilo do `blockquote`
- Revisado estilo do `code inline`
- Revisado estilo do `code block`
- Revisado estilo do `pre`
- Revisado estilo do `checkbox`
- Revisado estilo do `table`
- Revisado estilo do `strikethrough`

#### Player de Música
- Revisado estilo para igualar com o design de glassmorphism

---

## [0.4.1] - 27/02/2026

**Changelog agora com modal.**

### Adicionado
- Modal no changelog para renderizar o conteúdo de cada log
- Iniciada refatoração do changelog

---

## [0.4.0] - 25/02/2026

**Adicionada a aba de bookmarks.**

### Adicionado
- Aba de Bookmarks

### Planejado
- Adicionar mais categorias de bookmarks

---

## [0.3.1] - 25/02/2026

**Hook customizado `useTextOverflow` extraído para utilitário reutilizável.**

### Adicionado
- Hook customizado `useTextOverflow` para animação de marquee em textos com overflow
- Animação de marquee nos títulos dos logs do changelog

### Alterado
- Animação de marquee no overflow do texto do player de música migrada para o novo hook utilitário

---

## [0.3.0] - 25/02/2026

**Changelog adicionado ao site.**

### Adicionado
- Aba de Changelog com listagem de todas as atualizações do site

### Planejado
- Implementar suporte a markdown para qualquer conteúdo ✅
- Adicionar algo como diário / blog
- Adicionar aba de bookmarks ✅

---

## [0.2.0] - 24/02/2026

**Aba de vídeos pronta.**

### Adicionado
- Aba de Vídeos para armazenar jogadas de basquete e outros momentos
- Grid responsivo de vídeos
- Modal com player fullscreen
- Thumbnails customizadas
- Suporte a autoplay e loop

---

## [0.1.0] - 23/02/2026

**Primeira feature do site adicionada: player de música completamente funcional.**

### Adicionado
- Player de música com playlist personalizada
- Play/Pause
- Próxima e anterior faixa
- Seek bar interativa
- Display de tempo atual/total
- Capa do álbum animada
