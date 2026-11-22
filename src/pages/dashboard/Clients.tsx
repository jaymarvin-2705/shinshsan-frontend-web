
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Eye,
  Pencil,
  UserPlus,
  Check,
  X,
} from 'lucide-react';

import {
  getClient,
  getClients,
  updateClientStatus,
  type Client,
  type ClientStatus,
} from '../../services/clientService';

import ClientForm from '../../components/clients/ClientForm';
import ClientDetails from '../../components/clients/ClientDetails';
import Modal from '../../components/common/Modal';
import '../../styles/clients.css';

type StatusFilter = 'all' | ClientStatus;

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] =
    useState<Client | null>(null);
  const [selectedClient, setSelectedClient] =
    useState<Client | null>(null);

  const [updatingClientId, setUpdatingClientId] =
    useState<number | null>(null);

  const loadClients = async (
    requestedPage = 1,
    requestedStatus: StatusFilter = statusFilter
  ) => {
    try {
      setLoading(true);

      const response = await getClients(
        search,
        requestedPage,
        requestedStatus === 'all'
          ? undefined
          : requestedStatus
      );

      setClients(response.data.data);
      setPage(response.data.current_page);
      setLastPage(response.data.last_page);
      setTotal(response.data.total);
    } catch {
      toast.error('Unable to load clients.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClients(1, 'all');
    // Initial page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    void loadClients(1);
  };

  const handleFilterChange = (
    nextStatus: StatusFilter
  ) => {
    setStatusFilter(nextStatus);
    void loadClients(1, nextStatus);
  };

  const handleView = async (clientId: number) => {
    try {
      const response = await getClient(clientId);

      setSelectedClient(response.data);
      setShowForm(false);
      setEditingClient(null);
    } catch {
      toast.error('Unable to load client details.');
    }
  };

  const handleCloseDetails = () => {
    setSelectedClient(null);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setSelectedClient(null);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingClient(null);
    setSelectedClient(null);
    setShowForm(true);
  };

  const handleStatusChange = async (
    client: Client,
    newStatus: ClientStatus
  ) => {
    const actionLabels: Record<ClientStatus, string> = {
      pending: 'set to pending',
      active: 'approved or activated',
      inactive: 'deactivated',
      rejected: 'rejected',
    };

    const confirmationMessages: Partial<
      Record<ClientStatus, string>
    > = {
      active:
        client.user.status === 'pending'
          ? `Approve ${client.user.fullname}'s registration? They will be able to log in.`
          : `Reactivate ${client.user.fullname}'s account?`,
      inactive:
        `Deactivate ${client.user.fullname}'s account?`,
      rejected:
        `Reject ${client.user.fullname}'s registration?`,
    };

    const confirmation = confirmationMessages[newStatus];

    if (confirmation && !window.confirm(confirmation)) {
      return;
    }

    try {
      setUpdatingClientId(client.client_id);

      const response = await updateClientStatus(
        client.client_id,
        newStatus
      );

      toast.success(
        response.message ||
          `Client ${actionLabels[newStatus]} successfully.`
      );

      await loadClients(page);
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error
          ? (
              error as {
                response?: {
                  data?: { message?: string };
                };
              }
            ).response?.data?.message
          : undefined;

      toast.error(
        message || 'Unable to update client status.'
      );
    } finally {
      setUpdatingClientId(null);
    }
  };

  const handleFormSuccess = async () => {
    setShowForm(false);
    setEditingClient(null);

    await loadClients(page);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingClient(null);
  };

  const getStatusClass = (status: ClientStatus) => {
    return `client-status status-${status}`;
  };

  return (
    <div className="clients-page">
      {/* PAGE HEADER */}
      <div className="page-header client-page-header">
        <div>
          <h1>Clients</h1>
          <p>
            Manage Shinshan ISP client accounts and
            registration approvals.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleAdd}
        >
          <UserPlus size={18} />
          Add Client
        </button>
      </div>

      {/* STATUS FILTERS */}
      <div
        className="client-status-filters"
        role="group"
        aria-label="Filter clients by status"
      >
        {(
          [
            'all',
            'pending',
            'active',
            'inactive',
            'rejected',
          ] as StatusFilter[]
        ).map((status) => (
          <button
            key={status}
            type="button"
            className={
              statusFilter === status
                ? 'filter-button active'
                : 'filter-button'
            }
            aria-pressed={statusFilter === status}
            onClick={() => handleFilterChange(status)}
          >
            {status === 'all'
              ? 'All Clients'
              : status.charAt(0).toUpperCase() +
                status.slice(1)}
          </button>
        ))}
      </div>

      {/* SEARCH TOOLBAR */}
      <div className="client-toolbar">
        <input
          type="text"
          placeholder="Search name, email, or phone..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearch();
            }
          }}
        />

        <button
          type="button"
          className="primary-button"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={showForm}
        title={
          editingClient ? 'Edit Client' : 'Add New Client'
        }
        onClose={handleFormCancel}
      >
        <ClientForm
          key={editingClient?.client_id ?? 'new-client'}
          client={editingClient}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </Modal>

      {/* CLIENT DETAILS MODAL */}
      <Modal
        isOpen={selectedClient !== null}
        title="Client Details"
        onClose={handleCloseDetails}
      >
        {selectedClient && (
          <ClientDetails
            client={selectedClient}
            onClose={handleCloseDetails}
          />
        )}
      </Modal>

      {/* CLIENT TABLE */}
      <div className="table-container">
        {loading ? (
          <div className="empty-state">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="empty-state">
            No clients found for this filter.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Last Name</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Birth Date</th>
                <th>Barangay</th>
                <th>Purok</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {clients.map((client) => {
                const status = client.user.status;
                const updating =
                  updatingClientId === client.client_id;
                const name =
                  client.user.fullname ||
                  [
                    client.user.firstname,
                    client.user.middlename,
                    client.user.lastname,
                  ]
                    .filter(Boolean)
                    .join(' ');

                return (
                  <tr key={client.client_id}>
                    <td>{client.user.firstname || '-'}</td>
                    <td>{client.user.middlename || '-'}</td>
                    <td>{client.user.lastname || '-'}</td>
                    <td>{name || '-'}</td>
                    <td>{client.user.email}</td>
                    <td>{client.user.phone || '-'}</td>
                    <td>
                      {client.birth_date
                        ? new Date(
                            client.birth_date.includes('T')
                              ? client.birth_date
                              : `${client.birth_date}T00:00:00`
                          ).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>{client.barangay || '-'}</td>
                    <td>{client.purok || '-'}</td>

                    <td>
                      <span className={getStatusClass(status)}>
                        {status.charAt(0).toUpperCase() +
                          status.slice(1)}
                      </span>
                    </td>

                    <td>
                      <div className="action-buttons">
                        {/* VIEW */}
                        <button
                          type="button"
                          title="View client"
                          aria-label="View client"
                          onClick={() =>
                            void handleView(client.client_id)
                          }
                        >
                          <Eye size={17} />
                        </button>

                        {/* EDIT */}
                        <button
                          type="button"
                          title="Edit client"
                          aria-label="Edit client"
                          onClick={() => handleEdit(client)}
                        >
                          <Pencil size={17} />
                        </button>

                        {/* PENDING: APPROVE / REJECT */}
                        {status === 'pending' && (
                          <>
                            <button
                              type="button"
                              className="success-action"
                              title="Approve registration"
                              disabled={updating}
                              onClick={() =>
                                void handleStatusChange(
                                  client,
                                  'active'
                                )
                              }
                            >
                              <Check size={15} />
                              {updating
                                ? 'Updating...'
                                : 'Approve'}
                            </button>

                            <button
                              type="button"
                              className="danger-action"
                              title="Reject registration"
                              disabled={updating}
                              onClick={() =>
                                void handleStatusChange(
                                  client,
                                  'rejected'
                                )
                              }
                            >
                              <X size={15} />
                              Reject
                            </button>
                          </>
                        )}

                        {/* ACTIVE: DEACTIVATE */}
                        {status === 'active' && (
                          <button
                            type="button"
                            className="danger-action"
                            disabled={updating}
                            onClick={() =>
                              void handleStatusChange(
                                client,
                                'inactive'
                              )
                            }
                          >
                            Deactivate
                          </button>
                        )}

                        {/* INACTIVE / REJECTED: ACTIVATE */}
                        {(status === 'inactive' ||
                          status === 'rejected') && (
                          <button
                            type="button"
                            className="success-action"
                            disabled={updating}
                            onClick={() =>
                              void handleStatusChange(
                                client,
                                'active'
                              )
                            }
                          >
                            Activate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      {!loading && (
        <div className="pagination">
          <span>
            Total clients: {total}
          </span>

          <div>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => void loadClients(page - 1)}
            >
              Previous
            </button>

            <span>
              Page {page} of {lastPage}
            </span>

            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => void loadClients(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}