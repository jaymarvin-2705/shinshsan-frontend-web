import { useCallback, useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Wrench,
  MapPinned,
  Bell,
  Megaphone,
  Star,
  FileBarChart2,
  LogOut,
  KeyRound,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { getOperationalUnreadCount } from '../services/notificationService';
import { subscribeToUserNotifications } from '../services/realtimeNotificationService';

import '../styles/notifications.css';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await getOperationalUnreadCount());
    } catch (error) {
      console.error('Unable to refresh the operational notification count.', error);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const loadUnreadCount = async () => {
      try {
        setUnreadCount(await getOperationalUnreadCount());
      } catch (error) {
        console.error('Unable to refresh the operational notification count.', error);
      }
    };

    void loadUnreadCount();
    const unsubscribe = token && user
      ? subscribeToUserNotifications(user.user_id, token, () => {
          window.dispatchEvent(new Event('operational-notifications-updated'));
          void refreshUnreadCount();
        })
      : () => undefined;
    const intervalId = window.setInterval(() => {
      void refreshUnreadCount();
    }, 30_000);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshUnreadCount();
      }
    };
    const handleNotificationUpdate = () => {
      void refreshUnreadCount();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener(
      'operational-notifications-updated',
      handleNotificationUpdate
    );

    return () => {
      window.clearInterval(intervalId);
      unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener(
        'operational-notifications-updated',
        handleNotificationUpdate
      );
    };
  }, [refreshUnreadCount, user]);

  return (
    <div className="admin-layout">

      <aside className="sidebar">

        <div className="sidebar-header">
          <h2>Shinshan ISP</h2>
          <span>Admin Portal</span>
        </div>

        <nav>

          <NavLink to="/dashboard">
            <LayoutDashboard size={20} />
            Dashboard
          </NavLink>

          <NavLink to="/clients">
            <Users size={20} />
            Clients
          </NavLink>

          <NavLink to="/technicians">
            <UserCog size={20} />
            Technicians
          </NavLink>

          <NavLink to="/service-requests">
            <Wrench size={20} />
            Service Requests
          </NavLink>

          <NavLink to="/jobs">
            <Wrench size={20} />
            Jobs & Repairs
          </NavLink>

          <NavLink to="/gps">
            <MapPinned size={20} />
            GPS Tracking
          </NavLink>

          <NavLink to="/notifications">
            <Bell size={20} />
            Notifications
            {unreadCount > 0 ? (
              <span className="sidebar-notification-count" aria-label={`${unreadCount} unread notifications`}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </NavLink>

          <NavLink to="/announcements">
            <Megaphone size={20} />
            Announcements
          </NavLink>

          <NavLink to="/feedback">
            <Star size={20} />
            Ratings & Feedback
          </NavLink>

          <NavLink to="/reports">
            <FileBarChart2 size={20} />
            Reports
          </NavLink>

          <NavLink to="/change-password">
            <KeyRound size={20} />
            Change Password
          </NavLink>

        </nav>

        <button
          className="logout-button"
          onClick={logout}
        >
          <LogOut size={20} />
          Logout
        </button>

      </aside>

      <div className="main-area">

        <header className="topbar">
          <div>
            <h3>Administrator Dashboard</h3>
          </div>

          <div className="user-info">
            <strong>{user?.fullname}</strong>
            <span>{user?.role}</span>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}