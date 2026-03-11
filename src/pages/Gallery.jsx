import { Suspense, lazy, useState } from "react";
import { useNavigate } from "react-router-dom";
import { InfiniteLoader } from "../components/InfiniteLoader";
import { galleryMedia } from "../data/gallery";
import "../styles/pages.Gallery.css";

const InfiniteCanvas = lazy(() => import("../components/InfiniteCanvas"));

function Gallery() {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const hasMedia = galleryMedia.length > 0;

  return (
    <div className="gallery-page">
      {hasMedia && <InfiniteLoader progress={progress} />}
      <Suspense fallback={null}>
        <InfiniteCanvas
          media={galleryMedia}
          onTextureProgress={setProgress}
          showControls
        />
      </Suspense>
      <button className="gallery-back" onClick={() => navigate(-1)}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>Voltar</span>
      </button>
      {!hasMedia && (
        <div className="gallery-empty">
          <span>Nenhuma imagem encontrada.</span>
          <span>
            Adicione imagens em <code>src/assets/images/gallery/</code>
          </span>
        </div>
      )}
    </div>
  );
}

export default Gallery;