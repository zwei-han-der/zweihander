import Standalone from "../layouts/Standalone";
import "../styles/Bookmarks.css";

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
                <a href="https://ui.glass/generator/" rel="noreferrer noopener">
                  glass ui
                </a>
                :
              </h3>
              <span>
                Usado para criar o estilo de vidro base dos containeres.
              </span>
            </li>
            <li>
              <h3>
                <a
                  href="https://codepen.io/jinsouls/pen/WNYRogj"
                  rel="noreferrer noopener"
                >
                  adilene's music player
                </a>
                :
              </h3>
              <span>Código base para o player de música da home.</span>
            </li>

            <li>
              <h3>
                <a
                  href="https://gradienty.codes/mesh-gradients"
                  rel="noreferrer noopener"
                >
                  gradienty
                </a>
                :
              </h3>
              <span>
                De onde eu tirei as combinações de cores do plano de fundo.
              </span>
            </li>
            <li>
              <h3>
                <a href="https://filegarden.com/" rel="noreferrer noopener">
                  file garden
                </a>
                :
              </h3>
              <span>Onde eu armazeno as músicas que tocam no player.</span>
            </li>
          </ul>
        </div>
      </div>
    </Standalone>
  );
}

export default Bookmarks;
