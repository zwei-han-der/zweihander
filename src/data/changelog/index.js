// https://www.taqui.space/computacao/dados/texto-criptografado emanuelly TripleDES

const changelogContentLoaders = {
  U2FsdGVkX1N0fK6q8P1wY3rLs9TzMxQ: () => import("./v1.5.0.md?raw"),
  U2FsdGVkX1AqFvgP2nK7mLr8sQd9JtWy: () => import("./v1.4.1.md?raw"),
  U2FsdGVkX18xC8xw3lQ6W7vKp2mN5dRt: () => import("./v1.4.0.md?raw"),
  U2FsdGVkX18rsRHeyQc42GEsOhDW5qHf: () => import("./v1.3.0.md?raw"),
  U2FsdGVkX19LcSnwbIxtZttdwANOphDY: () => import("./v1.2.1.md?raw"),
  U2FsdGVkX19ejcVgTMZkfDSTe9B8JPeX: () => import("./v1.2.0.md?raw"),
  U2FsdGVkX19UopSScWDJRvxRzh6ANhVP: () => import("./v1.1.0.md?raw"),
  U2FsdGVkX19tzGKO0yNYQPBK1tcNbrMc: () => import("./v1.0.1.md?raw"),
  U2FsdGVkX190LnCf80wWGpZjhZeb2Um5: () => import("./v1.0.0.md?raw"),
  U2FsdGVkX18im7TGDHSJXjcy4hvfLGIx: () => import("./v0.1.6.md?raw"),
  U2FsdGVkX18mm6OH9J4yRQSPr3ngvGGq: () => import("./v0.1.5.md?raw"),
  U2FsdGVkX198i7SJoWK9NIZA3hq9RrIv: () => import("./v0.1.4.md?raw"),
  U2FsdGVkX19amAXgGFyj5fx6Etddr7sA: () => import("./v0.1.3.md?raw"),
  U2FsdGVkX183LL5sNWZbsp2Pife6TJR9: () => import("./v0.1.2.md?raw"),
  U2FsdGVkX18D8BTytUeooMTdRrZgvC4c: () => import("./v0.1.1.md?raw"),
};

const contentCache = new Map();

export const logs = [
  {
    id: "U2FsdGVkX1N0fK6q8P1wY3rLs9TzMxQ",
    title: "to infinity and beyond",
    version: "changelog #15 - v1.5.0",
    date: "11/03/2026",
    description:
      "Galeria em canvas infinito, expansão do blog e atualização dos links.",
  },
  {
    id: "U2FsdGVkX1AqFvgP2nK7mLr8sQd9JtWy",
    title: "ícones dinâmicos",
    version: "changelog #14 - v1.4.1",
    date: "07/03/2026",
    description:
      "Favicon agora acompanha o tema ativo e os textos dos changelogs foram padronizados.",
  },
  {
    id: "U2FsdGVkX18xC8xw3lQ6W7vKp2mN5dRt",
    title: "o link de milhões",
    version: "changelog #13 - v1.4.0",
    date: "07/03/2026",
    description:
      "Introduzido o sistema de preview de links.",
  },
  {
    id: "U2FsdGVkX18rsRHeyQc42GEsOhDW5qHf",
    title: "HTMLification",
    version: "changelog #12 - v1.3.0",
    date: "04/03/2026",
    description:
      "Adicionado parser HTML ao MarkdownRenderer.",
  },
  {
    id: "U2FsdGVkX19LcSnwbIxtZttdwANOphDY",
    title: "unificação",
    version: "changelog #11 - v1.2.1",
    date: "03/03/2026",
    description:
      "Centralização dos estilos do modal, remoção de acoplamento no Blog e ajuste de responsividade em telas pequenas.",
  },
  {
    id: "U2FsdGVkX19ejcVgTMZkfDSTe9B8JPeX",
    title: "carregando título...",
    version: "changelog #10 - v1.2.0",
    date: "03/03/2026",
    description:
      "Melhorias de performance com route-based code splitting e lazy loading.",
  },
  {
    id: "U2FsdGVkX19UopSScWDJRvxRzh6ANhVP",
    title: "responsividade é o inferno na terra",
    version: "changelog #9 - v1.1.0",
    date: "02/03/2026",
    description:
      "Responsividade revisada de ponta a ponta, correções de overflow e melhoria no comportamento do modal do changelog..",
  },
  {
    id: "U2FsdGVkX19tzGKO0yNYQPBK1tcNbrMc",
    title: "Alguns ajustes",
    version: "changelog #8 - v1.0.1",
    date: "01/03/2026",
    description:
      "Melhorias na acessibilidade, correções de bugs e otimizações gerais do site.",
  },
  {
    id: "U2FsdGVkX190LnCf80wWGpZjhZeb2Um5",
    title: "Zweihander v1.0.0",
    version: "changelog #7 - v1.0.0",
    date: "28/02/2026",
    description: "Primeira versão estável do projeto.",
  },
  {
    id: "U2FsdGVkX18im7TGDHSJXjcy4hvfLGIx",
    title: "refazendo changelog",
    version: "changelog #6 - v0.1.6",
    date: "27/02/2026",
    description: "Iniciada a refatoração do changelog com abertura de conteúdo em modal e consolidação de estilos Markdown.",
  },
  {
    id: "U2FsdGVkX18mm6OH9J4yRQSPr3ngvGGq",
    title: "boookkkkmmmmaaarrrkkkkssss",
    version: "changelog #5 - v0.1.5",
    date: "25/02/2026",
    description:
      "Adicionada a aba de bookmarks.",
  },
  {
    id: "U2FsdGVkX198i7SJoWK9NIZA3hq9RrIv",
    title: "marquee é legal demais",
    version: "changelog #4 - v0.1.4",
    date: "25/02/2026",
    description:
      "Gostei tanto que mudei a animação de marquee no overflow do texto para um utilitário próprio.",
  },
  {
    id: "U2FsdGVkX19amAXgGFyj5fx6Etddr7sA",
    title: "anotações são a base da recordação",
    version: "changelog #3 - v0.1.3",
    date: "25/02/2026",
    description:
      "Changelog adicionado, pronto para receber atualizações do site.",
  },
  {
    id: "U2FsdGVkX183LL5sNWZbsp2Pife6TJR9",
    title: "recordar é viver",
    version: "changelog #2 - v0.1.2",
    date: "24/02/2026",
    description:
      "Aba de vídeos pronta, feita para armazenar, principalmente, minhas jogadas no basquete.",
  },
  {
    id: "U2FsdGVkX18D8BTytUeooMTdRrZgvC4c",
    title: "música é vida",
    version: "changelog #1 - v0.1.0",
    date: "23/02/2026",
    description:
      "Primeira feature do site adicionada, player de música completamente funcional.",
  },
];

export async function loadLogContent(id) {
  if (contentCache.has(id)) {
    return contentCache.get(id);
  }

  const loader = changelogContentLoaders[id];
  if (!loader) {
    return "";
  }

  const module = await loader();
  const content = module.default;
  contentCache.set(id, content);
  return content;
}
