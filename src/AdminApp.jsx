import { Routes, Route, Navigate } from "react-router-dom";
import AdminRoute from "./components/layout/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/pages/AdminDashboard";
import AdminProducts from "./pages/admin/pages/AdminProducts";
import AdminOrders from "./pages/admin/pages/AdminOrders";
import AdminCustomers from "./pages/admin/pages/AdminCustomers";
import AdminContent from "./pages/admin/pages/AdminContent";
import AdminAllowlist from "./pages/admin/pages/AdminAllowlist";
import AdminLogin from "./pages/admin/AdminLogin";
import { AnimatePresence } from "framer-motion";

export default function AdminApp() {
    return (
        <div className="admin-portal-root">
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="login" element={<AdminLogin />} />

                    <Route
                        path="*"
                        element={
                            <AdminRoute>
                                <AdminLayout />
                            </AdminRoute>
                        }
                    >
                        <Route index element={<Navigate to="dashboard" replace />} />
                        <Route path="dashboard" element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="customers" element={<AdminCustomers />} />
                        <Route path="content" element={<AdminContent />} />
                        <Route path="allowlist" element={<AdminAllowlist />} />
                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Route>
                </Routes>
            </AnimatePresence>
        </div>
    );
}
