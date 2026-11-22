import { useEffect, useState } from "react";
import { Download, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

import {
  downloadReportsCsv,
  getReports,
} from "../../services/reportService";
import type {
  ReportFilters,
  ReportsResponse,
} from "../../types/report";

import "../../styles/reports.css";

const today = new Date();
const defaultStart = new Date(today);
defaultStart.setDate(today.getDate() - 29);

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DEFAULT_SUMMARY = {
  total: 0,
  completed: 0,
  open: 0,
  cancelled: 0,
  completion_rate: 0,
  average_completion_minutes: null,
};

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

function formatDuration(minutes: number | null): string {
  if (minutes === null) {
    return "—";
  }

  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }

  const hours = minutes / 60;
  if (hours < 48) {
    return `${hours.toFixed(1)} hrs`;
  }

  return `${(hours / 24).toFixed(1)} days`;
}

function Reports() {
  const [startDate, setStartDate] = useState(toDateInputValue(defaultStart));
  const [endDate, setEndDate] = useState(toDateInputValue(today));
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [barangay, setBarangay] = useState("");
  const [page, setPage] = useState(1);
  const [report, setReport] = useState<ReportsResponse["data"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadReport = async () => {
      setLoading(true);
      setError(false);
      const filters: ReportFilters = {
        start_date: startDate,
        end_date: endDate,
        status: status || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        technician_id: technicianId ? Number(technicianId) : undefined,
        barangay: barangay || undefined,
        page,
      };

      try {
        const response = await getReports(filters);
        if (isMounted) {
          setReport(response.data);
        }
      } catch {
        if (isMounted) {
          setError(true);
          toast.error("Unable to load reports.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadReport();

    return () => {
      isMounted = false;
    };
  }, [
    startDate,
    endDate,
    status,
    categoryId,
    technicianId,
    barangay,
    page,
    reloadKey,
  ]);

  const resetFilters = () => {
    setStartDate(toDateInputValue(defaultStart));
    setEndDate(toDateInputValue(today));
    setStatus("");
    setCategoryId("");
    setTechnicianId("");
    setBarangay("");
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const blob = await downloadReportsCsv({
        start_date: startDate,
        end_date: endDate,
        status: status || undefined,
        category_id: categoryId ? Number(categoryId) : undefined,
        technician_id: technicianId ? Number(technicianId) : undefined,
        barangay: barangay || undefined,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `service-reports-${startDate}-to-${endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Report exported.");
    } catch {
      toast.error("Unable to export the report.");
    } finally {
      setExporting(false);
    }
  };

  const summary = report?.summary ?? DEFAULT_SUMMARY;
  const maxTrend = Math.max(
    1,
    ...(report?.trend.map((item) => item.requests) ?? [])
  );
  const maxCategory = Math.max(
    1,
    ...(report?.categories.map((item) => item.total) ?? [])
  );
  const maxBarangay = Math.max(
    1,
    ...(report?.barangays.map((item) => item.total) ?? [])
  );

  return (
    <div className="reports-page">
      <header className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Analyze service request volume and technician performance.</p>
        </div>
        <button
          type="button"
          className="report-export-button"
          onClick={() => void handleExport()}
          disabled={loading || exporting}
        >
          <Download size={17} />
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </header>

      <section className="report-filters" aria-label="Report filters">
        <label>
          <span>From</span>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => {
              setStartDate(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          <span>To</span>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => {
              setEndDate(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="assigned">Assigned</option>
            <option value="on_the_way">On the way</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label>
          <span>Issue category</span>
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {(report?.categories_filter ?? []).map((category) => (
              <option key={category.category_id} value={category.category_id}>
                {category.category_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Technician</span>
          <select
            value={technicianId}
            onChange={(event) => {
              setTechnicianId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All technicians</option>
            {(report?.technicians_filter ?? []).map((technician) => (
              <option
                key={technician.technician_id}
                value={technician.technician_id}
              >
                {technician.fullname}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Barangay</span>
          <select
            value={barangay}
            onChange={(event) => {
              setBarangay(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All barangays</option>
            {(report?.barangays_filter ?? []).map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="report-reset-button"
          onClick={resetFilters}
        >
          Reset filters
        </button>
      </section>

      {error ? (
        <div className="report-load-error">
          <span>Reports could not be loaded.</span>
          <button
            type="button"
            onClick={() => setReloadKey((current) => current + 1)}
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      ) : (
        <>
          <section className="report-summary-grid" aria-label="Request summary">
            <article className="report-summary-card">
              <span>Requests received</span>
              <strong>{loading && !report ? "..." : summary.total}</strong>
            </article>
            <article className="report-summary-card">
              <span>Completed</span>
              <strong>{loading && !report ? "..." : summary.completed}</strong>
            </article>
            <article className="report-summary-card">
              <span>Open requests</span>
              <strong>{loading && !report ? "..." : summary.open}</strong>
            </article>
            <article className="report-summary-card">
              <span>Cancelled</span>
              <strong>{loading && !report ? "..." : summary.cancelled}</strong>
            </article>
            <article className="report-summary-card report-completion-card">
              <span>Completion rate</span>
              <strong>
                {loading && !report
                  ? "..."
                  : `${summary.completion_rate.toFixed(1)}%`}
              </strong>
              <div className="report-completion-track">
                <span
                  style={{ width: `${summary.completion_rate}%` }}
                />
              </div>
            </article>
            <article className="report-summary-card">
              <span>Average time to complete</span>
              <strong>
                {loading && !report
                  ? "..."
                  : formatDuration(summary.average_completion_minutes)}
              </strong>
            </article>
          </section>

          <section className="report-chart-grid">
            <article className="report-panel report-trend-panel">
              <div className="report-panel-header">
                <div>
                  <h2>Request trend</h2>
                  <p>Requests received and jobs completed by month</p>
                </div>
                <div className="report-legend">
                  <span><i className="report-legend-request" /> Requests</span>
                  <span><i className="report-legend-completed" /> Completed</span>
                </div>
              </div>
              {report?.trend.length ? (
                <div className="report-trend-chart">
                  {report.trend.map((item) => (
                    <div className="report-trend-column" key={item.period}>
                      <div className="report-trend-bars">
                        <div
                          className="report-trend-bar report-trend-bar-request"
                          title={`${item.requests} requests`}
                          style={{
                            height: `${Math.max(3, (item.requests / maxTrend) * 100)}%`,
                          }}
                        />
                        <div
                          className="report-trend-bar report-trend-bar-completed"
                          title={`${item.completed} completed`}
                          style={{
                            height: `${Math.max(3, (item.completed / maxTrend) * 100)}%`,
                          }}
                        />
                      </div>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="report-empty-chart">No request data for this period.</div>
              )}
            </article>

            <article className="report-panel">
              <div className="report-panel-header">
                <div>
                  <h2>By issue category</h2>
                  <p>Request count by category</p>
                </div>
              </div>
              {report?.categories.length ? (
                <div className="report-horizontal-bars">
                  {report.categories.map((item) => (
                    <div className="report-horizontal-row" key={item.category_id}>
                      <span title={item.category_name}>{item.category_name}</span>
                      <div className="report-horizontal-track">
                        <i
                          style={{ width: `${(item.total / maxCategory) * 100}%` }}
                        />
                      </div>
                      <strong>{item.total}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="report-empty-chart">No category data.</div>
              )}
            </article>

            <article className="report-panel">
              <div className="report-panel-header">
                <div>
                  <h2>By barangay</h2>
                  <p>Request count by service location</p>
                </div>
              </div>
              {report?.barangays.length ? (
                <div className="report-horizontal-bars">
                  {report.barangays.slice(0, 8).map((item) => (
                    <div className="report-horizontal-row" key={item.barangay}>
                      <span title={item.barangay}>{item.barangay}</span>
                      <div className="report-horizontal-track">
                        <i
                          style={{ width: `${(item.total / maxBarangay) * 100}%` }}
                        />
                      </div>
                      <strong>{item.total}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="report-empty-chart">No location data.</div>
              )}
            </article>

            <article className="report-panel">
              <div className="report-panel-header">
                <div>
                  <h2>By status</h2>
                  <p>Current request status</p>
                </div>
              </div>
              {report?.statuses.length ? (
                <div className="report-status-list">
                  {report.statuses.map((item) => (
                    <div className="report-status-row" key={item.status}>
                      <span className={`report-status-dot status-${item.status}`} />
                      <span>{formatStatus(item.status)}</span>
                      <strong>{item.total}</strong>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="report-empty-chart">No status data.</div>
              )}
            </article>
          </section>

          <section className="report-panel report-performance-panel">
            <div className="report-panel-header">
              <div>
                <h2>Technician performance</h2>
                <p>Assignments and customer ratings in the selected period</p>
              </div>
            </div>
            <div className="report-table-scroll">
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Technician</th>
                    <th>Assigned jobs</th>
                    <th>Completed jobs</th>
                    <th>Completion rate</th>
                    <th>Average rating</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !report ? (
                    <tr><td colSpan={5} className="report-table-empty">Loading...</td></tr>
                  ) : report?.technician_performance.length ? (
                    report.technician_performance.map((technician) => (
                      <tr key={technician.technician_id}>
                        <td>{technician.fullname}</td>
                        <td>{technician.assigned}</td>
                        <td>{technician.completed}</td>
                        <td>
                          {technician.assigned
                            ? `${((technician.completed / technician.assigned) * 100).toFixed(1)}%`
                            : "—"}
                        </td>
                        <td>
                          {technician.average_rating === null
                            ? "No ratings"
                            : `${technician.average_rating.toFixed(2)} / 5`}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={5} className="report-table-empty">No technician assignments for this period.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="report-panel report-requests-panel">
            <div className="report-panel-header">
              <div>
                <h2>Service request details</h2>
                <p>{report?.requests.total ?? 0} matching requests</p>
              </div>
              <button
                type="button"
                className="report-inline-export"
                onClick={() => void handleExport()}
                disabled={loading || exporting}
              >
                <Download size={15} />
                Export filtered data
              </button>
            </div>
            <div className="report-table-scroll">
              <table className="report-table report-request-table">
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Client</th>
                    <th>Technician</th>
                    <th>Category</th>
                    <th>Barangay</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !report ? (
                    <tr><td colSpan={7} className="report-table-empty">Loading requests...</td></tr>
                  ) : report?.requests.data.length ? (
                    report.requests.data.map((request) => (
                      <tr key={request.request_id}>
                        <td>
                          <strong>#{request.request_id}</strong>
                          <small>{request.title}</small>
                        </td>
                        <td>{request.client?.user?.fullname ?? "—"}</td>
                        <td>
                          {request.assignment?.technician?.user?.fullname ?? "Unassigned"}
                        </td>
                        <td>{request.category?.category_name ?? "—"}</td>
                        <td>{request.barangay ?? "—"}</td>
                        <td>
                          <span className={`report-request-status status-${request.status}`}>
                            {formatStatus(request.status)}
                          </span>
                        </td>
                        <td>{new Date(request.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={7} className="report-table-empty">No requests match the selected filters.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="report-pagination">
              <span>Page {report?.requests.current_page ?? 1} of {report?.requests.last_page ?? 1}</span>
              <div>
                <button
                  type="button"
                  disabled={loading || page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={loading || page >= (report?.requests.last_page ?? 1)}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default Reports;
