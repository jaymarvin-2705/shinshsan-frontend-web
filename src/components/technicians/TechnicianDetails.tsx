import type { Technician } from '../../services/technicianService';

interface TechnicianDetailsProps {
  technician: Technician;
  onClose: () => void;
}

export default function TechnicianDetails({
  technician,
  onClose,
}: TechnicianDetailsProps) {
  return (
    <div className="technician-details">
      <div className="client-details-grid">

        <div className="detail-item">
          <span className="detail-label">
            Full Name
          </span>

          <span className="detail-value">
            {technician.user.fullname}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Email
          </span>

          <span className="detail-value">
            {technician.user.email}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Phone
          </span>

          <span className="detail-value">
            {technician.user.phone || '-'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Account Status
          </span>

          <span
            className={
              technician.user.status === 'active'
                ? 'status-active'
                : 'status-inactive'
            }
          >
            {technician.user.status}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Service Area
          </span>

          <span className="detail-value">
            {technician.service_area || '-'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Availability
          </span>

          <span className="detail-value">
            {technician.availability}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Current Latitude
          </span>

          <span className="detail-value">
            {technician.current_latitude ||
              'Not available'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Current Longitude
          </span>

          <span className="detail-value">
            {technician.current_longitude ||
              'Not available'}
          </span>
        </div>

      </div>

      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}