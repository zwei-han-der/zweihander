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
        <div className="bookmarks-topic">
          <div className="bookmarks-topic-header">
            <h2>Inspiração</h2>
          </div>
          <div className="bookmarks-topic-content">
            {/* <div className="bookmarks-zweihander-topic"></div> */}
            <div className="bookmarks-inspo-topic">
              <a href="https://rice.place/" target="_blank" rel="noreferrer noopener">
                <img src="https://rice.place/button/paperice.gif" />
              </a>
              <a href="https://adilene.net/" target="_blank" rel="noreferrer noopener">
                <img src="https://adilene.net/images/sitebutton.gif" />
              </a>
              <a href="https://joo.sh" target="_blank" rel="noreferrer noopener">
                <img src="https://files.joo.sh/img/buttons/jooshRice.gif" />
              </a>
              <a href="https://nyscyra.net/" target="_blank" rel="noreferrer noopener">
                <img src="https://nyscyra.net/img/button.png" />
              </a>
              <a href="https://medjed.nekoweb.org/" target="_blank" rel="noreferrer noopener">
                <img
                  src="https://medjed.nekoweb.org/assets/images/button.jpg"
                  alt="Medjed"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </Standalone>
  );
}

export default Bookmarks;
