import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  .seller-sidebar {
    width: 260px;
    background: #FFFFFF;
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 999;
    font-family: 'Inter', sans-serif;
    border-right: 1px solid #E5E7EB;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.04);
    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }

  .seller-sidebar.collapsed {
    width: 80px;
  }

  /* ============ HEADER / BRAND ============ */
  .seller-sidebar-header {
    padding: 24px 16px;
    border-bottom: 1px solid #F3F4F6;
    display: flex;
    align-items: center;
    gap: 12px;
    position: relative;
  }

  .seller-sidebar.collapsed .seller-sidebar-header {
    padding: 24px 8px;
    justify-content: center;
  }

  .seller-logo-mark {
    width: 40px;
    height: 40px;
    border-radius: 10px;
    background: linear-gradient(135deg, #6f55ff 0%, #7b68ee 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #fff;
    font-weight: 700;
    font-size: 16px;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(111, 85, 255, 0.3);
  }

  .seller-logo-mark::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 60%);
  }

  .seller-logo-text-wrap {
    opacity: 1;
    transition: opacity 0.25s ease;
    white-space: nowrap;
  }

  .seller-sidebar.collapsed .seller-logo-text-wrap {
    opacity: 0;
    pointer-events: none;
  }

  .seller-logo-title {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.5px;
    display: block;
    line-height: 1.2;
  }

  .seller-logo-sub {
    font-size: 11px;
    font-weight: 500;
    color: #6f55ff;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    display: block;
    line-height: 1;
    margin-top: 2px;
  }

  /* ============ TOGGLE BUTTON ============ */
  .seller-toggle-btn {
    position: absolute;
    right: -14px;
    top: 32px;
    width: 28px;
    height: 28px;
    background: #fff;
    border: 1px solid #E5E7EB;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  .seller-toggle-btn:hover {
    background: #F9FAFB;
    border-color: #6f55ff;
  }

  .seller-toggle-btn svg {
    width: 14px;
    height: 14px;
    color: #6B7280;
    transition: color 0.2s ease;
  }

  .seller-toggle-btn:hover svg {
    color: #6f55ff;
  }

  .seller-sidebar.collapsed .seller-toggle-btn {
    transform: rotate(180deg);
  }

  /* ============ NAVIGATION ============ */
  .seller-nav-section {
    flex: 1;
    padding: 16px 8px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .seller-nav-section::-webkit-scrollbar {
    width: 6px;
  }

  .seller-nav-section::-webkit-scrollbar-track {
    background: transparent;
  }

  .seller-nav-section::-webkit-scrollbar-thumb {
    background: #D1D5DB;
    border-radius: 3px;
  }

  .seller-nav-section::-webkit-scrollbar-thumb:hover {
    background: #9CA3AF;
  }

  /* ============ NAV GROUP ============ */
  .seller-nav-group {
    margin-bottom: 8px;
  }

  .seller-nav-group:not(:first-of-type) {
    border-top: 1px solid #F3F4F6;
    padding-top: 12px;
    margin-top: 12px;
  }

  .seller-nav-group-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9CA3AF;
    padding: 8px 12px 10px;
    white-space: nowrap;
    transition: opacity 0.2s ease;
  }

  .seller-sidebar.collapsed .seller-nav-group-label {
    opacity: 0;
    pointer-events: none;
  }

  /* ============ NAV ITEMS ============ */
  .seller-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    margin-bottom: 4px;
    border-radius: 10px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    text-decoration: none;
    color: #6B7280;
    overflow: hidden;
  }

  .seller-nav-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: linear-gradient(180deg, #6f55ff 0%, #7b68ee 100%);
    border-radius: 0 3px 3px 0;
    transform: scaleY(0);
    transform-origin: center;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  .seller-nav-item:hover {
    background: #F9FAFB;
    color: #374151;
  }

  .seller-nav-item.active {
    background: linear-gradient(135deg, rgba(111, 85, 255, 0.08) 0%, rgba(123, 104, 238, 0.04) 100%);
    color: #6f55ff;
    font-weight: 500;
  }

  .seller-nav-item.active::before {
    transform: scaleY(1);
  }

  .seller-sidebar.collapsed .seller-nav-item {
    justify-content: center;
    gap: 0;
  }

  /* ============ ICON ============ */
  .seller-nav-icon-wrap {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: transparent;
    transition: all 0.2s ease;
  }

  .seller-nav-item:hover .seller-nav-icon-wrap {
    background: rgba(111, 85, 255, 0.08);
  }

  .seller-nav-item.active .seller-nav-icon-wrap {
    background: linear-gradient(135deg, rgba(111, 85, 255, 0.15) 0%, rgba(123, 104, 238, 0.08) 100%);
  }

  .seller-nav-icon-wrap svg {
    width: 16px;
    height: 16px;
    color: #9CA3AF;
    transition: color 0.2s ease;
    stroke: currentColor;
    stroke-width: 1.5;
  }

  .seller-nav-item:hover .seller-nav-icon-wrap svg {
    color: #6B7280;
  }

  .seller-nav-item.active .seller-nav-icon-wrap svg {
    color: #6f55ff;
  }

  /* ============ LABEL ============ */
  .seller-nav-label {
    font-size: 13px;
    font-weight: 500;
    color: inherit;
    white-space: nowrap;
    transition: opacity 0.2s ease;
    flex: 1;
    text-align: left;
  }

  .seller-sidebar.collapsed .seller-nav-label {
    opacity: 0;
    pointer-events: none;
  }

  /* ============ BADGE ============ */
  .seller-nav-badge {
    font-size: 9px;
    font-weight: 600;
    background: linear-gradient(135deg, #6f55ff 0%, #7b68ee 100%);
    color: #fff;
    padding: 2px 6px;
    border-radius: 10px;
    transition: opacity 0.2s ease;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .seller-sidebar.collapsed .seller-nav-badge {
    opacity: 0;
    pointer-events: none;
  }

  /* ============ FOOTER ============ */
  .seller-sidebar-footer {
    padding: 16px 8px 20px;
    border-top: 1px solid #F3F4F6;
  }

  .seller-user-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;
    position: relative;
  }

  .seller-user-card:hover {
    background: #F9FAFB;
  }

  .seller-sidebar.collapsed .seller-user-card {
    justify-content: center;
    gap: 0;
  }

  .seller-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6f55ff 0%, #7b68ee 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    flex-shrink: 0;
    position: relative;
    box-shadow: 0 2px 8px rgba(111, 85, 255, 0.25);
  }

  .seller-avatar-dot {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 10px;
    height: 10px;
    background: #10b981;
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 0 0 2px rgba(111, 85, 255, 0.1);
  }

  .seller-user-info {
    overflow: hidden;
    flex: 1;
    transition: opacity 0.2s ease;
  }

  .seller-sidebar.collapsed .seller-user-info {
    opacity: 0;
    pointer-events: none;
  }

  .seller-user-name {
    font-size: 12px;
    font-weight: 600;
    color: #111827;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.2;
  }

  .seller-user-role {
    font-size: 10px;
    color: #9CA3AF;
    white-space: nowrap;
    margin-top: 2px;
  }

  /* ============ RESPONSIVE ============ */
  @media (max-width: 1024px) {
    .seller-sidebar {
      width: 240px;
    }

    .seller-sidebar.collapsed {
      width: 70px;
    }
  }

  @media (max-width: 768px) {
    .seller-sidebar {
      width: 0;
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s ease;
    }

    .seller-sidebar.open-mobile {
      width: 260px;
      opacity: 1;
      pointer-events: auto;
    }
  }
`;

const menuGroups = [
  {
    label: "Main",
    items: [
      {
        path: "/seller/dashboard",
        label: "Dashboard",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        path: "/seller/products",
        label: "Products",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2.25a.75.75 0 01.75.75v.5h2.5a2.75 2.75 0 012.75 2.75v2h.5a.75.75 0 010 1.5h-.5v8a2.75 2.75 0 01-2.75 2.75h-8.5A2.75 2.75 0 013 17.75v-8h-.5a.75.75 0 010-1.5h.5v-2A2.75 2.75 0 015.75 3.75h2.5V3a.75.75 0 01.75-.75zm0 3h-5.25v8h10.5v-8H12zm-5.25-1.5h8.5a1.25 1.25 0 011.25 1.25v.5H5.5v-.5a1.25 1.25 0 011.25-1.25z" />
          </svg>
        ),
      },
      {
        path: "/seller/orders",
        label: "Orders",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M2 3a1 1 0 011-1h3.5a1 1 0 01.959.725l1.159 4.2h11.382l-1.5 9h-10l-.84-3h-1.66a1 1 0 01-.96-1.28l1.5-9A1 1 0 012 3z" />
            <circle cx="10" cy="20" r="1" />
            <circle cx="19" cy="20" r="1" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        path: "/seller/earnings",
        label: "Earnings",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 7 8.5 7 7 7.67 7 8.5 7.67 10 8.5 10zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
          </svg>
        ),
      },
      {
        path: "/seller/analytics",
        label: "Analytics",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M3 13h2v8H3zm4-8h2v16H7zm4-3h2v19h-2zm4 4h2v15h-2zm4-1h2v16h-2z" />
          </svg>
        ),
      },
      {
        path: "/seller/reviews",
        label: "Reviews",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M12 2l3.09 6.26L22 9.27l-7 6.87.17 8.86L12 19.77l-3.17 1.23.17-8.86L2 9.27l6.91-1.01L12 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: "Support",
    items: [
      {
        path: "/seller/notifications",
        label: "Notifications",
        badge: "3",
        icon: (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M18 8A6 6 0 003 9.972M3 9.972V20a1 1 0 001 1h16a1 1 0 001-1v-10.028" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 4h10M9.5 2h5a1.5 1.5 0 110 3h-5a1.5 1.5 0 110-3z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
      },
      {
        path: "/seller/settings",
        label: "Settings",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
          </svg>
        ),
      },
      {
        path: "/profile",
        label: "Profile",
        badge: null,
        icon: (
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
    ],
  },
];

export default function SellerSidebar() {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => {
    if (window.innerWidth < 768) {
      setIsMobileOpen(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <aside className={`seller-sidebar${isOpen ? "" : " collapsed"}${isMobileOpen ? " open-mobile" : ""}`}>
        {/* Toggle Button */}
        <button
          className="seller-toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          aria-label="Toggle sidebar"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {/* Header / Brand */}
        <div className="seller-sidebar-header">
          <Link to="/seller/dashboard" className="seller-logo-mark" title="Go to dashboard">
            S
          </Link>
          <div className="seller-logo-text-wrap">
            <span className="seller-logo-title">Seller</span>
            <span className="seller-logo-sub">Hub</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="seller-nav-section">
          {menuGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="seller-nav-group">
              <div className="seller-nav-group-label">{group.label}</div>
              {group.items.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`seller-nav-item${isActive(item.path) ? " active" : ""}`}
                  onClick={closeMobileMenu}
                  title={item.label}
                >
                  <div className="seller-nav-icon-wrap">{item.icon}</div>
                  <span className="seller-nav-label">{item.label}</span>
                  {item.badge && <span className="seller-nav-badge">{item.badge}</span>}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer / User Profile */}
        <div className="seller-sidebar-footer">
          <Link to="/profile" className="seller-user-card" title="View profile" onClick={closeMobileMenu}>
            <div className="seller-avatar">
              {user?.email?.charAt(0).toUpperCase() || "S"}
              <span className="seller-avatar-dot" />
            </div>
            <div className="seller-user-info">
              <div className="seller-user-name">{user?.shopName || user?.email || "Seller"}</div>
              <div className="seller-user-role">Shop Owner</div>
            </div>
          </Link>
        </div>
      </aside>
    </>
  );
}
