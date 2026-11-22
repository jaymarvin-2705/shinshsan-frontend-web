import type { RepairRequest } from "../../types/serviceRequest";

interface ServiceRequestDetailsProps {
  request: RepairRequest;
  onClose: () => void;
}

const ServiceRequestDetails = ({
  request,
  onClose,
}: ServiceRequestDetailsProps) => {
  return (
    <div className="sr-overlay">
      <div className="sr-modal">
        <div className="sr-modal-header">
          <div>
            <h2>Service Request Details</h2>

            <p>
              Request #{request.request_id}
            </p>
          </div>

          <button
            type="button"
            className="sr-close-button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="sr-details-grid">
          <div className="sr-detail-item">
            <span>Client</span>

            <strong>
              {request.client?.user?.fullname ?? "N/A"}
            </strong>
          </div>

          <div className="sr-detail-item">
            <span>Category</span>

            <strong>
              {request.category?.category_name ?? "N/A"}
            </strong>
          </div>

          <div className="sr-detail-item">
            <span>Title</span>

            <strong>
              {request.title}
            </strong>
          </div>

          <div className="sr-detail-item">
            <span>Priority</span>

            <strong>
              {request.priority}
            </strong>
          </div>

          <div className="sr-detail-item">
            <span>Status</span>

            <strong>
              {request.status}
            </strong>
          </div>

          <div className="sr-detail-item">
            <span>Created</span>

            <strong>
              {new Date(request.created_at).toLocaleString()}
            </strong>
          </div>
        </div>

        <div className="sr-description">
          <span>Description</span>

          <p>
            {request.description}
          </p>
        </div>

        {request.client && (
          <div className="sr-section">
            <h3>Client Information</h3>

            <p>
              <strong>Name:</strong>{" "}
              {request.client.user?.fullname ?? "N/A"}
            </p>

            <p>
              <strong>Email:</strong>{" "}
              {request.client.user?.email ?? "N/A"}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {request.client.user?.phone ?? "N/A"}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {request.client.address ?? "N/A"}
            </p>
          </div>
        )}

        {request.client?.latitude &&
          request.client?.longitude && (
            <div className="sr-section">
              <h3>Client GPS</h3>

              <p>
                Latitude: {request.client.latitude}
              </p>

              <p>
                Longitude: {request.client.longitude}
              </p>
            </div>
          )}

        <div className="sr-modal-footer">
          <button
            type="button"
            className="sr-button secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceRequestDetails;