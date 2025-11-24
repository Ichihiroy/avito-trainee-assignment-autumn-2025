import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import AdsList from "./pages/AdsList";
import AdDetail from "./pages/AdDetail";
import Stats from "./pages/Stats";
import "./index.css";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/list" replace />} />
            <Route path="list" element={<AdsList />} />
            <Route path="item/:id" element={<AdDetail />} />
            <Route path="stats" element={<Stats />} />
            <Route path="*" element={<Navigate to="/list" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
