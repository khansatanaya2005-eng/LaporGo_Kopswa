import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/Layout';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import UploadReport from './pages/UploadReport';
import ReportPreview from './pages/ReportPreview';
import ReportHistory from './pages/ReportHistory';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';
import UserGuide from './pages/UserGuide';
import ManageReport from './pages/ManageReport';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/panduan" element={<UserGuide />} />

          {/* Protected Routes (Staff & Admin) */}
          <Route element={<ProtectedRoute allowedRoles={['Admin', 'Staff']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadReport />} />
            <Route path="/preview" element={<ReportPreview />} />
            <Route path="/riwayat" element={<ReportHistory />} />
            <Route path="/kelola/:id" element={<ManageReport />} />
            <Route path="/pengaturan" element={<Settings />} />
          </Route>

          {/* Protected Route (Admin Only) */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/users" element={<UserManagement />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
