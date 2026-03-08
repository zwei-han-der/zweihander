import Standalone from "../layouts/Standalone";
import LinkPreview from "../components/LinkPreview";
import "../styles/pages.Bookmarks.css";

function Bookmarks() {
  return (
    <Standalone>
      <div className="bookmarks-content">
        <div className="bookmarks-topic">
          <div className="bookmarks-topic-header">
            <h2>Créditos</h2>
          </div>
          <ul>
            <li>
              <h3>
                <LinkPreview href="https://ui.glass/generator/">
                  <a
                    href="https://ui.glass/generator/"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    glass ui
                  </a>
                </LinkPreview>
                :
              </h3>
              <span>
                Usado para criar o estilo de vidro base dos containers.
              </span>
            </li>
            <li>
              <h3>
                <LinkPreview href="https://codepen.io/jinsouls/pen/WNYRogj">
                  <a
                    href="https://codepen.io/jinsouls/pen/WNYRogj"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    adilene's music player
                  </a>
                </LinkPreview>
                :
              </h3>
              <span>Código base para o player de música da home.</span>
            </li>

            <li>
              <h3>
                <LinkPreview href="https://gradienty.codes/mesh-gradients">
                  <a
                    href="https://gradienty.codes/mesh-gradients"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    gradienty
                  </a>
                </LinkPreview>
                :
              </h3>
              <span>
                De onde eu tirei as combinações de cores do plano de fundo.
              </span>
            </li>
            <li>
              <h3>
                <LinkPreview href="https://filegarden.com/">
                  <a
                    href="https://filegarden.com/"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    file garden
                  </a>
                </LinkPreview>
                :
              </h3>
              <span>Onde eu armazeno as músicas que tocam no player.</span>
            </li>
            <li>
              <h3>
                <LinkPreview href="https://detail.design/detail/rich-previews-for-external-urls">
                  <a
                    href="https://detail.design/detail/rich-previews-for-external-urls"
                    rel="noreferrer noopener"
                    target="_blank"
                  >
                    Detail
                  </a>
                </LinkPreview>
                :
              </h3>
              <span>
                De onde eu tirei a ideia de adicionar os previews para os links.
              </span>
            </li>
          </ul>
        </div>
        <div className="bookmarks-topic">
          <div className="bookmarks-topic-header">
            <h2>Links úteis</h2>
          </div>
          <div className="bookmarks-subtopic">
            <div className="bookmarks-subtopic-header">
              <h2>Inspiração</h2>
            </div>
            <ul>
              <li>
                <h3>
                  <LinkPreview href="https://deadsimplesites.com/">
                    <a
                      href="https://deadsimplesites.com/"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Dead Simple Sites
                    </a>
                  </LinkPreview>
                  :
                </h3>
                <span>Inspiração para sites minimalistas.</span>
              </li>
              <li>
                <h3>
                  <LinkPreview href="https://detail.design/">
                    <a
                      href="https://detail.design/"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Detail
                    </a>
                  </LinkPreview>
                  :
                </h3>
                <span>
                  Inspiração sobre microinterações para aperfeiçoamento da
                  experiência do usuário
                </span>
              </li>
            </ul>
            <div className="bookmarks-subtopic-header">
              <h2>Ferramentas</h2>
            </div>
            <ul>
              <li>
                <h3>
                  <LinkPreview href="https://delphi.tools/">
                    <a
                      href="https://delphi.tools/"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      Delphi Tools
                    </a>
                  </LinkPreview>
                  :
                </h3>
                <span>
                  Uma coleção de ferramentas pequenas, de baixo custo e fácil
                  utilização.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Standalone>
  );
}

export default Bookmarks;
