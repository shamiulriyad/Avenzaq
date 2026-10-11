import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getSellerOrders, updateSellerOrderStatus } from "../../services/orderService";

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSellerOrders({
        status: filterStatus !== "all" ? filterStatus : undefined,
        search: searchTerm || undefined,
        dateRange: dateRange !== "all" ? dateRange : undefined
      });
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  }, [filterStatus, searchTerm, dateRange]);

  useEffect(() => {
    load();
  }, [filterStatus, dateRange, load]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const markShipped = async (id) => {
    setUpdatingOrder(id);
    try {
      await updateSellerOrderStatus(id, "shipped");
      await load();
    } finally {
      setUpdatingOrder(null);
    }
  };

  const markDelivered = async (id) => {
    setUpdatingOrder(id);
    try {
      await updateSellerOrderStatus(id, "delivered");
      await load();
    } finally {
      setUpdatingOrder(null);
    }
  };

  const cancelOrder = async (id) => {
    if (window.confirm("Are you sure you want to cancel this order?")) {
      setUpdatingOrder(id);
      try {
        await updateSellerOrderStatus(id, "cancelled");
        await load();
      } finally {
        setUpdatingOrder(null);
      }
    }
  };

  const bulkUpdate = async (status) => {
    if (selectedOrders.length === 0) return;
    if (window.confirm(`Update ${selectedOrders.length} orders to ${status}?`)) {
      setLoading(true);
      try {
        await Promise.all(selectedOrders.map(id => updateSellerOrderStatus(id, status)));
        setSelectedOrders([]);
        await load();
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleSelectOrder = (orderId) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(o => o.id));
    }
  };

  // Filter orders based on search
  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#feebc8', text: '#744210' },
      processing: { bg: '#fed7d7', text: '#742a2a' },
      shipped: { bg: '#bee3f8', text: '#1e4a6b' },
      delivered: { bg: '#c6f6d5', text: '#22543d' },
      cancelled: { bg: '#e2e8f0', text: '#4a5568' }
    };
    return colors[status] || { bg: '#e2e8f0', text: '#4a5568' };
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return {
      ...styles.statusBadge,
      backgroundColor: color.bg,
      color: color.text
    };
  };

  if (loading && orders.length === 0) {
    return (
      <section style={styles.section}>
        <div style={styles.container}>
          <div style={styles.loadingContainer}>
            <div style={styles.loadingSpinner}></div>
            <p style={styles.loadingText}>Loading orders...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.heading}>Seller Orders</h1>
            <p style={styles.orderCount}>Total Orders: {stats.total}</p>
          </div>
          
          <Link 
            to="/seller/dashboard" 
            style={styles.backLink}
            onMouseEnter={(e) => {
              e.target.style.color = '#0e3a9c';
              e.target.style.borderBottomColor = '#0e3a9c';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#1a56db';
              e.target.style.borderBottomColor = 'transparent';
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Pending</span>
            <span style={styles.statValue}>{stats.pending}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Processing</span>
            <span style={styles.statValue}>{stats.processing}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Shipped</span>
            <span style={styles.statValue}>{stats.shipped}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Delivered</span>
            <span style={styles.statValue}>{stats.delivered}</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Cancelled</span>
            <span style={styles.statValue}>{stats.cancelled}</span>
          </div>
        </div>

        {/* Filters and Search */}
        <div style={styles.filtersContainer}>
          <form onSubmit={handleSearch} style={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a56db';
                e.target.style.boxShadow = '0 0 0 3px rgba(26, 86, 219, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button type="submit" style={styles.searchButton}>Search</button>
          </form>

          <div style={styles.filterGroup}>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={styles.filterSelect}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a56db';
                e.target.style.boxShadow = '0 0 0 3px rgba(26, 86, 219, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={styles.filterSelect}
              onFocus={(e) => {
                e.target.style.borderColor = '#1a56db';
                e.target.style.boxShadow = '0 0 0 3px rgba(26, 86, 219, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div style={styles.bulkActions}>
            <span style={styles.bulkSelected}>{selectedOrders.length} orders selected</span>
            <div style={styles.bulkButtons}>
              <button
                style={styles.bulkButton}
                onClick={() => bulkUpdate('processing')}
              >
                Mark as Processing
              </button>
              <button
                style={styles.bulkButton}
                onClick={() => bulkUpdate('shipped')}
              >
                Mark as Shipped
              </button>
              <button
                style={{...styles.bulkButton, ...styles.bulkButtonDanger}}
                onClick={() => bulkUpdate('cancelled')}
              >
                Cancel Selected
              </button>
            </div>
          </div>
        )}

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={styles.noOrders}>
            <svg 
              width="64" 
              height="64" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="rgba(26, 86, 219, 0.3)" 
              strokeWidth="1"
              style={styles.noOrdersIcon}
            >
              <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor"/>
            </svg>
            <h3 style={styles.noOrdersHeading}>No orders found</h3>
            <p style={styles.noOrdersText}>
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your filters'
                : 'You haven\'t received any orders yet'}
            </p>
            {(searchTerm || filterStatus !== 'all') && (
              <button 
                style={styles.clearFiltersButton}
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setDateRange('all');
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f7fafc'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div style={styles.ordersList}>
            {/* Table Header */}
            <div style={styles.orderHeader}>
              <div style={styles.checkboxCell}>
                <input
                  type="checkbox"
                  checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                  onChange={toggleSelectAll}
                  style={styles.checkbox}
                />
              </div>
              <div style={styles.orderIdCell}>Order ID</div>
              <div style={styles.customerCell}>Customer</div>
              <div style={styles.dateCell}>Date</div>
              <div style={styles.itemsCell}>Items</div>
              <div style={styles.totalCell}>Total</div>
              <div style={styles.statusCell}>Status</div>
              <div style={styles.actionsCell}>Actions</div>
            </div>

            {/* Order Rows */}
            {filteredOrders.map((order) => (
              <article key={order.id} style={styles.orderRow}>
                <div style={styles.checkboxCell}>
                  <input
                    type="checkbox"
                    checked={selectedOrders.includes(order.id)}
                    onChange={() => toggleSelectOrder(order.id)}
                    style={styles.checkbox}
                  />
                </div>
                
                <div style={styles.orderIdCell}>
                  <Link to={`/seller/orders/${order.id}`} style={styles.orderIdLink}>
                    #{order.id.slice(0, 8)}
                  </Link>
                </div>
                
                <div style={styles.customerCell}>
                  <div style={styles.customerInfo}>
                    <span style={styles.customerName}>{order.customerName || 'Guest'}</span>
                    {order.customerEmail && (
                      <span style={styles.customerEmail}>{order.customerEmail}</span>
                    )}
                  </div>
                </div>
                
                <div style={styles.dateCell}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </div>
                
                <div style={styles.itemsCell}>
                  {order.items?.length || 0} items
                </div>
                
                <div style={styles.totalCell}>
                  <span style={styles.orderTotal}>${order.total || order.subtotal}</span>
                  {order.paymentMethod && (
                    <span style={styles.paymentMethod}>{order.paymentMethod}</span>
                  )}
                </div>
                
                <div style={styles.statusCell}>
                  <span style={getStatusBadge(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                
                <div style={styles.actionsCell}>
                  <div style={styles.actionButtons}>
                    {order.status === 'pending' && (
                      <>
                        <button
                          style={styles.actionButton}
                          onClick={() => markShipped(order.id)}
                          disabled={updatingOrder === order.id}
                          onMouseEnter={(e) => {
                            if (updatingOrder !== order.id) {
                              e.target.style.backgroundColor = '#0e3a9c';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (updatingOrder !== order.id) {
                              e.target.style.backgroundColor = '#1a56db';
                            }
                          }}
                        >
                          {updatingOrder === order.id ? '...' : 'Ship'}
                        </button>
                        <button
                          style={{...styles.actionButton, ...styles.actionButtonDanger}}
                          onClick={() => cancelOrder(order.id)}
                          disabled={updatingOrder === order.id}
                          onMouseEnter={(e) => {
                            if (updatingOrder !== order.id) {
                              e.target.style.backgroundColor = '#c53030';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (updatingOrder !== order.id) {
                              e.target.style.backgroundColor = '#f56565';
                            }
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {order.status === 'processing' && (
                      <button
                        style={styles.actionButton}
                        onClick={() => markShipped(order.id)}
                        disabled={updatingOrder === order.id}
                      >
                        {updatingOrder === order.id ? '...' : 'Mark Shipped'}
                      </button>
                    )}
                    {order.status === 'shipped' && (
                      <button
                        style={styles.actionButton}
                        onClick={() => markDelivered(order.id)}
                        disabled={updatingOrder === order.id}
                      >
                        {updatingOrder === order.id ? '...' : 'Mark Delivered'}
                      </button>
                    )}
                    <Link 
                      to={`/seller/orders/${order.id}`}
                      style={styles.viewLink}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#0e3a9c';
                        e.target.style.borderBottomColor = '#0e3a9c';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#1a56db';
                        e.target.style.borderBottomColor = 'transparent';
                      }}
                    >
                      View
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Export Button */}
        {filteredOrders.length > 0 && (
          <div style={styles.exportSection}>
            <button
              style={styles.exportButton}
              onClick={() => {
                // Export functionality
                console.log('Export orders:', filteredOrders);
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f7fafc'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
            >
              📊 Export Orders
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap');

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (max-width: 1024px) {
            div[style*="grid-template-columns: repeat(5, 1fr)"] {
              grid-template-columns: repeat(3, 1fr) !important;
            }
            div[style*="display: grid; grid-template-columns: 40px 100px 1fr 100px 80px 100px 100px 120px;"] {
              display: none !important;
            }
          }

          @media (max-width: 768px) {
            div[style*="flex-direction: row; justify-content: space-between;"] {
              flex-direction: column !important;
              gap: 1rem !important;
            }
            div[style*="grid-template-columns: repeat(5, 1fr)"] {
              grid-template-columns: repeat(2, 1fr) !important;
            }
          }
        `}
      </style>
    </section>
  );
}

const styles = {
  section: {
    backgroundColor: '#f9fafc',
    fontFamily: "'DM Sans', sans-serif",
    minHeight: 'calc(100vh - 200px)',
    padding: '3rem 0',
  },
  container: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2rem',
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '4rem 2rem',
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '3px solid rgba(26, 86, 219, 0.1)',
    borderTop: '3px solid #1a56db',
    borderRadius: '50%',
    margin: '0 auto 1rem',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#718096',
    fontSize: '1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  heading: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '2.5rem',
    color: '#1a56db',
    margin: 0,
  },
  orderCount: {
    color: '#718096',
    fontSize: '1rem',
    margin: '0.5rem 0 0 0',
  },
  backLink: {
    color: '#1a56db',
    textDecoration: 'none',
    fontSize: '1rem',
    borderBottom: '1px solid transparent',
    paddingBottom: '2px',
    transition: 'color 0.2s ease, borderBottomColor 0.2s ease',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    padding: '1rem',
    textAlign: 'center',
  },
  statLabel: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#718096',
    marginBottom: '0.25rem',
  },
  statValue: {
    display: 'block',
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#1a56db',
  },
  filtersContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  searchBox: {
    flex: 2,
    display: 'flex',
    gap: '0.5rem',
    minWidth: '300px',
  },
  searchInput: {
    flex: 1,
    padding: '0.75rem 1rem',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '6px',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  searchButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1a56db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  filterGroup: {
    flex: 1,
    display: 'flex',
    gap: '0.5rem',
    minWidth: '250px',
  },
  filterSelect: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '6px',
    fontSize: '0.95rem',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  bulkActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ebf4ff',
    border: '1px solid #1a56db',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1.5rem',
  },
  bulkSelected: {
    color: '#1a56db',
    fontWeight: 500,
  },
  bulkButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  bulkButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#ffffff',
    border: '1px solid #1a56db',
    borderRadius: '4px',
    color: '#1a56db',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  bulkButtonDanger: {
    borderColor: '#f56565',
    color: '#f56565',
  },
  ordersList: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    overflow: 'hidden',
  },
  orderHeader: {
    display: 'grid',
    gridTemplateColumns: '40px 100px 1fr 100px 80px 100px 100px 120px',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f7fafc',
    borderBottom: '1px solid rgba(26, 86, 219, 0.1)',
    fontWeight: 600,
    color: '#4a5568',
    fontSize: '0.9rem',
  },
  orderRow: {
    display: 'grid',
    gridTemplateColumns: '40px 100px 1fr 100px 80px 100px 100px 120px',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid rgba(26, 86, 219, 0.1)',
    transition: 'background-color 0.2s ease',
  },
  checkboxCell: {
    display: 'flex',
    alignItems: 'center',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#1a56db',
  },
  orderIdCell: {
    display: 'flex',
    alignItems: 'center',
  },
  orderIdLink: {
    color: '#1a56db',
    textDecoration: 'none',
    fontWeight: 500,
  },
  customerCell: {
    display: 'flex',
    alignItems: 'center',
  },
  customerInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  customerName: {
    color: '#2d3748',
    fontWeight: 500,
  },
  customerEmail: {
    color: '#718096',
    fontSize: '0.85rem',
  },
  dateCell: {
    display: 'flex',
    alignItems: 'center',
    color: '#4a5568',
    fontSize: '0.95rem',
  },
  itemsCell: {
    display: 'flex',
    alignItems: 'center',
    color: '#718096',
  },
  totalCell: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  orderTotal: {
    color: '#1a56db',
    fontWeight: 600,
  },
  paymentMethod: {
    color: '#718096',
    fontSize: '0.85rem',
  },
  statusCell: {
    display: 'flex',
    alignItems: 'center',
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  actionsCell: {
    display: 'flex',
    alignItems: 'center',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  actionButton: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#1a56db',
    color: '#ffffff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  actionButtonDanger: {
    backgroundColor: '#f56565',
  },
  viewLink: {
    color: '#1a56db',
    textDecoration: 'none',
    fontSize: '0.85rem',
    borderBottom: '1px solid transparent',
    paddingBottom: '1px',
  },
  noOrders: {
    textAlign: 'center',
    padding: '4rem 2rem',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
  },
  noOrdersIcon: {
    marginBottom: '1.5rem',
    color: '#cbd5e0',
  },
  noOrdersHeading: {
    fontSize: '1.5rem',
    color: '#1a56db',
    marginBottom: '0.5rem',
  },
  noOrdersText: {
    color: '#718096',
    marginBottom: '1.5rem',
  },
  clearFiltersButton: {
    backgroundColor: '#ffffff',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    padding: '0.75rem 2rem',
    borderRadius: '6px',
    fontSize: '0.95rem',
    color: '#1a56db',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  exportSection: {
    marginTop: '2rem',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  exportButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '6px',
    fontSize: '0.95rem',
    color: '#2d3748',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
};