import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.tsx";
import TimeSeriesPage from "./pages/TimeSeriesPage.tsx";
import MA1Generation from "./pages/MA1Generation.tsx";
import ARRandomGenerationPage from "./pages/ARRandomGenerationPage.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<TimeSeriesPage />} />
        <Route path="ma1-generation" element={<MA1Generation />} />
        <Route path="ar-generation" element={<ARRandomGenerationPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
