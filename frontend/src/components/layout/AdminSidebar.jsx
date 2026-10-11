import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@500;600&display=swap');

  .sidebar {
    width: 240px;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
    border-right: 0.5px solid rgba(0,0,0,0.07);
    transition: width 0.35s cubic-bezier(0.4,0,0.2,1);
    overflow: hidden;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    font-family: 'DM Sans', sans-serif;
    z-index: 1000;
  }

  .sidebar.collapsed { width: 64px; }

  .sidebar-header {
    padding: 20px 16px 16px;
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 0.5px solid rgba(0,0,0,0.07);
    min-height: 64px;
  }

  .logo-mark {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    background: #2563EB;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
    overflow: hidden;
    text-decoration: none;
  }

  .logo-mark::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%);
  }

  .logo-text-wrap {
    opacity: 1;
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }

  .sidebar.collapsed .logo-text-wrap { opacity: 0; pointer-events: none; }

  .logo-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 600;
    color: #0F172A;
    letter-spacing: 0.03em;
    display: block;
    line-height: 1.2;
  }

  .logo-sub {
    font-size: 10px;
    font-weight: 400;
    color: #2563EB;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: block;
    line-height: 1;
    margin-top: 2px;
  }

  .nav-section {
    flex: 1;
    padding: 12px 10px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .nav-section::-webkit-scrollbar { width: 3px; }
  .nav-section::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 2px; }

  .nav-group-label {
    font-size: 9px;
    font-weight: 500;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #CBD5E1;
    padding: 10px 10px 6px;
    white-space: nowrap;
    overflow: hidden;
    transition: opacity 0.2s ease;
  }

  .sidebar.collapsed .nav-group-label { opacity: 0; }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    border-radius: 10px;
    cursor: pointer;
    position: relative;
    transition: background 0.15s ease;
    margin-bottom: 2px;
    overflow: hidden;
    text-decoration: none;
  }

  .nav-item::before {
    content: '';
    position: absolute;
    left: 0; top: 50%;
    transform: translateY(-50%) scaleY(0);
    width: 3px;
    height: 55%;
    background: #2563EB;
    border-radius: 0 3px 3px 0;
    transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
  }

  .nav-item:hover { background: rgba(0,0,0,0.04); }
  .nav-item.active { background: rgba(37,99,235,0.07); }
  .nav-item.active::before { transform: translateY(-50%) scaleY(1); }

  .nav-icon-wrap {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: transparent;
    transition: background 0.15s ease;
  }

  .nav-item.active .nav-icon-wrap { background: rgba(37,99,235,0.08); }
  .nav-item:hover .nav-icon-wrap { background: rgba(0,0,0,0.05); }

  .nav-icon-wrap svg {
    width: 15px;
    height: 15px;
    color: #64748B;
    transition: color 0.15s ease;
    stroke: currentColor;
  }

  .nav-item.active .nav-icon-wrap svg { color: #2563EB; }
  .nav-item:hover .nav-icon-wrap svg { color: #0F172A; }

  .nav-label {
    font-size: 13.5px;
    font-weight: 400;
    color: #64748B;
    white-space: nowrap;
    transition: color 0.15s ease, opacity 0.2s ease;
    flex: 1;
  }

  .nav-item.active .nav-label { color: #2563EB; font-weight: 500; }
  .nav-item:hover .nav-label { color: #0F172A; }
  .sidebar.collapsed .nav-label { opacity: 0; pointer-events: none; }

  .nav-badge {
    font-size: 10px;
    font-weight: 500;
    background: rgba(37,99,235,0.08);
    color: #2563EB;
    border: 0.5px solid rgba(37,99,235,0.15);
    padding: 1px 7px;
    border-radius: 20px;
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }

  .sidebar.collapsed .nav-badge { opacity: 0; pointer-events: none; }

  .nav-divider {
    height: 0.5px;
    background: rgba(0,0,0,0.07);
    margin: 8px 10px;
  }

  .sidebar-footer {
    padding: 12px 10px 16px;
    border-top: 0.5px solid rgba(0,0,0,0.07);
  }

  .user-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s ease;
    overflow: hidden;
    text-decoration: none;
    color: inherit;
  }

  .user-card:hover { background: rgba(37,99,235,0.08); }

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #2563EB;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Syne', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
    position: relative;
  }

  .avatar-dot {
    position: absolute;
    bottom: 0; right: 0;
    width: 8px; height: 8px;
    background: #22C55E;
    border-radius: 50%;
    border: 1.5px solid #fff;
  }

  .user-info { overflow: hidden; flex: 1; transition: opacity 0.2s ease; }
  .sidebar.collapsed .user-info { opacity: 0; }

  .user-name {
    font-size: 13px;
    font-weight: 500;
    color: #0F172A;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user-role { font-size: 11px; color: #64748B; white-space: nowrap; }

  .toggle-btn {
    position: absolute;
    right: -12px;
    top: 56px;
    width: 24px;
    height: 24px;
    background: #fff;
    border: 0.5px solid rgba(0,0,0,0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: background 0.15s ease, transform 0.35s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  }

  .toggle-btn:hover { background: rgba(37,99,235,0.08); }
  .toggle-btn svg { width: 12px; height: 12px; color: #64748B; transition: color 0.15s ease; stroke: currentColor; }
  .toggle-btn:hover svg { color: #2563EB; }
  .sidebar.collapsed .toggle-btn { transform: rotate(180deg); }
`;

const menuGroups = [
  {
    label: "Overview",
    items: [
      {
        path: "/admin/dashboard",
        label: "Dashboard",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        path: "/admin/reports",
        label: "Reports",
        badge: "New",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        path: "/admin/sellers",
        label: "Sellers",
        badge: "24",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        path: "/admin/users",
        label: "Users",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        path: "/admin/products",
        label: "Products",
        badge: "142",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          </svg>
        ),
      },
      {
        path: "/admin/orders",
        label: "Orders",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        path: "/admin/profile",
        label: "My Profile",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
      },
      {
        path: "/admin/categories",
        label: "Categories",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
        ),
      },
      {
        path: "/admin/promotions",
        label: "Promotions",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ),
      },
      {
        path: "/admin/settings",
        label: "Settings",
        icon: (
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        ),
      },
    ],
  },
];

export default function AdminSidebar({ isOpen: externalIsOpen, onToggle }) {
  const location = useLocation();
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(true);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalOpen;

  const handleToggle = () => {
    if (onToggle) onToggle();
    else setInternalOpen((prev) => !prev);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{styles}</style>
      <aside className={`sidebar${isOpen ? "" : " collapsed"}`}>
        {/* Toggle Button */}
        <button className="toggle-btn" onClick={handleToggle} title="Toggle sidebar">
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Header / Logo */}
        <div className="sidebar-header">
          <Link to="/admin/dashboard" className="logo-mark">
            <svg viewBox="0 0 16 16" fill="none" style={{ width: 16, height: 16 }}>
              <rect x="2" y="2" width="5" height="5" rx="1" fill="#fff" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="#fff" opacity="0.7" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="#fff" opacity="0.7" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="#fff" opacity="0.4" />
            </svg>
          </Link>
          <div className="logo-text-wrap">
            <span className="logo-title">Nexus</span>
            <span className="logo-sub">Control</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="nav-section">
          {menuGroups.map((group, gi) => (
            <div key={gi}>
              {gi > 0 && <div className="nav-divider" />}
              <div className="nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item${isActive(item.path) ? " active" : ""}`}
                  title={item.label}
                >
                  <div className="nav-icon-wrap">{item.icon}</div>
                  <span className="nav-label">{item.label}</span>
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="sidebar-footer">
          <Link to="/admin/profile" className="user-card" title="View Profile">
            <div className="avatar">
              {user?.email?.charAt(0).toUpperCase() || "A"}
              <span className="avatar-dot" />
            </div>
            <div className="user-info">
              <div className="user-name">{user?.email || "admin@nexus.io"}</div>
              <div className="user-role">Administrator</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}