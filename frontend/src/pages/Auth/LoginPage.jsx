import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
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
      const auth = await login(form);
      navigate(homeByRole(auth.role));
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section style={styles.section}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Welcome Back</h2>
          <p style={styles.subheading}>Sign in to continue to YourMarketplace</p>
          
          {error && <div style={styles.error}>{error}</div>}
          
          <form onSubmit={onSubmit} style={styles.form}>
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
              />
            </div>
            
            <div style={styles.forgotPassword}>
              <a href="/forgot-password" style={styles.forgotLink}>Forgot password?</a>
            </div>
            
            <button 
              type="submit" 
              style={styles.button}
              disabled={isLoading}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#0e3a9c'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#1a56db'}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          
          <div style={styles.footer}>
            <p style={styles.footerText}>
              Don't have an account?{" "}
              <a href="/register" style={styles.footerLink}>Create an account</a>
            </p>
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
    maxWidth: '440px',
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
  inputFocus: {
    borderColor: '#1a56db',
    boxShadow: '0 0 0 3px rgba(26, 86, 219, 0.1)',
  },
  forgotPassword: {
    textAlign: 'right',
    marginTop: '-0.5rem',
  },
  forgotLink: {
    color: '#718096',
    fontSize: '0.85rem',
    textDecoration: 'none',
    transition: 'color 0.2s ease',
    borderBottom: '1px solid transparent',
    paddingBottom: '2px',
  },
  forgotLinkHover: {
    color: '#1a56db',
    borderBottomColor: '#1a56db',
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
  },
  buttonHover: {
    backgroundColor: '#0e3a9c',
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
    transition: 'color 0.2s ease',
    borderBottom: '1px solid transparent',
    paddingBottom: '2px',
  },
  footerLinkHover: {
    color: '#0e3a9c',
    borderBottomColor: '#0e3a9c',
  },
  demoCredentials: {
    marginTop: '1.5rem',
    padding: '1rem',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
    border: '1px solid rgba(26, 86, 219, 0.1)',
    textAlign: 'center',
  },
  demoText: {
    fontSize: '0.9rem',
    color: '#4a5568',
    fontWeight: 500,
    marginBottom: '0.5rem',
  },
  demoTextSmall: {
    fontSize: '0.85rem',
    color: '#718096',
    margin: '0.25rem 0',
  },
};