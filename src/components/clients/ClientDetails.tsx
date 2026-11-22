import type { Client } from '../../services/clientService';

interface ClientDetailsProps {
  client: Client;
  onClose: () => void;
}

export default function ClientDetails({
  client,
  onClose,
}: ClientDetailsProps) {
  const detail = (value: string | number | null | undefined) =>
    value === null || value === undefined || value === ''
      ? 'Not provided'
      : value;

  return (
    <div className="client-details">

      <div className="client-details-grid">

        <div className="detail-item">
          <span className="detail-label">Client ID</span>
          <span className="detail-value">{client.client_id}</span>
        </div>

        <div className="detail-item">
          <span className="detail-label">User ID</span>
          <span className="detail-value">
            {detail(client.user.user_id)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">First Name</span>
          <span className="detail-value">
            {detail(client.user.firstname)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Middle Name</span>
          <span className="detail-value">
            {detail(client.user.middlename)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Last Name</span>
          <span className="detail-value">
            {detail(client.user.lastname)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Full Name
          </span>

          <span className="detail-value">
            {detail(client.user.fullname)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Email
          </span>

          <span className="detail-value">
            {detail(client.user.email)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Phone
          </span>

          <span className="detail-value">
            {detail(client.user.phone)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Role</span>
          <span className="detail-value">
            {detail(client.user.role?.role_name)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Birth Date</span>
          <span className="detail-value">
            {client.birth_date
              ? new Date(
                  client.birth_date.includes('T')
                    ? client.birth_date
                    : `${client.birth_date}T00:00:00`,
                ).toLocaleDateString()
              : 'Not provided'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Barangay</span>
          <span className="detail-value">
            {detail(client.barangay)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Purok</span>
          <span className="detail-value">
            {detail(client.purok)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Status
          </span>

          <span className={`client-status status-${client.user.status}`}>
            {client.user.status}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Password</span>
          <span className="detail-value">
            Hidden for security; passwords cannot be viewed.
          </span>
        </div>

        <div className="detail-item detail-full">
          <span className="detail-label">
            Address
          </span>

          <span className="detail-value">
            {detail(client.address)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Latitude
          </span>

          <span className="detail-value">
            {detail(client.latitude)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">
            Longitude
          </span>

          <span className="detail-value">
            {detail(client.longitude)}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Created</span>
          <span className="detail-value">
            {client.created_at
              ? new Date(client.created_at).toLocaleString()
              : 'Not available'}
          </span>
        </div>

        <div className="detail-item">
          <span className="detail-label">Last Updated</span>
          <span className="detail-value">
            {client.updated_at
              ? new Date(client.updated_at).toLocaleString()
              : 'Not available'}
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