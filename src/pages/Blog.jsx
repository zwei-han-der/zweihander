import { useState, useMemo, useRef, useEffect, lazy, Suspense } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Standalone from "../layouts/Standalone";
import Modal from "../components/Modal";
import useTextOverflow from "../utils/useTextOverflow";
import { posts, loadBlogContent } from "../data/blog/index";
import "../styles/pages.Blog.css";

const MarkdownRenderer = lazy(() => import("../components/MarkdownRenderer"));

function Blog() {
  const { postId } = useParams();
  const navigate = useNavigate();

  const [selectedContent, setSelectedContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [titleRefs] = useState(() => posts.map(() => ({ current: null })));
  const modalTitleRef = useRef(null);

  const selectedPost = postId
    ? posts.findIndex((post) => post.id === postId)
    : null;
  const isModalOpen = selectedPost !== null && selectedPost !== -1;

  const overflowRefs = useMemo(
    () => [
      ...posts.map((_, index) => ({
        key: `title-${index}`,
        ref: titleRefs[index],
      })),
      { key: "modal-title", ref: modalTitleRef },
    ],
    [titleRefs, modalTitleRef]
  );

  const overflowStates = useTextOverflow(overflowRefs, [selectedPost]);

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
      const currentPost = posts[selectedPost];
      setIsLoadingContent(true);

      try {
        const content = await loadBlogContent(currentPost.id);

        if (!isMounted) {
          return;
        }

        setSelectedContent(content);
      } catch {
        if (!isMounted) {
          return;
        }

        setSelectedContent("Não foi possível carregar este post.");
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
  }, [selectedPost, isModalOpen]);

  const handleLogClick = (index) => {
    navigate(`/blog/${posts[index].id}`);
  };

  const handleCloseModal = () => {
    navigate("/blog");
  };

  return (
    <>
      <Standalone>
        <div className="blog-posts">
          {posts.map((log, index) => {
            const isOverflowing = overflowStates[`title-${index}`];

            return (
              <button
                className={`blog-post ${log.cover ? "has-cover" : ""}`}
                key={index}
                onClick={() => handleLogClick(index)}
              >
                {log.cover ? (
                  <div className="blog-post-cover" aria-hidden="true">
                    <img
                      className="blog-post-cover-img"
                      src={log.cover}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                ) : null}

                <div className="blog-post-body">
                  <div className="blog-header">
                    <div
                      className={`blog-header-title ${
                        isOverflowing ? "is-overflowing" : ""
                      }`}
                      ref={(el) => {
                        titleRefs[index].current = el;
                      }}
                    >
                      <div className="blog-header-title-content">
                        <h2>{log.title}</h2>
                        <span className="blog-header-version">
                          {log.version}
                        </span>
                      </div>
                    </div>
                    <span className="blog-header-date">
                      <p>{log.date}</p>
                    </span>
                  </div>

                  <div className="blog-description">
                    <p>{log.description}</p>
                  </div>
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
                  <h2>{posts[selectedPost].title}</h2>
                  <span className="modal-header-version">
                    {posts[selectedPost].version}
                  </span>
                </div>
              </div>
              <span className="modal-header-date">
                {posts[selectedPost].date}
              </span>
            </div>

            {isLoadingContent ? (
              <p>Carregando blog...</p>
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

export default Blog;
