import React, { useState, useEffect } from 'react';
import { Edit, Trash2, UserPlus } from 'lucide-react';
import api from '../axiosConfig';

const IntrudeReport = () => {
  const [intruders, setIntruders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filterCamera, setFilterCamera] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assigningIntruder, setAssigningIntruder] = useState(null);
  const [userId, setUserId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(null);
  const [imageTitle, setImageTitle] = useState('');
  // Get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchIntruders(getCurrentDate(), getCurrentDate(), '');
  }, []);

  const fetchIntruders = async (startDate, endDate, camera) => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/reports/intruder_logs?start_date=${startDate}&end_date=${endDate}`;
      if (camera) {
        url += `&cameras=${camera}`;
      }

      const response = await api.get(url);
      // Handle both response formats
      const logs = response.data.intruder_logs ||
        (response.data['New item'] ? [response.data['New item']] : []);

      setIntruders(logs.map(log => ({
        ...log,
        // Convert ISO time to more readable format
        time: new Date(log.time).toLocaleString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      })));
    } catch (err) {
      setError(err.message || 'Failed to fetch intruder logs');
      console.error('Error fetching intruders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (intruderId) => {
    if (!window.confirm('Are you sure you want to delete this intruder report?')) return;
    try {
      setDeletingId(intruderId);
      setIntruders(prev => prev.filter(intruder => intruder.id !== intruderId));
      alert('Intruder report deleted successfully!');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleAssign = (intruder) => {
    setAssigningIntruder(intruder);
    setIsAssignModalOpen(true);
    setUserId('');
  };

  const handleSaveAssign = async () => {
    if (!userId.trim()) {
      alert('Please enter an Employee ID');
      return;
    }

    setIsAssigning(true);
    try {
      // Determine mode based on camera name (now comes from dropdown selection)
      const mode = assigningIntruder.camera?.toLowerCase().includes('checkout') ? 'checkout' : 'checkin';

      // Make API call with intruder ID, employee ID and mode
      await api.post('/api/update/attendance', {
        id: assigningIntruder.id,  // Intruder ID from selected row
        emp_id: userId,            // Employee ID from input
        mode: mode                 // Mode based on dropdown selection
      });

      alert(`Assigned employee ${userId} to intruder successfully as ${mode}!`);
      setIsAssignModalOpen(false);

      // Refresh intruder list after assignment
      fetchIntruders(getCurrentDate(), getCurrentDate(), '');
    } catch (err) {
      console.error('Assignment failed:', err);
      let errorMessage = 'Assignment failed';
      if (err.response) {
        if (err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Server responded with status ${err.response.status}`;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      alert(errorMessage);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleApplyFilters = () => {
    fetchIntruders(filterDate || getCurrentDate(), filterDate || getCurrentDate(), filterCamera);
    setIsFilterApplied(true);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilterCamera('');
    setFilterDate('');
    setSearchTerm('');
    setIsFilterApplied(false);
    setCurrentPage(1);
    fetchIntruders(getCurrentDate(), getCurrentDate(), '');
  };



  const filteredIntruders = intruders.filter((intruder) => {
    return (
      intruder.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intruder.camera?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intruder.time?.includes(searchTerm)
    );
  });

  const totalPages = Math.ceil(filteredIntruders.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = filteredIntruders.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="container-fluid p-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="#" className="text-decoration-none">🏠</a></li>
              <li className="breadcrumb-item active" aria-current="page">Intruder Report</li>
            </ol>
          </nav>
          <h2 className="mb-0">Intruder Report</h2>
        </div>
      </div>

      {/* Show entries and search */}
      <div className="row mb-3">
        <div className="col-md-6">
          <div className="d-flex align-items-center">
            <span className="me-2">Show</span>
            <select
              className="form-select form-select-sm"
              style={{ width: 'auto' }}
              value={entriesPerPage}
              onChange={(e) => {
                setEntriesPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ms-2">entries</span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex justify-content-end">
            <div className="input-group" style={{ width: '300px' }}>
              <span className="input-group-text">Search:</span>
              <input
                type="text"
                className="form-control"
                placeholder="Search intruders..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="row mb-3">
        <div className="col-md-2">
          <select
            className="form-select"
            value={filterCamera}
            onChange={(e) => setFilterCamera(e.target.value)}
          >
            <option value="">All Cameras</option>
            <option value="Checkin">Checkin</option>
            <option value="Checkout">Checkout</option>
          </select>
        </div>
        <div className="col-md-2">
          <input
            type="date"
            className="form-control"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>

        <div className="col-md-2">
          <button
            className="btn btn-outline-primary w-100"
            onClick={handleApplyFilters}
          >
            Apply Filters
          </button>
        </div>
        <div className="col-md-2">
          <button
            className="btn btn-outline-secondary w-100"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Handling */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button onClick={() => fetchIntruders(getCurrentDate(), getCurrentDate(), '')}
            className="btn btn-sm btn-outline-primary ms-2">
            <i className="fas fa-sync me-1"></i>
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Gender</th>
                <th>Camera</th>
                <th>Time</th>
                <th>Image</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5 text-muted">
                    <i className="fas fa-inbox fa-3x mb-3 d-block"></i>
                    No intruder reports found
                  </td>
                </tr>
              ) : (
                currentData.map((intruder, index) => (
                  <tr key={index}>
                    <td>{intruder.gender || 'Unknown'}</td>
                    <td>{intruder.camera || 'N/A'}</td>
                    <td>{intruder.time || 'N/A'}</td>
                    {/* <td>
                      {intruder.image ? (
                        <img
                          src={intruder.image}
                          alt="Intruder"
                          className="img-thumbnail"
                          style={{ width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => {
                            const newTab = window.open();
                            newTab.document.write(`<img src="${intruder.image}" style="max-width:100%;"/>`);
                          }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td> */}
                    <td>
                      {intruder.image ? (
                        <img
                          src={intruder.image}
                          alt="Intruder"
                          className="img-thumbnail"
                          style={{ width: '60px', height: '60px', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => {
                            setCurrentImage(intruder.image);
                            setImageTitle(`Intruder at ${intruder.time}`);
                            setShowImageModal(true);
                          }}
                        />
                      ) : (
                        <span className="text-muted">No image</span>
                      )}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleAssign(intruder)}
                          className="btn btn-sm btn-outline-success"
                          title="Assign"
                        >
                          <UserPlus size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(intruder.id)}
                          className="btn btn-sm btn-outline-danger"
                          title="Delete"
                          disabled={deletingId === intruder.id}
                        >
                          {deletingId === intruder.id ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center p-3 border-top">
          <div className="text-muted small">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredIntruders.length)} of {filteredIntruders.length} entries
          </div>
          <ul className="pagination pagination-sm mb-0">
            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              >
                PREVIOUS
              </button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(page)}>
                  {page}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
              <button
                className="page-link"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              >
                NEXT
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Assign Attender</h5>
                <button type="button" className="btn-close" onClick={() => setIsAssignModalOpen(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Intruder ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={assigningIntruder?.id || ''}
                    readOnly
                  />
                </div>
                {/* <div className="mb-3">
                  <label className="form-label">Camera</label>
                  <input
                    type="text"
                    className="form-control"
                    value={assigningIntruder?.camera || ''}
                    readOnly
                  />
                </div> */}
                <div className="mb-3">
                  <label className="form-label">Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter Employee ID"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Mode</label>
                  <select
                    className="form-control"
                    value={assigningIntruder?.camera?.toLowerCase().includes('checkout') ? 'checkout' : 'checkin'}
                    onChange={(e) => {
                      // Update the assigningIntruder state with the selected mode
                      setAssigningIntruder(prev => ({
                        ...prev,
                        camera: e.target.value === 'checkout' ? 'Checkout Camera' : 'Checkin Camera'
                      }))
                    }}
                  >
                    <option value="checkin">Checkin</option>
                    <option value="checkout">Checkout</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsAssignModalOpen(false)}
                  disabled={isAssigning}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveAssign}
                  disabled={!userId.trim() || isAssigning}
                >
                  {isAssigning ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Assigning...
                    </>
                  ) : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Image Modal */}
      {showImageModal && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              zIndex: 1060,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowImageModal(false)}
          >
            <div
              style={{
                position: 'relative',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                textAlign: 'center'
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImageModal(false)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  background: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  fontSize: '24px',
                  cursor: 'pointer',
                  zIndex: 2
                }}
              >
                ×
              </button>
              <h3 style={{ color: 'white', marginBottom: '20px' }}>
                {imageTitle}
              </h3>
              <img
                src={currentImage ?
                  (currentImage.startsWith('data:image/') ?
                    currentImage :
                    `data:image/jpeg;base64,${currentImage}`) :
                  null}
                alt="Enlarged view"
                style={{
                  maxWidth: '100%',
                  maxHeight: '80vh',
                  borderRadius: '8px',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>

  );
};

export default IntrudeReport;