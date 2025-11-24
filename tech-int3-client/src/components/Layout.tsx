import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Moon, Sun, List, BarChart3 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import ProgressBar from "./ProgressBar";
import "./Layout.css";

const Layout = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="layout">
      <ProgressBar isLoading={isLoading} />
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <h1>Авито Модерация</h1>
            </div>
            <nav className="nav">
              <NavLink
                to="/list"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <List size={20} />
                <span>Объявления</span>
              </NavLink>
              <NavLink
                to="/stats"
                className={({ isActive }) =>
                  isActive ? "nav-link active" : "nav-link"
                }
              >
                <BarChart3 size={20} />
                <span>Статистика</span>
              </NavLink>
            </nav>
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="Переключить тему"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="container">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;
