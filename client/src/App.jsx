import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import NotificationToast from './components/common/NotificationToast';
import LoadingSpinner from './components/common/LoadingSpinner';

// Main Landing / Listing Page
import PropertyListPage from './pages/PropertyListPage';

// Lazy-loaded Routed Pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const CreateEditPropertyPage = lazy(() => import('./pages/CreateEditPropertyPage'));
const CustomerBookingsPage = lazy(() => import('./pages/CustomerBookingsPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage'));

// Admin Enterprise Layout & Subpages (Lazy)
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverviewPage = lazy(() => import('./pages/admin/AdminOverviewPage'));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUsersPage'));
const AdminPropertiesPage = lazy(() => import('./pages/admin/AdminPropertiesPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));

// Owner Sanctuary Host Layout & Subpages (Lazy)
const OwnerLayout = lazy(() => import('./pages/owner/OwnerLayout'));
const OwnerOverviewPage = lazy(() => import('./pages/owner/OwnerOverviewPage'));
const OwnerPropertiesPage = lazy(() => import('./pages/owner/OwnerPropertiesPage'));
const OwnerBookingsPage = lazy(() => import('./pages/owner/OwnerBookingsPage'));


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen label="Checking authentication..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/properties" replace />;
  }

  return children;
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen label="Initializing HavenHideaway..." />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(30, 41, 59, 0.95)',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 12px 32px 0 rgba(0, 0, 0, 0.5)',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: '500',
            padding: '12px 16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#0f172a',
            },
          },
          error: {
            iconTheme: {
              primary: '#f43f5e',
              secondary: '#0f172a',
            },
            duration: 5000,
          },
        }}
      />
      
      <Navbar />
      <NotificationToast />

      <main className="flex-1">
        <Suspense fallback={<LoadingSpinner fullScreen label="Loading..." />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/properties" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
            <Route path="/properties" element={<PropertyListPage />} />
            <Route path="/properties/:id" element={<PropertyDetailPage />} />

            {/* User / Guest Protected Routes */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <CustomerBookingsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            {/* Owner / Host Protected Nested Routes */}
            <Route
              path="/owner-dashboard"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <OwnerLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<OwnerOverviewPage />} />
              <Route path="overview" element={<OwnerOverviewPage />} />
              <Route path="properties" element={<OwnerPropertiesPage />} />
              <Route path="bookings" element={<OwnerBookingsPage />} />
            </Route>
            
            <Route
              path="/create-property"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <CreateEditPropertyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/properties/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['owner', 'admin']}>
                  <CreateEditPropertyPage />
                </ProtectedRoute>
              }
            />

            {/* Admin Protected Nested Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminOverviewPage />} />
              <Route path="overview" element={<AdminOverviewPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="properties" element={<AdminPropertiesPage />} />
              <Route path="bookings" element={<AdminBookingsPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>

            {/* Backwards compatibility aliases */}
            <Route path="/admin-dashboard" element={<Navigate to="/admin" replace />} />
            <Route path="/admin-dashboard/*" element={<Navigate to="/admin" replace />} />

            <Route path="*" element={<Navigate to="/properties" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <AppContent />
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
