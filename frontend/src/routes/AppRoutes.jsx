import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import DashboardLayout from "../components/layout/DashboardLayout";
import ProtectedRoute from "../components/layout/ProtectedRoute";
import Dashboard from "../pages/dashboard/Dashboard";
import Clients from "../pages/clients/Clients";
import Products from "../pages/products/Products";
import InvoiceList from "../pages/invoices/InvoiceList";
import CreateInvoice from "../pages/invoices/CreateInvoice";
import InvoiceDetail from "../pages/invoices/InvoiceDetail";
import RecurringInvoices from "../pages/invoices/RecurringInvoices";
import TemplateBuilder from "../pages/templates/TemplateBuilder";
import Reports from "../pages/reports/Reports";
import Profile from "../pages/profile/Profile";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/app" element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<Clients />} />
            <Route path="products" element={<Products />} />
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/create" element={<CreateInvoice />} />
            <Route path="invoices/recurring" element={<RecurringInvoices />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="templates" element={<TemplateBuilder />} />
            <Route path="reports" element={<Reports />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;