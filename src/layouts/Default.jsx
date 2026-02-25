import MusicPlayer from "../components/MusicPlayer";
import TOC from "../components/TOC";
import "../styles/Default.css";

function Default({ children }) {
  return (
    <main className="default">
      <section className="default-left">
        <MusicPlayer />
        <TOC />
      </section>
      <section className="default-main">
        <div className="content">{children}</div>
      </section>
    </main>
  );
}

export default Default;
