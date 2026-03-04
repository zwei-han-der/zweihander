// https://www.taqui.space/computacao/dados/texto-criptografado emanuelly TripleDES

import demonmask from "../../assets/images/blog-covers/dayan-demon-mask.avif";
import bath from "../../assets/images/blog-covers/dayan-bath.avif";

const blogContentLoaders = {
  U2FsdGVkX18BN4Sch4PRgb1obNas3BsT: () => import("./todo.md?raw"),
  U2FsdGVkX19V3tFiu7vvqN8JEZUHNRGbQLZGysuFl0dPxzbulAEPTQ: () => import("./markdown.md?raw"),
};

const contentCache = new Map();

export const posts = [
  {
    id: "U2FsdGVkX18BN4Sch4PRgb1obNas3BsT",
    title: "lista de afazeres",
    version: "fixado",
    date: "27/02/2026",
    description:
      "Aqui ficará arquivado tudo o que já foi feito, o que está sendo feito e o que será feito no site.",
    cover: demonmask,
  },
  {
    id: "U2FsdGVkX19V3tFiu7vvqN8JEZUHNRGbQLZGysuFl0dPxzbulAEPTQ",
    title: "markdown preview",
    version: "",
    date: "27/02/2026",
    description: "Visualização do Markdown e HTML.",
    cover: bath,
  },
];

export async function loadBlogContent(id) {
  if (contentCache.has(id)) {
    return contentCache.get(id);
  }

  const loader = blogContentLoaders[id];
  if (!loader) {
    return "";
  }

  const module = await loader();
  const content = module.default;
  contentCache.set(id, content);
  return content;
}
