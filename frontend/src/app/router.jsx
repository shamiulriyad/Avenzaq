import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../pages/Home/HomePage";
import ProductListPage from "../pages/Products/ProductListPage";
import ProductDetailsPage from "../pages/Products/ProductDetailsPage";
import ShopPage from "../pages/Shop/ShopPage";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import NotificationsPage from "../pages/Notifications/NotificationsPage";
import SellerDashboardPage from "../pages/Seller/SellerDashboardPage";
import SellerProductsPage from "../pages/Seller/SellerProductsPage";
import AddProductPage from "../pages/Seller/AddProductPage";
import SellerProductDetailPage from "../pages/Seller/SellerProductDetailPage";
import SellerOrdersPage from "../pages/Seller/SellerOrdersPage";
import SellerApplyPage from "../pages/Seller/SellerApplyPage";
import SellerSettingsPage from "../pages/Seller/SellerSettingsPage";
import SellerEarningsPage from "../pages/Seller/SellerEarningsPage";
import SellerReviewsPage from "../pages/Seller/SellerReviewsPage";
import SellerAnalyticsPage from "../pages/Seller/SellerAnalyticsPage";
import SellerNotificationsPage from "../pages/Seller/SellerNotificationsPage";
import AdminDashboardPage from "../pages/Admin/AdminDashboardPage";
import AdminSellersPage from "../pages/Admin/AdminSellersPage";
import AdminUsersPage from "../pages/Admin/AdminUsersPage";
import AdminProductsPage from "../pages/Admin/AdminProductsPage";
import AdminOrdersPage from "../pages/Admin/AdminOrdersPage";
import AdminCategoriesPage from "../pages/Admin/AdminCategoriesPage";
import AdminPromotionsPage from "../pages/Admin/AdminPromotionsPage";
import AdminReportsPage from "../pages/Admin/AdminReportsPage";
import AdminSettingsPage from "../pages/Admin/AdminSettingsPage";
import AdminLayout from "../components/layout/AdminLayout";
import SellerLayout from "../components/layout/SellerLayout";
import { RequireAuth, RequireRole } from "./guards/RoleRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<ProductListPage />} />
      <Route path="/products/:id" element={<ProductDetailsPage />} />
      <Route path="/shop/:shopSlug" element={<ShopPage />} />
      <Route
        path="/cart"
        element={
          <RequireRole allowedRoles={["Customer"]}>
            <CartPage />
          </RequireRole>
        }
      />
      <Route
        path="/checkout"
        element={
          <RequireRole allowedRoles={["Customer"]}>
            <CheckoutPage />
          </RequireRole>
        }
      />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        }
      />
      <Route
        path="/notifications"
        element={
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/seller/apply"
        element={
          <RequireRole allowedRoles={["Customer"]}>
            <SellerApplyPage />
          </RequireRole>
        }
      />
      <Route
        path="/seller/dashboard"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <SellerDashboardPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/seller/products"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <SellerProductsPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/seller/products/new"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <AddProductPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/seller/products/add"
        element={<Navigate to="/seller/products/new" replace />}
      />
      <Route
        path="/seller/products/:productId"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <SellerProductDetailPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <SellerOrdersPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/seller/reviews"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <SellerReviewsPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/seller/earnings"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <SellerEarningsPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/seller/analytics"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <SellerAnalyticsPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/seller/notifications"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <SellerNotificationsPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/seller/settings"
        element={
          <RequireRole allowedRoles={["Seller"]}>
            <SellerLayout>
              <SellerSettingsPage />
            </SellerLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/dashboard"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/sellers"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <AdminSellersPage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/products"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <AdminProductsPage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <AdminOrdersPage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <AdminCategoriesPage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/promotions"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <AdminPromotionsPage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <AdminReportsPage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <AdminSettingsPage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <RequireRole allowedRoles={["Admin"]}>
            <AdminLayout>
              <ProfilePage />
            </AdminLayout>
          </RequireRole>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
