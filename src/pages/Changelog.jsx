import Standalone from "../layouts/Standalone";
import { logs } from "../data/logs";
import "../styles/Changelog.css";

function Changelog() {
  return (
    <Standalone>
      <div className="posts">
        {logs.map((log, index) => {
          return (
            <div className="post" key={index}>
              <div className="header">
                <span className="header-title">
                  <h2>{log.title}</h2>
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
