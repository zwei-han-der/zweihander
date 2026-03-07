import { Link } from "react-router-dom";
import Default from "../layouts/Default";
import "../styles/pages.Home.css";

// import icon from "../assets/images/zweihander-icon.jpg"

function Home() {
  return (
    <Default>
      <div className="home-content">
        {/* <div className="home-header">
          <div className="home-title">
            <h2>Gustavo "ZWEIHANDER" Ferreira</h2>
          </div>
          <div className="home-icon">
            <img src={icon} alt="Zweihander icon" />
          </div>
        </div> */}
        <p className="home-p">
          Bem vindo a minha página! Está deserta ainda, mas de uma chance para as músicas que eu adicionei.
        </p>
        <p className="home-p">
          Ou veja minhas incríveis jogadas na aba de{" "}
          <Link to="/videos">vídeos</Link>.
        </p>
        <p>Tente também dar F5 na página 😉</p>
      </div>
    </Default>
  );
}

export default Home;
