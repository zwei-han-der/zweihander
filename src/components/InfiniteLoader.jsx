import { useState, useEffect, useRef } from "react";
import "../styles/components.InfiniteLoader.css";

export function InfiniteLoader({ progress }) {
  const [show, setShow] = useState(true);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  const visualRef = useRef(0);
  const [visualProgress, setVisualProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let raf;
    const animate = () => {
      const diff = progress - visualRef.current;
      if (diff > 0.1) {
        visualRef.current += diff * 0.08;
        setVisualProgress(visualRef.current);
        raf = requestAnimationFrame(animate);
      } else {
        visualRef.current = progress;
        setVisualProgress(progress);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [progress]);

  useEffect(() => {
    if (minTimeElapsed && progress === 100 && visualProgress >= 99.5) {
      const t = setTimeout(() => setShow(false), 200);
      return () => clearTimeout(t);
    }
  }, [minTimeElapsed, progress, visualProgress]);

  if (!show) return null;

  const isHidden = minTimeElapsed && progress === 100 && visualProgress >= 99.5;

  return (
    <div
      className={`ic-loader-overlay ${isHidden ? "ic-loader-overlay--hidden" : "ic-loader-overlay--visible"}`}
    >
      <div className="ic-loader-bar">
        <div
          className="ic-loader-bar-fill"
          style={{ transform: `scaleX(${visualProgress / 100})` }}
        />
      </div>
    </div>
  );
}

export default InfiniteLoader;
