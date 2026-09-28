import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { PatientDashboard } from './pages/PatientDashboard';
import { PatientList } from './pages/PatientList';
import { PatientRegistration } from './pages/PatientRegistration';
import { PatientProfile } from './pages/PatientProfile';
import { CaseHistoryModule } from './pages/CaseHistoryModule';
import { ConsultationModule } from './pages/ConsultationModule';
import { FollowUpModule } from './pages/FollowUpModule';
import { UserManagement } from './pages/UserManagement';
import { ProfileSettings } from './pages/ProfileSettings';

// Layout wrapper for authenticated pages
const AppLayout = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
        Initializing MedCase Platform...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Role-based route protection
const RoleRoute = ({ allowedRoles, children }) => {
  const { role, user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to default home by role
    if (role === 'admin') return <Navigate to="/admin-dashboard" replace />;
    if (role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
    if (role === 'patient') return <Navigate to="/patient-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

// Toast Container component wrapper
const GlobalToast = () => {
  const { toast, removeToast } = useAuth();
  return <Toast toast={toast} onClose={removeToast} />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <GlobalToast />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Application Routes */}
          <Route element={<AppLayout />}>
            
            {/* Admin Dashboard */}
            <Route
              path="/admin-dashboard"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />

            {/* Doctor Dashboard */}
            <Route
              path="/doctor-dashboard"
              element={
                <RoleRoute allowedRoles={['doctor', 'admin']}>
                  <DoctorDashboard />
                </RoleRoute>
              }
            />

            {/* Patient Dashboard */}
            <Route
              path="/patient-dashboard"
              element={
                <RoleRoute allowedRoles={['patient', 'doctor', 'admin']}>
                  <PatientDashboard />
                </RoleRoute>
              }
            />

            {/* Patients Directory & Management */}
            <Route
              path="/patients"
              element={
                <RoleRoute allowedRoles={['admin', 'doctor']}>
                  <PatientList />
                </RoleRoute>
              }
            />
            <Route
              path="/patients/new"
              element={
                <RoleRoute allowedRoles={['admin', 'doctor']}>
                  <PatientRegistration />
                </RoleRoute>
              }
            />
            <Route
              path="/patients/edit/:id"
              element={
                <RoleRoute allowedRoles={['admin', 'doctor']}>
                  <PatientRegistration />
                </RoleRoute>
              }
            />
            <Route
              path="/patients/:id"
              element={
                <RoleRoute allowedRoles={['admin', 'doctor', 'patient']}>
                  <PatientProfile />
                </RoleRoute>
              }
            />

            {/* Case History & Consultations */}
            <Route
              path="/case-history/new"
              element={
                <RoleRoute allowedRoles={['admin', 'doctor']}>
                  <CaseHistoryModule />
                </RoleRoute>
              }
            />
            <Route
              path="/consultation/new"
              element={
                <RoleRoute allowedRoles={['admin', 'doctor']}>
                  <ConsultationModule />
                </RoleRoute>
              }
            />

            {/* Follow-ups */}
            <Route
              path="/follow-ups"
              element={
                <RoleRoute allowedRoles={['admin', 'doctor', 'patient']}>
                  <FollowUpModule />
                </RoleRoute>
              }
            />

            {/* User Management */}
            <Route
              path="/users"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <UserManagement />
                </RoleRoute>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <RoleRoute allowedRoles={['admin', 'doctor', 'patient']}>
                  <ProfileSettings />
                </RoleRoute>
              }
            />

          </Route>

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
