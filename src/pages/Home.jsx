import { Link } from "react-router-dom";
import Default from "../layouts/Default";
import "../styles/Home.css";

function Home() {
  return (
    <Default>
      <div className="main-content">
        <p className="p-content">
          Olá, eu sou o Gustavo e essa é a minha página principal. Ainda está
          deserta, mas tente interagir com o player de música ali no canto
          superior esquerdo.
        </p>
        <p className="p-content">Ou ver minhas incríveis jogadas na aba de <Link to="/videos">vídeos</Link>.</p>
      </div>
    </Default>
  );
}

export default Home;
