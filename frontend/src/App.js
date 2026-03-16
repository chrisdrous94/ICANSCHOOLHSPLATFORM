import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPathBuilder from "./pages/AdminPathBuilder";
import AdminStaffDirectory from "./pages/AdminStaffDirectory";
import StaffDashboard from "./pages/StaffDashboard";
import ModuleReader from "./pages/ModuleReader";
import ExamPage from "./pages/ExamPage";
import CertificatePage from "./pages/CertificatePage";
import ResourcesVault from "./pages/ResourcesVault";
import Layout from "./components/Layout";

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><div className="text-[#006C4C] text-lg font-semibold">Loading...</div></div>;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace /> : <LoginPage />} />
      <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
      <Route path="/admin/paths" element={<ProtectedRoute adminOnly><Layout><AdminPathBuilder /></Layout></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute adminOnly><Layout><AdminStaffDirectory /></Layout></ProtectedRoute>} />
      <Route path="/admin/certificates" element={<ProtectedRoute adminOnly><Layout><CertificatePage /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><StaffDashboard /></Layout></ProtectedRoute>} />
      <Route path="/module/:moduleId" element={<ProtectedRoute><Layout><ModuleReader /></Layout></ProtectedRoute>} />
      <Route path="/exam" element={<ProtectedRoute><Layout><ExamPage /></Layout></ProtectedRoute>} />
      <Route path="/certificates" element={<ProtectedRoute><Layout><CertificatePage /></Layout></ProtectedRoute>} />
      <Route path="/resources" element={<ProtectedRoute><Layout><ResourcesVault /></Layout></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors closeButton />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
