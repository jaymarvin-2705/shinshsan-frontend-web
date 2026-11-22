import { useEffect, useRef, useState } from "react";
import {
  Eye,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Star,
} from "lucide-react";
import { getJob, getJobs } from "../../services/jobService";
import type { Job } from "../../types/job";
import "../../styles/jobsRepairs.css";
const JobsRepairs = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const detailsRequest = useRef(0);

  const openJobDetails = async (job: Job) => {
    const requestId = ++detailsRequest.current;
    setSelectedJob(job);
    setDetailsLoading(true);
    setDetailsError("");

    try {
      const response = await getJob(job.assignment_id);
      if (requestId === detailsRequest.current) {
        setSelectedJob(response.data);
      }
    } catch (error) {
      console.error("Failed to load job details:", error);
      if (requestId === detailsRequest.current) {
        setDetailsError("Could not load the latest job details. Please try again.");
      }
    } finally {
      if (requestId === detailsRequest.current) {
        setDetailsLoading(false);
      }
    }
  };

  const closeJobDetails = () => {
    detailsRequest.current += 1;
    setDetailsLoading(false);
    setDetailsError("");
    setSelectedJob(null);
  };

  const loadJobs = async () => {
    try {
      setLoading(true);

      const response = await getJobs({
        search: search || undefined,
        status: status || undefined,
        page: currentPage,
        per_page: 10,
      });

      const pagination = response.data;

      setJobs(pagination?.data ?? []);
      setCurrentPage(pagination?.current_page ?? 1);
      setLastPage(pagination?.last_page ?? 1);
      setTotal(pagination?.total ?? 0);
    } catch (error) {
      console.error("Failed to load jobs:", error);

      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [currentPage, status]);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();

    setCurrentPage(1);
    loadJobs();
  };

  const handleStatusChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatus(event.target.value);
    setCurrentPage(1);
  };

  const getStatusClass = (jobStatus: string) => {
    switch (jobStatus) {
      case "assigned":
        return "status-badge status-assigned";

      case "accepted":
        return "status-badge status-accepted";

      case "on_the_way":
        return "status-badge status-on-the-way";

      case "in_progress":
        return "status-badge status-in-progress";

      case "completed":
        return "status-badge status-completed";

      case "cancelled":
        return "status-badge status-cancelled";

      default:
        return "status-badge";
    }
  };

  const formatStatus = (jobStatus: string) => {
    return jobStatus
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const formatPriority = (priority: string) => {
    if (priority === "very_high") return "Very High";
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const acceptedUpdate = selectedJob?.repair_updates.find(
    (update) => update.status === "accepted"
  );

  return (
    <div className="page-container">

      {/* PAGE HEADER */}
      <div className="page-header">

        <div>
          <h1>Jobs & Repairs</h1>

          <p>
            Monitor technician assignments and repair progress.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={loadJobs}
          disabled={loading}
        >
          <RefreshCw size={17} />

          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>


      {/* FILTERS */}
      <div className="filter-card">

        <form
          className="filter-form"
          onSubmit={handleSearch}
        >

          {/* SEARCH */}
          <div className="search-wrapper">

            <Search size={18} />

            <input
              type="text"
              placeholder="Search job, client, or technician..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />

          </div>


          {/* STATUS */}
          <select
            value={status}
            onChange={handleStatusChange}
            className="filter-select"
          >
            <option value="">
              All Statuses
            </option>

            <option value="assigned">
              Assigned
            </option>

            <option value="accepted">
              Accepted
            </option>

            <option value="on_the_way">
              On The Way
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


          <button
            type="submit"
            className="btn btn-primary"
          >
            Search
          </button>

        </form>

      </div>


      {/* SUMMARY */}
      <div className="jobs-summary">

        <span>
          Total Jobs: <strong>{total}</strong>
        </span>

      </div>


      {/* TABLE */}
      <div className="table-container">

        {loading ? (

          <div className="table-loading">
            Loading jobs...
          </div>

        ) : jobs.length === 0 ? (

          <div className="empty-state">
            <h3>No jobs found</h3>

            <p>
              There are no repair jobs matching your search.
            </p>
          </div>

        ) : (

          <table className="data-table">

            <thead>
              <tr>

                <th>
                  Job ID
                </th>

                <th>
                  Service Request
                </th>

                <th>
                  Client
                </th>

                <th>
                  Technician
                </th>

                <th>
                  Priority
                </th>

                <th>
                  Status
                </th>

                <th>
                  Action
                </th>

              </tr>
            </thead>

            <tbody>

              {jobs.map((job) => (

                <tr key={job.assignment_id}>

                  {/* JOB ID */}
                  <td>
                    #{job.assignment_id}
                  </td>


                  {/* SERVICE REQUEST */}
                  <td>

                    <div className="table-primary-text">
                      {job.repair_request?.title ||
                        "Untitled Request"}
                    </div>

                    <div className="table-secondary-text">
                      Request #
                      {job.request_id}
                    </div>

                  </td>


                  {/* CLIENT */}
                  <td>

                    {job.repair_request?.client?.user
                      ?.fullname || "N/A"}

                  </td>


                  {/* TECHNICIAN */}
                  <td>

                    {job.technician?.user?.fullname ||
                      "N/A"}

                  </td>


                  {/* PRIORITY */}
                  <td>

                    <span
                      className={`priority-badge priority-${job.repair_request?.priority}`}
                    >
                      {formatPriority(
                        job.repair_request?.priority ||
                          "medium"
                      )}
                    </span>

                  </td>


                  {/* STATUS */}
                  <td>

                    <span
                      className={getStatusClass(
                        job.status
                      )}
                    >
                      {formatStatus(job.status)}
                    </span>

                  </td>


                  {/* ACTION */}
                  <td>

                    <button
                      type="button"
                      className="icon-button"
                      title="View Job"
                      onClick={() => void openJobDetails(job)}
                    >
                      <Eye size={18} />
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        )}

      </div>


      {/* PAGINATION */}
      {!loading && jobs.length > 0 && (

        <div className="pagination">

          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() =>
              setCurrentPage((page) => page - 1)
            }
          >
            <ChevronLeft size={17} />
            Previous
          </button>


          <span>
            Page {currentPage} of {lastPage}
          </span>


          <button
            type="button"
            disabled={currentPage >= lastPage}
            onClick={() =>
              setCurrentPage((page) => page + 1)
            }
          >
            Next
            <ChevronRight size={17} />
          </button>

        </div>

      )}


      {/* JOB DETAILS MODAL */}
      {selectedJob && (

        <div
          className="modal-overlay"
          onClick={closeJobDetails}
        >

          <div
            className="modal-content job-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}
            <div className="modal-header">

              <div>

                <h2>
                  Job #{selectedJob.assignment_id}
                </h2>

                <p>
                  Service Request #
                  {selectedJob.request_id}
                </p>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={() =>
                  closeJobDetails()
                }
              >
                ×
              </button>

            </div>


            {/* JOB INFORMATION */}
            {detailsLoading && (
              <div className="detail-load-state" role="status">
                Loading the latest job details...
              </div>
            )}

            {detailsError && (
              <div className="detail-load-error" role="alert">
                <span>{detailsError}</span>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => void openJobDetails(selectedJob)}
                >
                  Retry
                </button>
              </div>
            )}

            <div className="job-details-grid">

              <div className="detail-item">

                <span>
                  Service Request
                </span>

                <strong>
                  {selectedJob.repair_request?.title ||
                    "N/A"}
                </strong>

              </div>


              <div className="detail-item">

                <span>
                  Status
                </span>

                <strong>
                  <span
                    className={getStatusClass(
                      selectedJob.status
                    )}
                  >
                    {formatStatus(
                      selectedJob.status
                    )}
                  </span>
                </strong>

              </div>


              <div className="detail-item">

                <span>
                  Client
                </span>

                <strong>
                  {selectedJob.repair_request?.client
                    ?.user?.fullname || "N/A"}
                </strong>

              </div>


              <div className="detail-item">

                <span>
                  Technician
                </span>

                <strong>
                  {selectedJob.technician?.user
                    ?.fullname || "N/A"}
                </strong>

              </div>

              <div className="detail-item">
                <span>Technician Contact</span>
                <strong>
                  {[
                    selectedJob.technician?.user?.email,
                    selectedJob.technician?.user?.phone,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "No contact information provided"}
                </strong>
              </div>


              <div className="detail-item">

                <span>
                  Priority
                </span>

                <strong>
                  {formatPriority(
                    selectedJob.repair_request
                      ?.priority || "medium"
                  )}
                </strong>

              </div>


              <div className="detail-item">

                <span>
                  Assigned At
                </span>

                <strong>
                  {selectedJob.assigned_at
                    ? new Date(
                        selectedJob.assigned_at
                      ).toLocaleString()
                    : "N/A"}
                </strong>

              </div>

              <div className="detail-item">
                <span>Request Status</span>
                <strong>
                  {formatStatus(selectedJob.repair_request?.status || "unknown")}
                </strong>
              </div>

              <div className="detail-item">
                <span>Category</span>
                <strong>
                  {selectedJob.repair_request?.category?.category_name || "N/A"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Technician Accepted Date</span>
                <strong>
                  {acceptedUpdate?.created_at
                    ? new Date(
                        acceptedUpdate.created_at
                      ).toLocaleDateString()
                    : "Not accepted yet"}
                </strong>
              </div>

              <div className="detail-item">
                <span>Assigned By</span>
                <strong>
                  {typeof selectedJob.assigned_by === "object"
                    ? selectedJob.assigned_by?.fullname || "N/A"
                    : "N/A"}
                </strong>
              </div>

            </div>


            {/* DESCRIPTION */}
            <div className="detail-section">

              <h3>
                Issue Description
              </h3>

              <p>
                {selectedJob.repair_request
                  ?.description || "No description."}
              </p>

            </div>

            <div className="detail-section">
              <h3>Service Location</h3>
              <div className="detail-item">
                <strong>
                  {[
                    selectedJob.repair_request?.barangay,
                    selectedJob.repair_request?.purok,
                    selectedJob.repair_request?.landmark,
                  ]
                    .filter(Boolean)
                    .join(", ") ||
                    selectedJob.repair_request?.client?.address ||
                    "No service location provided."}
                </strong>
              </div>
            </div>

            <div className="detail-section">
              <h3>Client Contact</h3>
              <div className="detail-item">
                <strong>
                  {selectedJob.repair_request?.client?.user?.email || "No email provided"}
                  {" · "}
                  {selectedJob.repair_request?.client?.user?.phone || "No phone provided"}
                </strong>
                {selectedJob.repair_request?.client?.address ? (
                  <p className="detail-contact-address">
                    {selectedJob.repair_request.client?.address}
                  </p>
                ) : null}
              </div>
            </div>


            {/* REMARKS */}
            <div className="detail-section">

              <h3>
                Latest Remarks
              </h3>

              <p>
                {selectedJob.remarks ||
                  "No remarks available."}
              </p>

            </div>


            {/* REPAIR HISTORY */}
            <div className="detail-section">

              <h3>
                Repair History
              </h3>

              {selectedJob.repair_updates?.length ? (

                <div className="repair-history">

                  {selectedJob.repair_updates.map(
                    (update) => (

                      <div
                        key={update.update_id}
                        className="repair-history-item"
                      >

                        <div>

                          <strong>
                            {formatStatus(
                              update.status
                            )}
                          </strong>

                          <span>
                            {new Date(
                              update.created_at
                            ).toLocaleString()}
                          </span>

                        </div>

                        <p>
                          {update.remarks ||
                            "No remarks."}
                        </p>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p>
                  No repair updates recorded.
                </p>

              )}

            </div>

            {/* CLIENT FEEDBACK */}
            <div className="detail-section">
              <h3>Client Rating &amp; Feedback</h3>

              {selectedJob.repair_request?.feedback ? (
                <div className="client-feedback">
                  <div
                    className="client-feedback-rating"
                    aria-label={`${selectedJob.repair_request.feedback.rating} out of 5 stars`}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        size={18}
                        fill={
                          index <
                          (selectedJob.repair_request.feedback?.rating ?? 0)
                            ? "currentColor"
                            : "none"
                        }
                      />
                    ))}
                    <strong>
                      {selectedJob.repair_request.feedback.rating} / 5
                    </strong>
                  </div>

                  <p className="client-feedback-comment">
                    {selectedJob.repair_request.feedback.comment?.trim() ||
                      "No written comment provided."}
                  </p>

                  <span className="client-feedback-date">
                    Submitted{" "}
                    {new Date(
                      selectedJob.repair_request.feedback.created_at
                    ).toLocaleString()}
                  </span>
                </div>
              ) : (
                <p className="client-feedback-empty">
                  No client rating or comment has been submitted.
                </p>
              )}
            </div>


            {/* FOOTER */}
            <div className="modal-footer">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() =>
                  setSelectedJob(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default JobsRepairs;