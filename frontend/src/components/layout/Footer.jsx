// Footer.jsx
// Premium E-commerce Footer — white background, luxury editorial style
// Fonts: Playfair Display + Outfit (add to your index.html or import in CSS)
// <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Outfit:wght@300;400;500&display=swap" rel="stylesheet" />

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const styles = {
  footer: {
    backgroundColor: '#ffffff',
    color: '#1a1a1a',
    fontFamily: "'Outfit', sans-serif",
    width: '100%',
    boxSizing: 'border-box',
  },
  inner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '0 2.5rem',
    boxSizing: 'border-box',
  },

  // Newsletter strip
  nlStrip: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    alignItems: 'center',
    gap: '3rem',
    padding: '3.5rem 0 3rem',
    borderBottom: '0.5px solid rgba(0,0,0,0.1)',
  },
  nlHeading: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '28px',
    fontWeight: 400,
    margin: '0 0 6px',
    lineHeight: 1.25,
    color: '#1a1a1a',
  },
  nlSubtext: {
    fontSize: '13px',
    fontWeight: 300,
    color: '#666',
    margin: 0,
    letterSpacing: '0.02em',
  },
  nlForm: {
    display: 'flex',
    border: '0.5px solid rgba(0,0,0,0.2)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  nlInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    padding: '13px 16px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '13px',
    fontWeight: 300,
    background: 'transparent',
    color: '#1a1a1a',
    letterSpacing: '0.02em',
  },
  nlBtn: {
    border: 'none',
    borderLeft: '0.5px solid rgba(0,0,0,0.15)',
    background: '#1a1a1a',
    color: '#ffffff',
    padding: '13px 22px',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    whiteSpace: 'nowrap',
  },
  nlTrust: {
    fontSize: '11px',
    color: '#aaa',
    marginTop: '8px',
    letterSpacing: '0.04em',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },

  // Main grid
  mainGrid: {
    display: 'grid',
    gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr',
    gap: '2.5rem',
    padding: '3rem 0',
    borderBottom: '0.5px solid rgba(0,0,0,0.1)',
  },
  colLabel: {
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#aaa',
    margin: '0 0 1.4rem',
  },
  linksList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  navLink: {
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: 300,
    color: '#555',
    letterSpacing: '0.01em',
    transition: 'color 0.2s',
    display: 'inline-block',
    paddingBottom: '1px',
    borderBottom: '0.5px solid transparent',
  },
  brandName: {
    fontFamily: "'Playfair Display', serif",
    fontSize: '22px',
    fontWeight: 400,
    margin: '0 0 1rem',
    color: '#1a1a1a',
  },
  brandDesc: {
    fontSize: '13px',
    fontWeight: 300,
    lineHeight: 1.75,
    color: '#666',
    margin: '0 0 1.75rem',
    maxWidth: '240px',
  },
  socials: {
    display: 'flex',
    gap: '18px',
  },
  socialLink: {
    textDecoration: 'none',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#aaa',
    transition: 'color 0.2s',
  },

  // Trust strip
  trustStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.5rem',
    padding: '2rem 0',
    borderBottom: '0.5px solid rgba(0,0,0,0.1)',
  },
  trustItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
  },
  trustTitle: {
    fontSize: '13px',
    fontWeight: 500,
    margin: '0 0 2px',
    color: '#1a1a1a',
  },
  trustSub: {
    fontSize: '11px',
    fontWeight: 300,
    color: '#aaa',
    letterSpacing: '0.01em',
  },

  // Bottom bar
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 0',
  },
  copyright: {
    fontSize: '11px',
    fontWeight: 300,
    color: '#aaa',
    letterSpacing: '0.03em',
    margin: 0,
  },
  bottomRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  payments: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  payChip: {
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.05em',
    padding: '4px 8px',
    border: '0.5px solid rgba(0,0,0,0.15)',
    borderRadius: '2px',
    color: '#aaa',
    textTransform: 'uppercase',
    cursor: 'default',
    transition: 'border-color 0.2s, color 0.2s',
  },
  dot: {
    width: '3px',
    height: '3px',
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.15)',
    flexShrink: 0,
  },
  legalLinks: {
    display: 'flex',
    gap: '20px',
    listStyle: 'none',
    margin: 0,
    padding: 0,
  },
  legalLink: {
    fontSize: '11px',
    fontWeight: 300,
    color: '#aaa',
    textDecoration: 'none',
    letterSpacing: '0.03em',
    transition: 'color 0.2s',
  },
};

const TrustIcon = ({ type }) => {
  const stroke = '#888';
  if (type === 'delivery') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="11" stroke={stroke} strokeWidth="1"/>
      <path d="M9 14l3.5 3.5 6.5-7" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (type === 'payment') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <rect x="4" y="8" width="20" height="14" rx="2" stroke={stroke} strokeWidth="1"/>
      <path d="M4 12h20" stroke={stroke} strokeWidth="1"/>
      <path d="M8 16.5h5" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'returns') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 10h12M8 10l3-3M8 10l3 3" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M20 18H8M20 18l-3-3M20 18l-3 3" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  if (type === 'support') return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="14" cy="14" r="11" stroke={stroke} strokeWidth="1"/>
      <path d="M14 9v5.5l3.5 2" stroke={stroke} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
  return null;
};

const NavLink = ({ to, href, children }) => {
  const [hovered, setHovered] = useState(false);
  const linkStyle = {
    ...styles.navLink,
    color: hovered ? '#1a1a1a' : '#555',
    borderBottomColor: hovered ? '#1a1a1a' : 'transparent',
  };
  if (href) return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
    </a>
  );
  return (
    <Link to={to || '/'} style={linkStyle}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      {children}
    </Link>
  );
};

const Footer = ({ categories = [], isCategoriesLoading = false }) => {
  const [email, setEmail] = useState('');
  const [btnHovered, setBtnHovered] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribe:', email);
    setEmail('');
  };

  // Responsive: detect mobile (simple approach, use a resize hook in production)
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  React.useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 600);
      setIsTablet(window.innerWidth < 960);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const responsiveNlStrip = {
    ...styles.nlStrip,
    ...(isTablet ? { gridTemplateColumns: '1fr', gap: '1.5rem' } : {}),
  };

  const responsiveMainGrid = {
    ...styles.mainGrid,
    ...(isMobile
      ? { gridTemplateColumns: '1fr' }
      : isTablet
      ? { gridTemplateColumns: '1fr 1fr', gap: '2rem' }
      : {}),
  };

  const responsiveTrustStrip = {
    ...styles.trustStrip,
    ...(isMobile
      ? { gridTemplateColumns: '1fr' }
      : isTablet
      ? { gridTemplateColumns: '1fr 1fr' }
      : {}),
  };

  const responsiveBottomBar = {
    ...styles.bottomBar,
    ...(isTablet ? { flexDirection: 'column', gap: '1rem', textAlign: 'center' } : {}),
  };

  const responsiveBottomRight = {
    ...styles.bottomRight,
    ...(isTablet ? { flexDirection: 'column', gap: '12px' } : {}),
  };

  const trustItems = [
    { type: 'delivery', title: 'Free Delivery', sub: 'On orders over ৳999' },
    { type: 'payment', title: 'Secure Payment', sub: 'Encrypted & protected' },
    { type: 'returns', title: 'Easy Returns', sub: '7-day hassle-free returns' },
    { type: 'support', title: '24/7 Support', sub: 'Always here to help' },
  ];

  const paymentMethods = ['bKash', 'Nagad', 'Rocket', 'Visa', 'MC', 'COD'];

  return (
    <footer style={styles.footer}>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=Outfit:wght@300;400;500&display=swap"
        rel="stylesheet"
      />

      <div style={styles.inner}>

        {/* Newsletter */}
        <div style={responsiveNlStrip}>
          <div>
            <h2 style={styles.nlHeading}>
              Stay in the <em>loop.</em>
            </h2>
            <p style={styles.nlSubtext}>
              New arrivals, exclusive offers — straight to your inbox.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubscribe} style={styles.nlForm}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={styles.nlInput}
              />
              <button
                type="submit"
                style={{
                  ...styles.nlBtn,
                  opacity: btnHovered ? 0.7 : 1,
                }}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
              >
                Subscribe
              </button>
            </form>
            <p style={styles.nlTrust}>
              <span style={{ display: 'inline-block', width: '14px', height: '0.5px', background: '#ccc' }} />
              No spam. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div style={responsiveMainGrid}>

          {/* Brand */}
          <div>
            <p style={styles.colLabel}>Our Brand</p>
            <p style={styles.brandName}>YourMarket</p>
            <p style={styles.brandDesc}>
              A curated marketplace connecting thoughtful buyers with independent sellers across Bangladesh and beyond.
            </p>
            <div style={styles.socials}>
              {['FB', 'IG', 'YT', 'LI'].map((s) => (
                <SocialLink key={s} href="#">{s}</SocialLink>
              ))}
            </div>
          </div>

          {/* Shop / Categories */}
          <div>
            <p style={styles.colLabel}>Shop</p>
            <ul style={styles.linksList}>
              {isCategoriesLoading ? (
                <li style={{ fontSize: '13px', color: '#aaa' }}>Loading...</li>
              ) : categories.length > 0 ? (
                categories.slice(0, 6).map((cat) => (
                  <li key={cat.id}>
                    <NavLink to={`/products?category=${cat.slug}`}>{cat.name}</NavLink>
                  </li>
                ))
              ) : (
                ['Electronics', 'Fashion', 'Home & Living', 'Beauty', 'Sports', 'Books'].map((c) => (
                  <li key={c}><NavLink to="/products">{c}</NavLink></li>
                ))
              )}
            </ul>
          </div>

          {/* Company */}
          <div>
            <p style={styles.colLabel}>Company</p>
            <ul style={styles.linksList}>
              {['About Us', 'Careers', 'Blog', 'Press', 'Our Mission'].map((item) => (
                <li key={item}><NavLink to="/">{item}</NavLink></li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <p style={styles.colLabel}>Support</p>
            <ul style={styles.linksList}>
              {[
                { label: 'Help Center', to: '/' },
                { label: 'Contact Us', to: '/' },
                { label: 'Track Order', to: '/cart' },
                { label: 'Returns', to: '/' },
                { label: 'Shipping Info', to: '/' },
                { label: 'FAQs', to: '/' },
              ].map((item) => (
                <li key={item.label}><NavLink to={item.to}>{item.label}</NavLink></li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <p style={styles.colLabel}>Account</p>
            <ul style={styles.linksList}>
              {[
                { label: 'Login', to: '/login' },
                { label: 'Register', to: '/register' },
                { label: 'My Orders', to: '/orders' },
                { label: 'Wishlist', to: '/wishlist' },
                { label: 'Become a Seller', to: '/register' },
              ].map((item) => (
                <li key={item.label}><NavLink to={item.to}>{item.label}</NavLink></li>
              ))}
            </ul>
          </div>

        </div>

        {/* Trust Strip */}
        <div style={responsiveTrustStrip}>
          {trustItems.map((item) => (
            <div key={item.type} style={styles.trustItem}>
              <TrustIcon type={item.type} />
              <div>
                <p style={styles.trustTitle}>{item.title}</p>
                <p style={styles.trustSub}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div style={responsiveBottomBar}>
          <p style={styles.copyright}>© 2026 YourMarket. All rights reserved.</p>
          <div style={responsiveBottomRight}>
            <div style={styles.payments}>
              {paymentMethods.map((p) => (
                <PayChip key={p}>{p}</PayChip>
              ))}
            </div>
            <span style={styles.dot} />
            <ul style={styles.legalLinks}>
              {['Privacy Policy', 'Terms', 'Cookies'].map((item) => (
                <li key={item}>
                  <LegalLink to="/">{item}</LegalLink>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </footer>
  );
};

const SocialLink = ({ href, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...styles.socialLink, color: hovered ? '#1a1a1a' : '#aaa' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </a>
  );
};

const PayChip = ({ children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <span
      style={{
        ...styles.payChip,
        borderColor: hovered ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.15)',
        color: hovered ? '#555' : '#aaa',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </span>
  );
};

const LegalLink = ({ to, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      style={{ ...styles.legalLink, color: hovered ? '#1a1a1a' : '#aaa' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
};

export default Footer;