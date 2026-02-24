import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  Bell,
  FileText,
  LayoutDashboard,
  List,
  LogOut,
  Mail,
  Menu,
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

  const pageTitle = useMemo(() => {
    return TITLES[location.pathname] || "Admin";
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/admin-login", { replace: true });
  };

  return (
    <section className="adm-page">
      <div className="adm-shell">
        <aside className="adm-sidebar">
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
              <button type="button" className="adm-icon-btn" aria-label="Menu">
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
              <button type="button" className="adm-icon-btn" aria-label="Notifications">
                <Bell size={19} />
              </button>
              <button type="button" className="adm-icon-btn" aria-label="Activity">
                <List size={19} />
              </button>
              <button type="button" className="adm-icon-btn" aria-label="Messages">
                <Mail size={19} />
              </button>
              <button type="button" className="adm-icon-btn" aria-label="Theme">
                <Sun size={19} />
              </button>
              <button type="button" className="adm-icon-btn" aria-label="Logout" onClick={handleLogout}>
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
    </section>
  );
}
