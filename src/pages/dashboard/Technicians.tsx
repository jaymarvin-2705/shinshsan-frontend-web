import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

import {
  Eye,
  Pencil,
  UserPlus,
} from 'lucide-react';

import {
  getTechnician,
  getTechnicians,
  updateTechnicianAvailability,
  updateTechnicianStatus,
  type Technician,
} from '../../services/technicianService';

import TechnicianForm from '../../components/technicians/TechnicianForm';
import TechnicianDetails from '../../components/technicians/TechnicianDetails';
import Modal from '../../components/common/Modal';
import '../../styles/technicians.css';

export default function Technicians() {
  // ========================================
  // PAGE STATE
  // ========================================

  const [technicians, setTechnicians] =
    useState<Technician[]>([]);

  const [search, setSearch] =
    useState('');

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  // ========================================
  // MODAL STATE
  // ========================================

  const [showForm, setShowForm] =
    useState(false);

  const [editingTechnician, setEditingTechnician] =
    useState<Technician | null>(null);

  const [selectedTechnician, setSelectedTechnician] =
    useState<Technician | null>(null);

  // ========================================
  // LOAD TECHNICIANS
  // ========================================

  const loadTechnicians = async (
    requestedPage = 1
  ) => {
    try {
      setLoading(true);

      const response = await getTechnicians(
        search,
        requestedPage
      );

      setTechnicians(
        response.data.data
      );

      setPage(
        response.data.current_page
      );

      setLastPage(
        response.data.last_page
      );

      setTotal(
        response.data.total
      );
    } catch {
      toast.error(
        'Unable to load technicians.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadTechnicians(1);
  }, []);

  // ========================================
  // SEARCH
  // ========================================

  const handleSearch = () => {
    loadTechnicians(1);
  };

  // ========================================
  // VIEW TECHNICIAN
  // ========================================

  const handleView = async (
    technicianId: number
  ) => {
    try {
      const response =
        await getTechnician(
          technicianId
        );

      setSelectedTechnician(
        response.data
      );

      // Make sure the edit modal is closed.
      setShowForm(false);
      setEditingTechnician(null);
    } catch {
      toast.error(
        'Unable to load technician details.'
      );
    }
  };

  // ========================================
  // CLOSE DETAILS
  // ========================================

  const handleCloseDetails = () => {
    setSelectedTechnician(null);
  };

  // ========================================
  // EDIT TECHNICIAN
  // ========================================

  const handleEdit = (
    technician: Technician
  ) => {
    setEditingTechnician(
      technician
    );

    setSelectedTechnician(null);

    setShowForm(true);
  };

  // ========================================
  // ADD TECHNICIAN
  // ========================================

  const handleAdd = () => {
    setEditingTechnician(null);

    setSelectedTechnician(null);

    setShowForm(true);
  };

  // ========================================
  // UPDATE ACCOUNT STATUS
  // ========================================

  const handleStatusChange = async (
    technician: Technician
  ) => {
    const newStatus =
      technician.user.status === 'active'
        ? 'inactive'
        : 'active';

    try {
      await updateTechnicianStatus(
        technician.technician_id,
        newStatus
      );

      toast.success(
        `Technician ${
          newStatus === 'active'
            ? 'activated'
            : 'deactivated'
        } successfully.`
      );

      await loadTechnicians(page);
    } catch {
      toast.error(
        'Unable to update technician status.'
      );
    }
  };

  // ========================================
  // UPDATE AVAILABILITY
  // ========================================

  const handleAvailabilityChange = async (
    technician: Technician,
    availability:
      | 'available'
      | 'busy'
      | 'offline'
  ) => {
    try {
      await updateTechnicianAvailability(
        technician.technician_id,
        availability
      );

      toast.success(
        'Technician availability updated successfully.'
      );

      await loadTechnicians(page);
    } catch {
      toast.error(
        'Unable to update technician availability.'
      );
    }
  };

  // ========================================
  // FORM SUCCESS
  // ========================================

  const handleFormSuccess = async () => {
    setShowForm(false);

    setEditingTechnician(null);

    await loadTechnicians(page);
  };

  // ========================================
  // FORM CANCEL
  // ========================================

  const handleFormCancel = () => {
    setShowForm(false);

    setEditingTechnician(null);
  };

  // ========================================
  // RENDER
  // ========================================

  return (
    <div className="technicians-page">

      {/* ========================================
          PAGE HEADER
      ======================================== */}

      <div className="page-header technician-page-header">

        <div>
          <h1>Technicians</h1>

          <p>
            Manage Shinshan ISP technician accounts.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleAdd}
        >
          <UserPlus size={18} />

          Add Technician
        </button>

      </div>

      {/* ========================================
          SEARCH TOOLBAR
      ======================================== */}

      <div className="technician-toolbar">

        <input
          type="text"
          placeholder="Search name, email, phone, or service area..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
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

      {/* ========================================
          ADD / EDIT TECHNICIAN MODAL
      ======================================== */}

      <Modal
        isOpen={showForm}
        title={
          editingTechnician
            ? 'Edit Technician'
            : 'Add New Technician'
        }
        onClose={handleFormCancel}
      >
        <TechnicianForm
          technician={
            editingTechnician
          }
          onSuccess={
            handleFormSuccess
          }
          onCancel={
            handleFormCancel
          }
        />
      </Modal>

      {/* ========================================
          VIEW TECHNICIAN MODAL
      ======================================== */}

      <Modal
        isOpen={
          selectedTechnician !== null
        }
        title="Technician Details"
        onClose={
          handleCloseDetails
        }
      >
        {selectedTechnician && (
          <TechnicianDetails
            technician={
              selectedTechnician
            }
            onClose={
              handleCloseDetails
            }
          />
        )}
      </Modal>

      {/* ========================================
          TECHNICIAN TABLE
      ======================================== */}

      <div className="table-container">

        {loading ? (

          <div className="empty-state">
            Loading technicians...
          </div>

        ) : technicians.length === 0 ? (

          <div className="empty-state">
            No technicians found.
          </div>

        ) : (

          <table>

            <thead>

              <tr>

                <th>
                  Name
                </th>

                <th>
                  Email
                </th>

                <th>
                  Phone
                </th>

                <th>
                  Service Area
                </th>

                <th>
                  Availability
                </th>

                <th>
                  Status
                </th>

                <th>
                  Actions
                </th>

              </tr>

            </thead>

            <tbody>

              {technicians.map(
                (technician) => (

                  <tr
                    key={
                      technician.technician_id
                    }
                  >

                    {/* NAME */}

                    <td>
                      {
                        technician.user
                          .fullname
                      }
                    </td>

                    {/* EMAIL */}

                    <td>
                      {
                        technician.user
                          .email
                      }
                    </td>

                    {/* PHONE */}

                    <td>
                      {
                        technician.user
                          .phone || '-'
                      }
                    </td>

                    {/* SERVICE AREA */}

                    <td>
                      {
                        technician.service_area ||
                        '-'
                      }
                    </td>

                    {/* AVAILABILITY */}

                    <td>

                      <select
                        value={
                          technician.availability
                        }
                        onChange={(event) =>
                          handleAvailabilityChange(
                            technician,
                            event.target.value as
                              | 'available'
                              | 'busy'
                              | 'offline'
                          )
                        }
                        disabled={
                          technician.user.status !==
                          'active'
                        }
                        className={`availability-select availability-${technician.availability}`}
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

                    </td>

                    {/* ACCOUNT STATUS */}

                    <td>

                      <span
                        className={
                          technician.user.status ===
                          'active'
                            ? 'status-active'
                            : 'status-inactive'
                        }
                      >
                        {
                          technician.user
                            .status
                        }
                      </span>

                    </td>

                    {/* ACTIONS */}

                    <td>

                      <div className="action-buttons">

                        {/* VIEW */}

                        <button
                          type="button"
                          title="View"
                          onClick={() =>
                            handleView(
                              technician.technician_id
                            )
                          }
                        >
                          <Eye size={17} />
                        </button>

                        {/* EDIT */}

                        <button
                          type="button"
                          title="Edit"
                          onClick={() =>
                            handleEdit(
                              technician
                            )
                          }
                        >
                          <Pencil size={17} />
                        </button>

                        {/* STATUS */}

                        <button
                          type="button"
                          className={
                            technician.user.status ===
                            'active'
                              ? 'danger-action'
                              : 'success-action'
                          }
                          onClick={() =>
                            handleStatusChange(
                              technician
                            )
                          }
                        >
                          {
                            technician.user
                              .status ===
                            'active'
                              ? 'Deactivate'
                              : 'Activate'
                          }
                        </button>

                      </div>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

      {/* ========================================
          PAGINATION
      ======================================== */}

      {!loading &&
        technicians.length > 0 && (

          <div className="pagination">

            <span>
              Total technicians: {total}
            </span>

            <div>

              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  loadTechnicians(
                    page - 1
                  )
                }
              >
                Previous
              </button>

              <span>
                Page {page} of {lastPage}
              </span>

              <button
                type="button"
                disabled={
                  page >= lastPage
                }
                onClick={() =>
                  loadTechnicians(
                    page + 1
                  )
                }
              >
                Next
              </button>

            </div>

          </div>

        )}

    </div>
  );
}