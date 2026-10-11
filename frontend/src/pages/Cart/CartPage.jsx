import { Link } from "react-router-dom";
import CartItemRow from "../../components/cart/CartItemRow";
import CartSummary from "../../components/cart/CartSummary";
import { useCart } from "../../hooks/useCart";
import { useState } from "react";

export default function CartPage() {
  const { cart, updateCartItem, removeCartItem } = useCart();
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoCode.toLowerCase() === "welcome10") {
      setPromoApplied(true);
    }
  };

  const cartItems = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const itemCount = cartItems.length;

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.heading}>Shopping Cart</h1>
          <p style={styles.itemCount}>{itemCount} {itemCount === 1 ? 'item' : 'items'}</p>
        </div>

        {itemCount === 0 ? (
          <div style={styles.emptyCart}>
            <div style={styles.emptyCartContent}>
              <svg 
                width="64" 
                height="64" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="rgba(26, 86, 219, 0.3)" 
                strokeWidth="1"
                style={styles.emptyIcon}
              >
                <circle cx="9" cy="21" r="1" fill="currentColor"/>
                <circle cx="20" cy="21" r="1" fill="currentColor"/>
                <path d="M1 1h4l2.5 13h13l2-9H6" stroke="currentColor" strokeLinecap="round"/>
              </svg>
              <p style={styles.emptyText}>Your cart is empty</p>
              <Link 
                to="/categories" 
                style={styles.shopButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0e3a9c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1a56db';
                }}
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <div style={styles.cartGrid}>
            {/* Cart Items */}
            <div style={styles.cartItems}>
              <div style={styles.cartHeader}>
                <span style={styles.cartHeaderProduct}>Product</span>
                <span style={styles.cartHeaderPrice}>Price</span>
                <span style={styles.cartHeaderQuantity}>Quantity</span>
                <span style={styles.cartHeaderTotal}>Total</span>
                <span style={styles.cartHeaderAction}></span>
              </div>
              
              {cartItems.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  onQtyChange={updateCartItem}
                  onRemove={removeCartItem}
                />
              ))}
            </div>

            {/* Cart Summary Sidebar */}
            <div style={styles.summarySidebar}>
              <CartSummary totalAmount={totalAmount} items={cartItems} />
              
              {/* Promo Code */}
              <div style={styles.promoSection}>
                <h3 style={styles.promoHeading}>Promo Code</h3>
                <form onSubmit={handleApplyPromo} style={styles.promoForm}>
                  <input
                    type="text"
                    placeholder="Enter code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={styles.promoInput}
                    disabled={promoApplied}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#1a56db';
                      e.target.style.boxShadow = '0 0 0 3px rgba(26, 86, 219, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  <button 
                    type="submit" 
                    style={promoApplied ? styles.promoButtonApplied : styles.promoButton}
                    disabled={promoApplied}
                    onMouseEnter={(e) => {
                      if (!promoApplied) e.target.style.backgroundColor = '#0e3a9c';
                    }}
                    onMouseLeave={(e) => {
                      if (!promoApplied) e.target.style.backgroundColor = '#1a56db';
                    }}
                  >
                    {promoApplied ? 'Applied ✓' : 'Apply'}
                  </button>
                </form>
                {!promoApplied && (
                  <p style={styles.promoHint}>Try "WELCOME10" for 10% off</p>
                )}
              </div>

              {/* Checkout Button */}
              <Link 
                to="/checkout" 
                style={styles.checkoutButton}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#0e3a9c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#1a56db';
                }}
              >
                Proceed to Checkout
              </Link>

              {/* Payment Methods */}
              <div style={styles.paymentMethods}>
                <p style={styles.paymentText}>We accept:</p>
                <div style={styles.paymentIcons}>
                  <span style={styles.paymentIcon}>bKash</span>
                  <span style={styles.paymentIcon}>Nagad</span>
                  <span style={styles.paymentIcon}>Visa</span>
                  <span style={styles.paymentIcon}>MasterCard</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Continue Shopping Link */}
        {itemCount > 0 && (
          <div style={styles.continueShopping}>
            <Link 
              to="/categories" 
              style={styles.continueLink}
              onMouseEnter={(e) => {
                e.target.style.color = '#0e3a9c';
                e.target.style.borderBottomColor = '#0e3a9c';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#1a56db';
                e.target.style.borderBottomColor = 'transparent';
              }}
            >
              ← Continue Shopping
            </Link>
          </div>
        )}
      </div>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap');
          
          @media (max-width: 768px) {
            div[style*="grid-template-columns: 2fr 1fr"] {
              grid-template-columns: 1fr !important;
            }
            div[style*="display: grid; gap: 1.5rem; grid-template-columns: 2fr 1fr;"] {
              grid-template-columns: 1fr !important;
            }
            div[style*="display: grid; grid-template-columns: 2fr 1fr 0.5fr 1fr 40px;"] {
              display: none !important;
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2.5rem',
  },
  heading: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '2.5rem',
    fontWeight: 600,
    color: '#1a56db',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  itemCount: {
    fontSize: '1rem',
    color: '#718096',
    backgroundColor: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    margin: 0,
  },
  emptyCart: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    padding: '4rem 2rem',
    textAlign: 'center',
  },
  emptyCartContent: {
    maxWidth: '400px',
    margin: '0 auto',
  },
  emptyIcon: {
    marginBottom: '1.5rem',
    color: '#cbd5e0',
  },
  emptyText: {
    fontSize: '1.2rem',
    color: '#4a5568',
    marginBottom: '2rem',
  },
  shopButton: {
    display: 'inline-block',
    backgroundColor: '#1a56db',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '0.875rem 2rem',
    borderRadius: '6px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
    transition: 'background-color 0.2s ease',
  },
  cartGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '2rem',
  },
  cartItems: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    padding: '1.5rem',
  },
  cartHeader: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 0.5fr 1fr 40px',
    gap: '1rem',
    padding: '0 0 1rem 0',
    borderBottom: '1px solid rgba(26, 86, 219, 0.1)',
    marginBottom: '1rem',
    color: '#718096',
    fontSize: '0.9rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  cartHeaderProduct: {
    textAlign: 'left',
  },
  cartHeaderPrice: {
    textAlign: 'right',
  },
  cartHeaderQuantity: {
    textAlign: 'center',
  },
  cartHeaderTotal: {
    textAlign: 'right',
  },
  cartHeaderAction: {
    textAlign: 'right',
  },
  summarySidebar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  promoSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    padding: '1.5rem',
  },
  promoHeading: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '1.2rem',
    color: '#1a56db',
    marginBottom: '1rem',
    marginTop: 0,
  },
  promoForm: {
    display: 'flex',
    gap: '0.75rem',
  },
  promoInput: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '6px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  },
  promoButton: {
    backgroundColor: '#1a56db',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    whiteSpace: 'nowrap',
  },
  promoButtonApplied: {
    backgroundColor: '#48bb78',
    color: '#ffffff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem',
    fontWeight: 500,
    cursor: 'not-allowed',
    whiteSpace: 'nowrap',
  },
  promoHint: {
    fontSize: '0.85rem',
    color: '#a0aec0',
    marginTop: '0.75rem',
    marginBottom: 0,
  },
  checkoutButton: {
    display: 'block',
    backgroundColor: '#1a56db',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '1rem',
    borderRadius: '6px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '1.1rem',
    fontWeight: 500,
    textAlign: 'center',
    transition: 'background-color 0.2s ease',
  },
  paymentMethods: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    padding: '1.5rem',
  },
  paymentText: {
    fontSize: '0.9rem',
    color: '#718096',
    marginBottom: '0.75rem',
    marginTop: 0,
  },
  paymentIcons: {
    display: 'flex',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  paymentIcon: {
    backgroundColor: '#f7fafc',
    padding: '0.4rem 1rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    color: '#2d3748',
    border: '1px solid rgba(26, 86, 219, 0.1)',
  },
  continueShopping: {
    marginTop: '2rem',
    textAlign: 'center',
  },
  continueLink: {
    color: '#1a56db',
    textDecoration: 'none',
    fontSize: '1rem',
    borderBottom: '1px solid transparent',
    paddingBottom: '2px',
    transition: 'color 0.2s ease, borderBottomColor 0.2s ease',
  },
};