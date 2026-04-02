import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Index from "./pages/Index";
import OrdersPage from "./pages/OrdersPage";
import ClientsPage from "./pages/ClientsPage";
import InventoryPage from "./pages/InventoryPage";
import FinancialPage from "./pages/FinancialPage";
import PersonalFinancePage from "./pages/PersonalFinancePage";
import MessagesPage from "./pages/MessagesPage";
import UsedEquipmentPage from "./pages/UsedEquipmentPage";
import EquipmentDetailPage from "./pages/EquipmentDetailPage";
import EquipmentReceiptPage from "./pages/EquipmentReceiptPage";
import OrderReceiptPage from "./pages/OrderReceiptPage";
import OrderQuotePage from "./pages/OrderQuotePage";
import QuotesPage from "./pages/QuotesPage";
import QuotePrintPage from "./pages/QuotePrintPage";
import SettingsPage from "./pages/SettingsPage";
import SubscriptionExpiredPage from "./pages/SubscriptionExpiredPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminFinancialPage from "./pages/admin/AdminFinancialPage";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, subscriptionStatus, isAdmin } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Admin always has access
  if (isAdmin) {
    return <>{children}</>;
  }

  // Check subscription - block null (new users) and non-active statuses
  if (!subscriptionStatus || !["ativo", "trial"].includes(subscriptionStatus)) {
    return <Navigate to="/assinatura-expirada" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/auth" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <LandingPage />} />
      <Route path="/auth" element={user ? <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace /> : <AuthPage />} />
      <Route path="/assinatura-expirada" element={!user ? <Navigate to="/auth" replace /> : isAdmin ? <Navigate to="/admin" replace /> : <SubscriptionExpiredPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/usuarios" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
      <Route path="/admin/financeiro" element={<AdminRoute><AdminFinancialPage /></AdminRoute>} />
      <Route path="/admin/notificacoes" element={<AdminRoute><AdminNotificationsPage /></AdminRoute>} />
      
      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/ordens" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
      <Route path="/ordens/:id/imprimir" element={<ProtectedRoute><OrderReceiptPage /></ProtectedRoute>} />
      <Route path="/ordens/:id/orcamento" element={<ProtectedRoute><OrderQuotePage /></ProtectedRoute>} />
      <Route path="/orcamentos" element={<ProtectedRoute><QuotesPage /></ProtectedRoute>} />
      <Route path="/orcamentos/:id/imprimir" element={<ProtectedRoute><QuotePrintPage /></ProtectedRoute>} />
      <Route path="/clientes" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
      <Route path="/estoque" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
      <Route path="/financeiro" element={<ProtectedRoute><FinancialPage /></ProtectedRoute>} />
      <Route path="/seminovos" element={<ProtectedRoute><UsedEquipmentPage /></ProtectedRoute>} />
      <Route path="/seminovos/:id" element={<ProtectedRoute><EquipmentDetailPage /></ProtectedRoute>} />
      <Route path="/seminovos/recibo/:id" element={<ProtectedRoute><EquipmentReceiptPage /></ProtectedRoute>} />
      <Route path="/pessoal" element={<ProtectedRoute><PersonalFinancePage /></ProtectedRoute>} />
      <Route path="/mensagens" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
      <Route path="/configuracoes" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
