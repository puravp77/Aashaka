import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Bell,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Mail,
  MessageSquare,
  Menu,
  Moon,
  Package,
  Settings,
  User,
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
  "/admin/allowlist": "Admin Allowlist",
  "/admin/profile": "Profile",
};

const QUICK_LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/allowlist", label: "Allow List" },
  { to: "/admin/content", label: "Settings" },
];

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const profileMenuRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 1100px)").matches
      : false
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(() =>
    typeof window !== "undefined"
      ? !window.matchMedia("(max-width: 1100px)").matches
      : true
  );
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      return localStorage.getItem("admin_theme") === "dark";
    } catch {
      return false;
    }
  });
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const pageTitle = useMemo(() => {
    return TITLES[location.pathname] || "Admin";
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login", { replace: true });
  };

  useEffect(() => {
    try {
      localStorage.setItem("admin_theme", isDarkMode ? "dark" : "light");
    } catch {
      // ignore storage errors
    }
  }, [isDarkMode]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1100px)");
    const syncViewport = () => {
      const mobile = media.matches;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!profileMenuRef.current) return;
      if (!profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <div className="adm-profile" ref={profileMenuRef}>
                <button
                  type="button"
                  className="adm-avatar"
                  aria-label="Account menu"
                  aria-expanded={isProfileMenuOpen}
                  onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                >
                  {user?.username ? user.username.charAt(0).toUpperCase() : (user?.id ? user.id.charAt(0).toUpperCase() : "A")}
                </button>

                {isProfileMenuOpen && (
                  <div className="adm-profile-menu" role="menu" aria-label="Account menu">
                    <p className="adm-menu-title">Account</p>
                    <button type="button" className="adm-menu-item">
                      <Bell size={16} /> Updates
                    </button>
                    <button type="button" className="adm-menu-item">
                      <Mail size={16} /> Messages
                    </button>
                    <button type="button" className="adm-menu-item">
                      <CheckSquare size={16} /> Tasks
                    </button>
                    <button type="button" className="adm-menu-item">
                      <MessageSquare size={16} /> Comments
                    </button>

                    <p className="adm-menu-title">Settings</p>
                    <Link
                      to="/admin/profile"
                      className="adm-menu-item"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User size={16} /> Profile
                    </Link>
                    <button type="button" className="adm-menu-item">
                      <Settings size={16} /> Settings
                    </button>

                    <button type="button" className="adm-menu-item">
                      <FileText size={16} /> Projects
                    </button>

                    <button type="button" className="adm-menu-item" onClick={logout}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
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
