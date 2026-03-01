import { useState } from "react";
import Standalone from "../layouts/Standalone";
import Modal from "../components/Modal";
import { videos } from "../data/videos";
import "../styles/pages.Videos.css";

function Videos() {
  const [selectedVideo, setSelectedVideo] = useState(null);

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
            <div
              key={index}
              className="video-card"
              onClick={() => openModal(index)}
            >
              <img
                src={video.poster}
                alt={video.title || `Vídeo ${index + 1}`}
                className="video-thumbnail"
              />
              <div className="video-info">
                <h3 className="video-title">
                  {video.title || `Vídeo ${index + 1}`}
                </h3>
                <span className="video-date">{video.date}</span>
              </div>
            </div>
          ))}
        </div>
      </Standalone>

      <Modal isOpen={selectedVideo !== null} onClose={closeModal}>
        {selectedVideo !== null && (
          <>
            <video className="video-player" controls autoPlay loop muted>
              <source src={videos[selectedVideo].video} type="video/mp4" />
              Seu navegador não suporta o elemento de vídeo.
            </video>
            <div className="video-modal-info">
              <h3 className="video-title">{videos[selectedVideo].title}</h3>
              <span className="video-date">{videos[selectedVideo].date}</span>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}

export default Videos;
