const changelogContentLoaders = {
  todo: () => import("./todo.md?raw"),
  v110: () => import("./v1.1.0.md?raw"),
  v101: () => import("./v1.0.1.md?raw"),
  v100: () => import("./v1.0.0.md?raw"),
  v016: () => import("./v0.1.6.md?raw"),
  v015: () => import("./v0.1.5.md?raw"),
  v014: () => import("./v0.1.4.md?raw"),
  v013: () => import("./v0.1.3.md?raw"),
  v012: () => import("./v0.1.2.md?raw"),
  v011: () => import("./v0.1.1.md?raw"),
};

const contentCache = new Map();

export const logs = [
  {
    id: "todo",
    title: "lista de afazeres",
    version: "fixado",
    date: "27/02/2026",
    description:
      "Aqui ficará arquivado tudo o que já foi feito, o que está sendo feito e o que será feito no site.",
  },
  {
    id: "v110",
    title: "responsividade é o inferno na terra",
    version: "changelog #9 - v1.1.0",
    date: "02/03/2026",
    description:
      "Responsividade completamente revisada, correções de overflow e melhoria do comportamento do modal do changelog.",
  },
  {
    id: "v101",
    title: "Alguns ajustes",
    version: "changelog #8 - v1.0.1",
    date: "01/03/2026",
    description:
      "Melhorias na acessibilidade, correções de bugs e otimizações gerais do site.",
  },
  {
    id: "v100",
    title: "Zweihander v1.0.0",
    version: "changelog #7 - v1.0.0",
    date: "28/02/2026",
    description: "Primeira versão estável.",
  },
  {
    id: "v016",
    title: "refazendo changelog",
    version: "changelog #6 - v0.4.1",
    date: "27/02/2026",
    description: "Changelog agora com modal.",
  },
  {
    id: "v015",
    title: "boookkkkmmmmaaarrrkkkkssss",
    version: "changelog #5 - v0.4.0",
    date: "25/02/2026",
    description:
      "Adicionada a aba de bookmarks. Ainda não está 100% completa, mas tá lá.",
  },
  {
    id: "v014",
    title: "marquee é legal demais",
    version: "changelog #4 - v0.3.1",
    date: "25/02/2026",
    description:
      "Gostei tanto que mudei a animação de marquee no overflow do texto para um utilitário próprio.",
  },
  {
    id: "v013",
    title: "anotações são a base da recordação",
    version: "changelog #3 - v0.3.0",
    date: "25/02/2026",
    description:
      "Changelog adicionado, pronto para receber atualizações do site.",
  },
  {
    id: "v012",
    title: "recordar é viver",
    version: "changelog #2 - v0.2.0",
    date: "24/02/2026",
    description:
      "Aba de vídeos pronta, feita para armazenar, principalmente, minhas jogadas no basquete.",
  },
  {
    id: "v011",
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
