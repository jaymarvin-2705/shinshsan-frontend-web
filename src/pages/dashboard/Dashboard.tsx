import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import toast from "react-hot-toast";

import ServiceRequestDetails
  from "../../components/serviceRequests/ServiceRequestDetails";
import {
  getClients,
} from "../../services/clientService";
import {
  getRepairRequests,
} from "../../services/serviceRequestService";
import {
  getTechnicians,
} from "../../services/technicianService";
import type {
  RepairRequest,
} from "../../types/serviceRequest";

import "../../styles/serviceRequests.css";

interface DashboardData {
  totalClients: number;
  activeTechnicians: number;
  pendingRequests: number;
  completedRequests: number;
  recentCompletedRequests: RepairRequest[];
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] =
    useState<RepairRequest | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        const [
          clientsResponse,
          firstTechnicianPage,
          pendingResponse,
          completedResponse,
        ] = await Promise.all([
          getClients("", 1),
          getTechnicians("", 1, 100),
          getRepairRequests({ status: "pending", per_page: 1 }),
          getRepairRequests({ status: "completed", per_page: 5 }),
        ]);

        const remainingTechnicianPages =
          firstTechnicianPage.data.last_page > 1
            ? await Promise.all(
                Array.from(
                  { length: firstTechnicianPage.data.last_page - 1 },
                  (_, index) =>
                    getTechnicians("", index + 2, 100)
                )
              )
            : [];
        const technicians = [
          ...firstTechnicianPage.data.data,
          ...remainingTechnicianPages.flatMap(
            (response) => response.data.data
          ),
        ];

        if (!isMounted) {
          return;
        }

        setDashboardData({
          totalClients: clientsResponse.data.total,
          activeTechnicians: technicians.filter(
            (technician) => technician.user.status === "active"
          ).length,
          pendingRequests: pendingResponse.data.total,
          completedRequests: completedResponse.data.total,
          recentCompletedRequests: completedResponse.data.data,
        });
        setLoadError(false);
      } catch {
        if (isMounted) {
          setLoadError(true);
          toast.error("Unable to load dashboard data.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const statValue = (value: number | undefined) =>
    loading ? "..." : value ?? "—";

  return (
    <div>

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Overview of the Shinshan ISP Management System.
          </p>
        </div>
      </div>

      <div className="dashboard-grid">

        <div className="stat-card">
          <span>Total Clients</span>
          <strong>{statValue(dashboardData?.totalClients)}</strong>
        </div>

        <div className="stat-card">
          <span>Active Technicians</span>
          <strong>{statValue(dashboardData?.activeTechnicians)}</strong>
        </div>

        <div className="stat-card">
          <span>Pending Requests</span>
          <strong>{statValue(dashboardData?.pendingRequests)}</strong>
        </div>

        <div className="stat-card">
          <span>Completed Repairs</span>
          <strong>{statValue(dashboardData?.completedRequests)}</strong>
        </div>

      </div>

      <div className="dashboard-section">

        <h2>Recent Completed Service Requests</h2>

        {loading ? (
          <div className="empty-state">
            Loading completed service requests...
          </div>
        ) : loadError ? (
          <div className="empty-state">
            Unable to load completed service requests.
          </div>
        ) : dashboardData?.recentCompletedRequests.length ? (
          <div className="table-container dashboard-requests-table">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {dashboardData.recentCompletedRequests.map((request) => (
                  <tr key={request.request_id}>
                    <td>#{request.request_id}</td>
                    <td>{request.client?.user?.fullname ?? "N/A"}</td>
                    <td>
                      <strong>{request.title}</strong>
                      <small>
                        {request.category?.category_name ?? "N/A"}
                      </small>
                    </td>
                    <td>
                      <span className="sr-badge status-completed">
                        Completed
                      </span>
                    </td>
                    <td>
                      {new Date(request.updated_at).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="sr-actions">
                        <button
                          type="button"
                          title={`View request ${request.request_id}`}
                          aria-label={`View request ${request.request_id}`}
                          onClick={() => setSelectedRequest(request)}
                        >
                          <Eye size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            No completed service requests available.
          </div>
        )}

      </div>

      {selectedRequest && (
        <ServiceRequestDetails
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}

    </div>
  );
}