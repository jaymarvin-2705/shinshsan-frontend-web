import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import toast from 'react-hot-toast';

import {
  createTechnician,
  updateTechnician,
  type Technician,
  type CreateTechnicianData,
} from '../../services/technicianService';

interface TechnicianFormProps {
  technician?: Technician | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function TechnicianForm({
  technician,
  onSuccess,
  onCancel,
}: TechnicianFormProps) {
  const [form, setForm] =
    useState<CreateTechnicianData>({
      fullname: '',
      email: '',
      phone: '',
      service_area: '',
      availability: 'available',
    });

  const [loading, setLoading] =
    useState(false);

  const isEditing = !!technician;

  useEffect(() => {
    if (technician) {
      setForm({
        fullname:
          technician.user.fullname,
        email:
          technician.user.email,
        phone:
          technician.user.phone || '',
        service_area:
          technician.service_area || '',
        availability:
          technician.availability,
      });
    } else {
      setForm({
        fullname: '',
        email: '',
        phone: '',
        service_area: '',
        availability: 'available',
      });
    }
  }, [technician]);

  const handleChange = (
    field: keyof CreateTechnicianData,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    try {
      setLoading(true);

      if (isEditing && technician) {
        await updateTechnician(
          technician.technician_id,
          form
        );

        toast.success(
          'Technician updated successfully.'
        );
      } else {
        await createTechnician(form);

        toast.success(
          'Technician created successfully.'
        );
      }

      onSuccess();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        'Unable to save technician.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="technician-form"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label htmlFor="fullname">
          Full Name
        </label>

        <input
          id="fullname"
          type="text"
          value={form.fullname}
          onChange={(event) =>
            handleChange(
              'fullname',
              event.target.value
            )
          }
          placeholder="Enter full name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">
          Email
        </label>

        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) =>
            handleChange(
              'email',
              event.target.value
            )
          }
          placeholder="Enter email address"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">
          Phone
        </label>

        <input
          id="phone"
          type="text"
          value={form.phone}
          onChange={(event) =>
            handleChange(
              'phone',
              event.target.value
            )
          }
          placeholder="Enter phone number"
        />
      </div>

      <div className="form-group">
        <label htmlFor="service_area">
          Service Area
        </label>

        <input
          id="service_area"
          type="text"
          value={form.service_area}
          onChange={(event) =>
            handleChange(
              'service_area',
              event.target.value
            )
          }
          placeholder="e.g. Trinidad"
        />
      </div>

      <div className="form-group">
        <label htmlFor="availability">
          Availability
        </label>

        <select
          id="availability"
          value={form.availability}
          onChange={(event) =>
            handleChange(
              'availability',
              event.target.value
            )
          }
        >
          <option value="available">
            Available
          </option>

          <option value="busy">
            Busy
          </option>

          <option value="offline">
            Offline
          </option>
        </select>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="primary-button"
          disabled={loading}
        >
          {loading
            ? 'Saving...'
            : isEditing
              ? 'Update Technician'
              : 'Create Technician'}
        </button>
      </div>
    </form>
  );
}