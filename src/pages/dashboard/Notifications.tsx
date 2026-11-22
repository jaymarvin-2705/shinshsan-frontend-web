import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  MessageSquareText,
  UserRoundCheck,
  Wrench,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getOperationalNotifications,
  markAllOperationalNotificationsRead,
  markOperationalNotificationRead,
} from "../../services/notificationService";
import type {
  OperationalNotification,
  OperationalNotificationType,
} from "../../types/notification";

const TYPE_LABELS: Record<OperationalNotificationType, string> = {
  new_request: "New request",
  technician_assigned: "Technician assigned",
  status_changed: "Status update",
  feedback_received: "Customer feedback",
};

const TYPE_ICONS = {
  new_request: ClipboardList,
  technician_assigned: UserRoundCheck,
  status_changed: Wrench,
  feedback_received: MessageSquareText,
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<
    OperationalNotification[]
  >([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">(
    "all"
  );
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    let active = true;

    const loadNotifications = async () => {
      setLoading(true);
      setLoadError(false);
      try {
        const response = await getOperationalNotifications({
          page,
          per_page: 15,
          read: readFilter,
          type: typeFilter || undefined,
          priority: priorityFilter || undefined,
        });
        if (active) {
          setNotifications(response.data.data);
          setUnreadCount(response.unread_count);
          setLastPage(response.data.last_page);
          setTotal(response.data.total);
        }
      } catch {
        if (active) {
          setLoadError(true);
          toast.error("Unable to load notifications.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadNotifications();
    return () => {
      active = false;
    };
  }, [page, readFilter, typeFilter, priorityFilter, reloadKey]);

  useEffect(() => {
    const reloadNotifications = () => setReloadKey((key) => key + 1);
    window.addEventListener('operational-notifications-updated', reloadNotifications);
    return () => window.removeEventListener('operational-notifications-updated', reloadNotifications);
  }, []);

  const markRead = async (notification: OperationalNotification) => {
    if (notification.is_read) return;
    setUpdatingId(notification.notification_id);
    try {
      const count = await markOperationalNotificationRead(
        notification.notification_id
      );
      setUnreadCount(count);
      window.dispatchEvent(new Event("operational-notifications-updated"));
      setNotifications((current) =>
        current.map((item) =>
          item.notification_id === notification.notification_id
            ? { ...item, is_read: true, read_at: new Date().toISOString() }
            : item
        )
      );
    } catch {
      toast.error("Unable to mark the notification as read.");
    } finally {
      setUpdatingId(null);
    }
  };

  const openNotification = async (
    notification: OperationalNotification
  ) => {
    await markRead(notification);
    if (!notification.related_request_id) return;

    if (notification.notification_type === "feedback_received") {
      navigate("/feedback");
    } else if (notification.notification_type === "technician_assigned") {
      navigate("/jobs");
    } else {
      navigate("/service-requests");
    }
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      const count = await markAllOperationalNotificationsRead();
      setUnreadCount(count);
      window.dispatchEvent(new Event("operational-notifications-updated"));
      setNotifications((current) =>
        current.map((item) => ({
          ...item,
          is_read: true,
          read_at: item.read_at ?? new Date().toISOString(),
        }))
      );
    } catch {
      toast.error("Unable to mark notifications as read.");
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="notifications-page">
      <header className="page-header notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>Operational alerts for service requests, jobs, and feedback.</p>
        </div>
        <div className="notifications-header-actions">
          <span className="notifications-unread-summary">
            <Bell size={16} />
            {unreadCount} unread
          </span>
          <button
            type="button"
            className="notifications-mark-all"
            disabled={unreadCount === 0 || markingAll}
            onClick={() => void markAllRead()}
          >
            <CheckCheck size={16} />
            {markingAll ? "Updating..." : "Mark all as read"}
          </button>
        </div>
      </header>

      <section className="notifications-filters" aria-label="Notification filters">
        <label>
          <span>Read status</span>
          <select
            value={readFilter}
            onChange={(event) => {
              setReadFilter(event.target.value as "all" | "unread" | "read");
              setPage(1);
            }}
          >
            <option value="all">All notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </label>
        <label>
          <span>Event</span>
          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All events</option>
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Priority</span>
          <select
            value={priorityFilter}
            onChange={(event) => {
              setPriorityFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="normal">Normal</option>
          </select>
        </label>
        <span className="notifications-total">{total} total</span>
      </section>

      <section className="notifications-list" aria-label="Operational notifications">
        {loading ? (
          <div className="notifications-empty">Loading notifications...</div>
        ) : loadError ? (
          <div className="notifications-empty">
            <span>Could not load notifications.</span>
            <button
              type="button"
              onClick={() => setReloadKey((current) => current + 1)}
            >
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={24} />
            <strong>No notifications found</strong>
            <span>Operational alerts will appear here when events occur.</span>
          </div>
        ) : (
          notifications.map((notification) => {
            const Icon = TYPE_ICONS[notification.notification_type];
            return (
              <article
                key={notification.notification_id}
                className={`notification-item ${notification.is_read ? "is-read" : "is-unread"}`}
              >
                <span className={`notification-icon notification-icon-${notification.notification_type}`}>
                  <Icon size={19} />
                </span>
                <div className="notification-content">
                  <div className="notification-title-row">
                    <h2>{notification.title}</h2>
                    {!notification.is_read ? (
                      <span className="notification-new">New</span>
                    ) : null}
                    <span className={`notification-priority priority-${notification.priority}`}>
                      {notification.priority}
                    </span>
                  </div>
                  <p>{notification.message}</p>
                  <div className="notification-meta">
                    <span>{TYPE_LABELS[notification.notification_type]}</span>
                    <span>{formatDate(notification.created_at)}</span>
                    {notification.repair_request?.client?.user?.fullname ? (
                      <span>
                        Client: {notification.repair_request.client.user.fullname}
                      </span>
                    ) : null}
                  </div>
                </div>
                <div className="notification-actions">
                  {notification.related_request_id ? (
                    <button
                      type="button"
                      onClick={() => void openNotification(notification)}
                    >
                      View details
                    </button>
                  ) : null}
                  {!notification.is_read ? (
                    <button
                      type="button"
                      disabled={updatingId === notification.notification_id}
                      onClick={() => void markRead(notification)}
                    >
                      {updatingId === notification.notification_id
                        ? "Updating..."
                        : "Mark read"}
                    </button>
                  ) : null}
                </div>
              </article>
            );
          })
        )}
      </section>

      <footer className="notifications-pagination">
        <span>Page {page} of {lastPage}</span>
        <div>
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => setPage((current) => current - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= lastPage || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </button>
        </div>
      </footer>
    </div>
  );
}
