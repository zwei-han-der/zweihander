import { useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { themes } from "./data/themes";

const Home = lazy(() => import("./pages/Home"));
const Changelog = lazy(() => import("./pages/Changelog"));
const Blog = lazy(() => import("./pages/Blog"));
const Videos = lazy(() => import("./pages/Videos"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
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
          <Route path="/changelog">
            <Route index element={<Changelog />} />
            <Route path=":logId" element={<Changelog />} />
          </Route>
          <Route path="/blog">
            <Route index element={<Blog />} />
            <Route path=":postId" element={<Blog />} />
          </Route>
          <Route path="/videos" element={<Videos />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
