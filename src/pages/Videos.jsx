import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Standalone from "../layouts/Standalone";
import { videos } from "../data/videos";
import "../styles/Videos.css";

function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setSelectedVideo(null);
      }
    };

    if (selectedVideo !== null) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [selectedVideo]);

  const openModal = (index) => {
    setSelectedVideo(index);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  return (
    <>
      <Standalone>
        <div className="video-grid">
          {videos.map((video, index) => (
            <div key={index} className="video-card" onClick={() => openModal(index)}>
              <img 
                src={video.poster} 
                alt={video.title || `Vídeo ${index + 1}`}
                className="video-thumbnail"
              />
              <div className="video-info">
                <h3 className="video-title">{video.title || `Vídeo ${index + 1}`}</h3>
                <span className="video-date">{video.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Standalone>

      {selectedVideo !== null && createPortal(
        <div className="video-modal-overlay" onClick={closeModal}>
          <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="video-modal-close" onClick={closeModal}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <video className="video-modal-player" controls autoPlay loop>
              <source src={videos[selectedVideo].video} type="video/mp4" />
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default Videos;
