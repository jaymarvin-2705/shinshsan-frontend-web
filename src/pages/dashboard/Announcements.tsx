import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Archive,
  ArrowDownUp,
  Eye,
  Megaphone,
  Pencil,
  Plus,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  archiveAnnouncement,
  createAnnouncement,
  deleteAnnouncement,
  downloadAnnouncementAttachment,
  getAnnouncements,
  publishAnnouncement,
  updateAnnouncement,
} from "../../services/announcementService";
import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementCategory,
  AnnouncementSortField,
  AnnouncementStatus,
  AnnouncementSummary,
  GetAnnouncementsParams,
  SaveAnnouncementPayload,
} from "../../types/announcement";

import "../../styles/announcements.css";

const EMPTY_SUMMARY: AnnouncementSummary = {
  total: 0,
  published: 0,
  draft: 0,
  scheduled: 0,
  archived: 0,
};

const CATEGORY_LABELS: Record<AnnouncementCategory, string> = {
  general: "General Announcement",
  maintenance: "Maintenance",
  service_interruption: "Service Interruption",
  system_update: "System Update",
  important_notice: "Important Notice",
  promotional: "Promotional Announcement",
};

const AUDIENCE_LABELS: Record<AnnouncementAudience, string> = {
  clients: "Clients",
  technicians: "Technicians",
  all: "All Users",
};

const STATUS_LABELS: Record<AnnouncementStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

interface AnnouncementFormState {
  title: string;
  content: string;
  category: AnnouncementCategory;
  target_audience: AnnouncementAudience;
  status: "draft" | "scheduled";
  publish_at: string;
  expires_at: string;
  attachment: File | null;
  remove_attachment: boolean;
}

const EMPTY_FORM: AnnouncementFormState = {
  title: "",
  content: "",
  category: "general",
  target_audience: "all",
  status: "draft",
  publish_at: "",
  expires_at: "",
  attachment: null,
  remove_attachment: false,
};

const formatDate = (date: string | null) => {
  if (!date) return "—";

  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(parsed);
};

const toDateTimeInput = (date: string | null) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";
  const local = new Date(parsed.getTime() - parsed.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
};

function getErrorMessage(error: unknown): string {
  if (
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
  ) {
    return error.response.data.message;
  }

  return "Unable to load announcements. Please try again.";
}

function toFormState(announcement: Announcement): AnnouncementFormState {
  return {
    title: announcement.title,
    content: announcement.content,
    category: announcement.category,
    target_audience: announcement.target_audience,
    status: announcement.status === "scheduled" ? "scheduled" : "draft",
    publish_at: toDateTimeInput(announcement.publish_at),
    expires_at: toDateTimeInput(announcement.expires_at),
    attachment: null,
    remove_attachment: false,
  };
}

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState<GetAnnouncementsParams>({
    page: 1,
    per_page: 10,
    sort: "created_at",
    direction: "desc",
  });
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<Announcement | null>(null);
  const [form, setForm] = useState<AnnouncementFormState>(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewAnnouncement, setPreviewAnnouncement] =
    useState<AnnouncementFormState | null>(null);
  const [pendingPublish, setPendingPublish] = useState<Announcement | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [busyAnnouncementId, setBusyAnnouncementId] = useState<number | null>(null);

  const loadAnnouncements = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const response = await getAnnouncements(filters);
      setAnnouncements(response.data.data);
      setSummary(response.summary);
      setLastPage(response.data.last_page);
      setTotal(response.data.total);
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // The effect synchronizes server-backed data whenever dashboard filters change.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadAnnouncements();
  }, [loadAnnouncements]);

  const updateFilter = <K extends keyof GetAnnouncementsParams>(
    key: K,
    value: GetAnnouncementsParams[K]
  ) => {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: 1,
    }));
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFilters((current) => ({
      ...current,
      search: searchInput.trim() || undefined,
      page: 1,
    }));
  };

  const toggleSortDirection = () => {
    setFilters((current) => ({
      ...current,
      direction: current.direction === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };

  const openCreate = () => {
    setEditingAnnouncement(null);
    setForm(EMPTY_FORM);
    setEditorOpen(true);
  };

  const openEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setForm(toFormState(announcement));
    setEditorOpen(true);
  };

  const closeEditor = () => {
    if (formBusy) return;
    setEditorOpen(false);
    setEditingAnnouncement(null);
    setForm(EMPTY_FORM);
  };

  const updateForm = <K extends keyof AnnouncementFormState>(
    key: K,
    value: AnnouncementFormState[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const showPreview = (announcement: AnnouncementFormState) => {
    setPreviewAnnouncement(announcement);
    setPreviewOpen(true);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formBusy) return;

    const publishAt = form.publish_at
      ? new Date(form.publish_at)
      : null;
    const expiresAt = form.expires_at
      ? new Date(form.expires_at)
      : null;

    if (form.status === "scheduled" &&
        (!publishAt || publishAt.getTime() <= Date.now())) {
      toast.error("Choose a future date and time to schedule this announcement.");
      return;
    }

    if (expiresAt && publishAt && expiresAt.getTime() <= publishAt.getTime()) {
      toast.error("The expiration date must be after the publish date.");
      return;
    }

    const payload: SaveAnnouncementPayload = {
      title: form.title.trim(),
      content: form.content.trim(),
      category: form.category,
      target_audience: form.target_audience,
      ...(editingAnnouncement?.status === "published"
        ? {}
        : {
            status: form.status,
            publish_at: form.status === "scheduled" ? form.publish_at : null,
          }),
      expires_at: form.expires_at || null,
      attachment: form.attachment,
    };

    setFormBusy(true);
    try {
      if (editingAnnouncement) {
        await updateAnnouncement(
          editingAnnouncement.announcement_id,
          payload,
          form.remove_attachment
        );
        toast.success("Announcement updated.");
      } else {
        await createAnnouncement(payload);
        toast.success(
          form.status === "scheduled"
            ? "Announcement scheduled."
            : "Draft saved."
        );
      }

      setEditorOpen(false);
      setEditingAnnouncement(null);
      setForm(EMPTY_FORM);
      await loadAnnouncements();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setFormBusy(false);
    }
  };

  const handlePublish = async () => {
    if (!pendingPublish || publishing) return;
    setPublishing(true);
    try {
      await publishAnnouncement(pendingPublish.announcement_id);
      toast.success("Announcement published.");
      setPendingPublish(null);
      await loadAnnouncements();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setPublishing(false);
    }
  };

  const handleArchive = async (announcement: Announcement) => {
    if (!window.confirm(`Archive “${announcement.title}”?`)) return;
    setBusyAnnouncementId(announcement.announcement_id);
    try {
      await archiveAnnouncement(announcement.announcement_id);
      toast.success("Announcement archived.");
      await loadAnnouncements();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAnnouncementId(null);
    }
  };

  const handleDelete = async (announcement: Announcement) => {
    if (!window.confirm(`Permanently delete “${announcement.title}”? This cannot be undone.`)) {
      return;
    }
    setBusyAnnouncementId(announcement.announcement_id);
    try {
      await deleteAnnouncement(announcement.announcement_id);
      toast.success("Announcement deleted.");
      await loadAnnouncements();
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusyAnnouncementId(null);
    }
  };

  const handleDownloadAttachment = async (announcement: Announcement) => {
    try {
      const attachment = await downloadAnnouncementAttachment(
        announcement.announcement_id
      );
      const objectUrl = window.URL.createObjectURL(attachment);
      const link = document.createElement("a");
      link.href = objectUrl;
      link.download = announcement.title.replace(/[^\w.-]+/g, "_") || "announcement";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(objectUrl), 1000);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    }
  };

  const previewVariants =
    previewAnnouncement?.target_audience === "all"
      ? (["clients", "technicians"] as const)
      : previewAnnouncement
        ? ([previewAnnouncement.target_audience] as const)
        : [];

  const pageStart = total === 0 ? 0 : (filters.page! - 1) * filters.per_page! + 1;
  const pageEnd = Math.min(filters.page! * filters.per_page!, total);

  return (
    <div className="announcements-page">
      <header className="announcements-header">
        <div>
          <h1>Announcements</h1>
          <p>Review announcements and their publishing status.</p>
        </div>
        <button type="button" className="announcement-primary-button" onClick={openCreate}>
          <Plus size={18} />
          Create Announcement
        </button>
      </header>

      <section
        className="announcement-summary"
        aria-label="Announcement summary"
      >
        {(
          [
            ["total", "Total Announcements"],
            ["published", "Published"],
            ["draft", "Drafts"],
            ["scheduled", "Scheduled"],
          ] as const
        ).map(([key, label]) => (
          <article className={`announcement-summary-card summary-${key}`} key={key}>
            <span>{label}</span>
            <strong>{summary[key]}</strong>
          </article>
        ))}
      </section>

      <section className="announcement-list-card">
        <div className="announcement-list-heading">
          <div>
            <h2>All Announcements</h2>
            <p>{total} announcement{total === 1 ? "" : "s"}</p>
          </div>
        </div>

        <form className="announcement-filters" onSubmit={submitSearch}>
          <label className="announcement-search">
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              placeholder="Search title or message"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              aria-label="Search announcement title or message"
            />
            <button type="submit">Search</button>
          </label>

          <select
            value={filters.audience ?? ""}
            onChange={(event) =>
              updateFilter(
                "audience",
                (event.target.value || undefined) as AnnouncementAudience | undefined
              )
            }
            aria-label="Filter by audience"
          >
            <option value="">All audiences</option>
            <option value="clients">Clients</option>
            <option value="technicians">Technicians</option>
            <option value="all">All Users</option>
          </select>

          <select
            value={filters.category ?? ""}
            onChange={(event) =>
              updateFilter(
                "category",
                (event.target.value || undefined) as AnnouncementCategory | undefined
              )
            }
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>

          <select
            value={filters.status ?? ""}
            onChange={(event) =>
              updateFilter(
                "status",
                (event.target.value || undefined) as AnnouncementStatus | undefined
              )
            }
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option value={value} key={value}>{label}</option>
            ))}
          </select>

          <label className="announcement-date-filter">
            <span>From</span>
            <input
              type="date"
              value={filters.published_from ?? ""}
              onChange={(event) =>
                updateFilter("published_from", event.target.value || undefined)
              }
              aria-label="Publish date from"
            />
          </label>

          <label className="announcement-date-filter">
            <span>To</span>
            <input
              type="date"
              value={filters.published_to ?? ""}
              onChange={(event) =>
                updateFilter("published_to", event.target.value || undefined)
              }
              aria-label="Publish date to"
            />
          </label>
        </form>

        <div className="announcement-table-tools">
          <label>
            Sort by
            <select
              value={filters.sort}
              onChange={(event) =>
                updateFilter("sort", event.target.value as AnnouncementSortField)
              }
            >
              <option value="created_at">Date created</option>
              <option value="publish_at">Publish date</option>
              <option value="published_at">Date published</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </label>
          <button
            type="button"
            className="announcement-sort-direction"
            onClick={toggleSortDirection}
            aria-label={`Sort ${filters.direction === "asc" ? "descending" : "ascending"}`}
          >
            <ArrowDownUp size={16} />
            {filters.direction === "asc" ? "Ascending" : "Descending"}
          </button>
          <label>
            Rows
            <select
              value={filters.per_page}
              onChange={(event) =>
                updateFilter("per_page", Number(event.target.value))
              }
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </label>
        </div>

        <div className="announcement-table-scroll">
          <table className="announcement-table">
            <thead>
              <tr>
                <th scope="col">Announcement Title</th>
                <th scope="col">Audience</th>
                <th scope="col">Category</th>
                <th scope="col">Date Created</th>
                <th scope="col">Publish Date</th>
                <th scope="col">Status</th>
                <th scope="col">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="announcement-table-state" colSpan={7}>
                    Loading announcements…
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td className="announcement-table-state" colSpan={7}>
                    {loadError}
                  </td>
                </tr>
              ) : announcements.length === 0 ? (
                <tr>
                  <td className="announcement-table-state" colSpan={7}>
                    No announcements match these filters.
                  </td>
                </tr>
              ) : (
                announcements.map((announcement) => (
                  <tr key={announcement.announcement_id}>
                    <td>
                      <strong>{announcement.title}</strong>
                      <span className="announcement-message-preview">
                        {announcement.content}
                      </span>
                    </td>
                    <td>
                      <span className={`announcement-audience audience-${announcement.target_audience}`}>
                        {AUDIENCE_LABELS[announcement.target_audience]}
                      </span>
                    </td>
                    <td>{CATEGORY_LABELS[announcement.category]}</td>
                    <td>{formatDate(announcement.created_at)}</td>
                    <td>{formatDate(announcement.publish_at)}</td>
                    <td>
                      <span className={`announcement-status status-${announcement.status}`}>
                        {STATUS_LABELS[announcement.status]}
                      </span>
                    </td>
                    <td>
                      <div className="announcement-row-actions">
                        <button
                          type="button"
                          aria-label={`Preview ${announcement.title}`}
                          title="Preview"
                          onClick={() => {
                            setPreviewAnnouncement(toFormState(announcement));
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        {announcement.status !== "archived" ? (
                          <button
                            type="button"
                            aria-label={`Edit ${announcement.title}`}
                            title="Edit"
                            onClick={() => openEdit(announcement)}
                          >
                            <Pencil size={16} />
                          </button>
                        ) : null}
                        {announcement.status === "draft" ||
                        announcement.status === "scheduled" ? (
                          <button
                            type="button"
                            aria-label={`Publish ${announcement.title}`}
                            title="Publish"
                            disabled={busyAnnouncementId === announcement.announcement_id}
                            onClick={() => setPendingPublish(announcement)}
                          >
                            <Send size={16} />
                          </button>
                        ) : null}
                        {announcement.status !== "archived" ? (
                          <button
                            type="button"
                            aria-label={`Archive ${announcement.title}`}
                            title="Archive"
                            disabled={busyAnnouncementId === announcement.announcement_id}
                            onClick={() => void handleArchive(announcement)}
                          >
                            <Archive size={16} />
                          </button>
                        ) : null}
                        <button
                          type="button"
                          aria-label={`Delete ${announcement.title}`}
                          title="Delete"
                          disabled={busyAnnouncementId === announcement.announcement_id}
                          onClick={() => void handleDelete(announcement)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="announcement-pagination">
          <span>
            Showing {pageStart}–{pageEnd} of {total}
          </span>
          <div>
            <button
              type="button"
              disabled={loading || filters.page === 1}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.max(1, (current.page ?? 1) - 1),
                }))
              }
            >
              Previous
            </button>
            <span>Page {filters.page} of {lastPage}</span>
            <button
              type="button"
              disabled={loading || (filters.page ?? 1) >= lastPage}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: Math.min(lastPage, (current.page ?? 1) + 1),
                }))
              }
            >
              Next
            </button>
          </div>
        </footer>
      </section>

      {editorOpen ? (
        <div className="announcement-modal-backdrop" role="presentation">
          <section
            className="announcement-modal announcement-editor-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-editor-title"
          >
            <header className="announcement-modal-header">
              <div>
                <span className="announcement-modal-eyebrow">ANNOUNCEMENT</span>
                <h2 id="announcement-editor-title">
                  {editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
                </h2>
              </div>
              <button
                type="button"
                className="announcement-modal-close"
                onClick={closeEditor}
                disabled={formBusy}
                aria-label="Close announcement editor"
              >
                <X size={20} />
              </button>
            </header>

            <form onSubmit={handleSave}>
              <div className="announcement-form-grid">
                <label className="announcement-form-field announcement-form-wide">
                  <span>Announcement Title</span>
                  <input
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    required
                    maxLength={150}
                    placeholder="Enter a clear announcement title"
                  />
                </label>

                <label className="announcement-form-field announcement-form-wide">
                  <span>Message</span>
                  <textarea
                    value={form.content}
                    onChange={(event) => updateForm("content", event.target.value)}
                    required
                    maxLength={10000}
                    rows={5}
                    placeholder="Write the announcement message"
                  />
                </label>

                <label className="announcement-form-field">
                  <span>Category</span>
                  <select
                    value={form.category}
                    onChange={(event) =>
                      updateForm("category", event.target.value as AnnouncementCategory)
                    }
                  >
                    {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                      <option value={value} key={value}>{label}</option>
                    ))}
                  </select>
                </label>

                <label className="announcement-form-field">
                  <span>Target Audience</span>
                  <select
                    value={form.target_audience}
                    onChange={(event) =>
                      updateForm("target_audience", event.target.value as AnnouncementAudience)
                    }
                  >
                    <option value="clients">Clients Only</option>
                    <option value="technicians">Technicians Only</option>
                    <option value="all">All Users</option>
                  </select>
                </label>

                <div className="announcement-audience-help announcement-form-wide" role="status">
                  {form.target_audience === "clients"
                    ? "This announcement will be delivered only to active client accounts."
                    : form.target_audience === "technicians"
                      ? "This announcement will be delivered only to active technician accounts."
                      : "This announcement will be delivered to active client and technician accounts."}
                </div>

                <label className="announcement-form-field">
                  <span>Save or schedule</span>
                  <select
                    value={form.status}
                    disabled={editingAnnouncement?.status === "published"}
                    onChange={(event) =>
                      updateForm("status", event.target.value as "draft" | "scheduled")
                    }
                  >
                    <option value="draft">Save as Draft</option>
                    <option value="scheduled">Schedule</option>
                  </select>
                </label>

                {form.status === "scheduled" &&
                editingAnnouncement?.status !== "published" ? (
                  <label className="announcement-form-field">
                    <span>Publish Date and Time</span>
                    <input
                      type="datetime-local"
                      value={form.publish_at}
                      required
                      onChange={(event) => updateForm("publish_at", event.target.value)}
                    />
                  </label>
                ) : (
                  <div className="announcement-form-field">
                    <span>Publish Date and Time</span>
                    <div className="announcement-readonly-date">
                      {editingAnnouncement?.status === "published"
                        ? formatDate(editingAnnouncement.published_at)
                        : "Set when you publish"}
                    </div>
                  </div>
                )}

                <label className="announcement-form-field">
                  <span>Expiration Date (optional)</span>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(event) => updateForm("expires_at", event.target.value)}
                  />
                </label>

                <label className="announcement-form-field">
                  <span>Image or PDF attachment (optional)</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    onChange={(event) =>
                      updateForm("attachment", event.target.files?.[0] ?? null)
                    }
                  />
                  <small>JPG, PNG, WEBP, or PDF. Maximum 5 MB.</small>
                </label>

                {editingAnnouncement?.attachment_url ? (
                  <div className="announcement-existing-attachment announcement-form-wide">
                    <button
                      type="button"
                      onClick={() => void handleDownloadAttachment(editingAnnouncement)}
                    >
                      Download current attachment
                    </button>
                    <label>
                      <input
                        type="checkbox"
                        checked={form.remove_attachment}
                        onChange={(event) =>
                          updateForm("remove_attachment", event.target.checked)
                        }
                      />
                      Remove current attachment
                    </label>
                  </div>
                ) : null}
                {form.attachment ? (
                  <p className="announcement-selected-file announcement-form-wide">
                    Selected: {form.attachment.name}
                  </p>
                ) : null}
              </div>

              <footer className="announcement-modal-footer">
                <button
                  type="button"
                  className="announcement-secondary-button"
                  onClick={() => showPreview(form)}
                >
                  <Eye size={16} />
                  Preview
                </button>
                <div>
                  <button
                    type="button"
                    className="announcement-secondary-button"
                    onClick={closeEditor}
                    disabled={formBusy}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="announcement-primary-button"
                    disabled={formBusy}
                  >
                    {formBusy
                      ? "Saving…"
                      : form.status === "scheduled" &&
                        editingAnnouncement?.status !== "published"
                        ? "Schedule Announcement"
                        : editingAnnouncement
                          ? "Save Changes"
                          : "Save as Draft"}
                  </button>
                </div>
              </footer>
            </form>
          </section>
        </div>
      ) : null}

      {previewOpen && previewAnnouncement ? (
        <div className="announcement-modal-backdrop announcement-preview-backdrop" role="presentation">
          <section
            className="announcement-modal announcement-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-preview-title"
          >
            <header className="announcement-modal-header">
              <div>
                <span className="announcement-modal-eyebrow">LIVE PREVIEW</span>
                <h2 id="announcement-preview-title">Announcement Preview</h2>
              </div>
              <button
                type="button"
                className="announcement-modal-close"
                onClick={() => setPreviewOpen(false)}
                aria-label="Close announcement preview"
              >
                <X size={20} />
              </button>
            </header>
            <div className="announcement-previews">
              {previewVariants.map((audience) => (
                <article
                  className={`announcement-phone-preview preview-${audience}`}
                  key={audience}
                >
                  <div className="announcement-phone-header">
                    <Megaphone size={18} />
                    <span>{audience === "clients" ? "CLIENT UPDATES" : "TECHNICIAN UPDATES"}</span>
                  </div>
                  <div className="announcement-phone-card">
                    <span className="announcement-preview-category">
                      {CATEGORY_LABELS[previewAnnouncement.category]}
                    </span>
                    <h3>{previewAnnouncement.title || "Announcement title"}</h3>
                    <p>{previewAnnouncement.content || "Announcement message preview."}</p>
                    {previewAnnouncement.attachment ? (
                      <span className="announcement-preview-attachment">
                        {previewAnnouncement.attachment.type.startsWith("image/")
                          ? "Image"
                          : "Attachment"}: {previewAnnouncement.attachment.name}
                      </span>
                    ) : null}
                    <time>
                      {previewAnnouncement.status === "scheduled" &&
                      previewAnnouncement.publish_at
                        ? formatDate(previewAnnouncement.publish_at)
                        : "Published just now"}
                    </time>
                  </div>
                  <span className="announcement-preview-theme">
                    {audience === "clients" ? "Customer • Green theme" : "Technician • Blue theme"}
                  </span>
                </article>
              ))}
            </div>
            <footer className="announcement-modal-footer">
              <button
                type="button"
                className="announcement-secondary-button"
                onClick={() => setPreviewOpen(false)}
              >
                Close Preview
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {pendingPublish ? (
        <div className="announcement-modal-backdrop" role="presentation">
          <section
            className="announcement-modal announcement-confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="announcement-publish-title"
          >
            <header className="announcement-modal-header">
              <div>
                <span className="announcement-modal-eyebrow">CONFIRM PUBLISHING</span>
                <h2 id="announcement-publish-title">Publish announcement?</h2>
              </div>
              <button
                type="button"
                className="announcement-modal-close"
                onClick={() => setPendingPublish(null)}
                disabled={publishing}
                aria-label="Close publish confirmation"
              >
                <X size={20} />
              </button>
            </header>
            <dl className="announcement-publish-summary">
              <div><dt>Title</dt><dd>{pendingPublish.title}</dd></div>
              <div><dt>Audience</dt><dd>{AUDIENCE_LABELS[pendingPublish.target_audience]}</dd></div>
              <div><dt>Category</dt><dd>{CATEGORY_LABELS[pendingPublish.category]}</dd></div>
              <div><dt>Publish date and time</dt><dd>Immediately — {formatDate(new Date().toISOString())}</dd></div>
            </dl>
            <p className="announcement-confirm-notice">
              This will deliver the announcement to the selected audience.
            </p>
            <footer className="announcement-modal-footer">
              <button
                type="button"
                className="announcement-secondary-button"
                onClick={() => setPendingPublish(null)}
                disabled={publishing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="announcement-primary-button"
                onClick={() => void handlePublish()}
                disabled={publishing}
              >
                <Send size={16} />
                {publishing ? "Publishing…" : "Confirm Publish"}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </div>
  );
}
