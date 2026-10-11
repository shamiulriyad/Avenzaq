import { BrowserRouter } from "react-router-dom";
import { useLocation } from "react-router-dom";
import AppRouter from "./app/router";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { CategoryProvider } from "./context/CategoryContext";
import "./styles/variables.css";
import "./styles/globals.css";
import "./components/layout/AdminLayout.css";
import "./styles/admin-modern.css";

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isSellerRoute = location.pathname.startsWith("/seller");

  return (
    <div className="app-shell">
      {!isAdminRoute && !isSellerRoute && <Navbar />}
      <AppRouter />
      {!isAdminRoute && !isSellerRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CategoryProvider>
          <CartProvider>
            <AppLayout />
          </CartProvider>
        </CategoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
