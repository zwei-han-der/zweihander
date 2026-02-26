import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { themes } from "./data/themes";
import Home from "./pages/Home";
import Changelog from "./pages/Changelog";
import NotFound from "./pages/NotFound";
import Videos from "./pages/Videos";
import Bookmarks from "./pages/Bookmarks";
import Profile from "./pages/Profile";

function App() {
  useEffect(() => {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    Object.entries(randomTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, []);

  return (
    <BrowserRouter basename="/zweihander">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/bookmarks" element={<Bookmarks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
