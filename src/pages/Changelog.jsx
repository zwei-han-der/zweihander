import { useState } from "react";
import Standalone from "../layouts/Standalone";
import useTextOverflow from "../utils/useTextOverflow";
import { logs } from "../data/logs";
import "../styles/Changelog.css";

function Changelog() {
  const [titleRefs] = useState(() => 
    logs.map(() => ({ current: null }))
  );

  const overflowRefs = logs.map((_, index) => ({
    key: `title-${index}`,
    ref: titleRefs[index],
  }));

  const overflowStates = useTextOverflow(overflowRefs, [logs]);

  return (
    <Standalone>
      <div className="posts">
        {logs.map((log, index) => {
          const isOverflowing = overflowStates[`title-${index}`];

          return (
            <div className="post" key={index}>
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
  );
}

export default Changelog;