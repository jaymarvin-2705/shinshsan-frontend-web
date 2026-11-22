import { isAxiosError } from 'axios';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import toast from 'react-hot-toast';

import {
  createClient,
  getRegistrationBarangays,
  getRegistrationPuroks,
  updateClient,
  type Client,
  type CreateClientData,
} from '../../services/clientService';

interface ClientFormProps {
  client?: Client | null;
  onSuccess: () => void;
  onCancel: () => void;
}

type ClientFormField = keyof CreateClientData;
type ClientFormErrors = Partial<Record<ClientFormField, string>>;

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

const emptyForm: CreateClientData = {
  firstname: '',
  middlename: '',
  lastname: '',
  fullname: '',
  email: '',
  phone: '',
  address: '',
  birth_date: '',
  barangay: '',
  purok: '',
  password: '',
  password_confirmation: '',
};

function getInitialForm(client?: Client | null): CreateClientData {
  if (!client) return emptyForm;

  return {
    ...emptyForm,
    firstname: client.user.firstname ?? '',
    middlename: client.user.middlename ?? '',
    lastname: client.user.lastname ?? '',
    fullname: client.user.fullname,
    email: client.user.email,
    phone: client.user.phone || '',
    address: client.address || '',
    birth_date: client.birth_date?.slice(0, 10) || '',
    barangay: client.barangay || '',
    purok: client.purok || '',
  };
}

export default function ClientForm({
  client,
  onSuccess,
  onCancel,
}: ClientFormProps) {
  const [form, setForm] = useState<CreateClientData>(
    () => getInitialForm(client)
  );
  const [barangays, setBarangays] = useState<string[]>([]);
  const [puroks, setPuroks] = useState<string[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(!client);
  const [puroksLoading, setPuroksLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ClientFormErrors>({});

  const isEditing = !!client;

  useEffect(() => {
    if (client) return;

    getRegistrationBarangays()
      .then(setBarangays)
      .catch(() => {
        toast.error('Unable to load Barangay choices.');
      })
      .finally(() => setLocationsLoading(false));
  }, [client]);

  useEffect(() => {
    if (!form.barangay || isEditing) return;

    let active = true;
    getRegistrationPuroks(form.barangay)
      .then((values) => {
        if (active) setPuroks(values);
      })
      .catch(() => {
        if (active) toast.error('Unable to load Purok choices.');
      })
      .finally(() => {
        if (active) setPuroksLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form.barangay, isEditing]);

  const handleChange = (
    field: ClientFormField,
    value: string
  ) => {
    if (field === 'barangay') {
      setPuroks([]);
      setPuroksLoading(value.length > 0);
    }
    setForm((previous) => ({
      ...previous,
      [field]: value,
      ...(field === 'barangay' ? { purok: '' } : {}),
    }));
    setErrors((previous) => {
      const next = { ...previous };
      delete next[field];
      if (field === 'barangay') delete next.purok;
      return next;
    });
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrors({});

    const fullname = isEditing
      ? form.fullname?.trim()
      : [
          form.firstname?.trim(),
          form.middlename?.trim(),
          form.lastname?.trim(),
        ]
          .filter(Boolean)
          .join(' ');

    if (
      !isEditing &&
      form.password !== form.password_confirmation
    ) {
      setErrors({
        password_confirmation: 'Passwords do not match.',
      });
      return;
    }

    try {
      setLoading(true);

      if (isEditing && client) {
        await updateClient(client.client_id, {
          fullname: fullname || '',
          email: form.email,
          phone: form.phone,
          address: form.address,
        });
        toast.success('Client updated successfully.');
      } else {
        await createClient({
          firstname: form.firstname?.trim(),
          middlename: form.middlename?.trim() || null,
          lastname: form.lastname?.trim(),
          fullname,
          email: form.email.trim().toLowerCase(),
          phone: form.phone?.trim(),
          address: form.address?.trim(),
          birth_date: form.birth_date,
          barangay: form.barangay,
          purok: form.purok,
          password: form.password,
          password_confirmation: form.password_confirmation,
        });
        toast.success(
          'Client created. The account is pending approval.'
        );
      }

      onSuccess();
    } catch (error: unknown) {
      if (isAxiosError<ApiErrorBody>(error)) {
        const apiErrors = error.response?.data?.errors;
        if (apiErrors) {
          const fieldErrors: ClientFormErrors = {};
          for (const [field, messages] of Object.entries(apiErrors)) {
            if (
              messages[0] &&
              field in emptyForm
            ) {
              fieldErrors[field as ClientFormField] = messages[0];
            }
          }
          setErrors(fieldErrors);
          if (Object.keys(fieldErrors).length > 0) {
            toast.error('Please correct the highlighted fields.');
            return;
          }
        }

        toast.error(
          error.response?.data?.message || 'Unable to save client.'
        );
      } else {
        toast.error('Unable to save client.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field: ClientFormField) =>
    errors[field] ? (
      <span className="client-form-error" role="alert">
        {errors[field]}
      </span>
    ) : null;

  return (
    <form className="client-form" onSubmit={handleSubmit}>
      {!isEditing ? (
        <>
          <div className="form-group">
            <label htmlFor="firstname">First Name *</label>
            <input
              id="firstname"
              type="text"
              value={form.firstname ?? ''}
              onChange={(event) =>
                handleChange('firstname', event.target.value)
              }
              placeholder="Enter first name"
              autoComplete="given-name"
              required
            />
            {renderError('firstname')}
          </div>

          <div className="form-group">
            <label htmlFor="middlename">Middle Name</label>
            <input
              id="middlename"
              type="text"
              value={form.middlename ?? ''}
              onChange={(event) =>
                handleChange('middlename', event.target.value)
              }
              placeholder="Enter middle name (optional)"
              autoComplete="additional-name"
            />
            {renderError('middlename')}
          </div>

          <div className="form-group">
            <label htmlFor="lastname">Last Name *</label>
            <input
              id="lastname"
              type="text"
              value={form.lastname ?? ''}
              onChange={(event) =>
                handleChange('lastname', event.target.value)
              }
              placeholder="Enter last name"
              autoComplete="family-name"
              required
            />
            {renderError('lastname')}
          </div>

          <div className="form-group">
            <label htmlFor="birth_date">Birth Date *</label>
            <input
              id="birth_date"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              value={form.birth_date ?? ''}
              onChange={(event) =>
                handleChange('birth_date', event.target.value)
              }
              required
            />
            {renderError('birth_date')}
          </div>

          <div className="form-group">
            <label htmlFor="barangay">Barangay *</label>
            <select
              id="barangay"
              value={form.barangay ?? ''}
              onChange={(event) =>
                handleChange('barangay', event.target.value)
              }
              disabled={locationsLoading || loading}
              required
            >
              <option value="">
                {locationsLoading ? 'Loading Barangays...' : 'Select Barangay'}
              </option>
              {barangays.map((barangay) => (
                <option key={barangay} value={barangay}>
                  {barangay}
                </option>
              ))}
            </select>
            {renderError('barangay')}
          </div>

          <div className="form-group">
            <label htmlFor="purok">Purok *</label>
            <select
              id="purok"
              value={form.purok ?? ''}
              onChange={(event) =>
                handleChange('purok', event.target.value)
              }
              disabled={!form.barangay || puroksLoading || loading}
              required
            >
              <option value="">
                {!form.barangay
                  ? 'Select Barangay first'
                  : puroksLoading
                    ? 'Loading Puroks...'
                    : 'Select Purok'}
              </option>
              {puroks.map((purok) => (
                <option key={purok} value={purok}>
                  {purok}
                </option>
              ))}
            </select>
            {renderError('purok')}
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="edit-fullname">Full Name</label>
            <input
              id="edit-fullname"
              type="text"
              value={form.fullname ?? ''}
              onChange={(event) =>
                handleChange('fullname', event.target.value)
              }
              placeholder="Enter full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-phone">Phone</label>
            <input
              id="edit-phone"
              type="text"
              value={form.phone ?? ''}
              onChange={(event) =>
                handleChange('phone', event.target.value)
              }
              placeholder="Enter phone number"
            />
          </div>

        </>
      )}

      <div className="form-group">
        <label htmlFor="email">Email Address *</label>
        <input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) =>
            handleChange('email', event.target.value)
          }
          placeholder="Enter email address"
          autoComplete="email"
          required
        />
        {renderError('email')}
      </div>

      {!isEditing ? (
        <>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              type="tel"
              value={form.phone ?? ''}
              onChange={(event) =>
                handleChange('phone', event.target.value)
              }
              placeholder="Enter phone number (optional)"
              autoComplete="tel"
            />
            {renderError('phone')}
          </div>

          <div className="form-group">
            <label htmlFor="password">Temporary Password *</label>
            <input
              id="password"
              type="password"
              value={form.password ?? ''}
              onChange={(event) =>
                handleChange('password', event.target.value)
              }
              placeholder="At least 8 characters"
              autoComplete="new-password"
              minLength={8}
              required
            />
            {renderError('password')}
          </div>

          <div className="form-group">
            <label htmlFor="password_confirmation">
              Confirm Password *
            </label>
            <input
              id="password_confirmation"
              type="password"
              value={form.password_confirmation ?? ''}
              onChange={(event) =>
                handleChange('password_confirmation', event.target.value)
              }
              placeholder="Re-enter temporary password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            {renderError('password_confirmation')}
          </div>

          <p className="client-form-note">
            The new account will remain pending until an administrator
            approves it.
          </p>
        </>
      ) : (
        <div className="form-group">
          <label htmlFor="edit-address">Address</label>
          <textarea
            id="edit-address"
            value={form.address ?? ''}
            onChange={(event) =>
              handleChange('address', event.target.value)
            }
            placeholder="Enter client address"
            rows={4}
          />
        </div>
      )}

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
          disabled={loading || locationsLoading}
        >
          {loading
            ? 'Saving...'
            : isEditing
              ? 'Update Client'
              : 'Create Pending Client'}
        </button>
      </div>
    </form>
  );
}
