/* eslint-disable no-undef */
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAllShops } from "../../services/shopService";

// Design Tokens (match Navbar)
const T = {
  brand: "#1a56db",
  brandHover: "#1447c0",
  ink: "#0f172a",
  muted: "#64748b",
  faint: "#f8fafc",
  line: "#e2e8f0",
  white: "#ffffff",
};

const S = {
  button: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "400",
    color: T.ink,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: "nowrap",
  },
  buttonHover: {
    background: T.faint,
    color: T.brand,
    borderColor: T.line,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "6px",
    background: T.white,
    border: `1px solid ${T.line}`,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    zIndex: 1000,
    minWidth: "280px",
    maxWidth: "320px",
    animation: "dropIn 0.2s ease",
  },
  dropdownContent: {
    maxHeight: "400px",
    overflowY: "auto",
  },
  shopItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderBottom: `0.5px solid ${T.line}`,
    cursor: "pointer",
    transition: "background 0.15s ease",
    fontSize: "13px",
    color: T.ink,
  },
  shopLogo: {
    width: "40px",
    height: "40px",
    borderRadius: "6px",
    background: T.faint,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "10px",
    fontWeight: "600",
    color: T.brand,
    overflow: "hidden",
  },
  shopInfo: {
    flex: 1,
  },
  shopName: {
    fontWeight: "500",
    color: T.ink,
    marginBottom: "2px",
  },
  shopRating: {
    fontSize: "11px",
    color: T.muted,
  },
  viewAllButton: {
    width: "100%",
    padding: "10px 16px",
    textAlign: "center",
    borderTop: `1px solid ${T.line}`,
    color: T.brand,
    fontSize: "13px",
    fontWeight: "500",
    background: "transparent",
    border: "none",
    cursor: "pointer",
    transition: "background 0.15s ease",
  },
  loadingText: {
    padding: "16px",
    textAlign: "center",
    color: T.muted,
    fontSize: "13px",
  },
  errorText: {
    padding: "16px",
    textAlign: "center",
    color: "#dc2626",
    fontSize: "13px",
  },
  emptyText: {
    padding: "16px",
    textAlign: "center",
    color: T.muted,
    fontSize: "13px",
  },
};

const Icon = {
  Store: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  ChevronDown: ({ open }) => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Star: ({ filled }) => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? "#fbbf24" : "none"} stroke={filled ? "#fbbf24" : currentColor} strokeWidth="2">
      <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 19.85 24.29 12 18.54 4.15 24.29 6.23 16.01 0 10.35 8.91 10.26 12 2" />
    </svg>
  ),
};

export default function ShopsMenu() {
  const routerNavigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastShop, setLastShop] = useState(null);
  const dropdownRef = useRef(null);

  // Load last visited shop from localStorage
  useEffect(() => {
    const lastShopSlug = localStorage.getItem("lastShop");
    if (lastShopSlug) {
      setLastShop(lastShopSlug);
    }
  }, [open]);

  // Load shops when dropdown opens
  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const loadShops = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getAllShops();
        if (isMounted) {
          setShops(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError("Unable to load shops");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadShops();

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleShopClick = (shopSlug) => {
    localStorage.setItem("lastVisitedShop", shopSlug);
    routerNavigate(`/shop/${shopSlug}`);
    setOpen(false);
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      {/* Button */}
      <button
        style={{
          ...S.button,
          ...(open && S.buttonHover),
        }}
        onClick={() => setOpen(!open)}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = S.buttonHover.background;
            e.currentTarget.style.color = S.buttonHover.color;
            e.currentTarget.style.borderColor = S.buttonHover.borderColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = S.button.background;
            e.currentTarget.style.color = S.button.color;
            e.currentTarget.style.borderColor = S.button.borderColor;
          }
        }}
        title="Browse all shops"
      >
        <Icon.Store />
        <span>Shops</span>
        <Icon.ChevronDown open={open} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={S.dropdown}>
          {loading && <div style={S.loadingText}>Loading shops...</div>}
          {error && <div style={S.errorText}>{error}</div>}
          {!loading && !error && shops.length === 0 && (
            <div style={S.emptyText}>No shops available</div>
          )}

          {!loading && !error && lastShop && (
            <div>
              <button
                style={{
                  ...S.viewAllButton,
                  width: "100%",
                  textAlign: "left",
                  color: T.brand,
                  fontWeight: "500",
                  padding: "12px 16px",
                  borderTop: "none",
                  borderBottom: `1px solid ${T.line}`,
                }}
                onClick={() => {
                  routerNavigate(`/shop/${lastShop}`);
                  setOpen(false);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.faint;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
                title="Go to your last visited shop"
              >
                ← Last Visited Shop
              </button>
            </div>
          )}

          {!loading && !error && shops.length > 0 && (
            <>
              <div style={S.dropdownContent}>
                {shops.slice(0, 8).map((shop) => (
                  <div
                    key={shop.id}
                    style={S.shopItem}
                    onClick={() => handleShopClick(shop.slug)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = T.faint;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {shop.logoUrl ? (
                      <img
                        src={shop.logoUrl}
                        alt={shop.name}
                        style={{
                          ...S.shopLogo,
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={S.shopLogo}>{shop.name.charAt(0).toUpperCase()}</div>
                    )}
                    <div style={S.shopInfo}>
                      <div style={S.shopName}>{shop.name}</div>
                      <div style={S.shopRating}>
                        ⭐ {shop.rating?.toFixed(1) || "N/A"} rating
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {shops.length > 8 && (
                <button
                  style={S.viewAllButton}
                  onClick={() => {
                    routerNavigate("/shops");
                    setOpen(false);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = T.faint;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  View all shops →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
