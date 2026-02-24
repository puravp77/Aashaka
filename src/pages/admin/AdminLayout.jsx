import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Bell,
  FileText,
  LayoutDashboard,
  List,
  LogOut,
  Mail,
  Menu,
  Moon,
  Package,
  ShoppingCart,
  Sun,
  Users,
} from "lucide-react";
import "./AdminLayout.css";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/content", label: "Content", icon: FileText },
];

const TITLES = {
  "/admin/dashboard": "Dashboard",
  "/admin/products": "Products",
  "/admin/orders": "Orders",
  "/admin/customers": "Customers",
  "/admin/content": "Content",
};

const QUICK_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/customers", label: "Users" },
  { to: "/admin/content", label: "Settings" },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 1100 : false
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth > 1100 : true
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem("admin_theme") === "dark";
    } catch {
      return false;
    }
  });

  const pageTitle = useMemo(() => {
    return TITLES[location.pathname] || "Admin";
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin-login", { replace: true });
  };

  useEffect(() => {
    try {
      localStorage.setItem("admin_theme", isDarkMode ? "dark" : "light");
    } catch {
      // ignore storage errors
    }
  }, [isDarkMode]);

  useEffect(() => {
    const syncViewport = () => {
      const mobile = window.innerWidth <= 1100;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    syncViewport();
    window.addEventListener("resize", syncViewport);
    return () => window.removeEventListener("resize", syncViewport);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  return (
    <section className={`adm-page ${isDarkMode ? "dark-mode" : ""}`}>
      <div className={`adm-shell ${isSidebarOpen ? "" : "sidebar-collapsed"}`}>
        <aside className={`adm-sidebar ${isSidebarOpen ? "is-open" : ""}`} id="admin-sidebar">
          <div className="adm-logo-wrap">
            <div>
              <div className="adm-logo">Aashaka</div>
              <p className="adm-logo-sub">Admin Console</p>
            </div>
          </div>

          <nav className="adm-nav" aria-label="Admin navigation">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `adm-nav-item ${isActive ? "active" : ""}`
                }
                onClick={() => {
                  if (isMobile) setIsSidebarOpen(false);
                }}
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="adm-main">
          <header className="adm-topbar">
            <div className="adm-topbar-left">
              <button
                type="button"
                className="adm-icon-btn"
                aria-label="Toggle menu"
                aria-controls="admin-sidebar"
                aria-expanded={isSidebarOpen}
                onClick={() => setIsSidebarOpen((prev) => !prev)}
              >
                <Menu size={20} />
              </button>
              <nav className="adm-quick-nav" aria-label="Header links">
                {QUICK_LINKS.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `adm-quick-link ${isActive ? "active" : ""}`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="adm-topbar-right">
              <button type="button" className="adm-icon-btn" aria-label="Notifications" data-tip="Notifications">
                <Bell size={19} />
              </button>
              <button type="button" className="adm-icon-btn" aria-label="Activity" data-tip="Activity">
                <List size={19} />
              </button>
              <button type="button" className="adm-icon-btn" aria-label="Messages" data-tip="Messages">
                <Mail size={19} />
              </button>
              <button
                type="button"
                className="adm-icon-btn"
                aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
                data-tip={isDarkMode ? "Light mode" : "Dark mode"}
                onClick={() => setIsDarkMode((prev) => !prev)}
              >
                {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
              </button>
              <button type="button" className="adm-icon-btn" aria-label="Logout" data-tip="Logout" onClick={handleLogout}>
                <LogOut size={19} />
              </button>
              <div className="adm-avatar" aria-hidden="true">A</div>
            </div>
          </header>

          <section className="adm-page-head">
            <p className="adm-breadcrumb">
              <Link to="/admin/dashboard">Home</Link> / <span>{pageTitle}</span>
            </p>
          </section>

          <Outlet />
        </main>
      </div>
      {isMobile && isSidebarOpen && (
        <button
          type="button"
          className="adm-sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </section>
  );
}
