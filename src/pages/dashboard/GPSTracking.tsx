import { useEffect, useRef, useState } from "react";
import { MapPin, RefreshCw, Users } from "lucide-react";

import { getMapTrackingData } from "../../services/mapTrackingService";
import { loadGoogleMaps } from "../../services/googleMapsLoader";
import type { MapTechnician } from "../../types/mapTracking";
import type {
  RepairRequest,
  RepairRequestStatus,
} from "../../types/serviceRequest";

import "../../styles/gpsTracking.css";

type SelectedMarker =
  | { type: "request"; request: RepairRequest }
  | { type: "technician"; technician: MapTechnician }
  | null;

const DEFAULT_CENTER = { lat: 9.86, lng: 124.33 };
const MISSING_MAP_KEY =
  "Google Maps is not configured. Add VITE_GOOGLE_MAPS_API_KEY to frontend-web/.env and restart the web app.";

function coordinate(value: string | null | undefined): number | null {
  if (value === null || value === undefined || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatStatus(status: string): string {
  return status.replaceAll("_", " ");
}

function formatLocationTime(value: string | null): string {
  if (!value) {
    return "Location has not been reported";
  }
  return new Date(value).toLocaleString();
}

function isLocationStale(value: string | null): boolean {
  if (!value) return true;
  const timestamp = Date.parse(value);
  return !Number.isFinite(timestamp) || Date.now() - timestamp > 5 * 60 * 1000;
}

function isRepairRequestStatus(
  value: string
): value is RepairRequestStatus {
  return [
    "pending",
    "assigned",
    "on_the_way",
    "in_progress",
    "completed",
    "cancelled",
  ].includes(value);
}

export default function GPSTracking() {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markers = useRef<google.maps.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(
    () => import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? "" : MISSING_MAP_KEY
  );
  const [dataError, setDataError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] =
    useState<RepairRequestStatus | "">("");
  const [showRequests, setShowRequests] = useState(true);
  const [showTechnicians, setShowTechnicians] = useState(true);
  const [requests, setRequests] = useState<RepairRequest[]>([]);
  const [technicians, setTechnicians] = useState<MapTechnician[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker>(null);

  useEffect(() => {
    let active = true;

    const refreshData = async () => {
      try {
        const response = await getMapTrackingData(statusFilter || undefined);
        if (active) {
          setRequests(response.data.requests);
          setTechnicians(response.data.technicians);
          setLastUpdated(response.data.last_updated_at);
          setDataError(false);
        }
      } catch {
        if (active) {
          setDataError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void refreshData();
    const timer = window.setInterval(() => void refreshData(), 30000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [statusFilter, refreshKey]);

  useEffect(() => {
    let active = true;
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return;
    }

    void loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!active || !mapElement.current) return;
        mapInstance.current = new maps.maps.Map(mapElement.current, {
          center: DEFAULT_CENTER,
          zoom: 12,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
          clickableIcons: false,
        });
        setMapLoaded(true);
        setMapError("");
      })
      .catch((error: unknown) => {
        if (active) {
          setMapError(
            error instanceof Error
              ? error.message
              : "Google Maps could not be loaded."
          );
        }
      });

    return () => {
      active = false;
      markers.current.forEach((marker) => marker.setMap(null));
      markers.current = [];
      mapInstance.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapInstance.current;
    if (!mapLoaded || !map) return;

    markers.current.forEach((marker) => marker.setMap(null));
    markers.current = [];
    const bounds = new google.maps.LatLngBounds();
    let markerCount = 0;

    if (showRequests) {
      requests.forEach((request) => {
        const lat = coordinate(request.service_latitude);
        const lng = coordinate(request.service_longitude);
        if (lat === null || lng === null) return;

        const marker = new google.maps.Marker({
          map,
          position: { lat, lng },
          title: `Request #${request.request_id}: ${request.title}`,
          label: {
            text: "R",
            color: "#ffffff",
            fontWeight: "700",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor:
              request.status === "completed"
                ? "#16a34a"
                : request.status === "cancelled"
                  ? "#64748b"
                  : "#7c3aed",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        marker.addListener("click", () =>
          setSelectedMarker({ type: "request", request })
        );
        markers.current.push(marker);
        bounds.extend({ lat, lng });
        markerCount += 1;
      });
    }

    if (showTechnicians) {
      technicians.forEach((technician) => {
        const lat = coordinate(technician.current_latitude);
        const lng = coordinate(technician.current_longitude);
        if (lat === null || lng === null) return;
        const stale = isLocationStale(
          technician.current_location_updated_at
        );

        const marker = new google.maps.Marker({
          map,
          position: { lat, lng },
          title: `${technician.user?.fullname ?? "Technician"}${stale ? " (last location may be outdated)" : ""}`,
          label: {
            text: "T",
            color: "#ffffff",
            fontWeight: "700",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: stale ? "#64748b" : "#ea580c",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
        });
        marker.addListener("click", () =>
          setSelectedMarker({ type: "technician", technician })
        );
        markers.current.push(marker);
        bounds.extend({ lat, lng });
        markerCount += 1;
      });
    }

    if (markerCount > 1) {
      map.fitBounds(bounds, 48);
    } else if (markerCount === 1) {
      map.fitBounds(bounds, 48);
    }
  }, [
    mapLoaded,
    requests,
    technicians,
    showRequests,
    showTechnicians,
  ]);

  const refreshLocations = () => {
    setLoading(true);
    setRefreshKey((current) => current + 1);
  };

  const mappedRequestCount = requests.filter(
    (request) =>
      coordinate(request.service_latitude) !== null &&
      coordinate(request.service_longitude) !== null
  ).length;
  const mappedTechnicianCount = technicians.filter(
    (technician) =>
      coordinate(technician.current_latitude) !== null &&
      coordinate(technician.current_longitude) !== null
  ).length;
  const requestsWithoutLocation = requests.length - mappedRequestCount;
  const techniciansWithoutLocation = technicians.length - mappedTechnicianCount;

  return (
    <div className="gps-page">
      <header className="page-header gps-page-header">
        <div>
          <h1>GPS Tracking</h1>
          <p>View service request locations and technician positions.</p>
        </div>
        <button
          type="button"
          className="gps-refresh-button"
          onClick={refreshLocations}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? "gps-spinning" : ""} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </header>

      <section className="gps-toolbar" aria-label="Map controls">
        <label>
          <span>Request status</span>
          <select
            value={statusFilter}
            onChange={(event) => {
              setLoading(true);
              const value = event.target.value;
              setStatusFilter(
                isRepairRequestStatus(value) ? value : ""
              );
              setSelectedMarker(null);
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

        <label className="gps-toggle">
          <input
            type="checkbox"
            checked={showRequests}
            onChange={(event) => setShowRequests(event.target.checked)}
          />
          <span className="gps-legend-dot gps-request-dot" />
          Service requests ({mappedRequestCount})
        </label>

        <label className="gps-toggle">
          <input
            type="checkbox"
            checked={showTechnicians}
            onChange={(event) => setShowTechnicians(event.target.checked)}
          />
          <span className="gps-legend-dot gps-technician-dot" />
          Technicians ({mappedTechnicianCount})
        </label>

        <span className="gps-updated">
          Auto-refresh every 30 seconds
          {lastUpdated
            ? ` · Last checked ${new Date(lastUpdated).toLocaleTimeString()}`
            : ""}
        </span>
      </section>

      {dataError ? (
        <div className="gps-error">
          Map locations could not be loaded. Check the API connection and retry.
        </div>
      ) : null}
      {!dataError && (requestsWithoutLocation > 0 || techniciansWithoutLocation > 0) ? (
        <div className="gps-location-warning">
          {requestsWithoutLocation > 0
            ? `${requestsWithoutLocation} service request(s) do not have saved GPS coordinates. `
            : ""}
          {techniciansWithoutLocation > 0
            ? `${techniciansWithoutLocation} technician(s) have not shared a location yet.`
            : ""}
        </div>
      ) : null}

      <div className="gps-content">
        <div className="gps-map-shell">
          <div
            ref={mapElement}
            className="gps-map"
            aria-label="Map of service request and technician locations"
          />
          {mapError ? (
            <div className="gps-map-message">
              <MapPin size={28} />
              <strong>Google Map unavailable</strong>
              <p>{mapError}</p>
              <small>
                Enable Maps JavaScript API and billing for the Google Cloud
                project associated with this key.
              </small>
            </div>
          ) : null}
          {loading && !mapError ? (
            <div className="gps-map-loading">Updating locations...</div>
          ) : null}
          {!mapError &&
          mapLoaded &&
          showRequests &&
          mappedRequestCount === 0 &&
          showTechnicians &&
          mappedTechnicianCount === 0 ? (
            <div className="gps-map-empty">
              No coordinates are available yet. Clients can pin request
              locations in the mobile app; technicians can enable location
              sharing while an active assignment is open.
            </div>
          ) : null}
        </div>

        <aside className="gps-details-panel">
          {selectedMarker?.type === "request" ? (
            <>
              <div className="gps-details-heading">
                <span className="gps-legend-dot gps-request-dot" />
                <div>
                  <h2>Service Request</h2>
                  <p>Request #{selectedMarker.request.request_id}</p>
                </div>
              </div>
              <dl className="gps-details-list">
                <div>
                  <dt>Issue</dt>
                  <dd>{selectedMarker.request.title}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{selectedMarker.request.category?.category_name ?? "—"}</dd>
                </div>
                <div>
                  <dt>Client</dt>
                  <dd>{selectedMarker.request.client?.user?.fullname ?? "—"}</dd>
                </div>
                <div>
                  <dt>Contact</dt>
                  <dd>{selectedMarker.request.client?.user?.phone ?? "—"}</dd>
                </div>
                <div>
                  <dt>Service address</dt>
                  <dd>
                    {[
                      selectedMarker.request.landmark,
                      selectedMarker.request.purok,
                      selectedMarker.request.barangay,
                    ].filter(Boolean).join(", ") || "Address not provided"}
                  </dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd className={`gps-status status-${selectedMarker.request.status}`}>
                    {formatStatus(selectedMarker.request.status)}
                  </dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>{selectedMarker.request.priority.replace("_", " ")}</dd>
                </div>
                <div>
                  <dt>Technician</dt>
                  <dd>
                    {selectedMarker.request.assignment?.technician?.user?.fullname ??
                      "Not assigned"}
                  </dd>
                </div>
                <div>
                  <dt>Submitted</dt>
                  <dd>{new Date(selectedMarker.request.created_at).toLocaleString()}</dd>
                </div>
              </dl>
              <p className="gps-description">{selectedMarker.request.description}</p>
            </>
          ) : selectedMarker?.type === "technician" ? (
            <>
              <div className="gps-details-heading">
                <span className="gps-legend-dot gps-technician-dot" />
                <div>
                  <h2>Technician</h2>
                  <p>
                    {selectedMarker.technician.user?.fullname ?? "Technician"}
                  </p>
                </div>
              </div>
              <dl className="gps-details-list">
                <div>
                  <dt>Email</dt>
                  <dd>{selectedMarker.technician.user?.email ?? "—"}</dd>
                </div>
                <div>
                  <dt>Phone</dt>
                  <dd>{selectedMarker.technician.user?.phone ?? "—"}</dd>
                </div>
                <div>
                  <dt>Availability</dt>
                  <dd>{selectedMarker.technician.availability}</dd>
                </div>
                <div>
                  <dt>Service area</dt>
                  <dd>{selectedMarker.technician.service_area ?? "—"}</dd>
                </div>
                <div>
                  <dt>Location last reported</dt>
                  <dd>
                    {formatLocationTime(
                      selectedMarker.technician.current_location_updated_at
                    )}
                  </dd>
                </div>
                <div>
                  <dt>Location freshness</dt>
                  <dd className={
                    isLocationStale(
                      selectedMarker.technician.current_location_updated_at
                    )
                      ? "gps-stale-location"
                      : "gps-fresh-location"
                  }>
                    {isLocationStale(
                      selectedMarker.technician.current_location_updated_at
                    )
                      ? "May be outdated"
                      : "Recently updated"}
                  </dd>
                </div>
                <div>
                  <dt>Coordinates</dt>
                  <dd>
                    {selectedMarker.technician.current_latitude},{" "}
                    {selectedMarker.technician.current_longitude}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <div className="gps-details-placeholder">
              <Users size={24} />
              <h2>Location details</h2>
              <p>Select a request or technician marker to view its information.</p>
            </div>
          )}
        </aside>
      </div>

      <p className="gps-privacy-note">
        Technician locations are reported only while the technician enables
        sharing in the mobile app with an active assignment. The map shows the
        last reported position, not guaranteed live or background tracking.
      </p>
    </div>
  );
}
