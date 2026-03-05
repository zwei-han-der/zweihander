import { cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getLinkMetadataByHref } from "../utils/linkMetadata";
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

function LinkPreviewTooltip({ metadata, anchorRect, tooltipId }) {
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
        <div className="link-preview-thumb-wrap" aria-hidden="true">
          <img className="link-preview-thumb" src={metadata.image} alt="" loading="lazy" />
        </div>
      ) : null}

      <div className="link-preview-content">
        <p className="link-preview-site">{metadata.siteName || "Link"}</p>
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
  const wrapperRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [anchorRect, setAnchorRect] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [canHover, setCanHover] = useState(false);
  const tooltipId = useMemo(
    () => `link-preview-${Math.random().toString(36).slice(2, 10)}`,
    [],
  );

  const updateAnchorRect = () => {
    if (!wrapperRef.current) {
      return;
    }

    setAnchorRect(wrapperRef.current.getBoundingClientRect());
  };

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => {
      setCanHover(mediaQuery.matches);
    };

    update();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", update);
    } else if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(update);
    }

    return () => {
      if (typeof mediaQuery.removeEventListener === "function") {
        mediaQuery.removeEventListener("change", update);
      } else if (typeof mediaQuery.removeListener === "function") {
        mediaQuery.removeListener(update);
      }
    };
  }, []);

  useEffect(() => {
    let active = true;

    if (!isActive || !canHover || !href || metadata) {
      return () => {
        active = false;
      };
    }

    getLinkMetadataByHref(href)
      .then((record) => {
        if (!active || !record) {
          return;
        }

        setMetadata(record);
      })
      .catch(() => {
        // Swallow errors to preserve plain-link behavior.
      });

    return () => {
      active = false;
    };
  }, [isActive, canHover, href, metadata]);

  useEffect(() => {
    if (!isActive || !metadata) {
      return;
    }

    updateAnchorRect();

    const handleViewportChange = () => {
      updateAnchorRect();
    };

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isActive, metadata]);

  const showTooltip = Boolean(canHover && isActive && metadata);

  const handleEnter = () => {
    if (!canHover) {
      return;
    }

    setIsActive(true);
  };

  const handleLeave = () => {
    setIsActive(false);
  };

  const renderedChildren = useMemo(() => {
    if (!isValidElement(children)) {
      return children;
    }

    const existingDescribedBy = children.props["aria-describedby"];
    const describedBy = showTooltip
      ? [existingDescribedBy, tooltipId].filter(Boolean).join(" ")
      : existingDescribedBy;

    const existingOnFocus = children.props.onFocus;
    const existingOnBlur = children.props.onBlur;
    const existingOnMouseEnter = children.props.onMouseEnter;
    const existingOnMouseLeave = children.props.onMouseLeave;

    return cloneElement(children, {
      "aria-describedby": describedBy,
      onFocus: (event) => {
        existingOnFocus?.(event);
        handleEnter();
      },
      onBlur: (event) => {
        existingOnBlur?.(event);
        handleLeave();
      },
      onMouseEnter: (event) => {
        existingOnMouseEnter?.(event);
        handleEnter();
      },
      onMouseLeave: (event) => {
        existingOnMouseLeave?.(event);
        handleLeave();
      },
    });
  }, [children, showTooltip, tooltipId, canHover]);

  return (
    <span className="link-preview-anchor-wrap" ref={wrapperRef}>
      {renderedChildren}
      {showTooltip ? (
        <LinkPreviewTooltip
          metadata={metadata}
          anchorRect={anchorRect}
          tooltipId={tooltipId}
        />
      ) : null}
    </span>
  );
}

export default LinkPreview;
