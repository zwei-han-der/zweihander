import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { themes } from "./data/themes";
import Changelog from "./pages/Changelog";

function App() {
  useEffect(() => {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    Object.entries(randomTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/changelog" element={<Changelog />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
