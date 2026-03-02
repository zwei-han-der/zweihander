import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Standalone from "../layouts/Standalone";
import Modal from "../components/Modal";
import useTextOverflow from "../utils/useTextOverflow";
import { logs, loadLogContent } from "../data/changelog/index";
import "../styles/pages.Changelog.css";

const MarkdownRenderer = lazy(() => import("../components/MarkdownRenderer"));

function Changelog() {
  const { logId } = useParams();
  const navigate = useNavigate();

  const [selectedContent, setSelectedContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [titleRefs] = useState(() => logs.map(() => ({ current: null })));
  const modalTitleRef = useRef(null);

  const selectedLog = logId ? logs.findIndex((log) => log.id === logId) : null;
  const isModalOpen = selectedLog !== null && selectedLog !== -1;

  const overflowRefs = useMemo(
    () => [
      ...logs.map((_, index) => ({
        key: `title-${index}`,
        ref: titleRefs[index],
      })),
      { key: "modal-title", ref: modalTitleRef },
    ],
    [titleRefs, modalTitleRef],
  );

  const overflowStates = useTextOverflow(overflowRefs, [selectedLog]);

  useEffect(() => {
    let isMounted = true;

    if (!isModalOpen) {
      setSelectedContent("");
      setIsLoadingContent(false);
      return () => {
        isMounted = false;
      };
    }

    const loadContent = async () => {
      const currentLog = logs[selectedLog];
      setIsLoadingContent(true);

      try {
        const content = await loadLogContent(currentLog.id);

        if (!isMounted) {
          return;
        }

        setSelectedContent(content);
      } catch {
        if (!isMounted) {
          return;
        }

        setSelectedContent("Não foi possível carregar este changelog.");
      } finally {
        if (isMounted) {
          setIsLoadingContent(false);
        }
      }
    };

    loadContent();

    return () => {
      isMounted = false;
    };
  }, [selectedLog, isModalOpen]);

  const handleLogClick = (index) => {
    navigate(`/changelog/${logs[index].id}`);
  };

  const handleCloseModal = () => {
    navigate("/changelog");
  };

  return (
    <>
      <Standalone>
        <div className="posts">
          {logs.map((log, index) => {
            const isOverflowing = overflowStates[`title-${index}`];

            return (
              <button
                className="post"
                key={index}
                onClick={() => handleLogClick(index)}
              >
                <div className="header">
                  <div
                    className={`header-title ${
                      isOverflowing ? "is-overflowing" : ""
                    }`}
                    ref={(el) => {
                      titleRefs[index].current = el;
                    }}
                  >
                    <div className="header-title-content">
                      <h2>{log.title}</h2>
                      <span className="header-version">{log.version}</span>
                    </div>
                  </div>
                  <span className="header-date">
                    <p>{log.date}</p>
                  </span>
                </div>
                <div className="description">
                  <p>{log.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Standalone>

      <Modal
        isOpen={isModalOpen}
        onCloseNavigate={handleCloseModal}
        className="changelog-modal"
      >
        {isModalOpen && (
          <div className="changelog-modal-content">
            <div className="changelog-modal-header">
              <div
                className={`modal-header-title ${
                  overflowStates["modal-title"] ? "is-overflowing" : ""
                }`}
                ref={modalTitleRef}
              >
                <div className="modal-header-title-content">
                  <h2>{logs[selectedLog].title}</h2>
                  <span className="modal-header-version">
                    {logs[selectedLog].version}
                  </span>
                </div>
              </div>
              <span className="modal-header-date">
                {logs[selectedLog].date}
              </span>
            </div>

            {isLoadingContent ? (
              <p>Carregando changelog...</p>
            ) : (
              <Suspense fallback={<p>Carregando renderização...</p>}>
                <MarkdownRenderer
                  content={selectedContent}
                  className="markdown-modal-content"
                />
              </Suspense>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}

export default Changelog;
