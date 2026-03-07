import { useMemo } from "react";
import { createPortal } from "react-dom";
import useLinkPreview from "../utils/useLinkPreview";
import "../styles/components.LinkPreview.css";

function getViewportAwarePosition(anchorRect, tooltipWidth = 320, tooltipHeight = 180) {
  const spacing = 12;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let left = anchorRect.left;
  let top = anchorRect.bottom + spacing;

  if (left + tooltipWidth > viewportWidth - spacing) {
    left = Math.max(spacing, viewportWidth - tooltipWidth - spacing);
  }

  if (top + tooltipHeight > viewportHeight - spacing) {
    top = anchorRect.top - tooltipHeight - spacing;
  }

  top = Math.max(spacing, top);

  return { top, left };
}

function LinkPreviewTooltip({ metadata, anchorRect, tooltipId, thumbVariant, onThumbLoad }) {
  const style = useMemo(() => {
    if (!anchorRect) {
      return { visibility: "hidden" };
    }

    const position = getViewportAwarePosition(anchorRect);
    return {
      top: `${position.top}px`,
      left: `${position.left}px`,
    };
  }, [anchorRect]);

  return createPortal(
    <div
      className="link-preview-tooltip"
      role="tooltip"
      id={tooltipId}
      aria-hidden={!anchorRect}
      style={style}
    >
      {metadata.image ? (
        <div
          className={`link-preview-thumb-wrap ${
            thumbVariant === "wide" ? "is-wide" : ""
          }`}
          aria-hidden="true"
        >
          <img
            className="link-preview-thumb"
            src={metadata.image}
            alt=""
            loading="lazy"
            onLoad={onThumbLoad}
          />
        </div>
      ) : null}

      <div className="link-preview-content">
        {/* <p className="link-preview-site">{metadata.siteName || "Link"}</p> */}
        <p className="link-preview-title">{metadata.title || metadata.url}</p>
        {metadata.description ? (
          <p className="link-preview-description">{metadata.description}</p>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

function LinkPreview({ href, children }) {
  const {
    wrapperRef,
    anchorRect,
    metadata,
    tooltipId,
    thumbVariant,
    handleThumbLoad,
    renderedChildren,
    showTooltip,
  } = useLinkPreview({ href, children });

  return (
    <span className="link-preview-anchor-wrap" ref={wrapperRef}>
      {renderedChildren}
      {showTooltip ? (
        <LinkPreviewTooltip
          metadata={metadata}
          anchorRect={anchorRect}
          tooltipId={tooltipId}
          thumbVariant={thumbVariant}
          onThumbLoad={handleThumbLoad}
        />
      ) : null}
    </span>
  );
}

export default LinkPreview;
