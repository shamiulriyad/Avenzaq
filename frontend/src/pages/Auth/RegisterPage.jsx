import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const homeByRole = (role) => {
    if (role === "Admin") return "/admin/dashboard";
    if (role === "Seller") return "/seller/dashboard";
    return "/";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const auth = await register(form);
      navigate(homeByRole(auth.role));
    } catch (err) {
      const apiMessage = err?.response?.data?.message;
      setError(apiMessage || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Create Account</h2>
          <p style={styles.subheading}>Join YourMarketplace today</p>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={onSubmit} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a56db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26, 86, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a56db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26, 86, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={6}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1a56db';
                  e.target.style.boxShadow = '0 0 0 3px rgba(26, 86, 219, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(26, 86, 219, 0.2)';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <p style={styles.passwordHint}>Minimum 6 characters</p>
            </div>
            
            <div style={styles.terms}>
              <input 
                type="checkbox" 
                id="terms" 
                required 
                style={styles.checkbox}
              />
              <label htmlFor="terms" style={styles.termsText}>
                I agree to the{" "}
                <a href="/terms" style={styles.termsLink}>Terms of Service</a>{" "}
                and{" "}
                <a href="/privacy" style={styles.termsLink}>Privacy Policy</a>
              </label>
            </div>
            
            <button 
              type="submit" 
              style={styles.button}
              disabled={isLoading}
              onMouseEnter={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#0e3a9c';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.target.style.backgroundColor = '#1a56db';
              }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
          
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Already have an account?{" "}
              <a 
                href="/login" 
                style={styles.footerLink}
                onMouseEnter={(e) => {
                  e.target.style.color = '#0e3a9c';
                  e.target.style.borderBottomColor = '#0e3a9c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#1a56db';
                  e.target.style.borderBottomColor = 'transparent';
                }}
              >
                Sign in
              </a>
            </p>
          </div>

          <div style={styles.benefits}>
            <p style={styles.benefitsTitle}>Join as a:</p>
            <div style={styles.benefitTags}>
              <span style={styles.benefitTag}>🛒 Buyer</span>
              <span style={styles.benefitTag}>🏪 Seller</span>
              <span style={styles.benefitTag}>🚚 Both</span>
            </div>
          </div>
        </div>
      </div>
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&display=swap');
        `}
      </style>
    </section>
  );
}

const styles = {
  section: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafc',
    fontFamily: "'DM Sans', sans-serif",
    padding: '2rem',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '2.5rem',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
    border: '1px solid rgba(26, 86, 219, 0.1)',
  },
  heading: {
    fontFamily: "'Instrument Serif', serif",
    fontSize: '2rem',
    fontWeight: 600,
    color: '#1a56db',
    marginBottom: '0.5rem',
    letterSpacing: '-0.02em',
    textAlign: 'center',
  },
  subheading: {
    fontSize: '0.95rem',
    color: '#718096',
    marginBottom: '2rem',
    textAlign: 'center',
  },
  error: {
    backgroundColor: '#fff5f5',
    color: '#e53e3e',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    marginBottom: '1.5rem',
    fontSize: '0.9rem',
    border: '1px solid #feb2b2',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#4a5568',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid rgba(26, 86, 219, 0.2)',
    borderRadius: '6px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.95rem',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  passwordHint: {
    fontSize: '0.8rem',
    color: '#a0aec0',
    marginTop: '0.25rem',
  },
  terms: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  checkbox: {
    width: '1rem',
    height: '1rem',
    marginTop: '0.125rem',
    cursor: 'pointer',
    accentColor: '#1a56db',
  },
  termsText: {
    fontSize: '0.9rem',
    color: '#4a5568',
    lineHeight: 1.5,
  },
  termsLink: {
    color: '#1a56db',
    textDecoration: 'none',
    borderBottom: '1px solid transparent',
    transition: 'color 0.2s ease, borderBottomColor 0.2s ease',
    paddingBottom: '1px',
  },
  button: {
    backgroundColor: '#1a56db',
    color: '#ffffff',
    border: 'none',
    padding: '0.875rem',
    borderRadius: '6px',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '1rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '0.5rem',
    width: '100%',
    opacity: 1,
  },
  footer: {
    marginTop: '2rem',
    textAlign: 'center',
    paddingTop: '1.5rem',
    borderTop: '1px solid rgba(26, 86, 219, 0.1)',
  },
  footerText: {
    fontSize: '0.9rem',
    color: '#718096',
    margin: 0,
  },
  footerLink: {
    color: '#1a56db',
    textDecoration: 'none',
    fontWeight: 500,
    borderBottom: '1px solid transparent',
    paddingBottom: '2px',
    transition: 'color 0.2s ease, borderBottomColor 0.2s ease',
  },
  benefits: {
    marginTop: '1.5rem',
    padding: '1.25rem',
    backgroundColor: '#f7fafc',
    borderRadius: '8px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    textAlign: 'center',
  },
  benefitsTitle: {
    fontSize: '0.9rem',
    color: '#4a5568',
    fontWeight: 500,
    marginBottom: '0.75rem',
  },
  benefitTags: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  benefitTag: {
    backgroundColor: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    fontSize: '0.85rem',
    color: '#2d3748',
    border: '1px solid rgba(26, 86, 219, 0.15)',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
  },
};