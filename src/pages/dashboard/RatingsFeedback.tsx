import { useEffect, useState } from "react";
import { Search, Star, X } from "lucide-react";
import toast from "react-hot-toast";

import { getFeedback } from "../../services/feedbackService";
import type {
  FeedbackRecord,
  FeedbackTechnicianOption,
} from "../../types/feedback";

import "../../styles/ratingsFeedback.css";

interface FeedbackSummary {
  total: number;
  average_rating: number;
  rating_counts: Record<number, number>;
}

const EMPTY_SUMMARY: FeedbackSummary = {
  total: 0,
  average_rating: 0,
  rating_counts: {},
};

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="feedback-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={16}
          fill={index < rating ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

export default function RatingsFeedback() {
  const [records, setRecords] = useState<FeedbackRecord[]>([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [technicians, setTechnicians] =
    useState<FeedbackTechnicianOption[]>([]);
  const [selectedRecord, setSelectedRecord] =
    useState<FeedbackRecord | null>(null);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [rating, setRating] = useState("");
  const [technicianId, setTechnicianId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadFeedback = async () => {
      setLoading(true);
      setLoadError(false);

      try {
        const response = await getFeedback({
          page,
          per_page: 10,
          search: appliedSearch || undefined,
          rating: rating ? Number(rating) : undefined,
          technician_id: technicianId
            ? Number(technicianId)
            : undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        });

        if (!isMounted) {
          return;
        }

        setRecords(response.data.data);
        setSummary(response.summary);
        setTechnicians(response.technicians);
        setTotal(response.data.total);
        setLastPage(response.data.last_page);
      } catch {
        if (isMounted) {
          setLoadError(true);
          toast.error("Unable to load ratings and feedback.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadFeedback();

    return () => {
      isMounted = false;
    };
  }, [page, appliedSearch, rating, technicianId, fromDate, toDate, reloadKey]);

  const resetFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setRating("");
    setTechnicianId("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  return (
    <div className="feedback-page">
      <div className="page-header">
        <div>
          <h1>Ratings &amp; Feedback</h1>
          <p>Review client feedback about completed technician visits.</p>
        </div>
      </div>

      <section className="feedback-summary" aria-label="Feedback summary">
        <article className="feedback-summary-card">
          <span>Total Reviews</span>
          <strong>{loading && summary.total === 0 ? "..." : summary.total}</strong>
        </article>
        <article className="feedback-summary-card">
          <span>Average Rating</span>
          <strong className="feedback-average">
            {loading && summary.total === 0
              ? "..."
              : summary.average_rating.toFixed(2)}
            {!loading || summary.total > 0 ? (
              <span className="feedback-out-of">/ 5</span>
            ) : null}
          </strong>
          <RatingStars rating={Math.round(summary.average_rating)} />
        </article>
        <article className="feedback-summary-card feedback-rating-breakdown">
          <span>Rating Breakdown</span>
          {[5, 4, 3, 2, 1].map((value) => (
            <div className="feedback-breakdown-row" key={value}>
              <span>{value} stars</span>
              <div className="feedback-breakdown-track">
                <span
                  style={{
                    width: summary.total
                      ? `${((summary.rating_counts[value] ?? 0) / summary.total) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <strong>{summary.rating_counts[value] ?? 0}</strong>
            </div>
          ))}
        </article>
      </section>

      <form
        className="feedback-toolbar"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setAppliedSearch(search.trim());
        }}
      >
        <label className="feedback-search">
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search reviews, clients, technicians..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            aria-label="Search feedback"
          />
        </label>
        <select
          aria-label="Filter by rating"
          value={rating}
          onChange={(event) => {
            setRating(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All ratings</option>
          {[5, 4, 3, 2, 1].map((value) => (
            <option value={value} key={value}>
              {value} stars
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by technician"
          value={technicianId}
          onChange={(event) => {
            setTechnicianId(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All technicians</option>
          {technicians.map((technician) => (
            <option
              key={technician.technician_id}
              value={technician.technician_id}
            >
              {technician.fullname}
            </option>
          ))}
        </select>
        <label className="feedback-date-filter">
          <span>From</span>
          <input
            type="date"
            aria-label="From date"
            value={fromDate}
            max={toDate || undefined}
            onChange={(event) => {
              setFromDate(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label className="feedback-date-filter">
          <span>To</span>
          <input
            type="date"
            aria-label="To date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(event) => {
              setToDate(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <button type="submit" className="feedback-search-button">
          Search
        </button>
        <button
          type="button"
          className="feedback-reset-button"
          onClick={resetFilters}
        >
          Reset
        </button>
      </form>

      <div className="feedback-table-card">
        <div className="feedback-table-scroll">
          <table className="feedback-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Technician</th>
                <th>Service Request</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="feedback-empty">
                    Loading feedback...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan={7} className="feedback-empty">
                    <span>Could not load feedback.</span>
                    <button
                      type="button"
                      className="feedback-retry-button"
                      onClick={() => setReloadKey((current) => current + 1)}
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="feedback-empty">
                    No feedback matches these filters.
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.feedback_id}>
                    <td>{new Date(record.created_at).toLocaleDateString()}</td>
                    <td>{record.client?.user?.fullname ?? "Unknown client"}</td>
                    <td>
                      {record.technician?.user?.fullname ??
                        "Unknown technician"}
                    </td>
                    <td>
                      <strong>
                        {record.repair_request?.title ?? `Request #${record.request_id}`}
                      </strong>
                      <small>
                        {record.repair_request?.category?.category_name ?? ""}
                      </small>
                    </td>
                    <td>
                      <span className="feedback-rating-cell">
                        <RatingStars rating={record.rating} />
                        <span>{record.rating}/5</span>
                      </span>
                    </td>
                    <td className="feedback-comment-preview">
                      {record.comment?.trim() || "No written comment"}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="feedback-view-button"
                        onClick={() => setSelectedRecord(record)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="feedback-pagination">
          <span>
            {total} {total === 1 ? "review" : "reviews"}
          </span>
          <div>
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </button>
            <span>Page {page} of {lastPage}</span>
            <button
              type="button"
              disabled={page >= lastPage || loading}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {selectedRecord && (
        <div
          className="feedback-modal-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null);
            }
          }}
        >
          <section
            className="feedback-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
          >
            <header className="feedback-modal-header">
              <div>
                <h2 id="feedback-modal-title">Feedback Details</h2>
                <p>
                  Review for request #{selectedRecord.request_id}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close feedback details"
                onClick={() => setSelectedRecord(null)}
              >
                <X size={20} />
              </button>
            </header>
            <div className="feedback-modal-content">
              <div className="feedback-detail-grid">
                <div>
                  <span>Rating</span>
                  <div className="feedback-modal-rating">
                    <RatingStars rating={selectedRecord.rating} />
                    <strong>{selectedRecord.rating}/5</strong>
                  </div>
                </div>
                <div>
                  <span>Submitted</span>
                  <strong>
                    {new Date(selectedRecord.created_at).toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span>Client</span>
                  <strong>
                    {selectedRecord.client?.user?.fullname ?? "Unknown client"}
                  </strong>
                  <small>{selectedRecord.client?.user?.email ?? ""}</small>
                  <small>{selectedRecord.client?.user?.phone ?? ""}</small>
                </div>
                <div>
                  <span>Technician</span>
                  <strong>
                    {selectedRecord.technician?.user?.fullname ??
                      "Unknown technician"}
                  </strong>
                  <small>
                    {selectedRecord.technician?.user?.email ?? ""}
                  </small>
                  <small>
                    {selectedRecord.technician?.user?.phone ?? ""}
                  </small>
                </div>
                <div className="feedback-detail-request">
                  <span>Service Request</span>
                  <strong>
                    {selectedRecord.repair_request?.title ??
                      `Request #${selectedRecord.request_id}`}
                  </strong>
                  <small>
                    {selectedRecord.repair_request?.category?.category_name ??
                      ""}
                  </small>
                  <p>
                    {selectedRecord.repair_request?.description ??
                      "Request details are unavailable."}
                  </p>
                </div>
                <div className="feedback-detail-comment">
                  <span>Client Comment</span>
                  <p>
                    {selectedRecord.comment?.trim() || "No written comment."}
                  </p>
                </div>
              </div>
            </div>
            <footer className="feedback-modal-footer">
              <button
                type="button"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}
