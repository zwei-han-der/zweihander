import { useState, useMemo } from "react";
import Standalone from "../layouts/Standalone";
import Modal from "../components/Modal";
import MarkdownRenderer from "../components/MarkdownRenderer";
import useTextOverflow from "../utils/useTextOverflow";
import { logs } from "../data/changelog/index";
import "../styles/pages.Changelog.css";

function Changelog() {
  const [selectedLog, setSelectedLog] = useState(null);
  const [titleRefs] = useState(() => logs.map(() => ({ current: null })));

  const overflowRefs = useMemo(
    () =>
      logs.map((_, index) => ({
        key: `title-${index}`,
        ref: titleRefs[index],
      })),
    [titleRefs]
  );

  const overflowStates = useTextOverflow(overflowRefs, [logs]);

  const openModal = (index) => {
    setSelectedLog(index);
  };

  const closeModal = () => {
    setSelectedLog(null);
  };

  return (
    <>
      <Standalone>
        <div className="posts">
          {logs.map((log, index) => {
            const isOverflowing = overflowStates[`title-${index}`];

            return (
              <div
                className="post"
                key={index}
                onClick={() => openModal(index)}
                style={{ cursor: "pointer" }}
              >
                <div className="header">
                  <span
                    className={`header-title ${
                      isOverflowing ? "is-overflowing" : ""
                    }`}
                    ref={(el) => {
                      titleRefs[index].current = el;
                    }}
                  >
                    <h2>{log.title}</h2>
                    <span className="header-version">{log.version}</span>
                  </span>
                  <span className="header-date">
                    <p>{log.date}</p>
                  </span>
                </div>
                <div className="description">
                  <p>{log.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Standalone>

      <Modal
        isOpen={selectedLog !== null}
        onClose={closeModal}
        className="changelog-modal"
      >
        {selectedLog !== null && (
          <div className="changelog-modal-content">
            <div className="changelog-modal-header">
              <div className="changelog-modal-header-content">
                <h2>{logs[selectedLog].title}</h2>
                <span className="version">{logs[selectedLog].version}</span>
              </div>
              <div className="changelog-modal-meta">
                <span className="date">{logs[selectedLog].date}</span>
              </div>
            </div>
            <MarkdownRenderer
              content={logs[selectedLog].content}
              className="markdown-modal-content"
            />
          </div>
        )}
      </Modal>
    </>
  );
}

export default Changelog;
