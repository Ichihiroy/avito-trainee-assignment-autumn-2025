import { Outlet, NavLink } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { Moon, Sun, List, BarChart3 } from "lucide-react";
import "./Layout.css";

const Layout = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="layout">
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
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
