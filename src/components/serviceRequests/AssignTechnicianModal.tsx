import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import type { Technician } from "../../types/serviceRequest";
import { assignTechnician } from "../../services/serviceRequestService";
import api from "../../services/api";

interface AssignTechnicianModalProps {
  requestId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const AssignTechnicianModal = ({
  requestId,
  onClose,
  onSuccess,
}: AssignTechnicianModalProps) => {
  const [technicians, setTechnicians] =
    useState<Technician[]>([]);

  const [technicianId, setTechnicianId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  useEffect(() => {
    const loadTechnicians = async () => {
      try {
        const response = await api.get(
          "/admin/technicians",
          {
            params: {
              availability: "available",
              per_page: 100,
            },
          }
        );

        setTechnicians(
          response.data.data?.data ??
          response.data.data ??
          []
        );
      } catch {
        toast.error(
          "Failed to load technicians."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTechnicians();
  }, []);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!technicianId) {
      toast.error(
        "Please select a technician."
      );

      return;
    }

    try {
      setSubmitting(true);

      await assignTechnician(
        requestId,
        Number(technicianId)
      );

      toast.success(
        "Technician assigned successfully."
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ??
        "Failed to assign technician."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="sr-overlay">
      <div className="sr-modal sr-small-modal">
        <div className="sr-modal-header">
          <div>
            <h2>Assign Technician</h2>

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

        <form onSubmit={handleSubmit}>
          <div className="sr-form-group">
            <label htmlFor="technician">
              Available Technician
            </label>

            {loading ? (
              <p>Loading technicians...</p>
            ) : (
              <select
                id="technician"
                value={technicianId}
                onChange={(event) =>
                  setTechnicianId(
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select technician
                </option>

                {technicians.map(
                  (technician) => (
                    <option
                      key={
                        technician.technician_id
                      }
                      value={
                        technician.technician_id
                      }
                    >
                      {technician.user?.fullname ??
                        `Technician #${technician.technician_id}`}
                    </option>
                  )
                )}
              </select>
            )}
          </div>

          <div className="sr-modal-footer">
            <button
              type="button"
              className="sr-button secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="sr-button primary"
              disabled={
                submitting ||
                loading ||
                !technicianId
              }
            >
              {submitting
                ? "Assigning..."
                : "Assign Technician"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTechnicianModal;