import { useEffect, useState } from "react";
import {
  Eye,
  UserRoundCheck,
  MapPinned,
  Search,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getRepairRequests,
  updateRepairRequestPriority,
} from "../../services/serviceRequestService";

import type {
  RepairRequest,
  RepairRequestPriority,
} from "../../types/serviceRequest";

import ServiceRequestDetails
  from "../../components/serviceRequests/ServiceRequestDetails";

import AssignTechnicianModal
  from "../../components/serviceRequests/AssignTechnicianModal";

import AutoAssignModal
  from "../../components/serviceRequests/AutoAssignModal";

import "../../styles/serviceRequests.css";

type EditablePriority = Exclude<RepairRequestPriority, "low">;

const isEditablePriority = (
  value: string
): value is EditablePriority =>
  value === "medium" ||
  value === "high" ||
  value === "very_high";

const ServiceRequests = () => {
  const [requests, setRequests] =
    useState<RepairRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [priority, setPriority] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [updatingPriorityId, setUpdatingPriorityId] =
    useState<number | null>(null);

  const [selectedRequest, setSelectedRequest] =
    useState<RepairRequest | null>(null);

  const [assignRequestId, setAssignRequestId] =
    useState<number | null>(null);

  const [autoAssignRequestId, setAutoAssignRequestId] =
    useState<number | null>(null);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const response =
        await getRepairRequests({
          page,
          search: search || undefined,
          status: status || undefined,
          priority: priority || undefined,
        });

      setRequests(
        response.data.data
      );

      setLastPage(
        response.data.last_page
      );

      setTotal(
        response.data.total
      );
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
        "Failed to load service requests."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [page, status, priority]);

  const handlePriorityChange = async (
    request: RepairRequest,
    nextPriority: string
  ) => {
    if (
      nextPriority === request.priority ||
      !isEditablePriority(nextPriority)
    ) {
      return;
    }

    setUpdatingPriorityId(request.request_id);
    try {
      const response = await updateRepairRequestPriority(
        request.request_id,
        nextPriority
      );
      setRequests((current) =>
        current.map((item) =>
          item.request_id === request.request_id
            ? response.data
            : item
        )
      );
      setSelectedRequest((current) =>
        current?.request_id === request.request_id
          ? response.data
          : current
      );
      toast.success("Priority updated.");
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
          ? error.response.data.message
          : "Failed to update priority.";
      toast.error(message);
    } finally {
      setUpdatingPriorityId(null);
    }
  };

  const handleSearch = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setPage(1);
    loadRequests();
  };

  return (
    <div className="service-requests-page">
      <div className="page-header">
        <div>
          <h1>Service Requests</h1>

          <p>
            Monitor client service requests
            and assign technicians.
          </p>
        </div>
      </div>

      <div className="sr-toolbar">
        <form
          className="sr-search"
          onSubmit={handleSearch}
        >
          <Search size={18} />

          <input
            type="text"
            placeholder="Search requests..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />
        </form>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">
            All Statuses
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="assigned">
            Assigned
          </option>

          <option value="on_the_way">
            On the Way
          </option>

          <option value="in_progress">
            In Progress
          </option>

          <option value="completed">
            Completed
          </option>

          <option value="cancelled">
            Cancelled
          </option>
        </select>

        <select
          value={priority}
          onChange={(event) => {
            setPriority(event.target.value);
            setPage(1);
          }}
        >
          <option value="">
            All Priorities
          </option>

          <option value="low">
            Low
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="high">
            High
          </option>

          <option value="very_high">
            Very High
          </option>
        </select>
      </div>

      <div className="sr-card">
        <div className="table-container">
          <table className="sr-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Client</th>
                <th>Issue</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Technician</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="sr-empty"
                  >
                    Loading service requests...
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="sr-empty"
                  >
                    No service requests found.
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr
                    key={request.request_id}
                  >
                    <td>
                      #{request.request_id}
                    </td>

                    <td>
                      {request.client?.user
                        ?.fullname ?? "N/A"}
                    </td>

                    <td>
                      <strong>
                        {request.title}
                      </strong>

                      <small>
                        {request.category
                          ?.category_name ?? "N/A"}
                      </small>
                    </td>

                    <td>
                      <select
                        aria-label={`Update priority for request ${request.request_id}`}
                        className={`sr-priority-select priority-${request.priority}`}
                        value={request.priority}
                        disabled={updatingPriorityId === request.request_id}
                        onChange={(event) =>
                          void handlePriorityChange(
                            request,
                            event.target.value
                          )
                        }
                      >
                        {request.priority === "low" && (
                          <option value="low" disabled>
                            Low (legacy)
                          </option>
                        )}
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="very_high">Very High</option>
                      </select>
                    </td>

                    <td>
                      <span
                        className={`sr-badge status-${request.status}`}
                      >
                        {request.status.replace(
                          "_",
                          " "
                        )}
                      </span>
                    </td>

                    <td>
                      {request.assignment
                        ?.technician?.user
                        ?.fullname ?? "Unassigned"}
                    </td>

                    <td>
                      {new Date(
                        request.created_at
                      ).toLocaleDateString()}
                    </td>

                    <td>
                      <div className="sr-actions">
                        <button
                          type="button"
                          title="View"
                          onClick={() =>
                            setSelectedRequest(
                              request
                            )
                          }
                        >
                          <Eye size={17} />
                        </button>

                        {request.status ===
                          "pending" && (
                          <>
                            <button
                              type="button"
                              title="Assign Technician"
                              onClick={() =>
                                setAssignRequestId(
                                  request.request_id
                                )
                              }
                            >
                              <UserRoundCheck
                                size={17}
                              />
                            </button>

                            <button
                              type="button"
                              title="Auto Assign Nearest"
                              onClick={() =>
                                setAutoAssignRequestId(
                                  request.request_id
                                )
                              }
                            >
                              <MapPinned
                                size={17}
                              />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="sr-pagination">
          <span>
            Total: {total}
          </span>

          <div>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((value) =>
                  value - 1
                )
              }
            >
              Previous
            </button>

            <span>
              Page {page} of {lastPage}
            </span>

            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() =>
                setPage((value) =>
                  value + 1
                )
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedRequest && (
        <ServiceRequestDetails
          request={selectedRequest}
          onClose={() =>
            setSelectedRequest(null)
          }
        />
      )}

      {assignRequestId && (
        <AssignTechnicianModal
          requestId={assignRequestId}
          onClose={() =>
            setAssignRequestId(null)
          }
          onSuccess={loadRequests}
        />
      )}

      {autoAssignRequestId && (
        <AutoAssignModal
          requestId={autoAssignRequestId}
          onClose={() =>
            setAutoAssignRequestId(null)
          }
          onSuccess={loadRequests}
        />
      )}
    </div>
  );
};

export default ServiceRequests;