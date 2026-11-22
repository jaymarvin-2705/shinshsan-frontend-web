import { useState } from "react";
import toast from "react-hot-toast";

import { autoAssignTechnician } from "../../services/serviceRequestService";

interface AutoAssignModalProps {
  requestId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const AutoAssignModal = ({
  requestId,
  onClose,
  onSuccess,
}: AutoAssignModalProps) => {
  const [loading, setLoading] =
    useState(false);

  const handleAutoAssign = async () => {
    try {
      setLoading(true);

      await autoAssignTechnician(
        requestId
      );

      toast.success(
        "Nearest technician assigned successfully."
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
        "Failed to automatically assign technician."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sr-overlay">
      <div className="sr-modal sr-small-modal">
        <div className="sr-modal-header">
          <div>
            <h2>
              Auto Assign Technician
            </h2>

            <p>
              Request #{requestId}
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

        <div className="sr-confirm-content">
          <p>
            The system will find the nearest
            available technician with a valid
            GPS location.
          </p>

          <p>
            Do you want to continue?
          </p>
        </div>

        <div className="sr-modal-footer">
          <button
            type="button"
            className="sr-button secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="sr-button primary"
            onClick={handleAutoAssign}
            disabled={loading}
          >
            {loading
              ? "Finding Technician..."
              : "Auto Assign"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutoAssignModal;