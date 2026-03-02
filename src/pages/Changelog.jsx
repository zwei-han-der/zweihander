import { useState, useMemo, useRef } from "react";
import Standalone from "../layouts/Standalone";
import Modal from "../components/Modal";
import MarkdownRenderer from "../components/MarkdownRenderer";
import useTextOverflow from "../utils/useTextOverflow";
import { logs } from "../data/changelog/index";
import "../styles/pages.Changelog.css";

function Changelog() {
  const [selectedLog, setSelectedLog] = useState(null);
  const [titleRefs] = useState(() => logs.map(() => ({ current: null })));
  const modalTitleRef = useRef(null);

  const overflowRefs = useMemo(
    () => [
      ...logs.map((_, index) => ({
        key: `title-${index}`,
        ref: titleRefs[index],
      })),
      { key: 'modal-title', ref: modalTitleRef },
    ],
    [titleRefs, modalTitleRef]
  );

  const overflowStates = useTextOverflow(overflowRefs, [logs, selectedLog]);

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
              <button
                className="post"
                key={index}
                onClick={() => openModal(index)}
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
        isOpen={selectedLog !== null}
        onClose={closeModal}
        className="changelog-modal"
      >
        {selectedLog !== null && (
          <div className="changelog-modal-content">
            <div className="changelog-modal-header">
              <div
                className={`modal-header-title ${
                  overflowStates['modal-title'] ? 'is-overflowing' : ''
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
