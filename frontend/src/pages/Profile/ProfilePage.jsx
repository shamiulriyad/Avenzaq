import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getMyOrders } from "../../services/orderService";
import { updateProfile } from "../../services/authService";
import { useWishlist } from "../../hooks/useWishlist";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "overview";
  const { user, isAuthenticated, logout } = useAuth();
  const isCustomer = user?.role === "Customer";
  const isSeller = user?.role === "Seller";
  const isAdmin = user?.role === "Admin";
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const { wishlist, removeFromWishlist } = useWishlist();
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    avatar: user?.avatar || ""
  });

  // Sync profileForm with user data whenever user changes
  useEffect(() => {
    setProfileForm({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      avatar: user?.avatar || ""
    });
  }, [user]);

  const roleDashboardPath = useMemo(() => {
    if (user?.role === "Admin") return "/admin/dashboard";
    if (user?.role === "Seller") return "/seller/dashboard";
    return "/profile";
  }, [user?.role]);

  useEffect(() => {
    const customerTabs = new Set(["overview", "orders", "wishlist", "settings"]);
    const privilegedTabs = new Set(["overview", "settings"]);
    const allowedTabs = isCustomer ? customerTabs : privilegedTabs;

    if (!allowedTabs.has(tab)) {
      setSearchParams({ tab: "overview" });
    }
  }, [isCustomer, setSearchParams, tab]);

  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([]);
      return;
    }

    if (!isCustomer) {
      setOrders([]);
      setOrdersError("");
      return;
    }

    setLoadingOrders(true);
    setOrdersError("");

    getMyOrders()
      .then((data) => {
        setOrders(data || []);
      })
      .catch(() => {
        setOrdersError("Unable to load your order history right now.");
      })
      .finally(() => {
        setLoadingOrders(false);
      });

    // Load recently viewed from localStorage
    const viewed = localStorage.getItem('recentlyViewed');
    if (viewed) {
      setRecentlyViewed(JSON.parse(viewed));
    }
  }, [isAuthenticated, isCustomer]);

  const dashboardStats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalItems = orders.reduce(
      (sum, order) => sum + (order.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0),
      0
    );
    const lastOrderDate = orders[0]?.createdAtUtc || null;

    return { totalOrders, totalSpent, totalItems, lastOrderDate };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  const handleTabChange = (newTab) => {
    setSearchParams({ tab: newTab });
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({
        fullName: profileForm.fullName,
        phone: profileForm.phone,
        avatar: profileForm.avatar
      });
      setEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    removeFromWishlist(productId);
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: { bg: '#feebc8', text: '#744210' },
      processing: { bg: '#fed7d7', text: '#742a2a' },
      shipped: { bg: '#bee3f8', text: '#1e4a6b' },
      delivered: { bg: '#c6f6d5', text: '#22543d' },
      cancelled: { bg: '#e2e8f0', text: '#4a5568' }
    };
    return colors[status?.toLowerCase()] || colors.pending;
  };

  if (!isAuthenticated) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.notLoggedInCard}>
            <div style={styles.lockIcon}>🔒</div>
            <h1 style={styles.heading}>My Profile</h1>
            <p style={styles.text}>Please login to view your profile and order history.</p>
            <div style={styles.buttonGroup}>
              <button 
                style={styles.primaryButton} 
                onClick={() => navigate("/login")}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#0e3a9c'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#1a56db'}
              >
                Sign In
              </button>
              <button 
                style={styles.secondaryButton}
                onClick={() => navigate("/register")}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f7fafc'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
              >
                Create Account
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        {/* Header with User Info */}
        <div style={styles.header}>
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {profileForm.avatar ? (
                <img src={profileForm.avatar} alt={user?.fullName} style={styles.avatarImage} />
              ) : (
                <span style={styles.avatarFallback}>
                  {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div>
              <h1 style={styles.heading}>Welcome back, {user?.fullName || 'User'}!</h1>
              <p style={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          
          <div style={styles.headerActions}>
            <Link to={roleDashboardPath} style={styles.linkButton}>
              {user?.role === 'Seller' ? 'Seller Dashboard' : 
               user?.role === 'Admin' ? 'Admin Dashboard' : 'Dashboard'}
            </Link>
            <button
              style={styles.dangerButton}
              onClick={() => {
                logout();
                navigate("/");
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#dc2626';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff1f2';
                e.target.style.color = '#be123c';
              }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div style={styles.completionBar}>
          <div style={styles.completionHeader}>
            <span style={styles.completionTitle}>Profile Completion</span>
            <span style={styles.completionPercentage}>75%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{...styles.progressFill, width: '75%'}}></div>
          </div>
          <p style={styles.completionHint}>Add your phone number to complete your profile</p>
        </div>

        {/* Tabs Navigation */}
        <div style={styles.tabs}>
          <button
            style={{
              ...styles.tabButton,
              ...(tab === 'overview' ? styles.tabButtonActive : {})
            }}
            onClick={() => handleTabChange('overview')}
          >
            Overview
          </button>
          {isCustomer && (
            <button
              style={{
                ...styles.tabButton,
                ...(tab === 'orders' ? styles.tabButtonActive : {})
              }}
              onClick={() => handleTabChange('orders')}
            >
              Orders
            </button>
          )}
          {isCustomer && (
            <button
              style={{
                ...styles.tabButton,
                ...(tab === 'wishlist' ? styles.tabButtonActive : {})
              }}
              onClick={() => handleTabChange('wishlist')}
            >
              Wishlist
            </button>
          )}
          <button
            style={{
              ...styles.tabButton,
              ...(tab === 'settings' ? styles.tabButtonActive : {})
            }}
            onClick={() => handleTabChange('settings')}
          >
            Settings
          </button>
        </div>

        {/* Tab Content */}
        <div style={styles.tabContent}>
          {/* Overview Tab */}
          {tab === 'overview' && (
            <>
              {/* Stats Grid */}
              {isCustomer ? (
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <span style={styles.statIcon}>📦</span>
                    <div>
                      <span style={styles.statLabel}>Total Orders</span>
                      <span style={styles.statValue}>{dashboardStats.totalOrders}</span>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statIcon}>🛍️</span>
                    <div>
                      <span style={styles.statLabel}>Products Bought</span>
                      <span style={styles.statValue}>{dashboardStats.totalItems}</span>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statIcon}>💰</span>
                    <div>
                      <span style={styles.statLabel}>Total Spent</span>
                      <span style={styles.statValue}>${dashboardStats.totalSpent.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statIcon}>📅</span>
                    <div>
                      <span style={styles.statLabel}>Member Since</span>
                      <span style={styles.statValue}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.statsGrid}>
                  <div style={styles.statCard}>
                    <span style={styles.statIcon}>🛡️</span>
                    <div>
                      <span style={styles.statLabel}>Current Role</span>
                      <span style={styles.statValue}>{user?.role || 'User'}</span>
                    </div>
                  </div>
                  <div style={styles.statCard}>
                    <span style={styles.statIcon}>📅</span>
                    <div>
                      <span style={styles.statLabel}>Member Since</span>
                      <span style={styles.statValue}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions and Account Info */}
              <div style={styles.overviewGrid}>
                <div style={styles.card}>
                  <h2 style={styles.subHeading}>Account Information</h2>
                  <div style={styles.infoList}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Full Name</span>
                      <span style={styles.infoValue}>{user?.fullName || "Not set"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Email</span>
                      <span style={styles.infoValue}>{user?.email}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Phone</span>
                      <span style={styles.infoValue}>{user?.phone || "Not added"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Role</span>
                      <span style={styles.roleBadge}>{user?.role || "Customer"}</span>
                    </div>
                  </div>
                  <button 
                    style={styles.editButton}
                    onClick={() => handleTabChange('settings')}
                  >
                    Edit Profile
                  </button>
                </div>

                <div style={styles.card}>
                  <h2 style={styles.subHeading}>Quick Actions</h2>
                  <div style={styles.quickActions}>
                    {isCustomer && (
                      <>
                        <Link to="/cart" style={styles.quickAction}>
                          <span style={styles.quickActionIcon}>🛒</span>
                          <span>View Cart</span>
                        </Link>
                        <Link to="/products" style={styles.quickAction}>
                          <span style={styles.quickActionIcon}>🔍</span>
                          <span>Continue Shopping</span>
                        </Link>
                      </>
                    )}
                    {isSeller && (
                      <>
                        <Link to="/seller/products" style={styles.quickAction}>
                          <span style={styles.quickActionIcon}>📋</span>
                          <span>Add Product</span>
                        </Link>
                        <Link to="/seller/orders" style={styles.quickAction}>
                          <span style={styles.quickActionIcon}>📦</span>
                          <span>Seller Orders</span>
                        </Link>
                      </>
                    )}
                    {isAdmin && (
                      <>
                        <Link to="/admin/dashboard" style={styles.quickAction}>
                          <span style={styles.quickActionIcon}>📊</span>
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link to="/admin/sellers" style={styles.quickAction}>
                          <span style={styles.quickActionIcon}>✅</span>
                          <span>Manage Sellers</span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                {/* Recently Viewed */}
                {isCustomer && recentlyViewed.length > 0 && (
                  <div style={styles.card}>
                    <h2 style={styles.subHeading}>Recently Viewed</h2>
                    <div style={styles.recentlyViewed}>
                      {recentlyViewed.slice(0, 4).map((item) => (
                        <Link to={`/products/${item.id}`} key={item.id} style={styles.recentItem}>
                          <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} style={styles.recentImage} />
                          <span style={styles.recentName}>{item.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Recent Orders Preview */}
              {isCustomer && recentOrders.length > 0 && (
                <div style={styles.card}>
                  <div style={styles.sectionHeader}>
                    <h2 style={styles.subHeading}>Recent Orders</h2>
                    <button 
                      style={styles.viewAllButton}
                      onClick={() => handleTabChange('orders')}
                    >
                      View All →
                    </button>
                  </div>
                  <div style={styles.recentOrdersList}>
                    {recentOrders.map((order) => {
                      const statusColor = getStatusBadge(order.status);
                      return (
                        <Link to={`/orders/${order.id}`} key={order.id} style={styles.recentOrderRow}>
                          <div style={styles.recentOrderInfo}>
                            <span style={styles.recentOrderId}>#{String(order.id).slice(0, 8)}</span>
                            <span style={styles.recentOrderDate}>
                              {new Date(order.createdAtUtc).toLocaleDateString()}
                            </span>
                          </div>
                          <span style={styles.recentOrderAmount}>${Number(order.totalAmount || 0).toFixed(2)}</span>
                          <span style={{
                            ...styles.orderStatusBadge,
                            backgroundColor: statusColor.bg,
                            color: statusColor.text
                          }}>
                            {order.status}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Orders Tab */}
          {isCustomer && tab === 'orders' && (
            <div style={styles.card}>
              <h2 style={styles.subHeading}>Order History</h2>
              {loadingOrders ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.loadingSpinner}></div>
                  <p style={styles.loadingText}>Loading your orders...</p>
                </div>
              ) : ordersError ? (
                <div style={styles.errorContainer}>
                  <p style={styles.errorText}>{ordersError}</p>
                  <button 
                    style={styles.retryButton}
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </button>
                </div>
              ) : orders.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>📦</span>
                  <h3 style={styles.emptyTitle}>No orders yet</h3>
                  <p style={styles.emptyText}>When you place orders, they will appear here.</p>
                  <Link to="/categories" style={styles.shopButton}>
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div style={styles.ordersList}>
                  {orders.map((order) => {
                    const statusColor = getStatusBadge(order.status);
                    return (
                      <div key={order.id} style={styles.orderCard}>
                        <div style={styles.orderHeader}>
                          <div>
                            <div style={styles.orderTitle}>
                              Order #{String(order.id).slice(0, 8)}
                              <span style={styles.orderDate}>
                                {new Date(order.createdAtUtc).toLocaleDateString()}
                              </span>
                            </div>
                            <div style={styles.orderMeta}>
                              <span style={{
                                ...styles.orderStatusBadge,
                                backgroundColor: statusColor.bg,
                                color: statusColor.text
                              }}>
                                {order.status}
                              </span>
                              <span style={styles.paymentStatus}>
                                Payment: {order.paymentStatus}
                              </span>
                            </div>
                          </div>
                          <div style={styles.orderAmount}>${Number(order.totalAmount || 0).toFixed(2)}</div>
                        </div>

                        <div style={styles.addressBox}>
                          <span style={styles.addressLabel}>Shipping Address</span>
                          <span style={styles.addressText}>{order.shippingAddress || "Not available"}</span>
                        </div>

                        <div style={styles.itemsSection}>
                          <div style={styles.itemsHeading}>Items ({order.items?.length || 0})</div>
                          <div style={styles.itemsGrid}>
                            {(order.items || []).map((item) => (
                              <div key={`${order.id}-${item.productId}`} style={styles.itemCard}>
                                <div style={styles.itemImageWrap}>
                                  {item.primaryImageUrl ? (
                                    <img src={item.primaryImageUrl} alt={item.productName} style={styles.itemImage} />
                                  ) : (
                                    <div style={styles.itemImagePlaceholder}>
                                      {item.productName?.charAt(0) || '📦'}
                                    </div>
                                  )}
                                </div>
                                <div style={styles.itemContent}>
                                  <div style={styles.itemName}>{item.productName}</div>
                                  <div style={styles.itemMeta}>Qty: {item.quantity}</div>
                                  <div style={styles.itemPrice}>${Number(item.lineTotal || 0).toFixed(2)}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div style={styles.orderActions}>
                          <Link to={`/orders/${order.id}`} style={styles.orderActionLink}>
                            View Details
                          </Link>
                          {order.status === 'delivered' && (
                            <button style={styles.orderActionButton}>
                              Write Review
                            </button>
                          )}
                          {order.status === 'shipped' && (
                            <button style={styles.orderActionButton}>
                              Track Order
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Wishlist Tab */}
          {isCustomer && tab === 'wishlist' && (
            <div style={styles.card}>
              <h2 style={styles.subHeading}>My Wishlist</h2>
              {wishlist.length === 0 ? (
                <div style={styles.emptyState}>
                  <span style={styles.emptyIcon}>❤️</span>
                  <h3 style={styles.emptyTitle}>Your wishlist is empty</h3>
                  <p style={styles.emptyText}>Save items you love to your wishlist.</p>
                  <Link to="/categories" style={styles.shopButton}>
                    Explore Products
                  </Link>
                </div>
              ) : (
                <div style={styles.wishlistGrid}>
                  {wishlist.map((item) => (
                    <div key={item.id} style={styles.wishlistItem}>
                      <button 
                        style={styles.removeWishlist}
                        onClick={() => handleRemoveFromWishlist(item.id)}
                      >
                        ×
                      </button>
                      <Link to={`/products/${item.id}`} style={styles.wishlistLink}>
                        <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} style={styles.wishlistImage} />
                        <h4 style={styles.wishlistName}>{item.name}</h4>
                        <p style={styles.wishlistPrice}>${item.price}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {tab === 'settings' && (
            <div style={styles.card}>
              <h2 style={styles.subHeading}>Profile Settings</h2>
              
              {editingProfile ? (
                <form onSubmit={handleProfileUpdate} style={styles.settingsForm}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Full Name</label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                      style={styles.formInput}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Email</label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      style={styles.formInput}
                      placeholder="Your email"
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      style={styles.formInput}
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Avatar URL</label>
                    <input
                      type="url"
                      value={profileForm.avatar}
                      onChange={(e) => setProfileForm({...profileForm, avatar: e.target.value})}
                      style={styles.formInput}
                      placeholder="https://example.com/avatar.jpg"
                    />
                  </div>
                  
                  <div style={styles.formActions}>
                    <button 
                      type="button" 
                      style={styles.cancelButton}
                      onClick={() => setEditingProfile(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      style={styles.saveButton}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#0e3a9c'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#1a56db'}
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div style={styles.settingsInfo}>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Full Name</span>
                      <span style={styles.infoValue}>{user?.fullName || "Not set"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Email</span>
                      <span style={styles.infoValue}>{user?.email}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Phone</span>
                      <span style={styles.infoValue}>{user?.phone || "Not added"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Account Type</span>
                      <span style={styles.infoValue}>{user?.role || "Customer"}</span>
                    </div>
                    <div style={styles.infoRow}>
                      <span style={styles.infoLabel}>Member Since</span>
                      <span style={styles.infoValue}>
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                  
                  <button 
                    style={styles.editProfileButton}
                    onClick={() => setEditingProfile(true)}
                  >
                    Edit Profile
                  </button>

                  <div style={styles.dangerZone}>
                    <h3 style={styles.dangerZoneTitle}>Danger Zone</h3>
                    <button 
                      style={styles.deleteAccountButton}
                      onClick={() => {
                        if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                          console.log("Delete account");
                        }
                      }}
                    >
                      Delete Account
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap');

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 1024px) {
            div[style*="grid-template-columns: repeat(4, 1fr)"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
            div[style*="grid-template-columns: repeat(3, 1fr)"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }

          @media (max-width: 768px) {
            div[style*="flex-direction: row; justify-content: space-between;"] {
              flex-direction: column !important;
              gap: 1rem !important;
            }
            div[style*="grid-template-columns: repeat(4, 1fr)"] {
              grid-template-columns: 1fr !important;
            }
            div[style*="grid-template-columns: 2fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </section>
  );
}

const styles = {
  section: {
    background: "#f8fafc",
    minHeight: "calc(100vh - 200px)",
    padding: "3rem 0",
    fontFamily: "'DM Sans', sans-serif",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 2rem",
  },
  notLoggedInCard: {
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    border: "1px solid rgba(26, 86, 219, 0.1)",
    padding: "4rem 2rem",
    textAlign: "center",
    maxWidth: "500px",
    margin: "0 auto",
  },
  lockIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    justifyContent: "center",
    marginTop: "2rem",
  },
  primaryButton: {
    background: "#1a56db",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "0.75rem 2rem",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "background-color 0.2s ease",
  },
  secondaryButton: {
    background: "#ffffff",
    color: "#1a56db",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    borderRadius: "8px",
    padding: "0.75rem 2rem",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    fontSize: "1rem",
    transition: "background-color 0.2s ease",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "1.5rem",
  },
  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    backgroundColor: "#e6f0ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    border: "2px solid #1a56db",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarFallback: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "#1a56db",
    textTransform: "uppercase",
  },
  heading: {
    margin: 0,
    color: "#1a56db",
    fontFamily: "'Instrument Serif', serif",
    fontSize: "2rem",
  },
  userEmail: {
    color: "#64748b",
    fontSize: "0.95rem",
    margin: "0.25rem 0 0 0",
  },
  headerActions: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  linkButton: {
    textDecoration: "none",
    background: "#eff6ff",
    color: "#1a56db",
    border: "1px solid #bfdbfe",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "background-color 0.2s ease",
  },
  dangerButton: {
    border: "1px solid #fecaca",
    background: "#fff1f2",
    color: "#be123c",
    borderRadius: "8px",
    padding: "0.6rem 1.2rem",
    cursor: "pointer",
    fontFamily: "inherit",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
  },
  completionBar: {
    backgroundColor: "#ffffff",
    border: "1px solid rgba(26, 86, 219, 0.1)",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "2rem",
  },
  completionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  completionTitle: {
    color: "#4a5568",
    fontSize: "0.95rem",
  },
  completionPercentage: {
    color: "#1a56db",
    fontWeight: 600,
  },
  progressBar: {
    height: "6px",
    backgroundColor: "#e2e8f0",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "0.5rem",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#1a56db",
    borderRadius: "3px",
    transition: "width 0.3s ease",
  },
  completionHint: {
    color: "#718096",
    fontSize: "0.85rem",
    margin: 0,
  },
  tabs: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "2rem",
    borderBottom: "1px solid rgba(26, 86, 219, 0.1)",
    paddingBottom: "0.5rem",
    overflowX: "auto",
  },
  tabButton: {
    padding: "0.75rem 1.5rem",
    border: "none",
    backgroundColor: "transparent",
    fontSize: "1rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#718096",
    borderBottom: "2px solid transparent",
    whiteSpace: "nowrap",
  },
  tabButtonActive: {
    color: "#1a56db",
    borderBottomColor: "#1a56db",
  },
  tabContent: {
    marginBottom: "2rem",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "1rem",
    marginBottom: "2rem",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid rgba(26, 86, 219, 0.1)",
    borderRadius: "10px",
    padding: "1.5rem",
    display: "flex",
    alignItems: "center",
    gap: "1rem",
  },
  statIcon: {
    fontSize: "2rem",
  },
  statLabel: {
    display: "block",
    color: "#64748b",
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
  },
  statValue: {
    display: "block",
    color: "#1a56db",
    fontSize: "1.5rem",
    fontWeight: 700,
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1rem",
    marginBottom: "1rem",
  },
  card: {
    background: "#ffffff",
    border: "1px solid rgba(26, 86, 219, 0.1)",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "1rem",
  },
  subHeading: {
    margin: "0 0 1rem 0",
    color: "#1a56db",
    fontSize: "1.25rem",
    fontFamily: "'Instrument Serif', serif",
  },
  infoList: {
    marginBottom: "1.5rem",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 0",
    borderBottom: "1px solid rgba(26, 86, 219, 0.1)",
  },
  infoLabel: {
    color: "#64748b",
    fontSize: "0.95rem",
  },
  infoValue: {
    color: "#2d3748",
    fontWeight: 500,
  },
  roleBadge: {
    backgroundColor: "#e6f0ff",
    color: "#1a56db",
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  editButton: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#f7fafc",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    borderRadius: "6px",
    color: "#1a56db",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  quickActions: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem",
  },
  quickAction: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem",
    backgroundColor: "#f7fafc",
    border: "1px solid rgba(26, 86, 219, 0.1)",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#2d3748",
    transition: "all 0.2s ease",
  },
  quickActionIcon: {
    fontSize: "1.2rem",
  },
  recentlyViewed: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "0.75rem",
  },
  recentItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    backgroundColor: "#f7fafc",
    borderRadius: "6px",
    textDecoration: "none",
    color: "#2d3748",
  },
  recentImage: {
    width: "40px",
    height: "40px",
    borderRadius: "4px",
    objectFit: "cover",
  },
  recentName: {
    fontSize: "0.9rem",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  viewAllButton: {
    background: "none",
    border: "none",
    color: "#1a56db",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  recentOrdersList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  recentOrderRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem",
    backgroundColor: "#f7fafc",
    borderRadius: "6px",
    textDecoration: "none",
  },
  recentOrderInfo: {
    display: "flex",
    flexDirection: "column",
  },
  recentOrderId: {
    color: "#1a56db",
    fontWeight: 500,
  },
  recentOrderDate: {
    color: "#718096",
    fontSize: "0.85rem",
  },
  recentOrderAmount: {
    color: "#2d3748",
    fontWeight: 600,
  },
  orderStatusBadge: {
    padding: "0.25rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: 500,
  },
  loadingContainer: {
    textAlign: "center",
    padding: "3rem",
  },
  loadingSpinner: {
    width: "40px",
    height: "40px",
    border: "3px solid rgba(26, 86, 219, 0.1)",
    borderTop: "3px solid #1a56db",
    borderRadius: "50%",
    margin: "0 auto 1rem",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    color: "#718096",
  },
  errorContainer: {
    textAlign: "center",
    padding: "2rem",
  },
  errorText: {
    color: "#dc2626",
    marginBottom: "1rem",
  },
  retryButton: {
    padding: "0.5rem 1.5rem",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    borderRadius: "6px",
    color: "#1a56db",
    cursor: "pointer",
  },
  emptyState: {
    textAlign: "center",
    padding: "3rem",
  },
  emptyIcon: {
    fontSize: "3rem",
    marginBottom: "1rem",
    display: "block",
  },
  emptyTitle: {
    color: "#1a56db",
    fontSize: "1.25rem",
    marginBottom: "0.5rem",
  },
  emptyText: {
    color: "#718096",
    marginBottom: "1.5rem",
  },
  shopButton: {
    display: "inline-block",
    backgroundColor: "#1a56db",
    color: "#ffffff",
    textDecoration: "none",
    padding: "0.75rem 2rem",
    borderRadius: "6px",
    fontSize: "1rem",
    transition: "background-color 0.2s ease",
  },
  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  orderCard: {
    border: "1px solid rgba(26, 86, 219, 0.1)",
    borderRadius: "12px",
    padding: "1.5rem",
    background: "#ffffff",
  },
  orderHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "1rem",
  },
  orderTitle: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginBottom: "0.5rem",
  },
  orderDate: {
    color: "#718096",
    fontSize: "0.9rem",
    fontWeight: "normal",
  },
  orderMeta: {
    display: "flex",
    gap: "1rem",
    alignItems: "center",
  },
  paymentStatus: {
    color: "#718096",
    fontSize: "0.9rem",
  },
  orderAmount: {
    color: "#1a56db",
    fontWeight: 700,
    fontSize: "1.25rem",
  },
  addressBox: {
    backgroundColor: "#f7fafc",
    borderRadius: "8px",
    padding: "1rem",
    marginBottom: "1rem",
  },
  addressLabel: {
    display: "block",
    color: "#718096",
    fontSize: "0.85rem",
    marginBottom: "0.25rem",
  },
  addressText: {
    color: "#2d3748",
    fontSize: "0.95rem",
  },
  itemsSection: {
    marginBottom: "1rem",
  },
  itemsHeading: {
    color: "#2d3748",
    fontWeight: 600,
    marginBottom: "0.75rem",
  },
  itemsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "0.75rem",
  },
  itemCard: {
    display: "flex",
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#f7fafc",
    borderRadius: "8px",
  },
  itemImageWrap: {
    width: "50px",
    height: "50px",
    borderRadius: "6px",
    overflow: "hidden",
    flexShrink: 0,
  },
  itemImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  itemImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e6f0ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1a56db",
    fontSize: "1.2rem",
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    color: "#2d3748",
    fontWeight: 500,
    fontSize: "0.9rem",
    marginBottom: "0.25rem",
  },
  itemMeta: {
    color: "#718096",
    fontSize: "0.8rem",
  },
  itemPrice: {
    color: "#1a56db",
    fontWeight: 600,
    fontSize: "0.9rem",
    marginTop: "0.25rem",
  },
  orderActions: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(26, 86, 219, 0.1)",
  },
  orderActionLink: {
    color: "#1a56db",
    textDecoration: "none",
    fontSize: "0.9rem",
    padding: "0.25rem 0",
  },
  orderActionButton: {
    backgroundColor: "transparent",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    borderRadius: "4px",
    padding: "0.25rem 1rem",
    color: "#2d3748",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  wishlistGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "1rem",
  },
  wishlistItem: {
    position: "relative",
    border: "1px solid rgba(26, 86, 219, 0.1)",
    borderRadius: "8px",
    overflow: "hidden",
  },
  removeWishlist: {
    position: "absolute",
    top: "0.5rem",
    right: "0.5rem",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#718096",
    zIndex: 1,
  },
  wishlistLink: {
    textDecoration: "none",
    color: "inherit",
  },
  wishlistImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
  },
  wishlistName: {
    padding: "0.5rem",
    fontSize: "0.95rem",
    color: "#2d3748",
    margin: 0,
  },
  wishlistPrice: {
    padding: "0 0.5rem 0.5rem",
    color: "#1a56db",
    fontWeight: 600,
    margin: 0,
  },
  settingsForm: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  formLabel: {
    color: "#4a5568",
    fontSize: "0.95rem",
    fontWeight: 500,
  },
  formInput: {
    padding: "0.75rem",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    borderRadius: "6px",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  formActions: {
    display: "flex",
    gap: "1rem",
    marginTop: "1rem",
  },
  cancelButton: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "#ffffff",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    borderRadius: "6px",
    color: "#718096",
    cursor: "pointer",
    fontSize: "0.95rem",
  },
  saveButton: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "#1a56db",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: 500,
    transition: "background-color 0.2s ease",
  },
  settingsInfo: {
    marginBottom: "2rem",
  },
  editProfileButton: {
    width: "100%",
    padding: "0.75rem",
    backgroundColor: "#f7fafc",
    border: "1px solid rgba(26, 86, 219, 0.2)",
    borderRadius: "6px",
    color: "#1a56db",
    cursor: "pointer",
    fontSize: "0.95rem",
    marginBottom: "2rem",
  },
  dangerZone: {
    borderTop: "1px solid #fecaca",
    paddingTop: "1.5rem",
  },
  dangerZoneTitle: {
    color: "#dc2626",
    fontSize: "1rem",
    marginBottom: "1rem",
  },
  deleteAccountButton: {
    padding: "0.75rem",
    backgroundColor: "#fff1f2",
    border: "1px solid #fecaca",
    borderRadius: "6px",
    color: "#dc2626",
    cursor: "pointer",
    fontSize: "0.95rem",
    width: "100%",
  },
};