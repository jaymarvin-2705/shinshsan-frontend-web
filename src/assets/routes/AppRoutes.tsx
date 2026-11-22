import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import Login from '../../pages/auth/Login';
import ForgotPassword from '../../pages/auth/ForgotPassword';
import ResetPassword from '../../pages/auth/ResetPassword';
import ChangePassword from '../../pages/auth/ChangePassword';

import Dashboard from '../../pages/dashboard/Dashboard';
import Clients from '../../pages/dashboard/Clients';
import Technicians from '../../pages/dashboard/Technicians';
import ServiceRequests from '../../pages/dashboard/ServiceRequests';
import JobsRepairs from '../../pages/dashboard/JobsRepairs';
import GPSTracking from '../../pages/dashboard/GPSTracking';
import Notifications from '../../pages/dashboard/Notifications';
import Announcements from '../../pages/dashboard/Announcements';
import RatingsFeedback from '../../pages/dashboard/RatingsFeedback';
import Reports from '../../pages/dashboard/Reports';

import AdminLayout from '../../layouts/AdminLayout';
import ProtectedRoute from '../../routes/ProtectedRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/change-password"
            element={<ChangePassword />}
          />

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/clients"
            element={<Clients />}
          />

          <Route
            path="/technicians"
            element={<Technicians />}
          />

          <Route
            path="/service-requests"
            element={<ServiceRequests />}
          />

          <Route
            path="/jobs"
            element={<JobsRepairs />}
          />

          <Route
            path="/gps"
            element={<GPSTracking />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/announcements"
            element={<Announcements />}
          />

          <Route
            path="/feedback"
            element={<RatingsFeedback />}
          />

          <Route
            path="/reports"
            element={<Reports />}
          />

        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}