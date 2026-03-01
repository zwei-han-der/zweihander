import TOC from "../components/TOC";
import "../styles/layout.Standalone.css";

function Standalone({ children }) {
  return (
    <main className="standalone">
      <section className="standalone-left">
        <TOC />
      </section>
      <section className="standalone-main">
        <div className="content">{children}</div>
      </section>
    </main>
  );
}

export default Standalone;
