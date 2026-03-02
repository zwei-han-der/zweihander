import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { themes } from "./data/themes";

const Home = lazy(() => import("./pages/Home"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Videos = lazy(() => import("./pages/Videos"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  useEffect(() => {
    const randomTheme = themes[Math.floor(Math.random() * themes.length)];

    Object.entries(randomTheme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--${key}`, value);
    });
  }, []);

  return (
    <BrowserRouter basename="/zweihander">
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/changelog" element={<Changelog />} />
          <Route path="/videos" element={<Videos />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
