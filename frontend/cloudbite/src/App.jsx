/* eslint-disable no-unused-vars */
import React, { useState, useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, AuthContext } from "./components/AuthControls/AuthContext";

import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import ThemeProviderCustom from "./context/ThemeContext";

// ---------- Public ----------
import Home from "./components/Home/Home";
import KitchenMenuPage from "./components/Home/KitchenMenuPage";
import ForgotPassword from "./pages/ForgotPassword";
import CustomerRegister from "./pages/Customer/CustomerRegister";
import SendOTP from "./pages/SendOTP";
import VerifyOTP from "./pages/VerifyOTP";
import DishSearch from "./components/Home/DishSearch";

// ---------- Customer ----------
import CustomerDashboard from "./pages/Customer/CustomerDashboard";
import CustomerProfile from "./pages/Customer/CustomerProfile";
import CustomerCartPage from "./components/Home/CustomerCartPage";
import CheckoutPage from "./pages/Customer/CheckoutPage";
import OrderSuccess from "./pages/Customer/OrderSuccess";
// import CustomerOrders from "./pages/Customer/CustomerOrders";
import OrderTrackingPage from "./pages/Customer/OrderTrackingPage";

// ---------- Kitchen Owner ----------
import KitchenDashboard from "./pages/KitchenOwner/KitchenDashboard";
import ManageMenu from "./pages/KitchenOwner/ManageMenu";
import AddDish from "./pages/KitchenOwner/AddDish";
import KitchenProfile from "./pages/KitchenOwner/KitchenProfile";
import KitchenOrdersPage from "./pages/KitchenOwner/KitchenOrdersPage";

// ---------- Admin ----------
import AdminDashboard from "./pages/Admin/AdminDashboard";
import RegisterKitchen from "./pages/Admin/RegisterKitchen";
import ManageKitchens from "./pages/Admin/ManageKitchens";
import ViewOrders from "./pages/Admin/ViewOrders";
import RegisterDeliveryPartner from "./pages/Admin/RegisterDeliveryPartner";
import ManageDeliveryPartners from "./pages/Admin/ManageDeliveryPartners";

// ---------- Delivery Partner ----------
import DeliveryDashboard from "./pages/DeliveryPartner/DeliveryDashboard";
import ActiveOrders from "./pages/DeliveryPartner/ActiveOrders";
import DeliveryHistory from "./pages/DeliveryPartner/DeliveryHistory";
import DeliveryLayout from "./pages/DeliveryPartner/DeliveryLayout";
import DeliveryProfile from "./pages/DeliveryPartner/DeliveryProfile";

// ---------- Auth Modal ----------
import AuthModal from "./components/AuthControls/AuthModal";

// ================= PRIVATE ROUTE =================
const PrivateRoute = ({ element: Element, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // or loader UI
  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "ROLE_ADMIN":
        return <Navigate to="/admin/dashboard" replace />;
      case "ROLE_KITCHEN_OWNER":
        return <Navigate to="/kitchen/dashboard" replace />;
      case "ROLE_DELIVERY_PARTNER":
        return <Navigate to="/delivery/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <Element />;
};

// ================= ROUTES =================
const AppRoutes = () => {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route path="/" element={user ? <CustomerDashboard /> : <Home />} />
      <Route path="/search" element={<DishSearch />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/send-otp" element={<SendOTP />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/customer/track/:orderId" element={<OrderTrackingPage />} />

      {/* ---------- Customer ---------- */}
      <Route
        path="/customer/profile"
        element={
          <PrivateRoute
            element={CustomerProfile}
            allowedRoles={["ROLE_CUSTOMER"]}
          />
        }
      />
      {/* <Route
        path="/customer/orders"
        element={<PrivateRoute element={CustomerOrders} allowedRoles={["ROLE_CUSTOMER"]} />}
      /> */}
      <Route path="/customer/cart" element={<CustomerCartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/order-success" element={<OrderSuccess />} />

      {/* ---------- Kitchen Owner ---------- */}
      <Route
        path="/kitchen/dashboard"
        element={
          <PrivateRoute
            element={KitchenDashboard}
            allowedRoles={["ROLE_KITCHEN_OWNER"]}
          />
        }
      />
      <Route
        path="/kitchen/manage-menu"
        element={
          <PrivateRoute
            element={ManageMenu}
            allowedRoles={["ROLE_KITCHEN_OWNER"]}
          />
        }
      />
      <Route
        path="/kitchen/add-dish"
        element={
          <PrivateRoute
            element={AddDish}
            allowedRoles={["ROLE_KITCHEN_OWNER"]}
          />
        }
      />
      <Route
        path="/kitchen/profile"
        element={
          <PrivateRoute
            element={KitchenProfile}
            allowedRoles={["ROLE_KITCHEN_OWNER"]}
          />
        }
      />
      <Route
        path="/kitchen/orders"
        element={
          <PrivateRoute
            element={KitchenOrdersPage}
            allowedRoles={["ROLE_KITCHEN_OWNER"]}
          />
        }
      />
      <Route path="/kitchen/:kitchenId" element={<KitchenMenuPage />} />

      {/* ---------- Delivery Partner ---------- */}
      <Route
        path="/delivery"
        element={
          <PrivateRoute
            element={DeliveryLayout}
            allowedRoles={["ROLE_DELIVERY_PARTNER"]}
          />
        }
      >
        <Route index element={<DeliveryDashboard />} />
        <Route path="dashboard" element={<DeliveryDashboard />} />
        <Route path="active-orders" element={<ActiveOrders />} />
        <Route path="profile" element={<DeliveryProfile />} />
        <Route path="history" element={<DeliveryHistory />} />
      </Route>

      {/* ---------- Admin ---------- */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute element={AdminDashboard} allowedRoles={["ROLE_ADMIN"]} />
        }
      />
      <Route
        path="/admin/register-kitchen"
        element={
          <PrivateRoute
            element={RegisterKitchen}
            allowedRoles={["ROLE_ADMIN"]}
          />
        }
      />
      <Route
        path="/admin/kitchens"
        element={
          <PrivateRoute element={ManageKitchens} allowedRoles={["ROLE_ADMIN"]} />
        }
      />
      <Route
        path="/admin/orders"
        element={
          <PrivateRoute element={ViewOrders} allowedRoles={["ROLE_ADMIN"]} />
        }
      />
      <Route
        path="/admin/register-delivery-partner"
        element={
          <PrivateRoute
            element={RegisterDeliveryPartner}
            allowedRoles={["ROLE_ADMIN"]}
          />
        }
      />
      <Route
        path="/admin/delivery-partners"
        element={
          <PrivateRoute
            element={ManageDeliveryPartners}
            allowedRoles={["ROLE_ADMIN"]}
          />
        }
      />

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// ================= APP =================
function App() {
  const [openAuthModal, setOpenAuthModal] = useState(false);

  return (
    <AuthProvider>
      <Toaster />
      <Navbar onLoginClick={() => setOpenAuthModal(true)} />
      <AppRoutes />
      {openAuthModal && (
        <AuthModal
          open={openAuthModal}
          handleClose={() => setOpenAuthModal(false)}
        />
      )}
    </AuthProvider>
  );
}

export default function AppWithTheme() {
  return (
    <ThemeProviderCustom>
      <App />
    </ThemeProviderCustom>
  );
}
