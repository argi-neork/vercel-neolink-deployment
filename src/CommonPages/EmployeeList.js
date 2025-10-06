import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import api from '../axiosConfig';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get('/api/get/employees');
      let data = response.data;

      // Handle different response formats
      if (!Array.isArray(data)) {
        if (data && typeof data === 'object') {
          // Convert object to array
          data = Object.values(data);
        } else {
          throw new Error("Unexpected API response format");
        }
      }

      setEmployees(data);
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to fetch employees. Please try again later.');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee({
      emp_id_old: employee.emp_id,
      emp_id_new: employee.emp_id,
      emp_name: employee.emp_name,
      actual_hours: employee.actual_hours || 0,
      break_hours: employee.break_hours || 0,
      start_time: employee.start_time || '',  // Add start_time
      end_time: employee.end_time || ''       // Add end_time
    });
  };

  const handleSaveEdit = async () => {
    if (!editingEmployee) return;

    try {
      setLoading(true);

      const payload = {
        emp_id_old: editingEmployee.emp_id_old,
        emp_id_new: editingEmployee.emp_id_new,
        emp_name: editingEmployee.emp_name,
        actual_hours: editingEmployee.actual_hours,
        break_hours: editingEmployee.break_hours,
        start_time: editingEmployee.start_time,  // Add to payload
        end_time: editingEmployee.end_time        // Add to payload
      };

      await api.post('update/employee', payload);

      // Update local state
      setEmployees(prev =>
        prev.map(emp =>
          emp.emp_id === editingEmployee.emp_id_old
            ? {
              ...emp,
              emp_id: editingEmployee.emp_id_new,
              emp_name: editingEmployee.emp_name,
              actual_hours: editingEmployee.actual_hours,
              break_hours: editingEmployee.break_hours,
              start_time: editingEmployee.start_time,  // Add to state update
              end_time: editingEmployee.end_time       // Add to state update
            }
            : emp
        )
      );

      setEditingEmployee(null);
      alert('Employee updated successfully!');
    } catch (err) {
      alert(`Update error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (empId) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      setDeletingId(empId);
      await api.post(`/delete/employee/${empId}`);

      setEmployees(prev => prev.filter(emp => emp.emp_id !== empId));
      alert('Employee deleted successfully!');
    } catch (err) {
      alert(`Delete failed: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  // Filter data based on search term
  const filteredEmployees = employees.filter(employee => {
    return employee.emp_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.emp_id.toString().includes(searchTerm);
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const currentData = filteredEmployees.slice(startIndex, endIndex);

  // Loading spinner
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
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><a href="#" className="text-decoration-none">🏠</a></li>
              <li className="breadcrumb-item active" aria-current="page">Employees</li>
            </ol>
          </nav>
          <h2 className="mb-0">Employees</h2>
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
                placeholder="Search employees..."
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

      {/* Error Messages */}
      {error && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
          <button onClick={fetchEmployees} className="btn btn-sm btn-outline-primary ms-2">
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
                <th scope="col" className="border-0 px-4 py-3">
                  Employee Name
                  <i className="fas fa-sort ms-1 text-muted"></i>
                </th>
                <th scope="col" className="border-0 px-4 py-3">Employee ID</th>
                <th scope="col" className="border-0 px-4 py-3">Start Time</th>
                <th scope="col" className="border-0 px-4 py-3">End Time</th>
                <th scope="col" className="border-0 px-4 py-3">Actual Hours</th>
                <th scope="col" className="border-0 px-4 py-3">Break Hours</th>
                <th scope="col" className="border-0 px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-5">
                    <i className="fas fa-inbox fa-3x text-muted mb-3 d-block"></i>
                    <p className="text-muted mb-0">No employees found</p>
                  </td>
                </tr>
              ) : (
                currentData.map((employee) => (
                  <tr key={employee.emp_id}>
                    <td className="px-4 py-3">
                      <div className="fw-medium text-dark">{employee.emp_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted">{employee.emp_id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted">
                        {employee.start_time || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted">
                        {employee.end_time || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted">{employee.actual_hours || 0} hrs</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-muted">{employee.break_hours || 0} hrs</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="d-flex gap-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          title="Edit Employee"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#28a745'
                          }}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(employee.emp_id)}
                          title="Delete Employee"
                          disabled={deletingId === employee.emp_id}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: deletingId === employee.emp_id ? 'not-allowed' : 'pointer',
                            padding: '4px',
                            color: '#dc3545',
                            opacity: deletingId === employee.emp_id ? 0.5 : 1
                          }}
                        >
                          {deletingId === employee.emp_id ? (
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
            Showing {startIndex + 1} to {Math.min(endIndex, filteredEmployees.length)} of {filteredEmployees.length} entries
          </div>
          <nav aria-label="Table pagination">
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  PREVIOUS
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  NEXT
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Edit Modal */}
      {editingEmployee && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Employee</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingEmployee(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Current Employee ID</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={editingEmployee.emp_id_old}
                    readOnly
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Employee ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingEmployee.emp_id_new}
                    onChange={(e) => setEditingEmployee(prev => ({
                      ...prev,
                      emp_id_new: e.target.value
                    }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Employee Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editingEmployee.emp_name}
                    onChange={(e) => setEditingEmployee(prev => ({
                      ...prev,
                      emp_name: e.target.value
                    }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Start Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={editingEmployee.start_time || ''}
                    onChange={(e) => setEditingEmployee(prev => ({
                      ...prev,
                      start_time: e.target.value
                    }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Time</label>
                  <input
                    type="time"
                    className="form-control"
                    value={editingEmployee.end_time || ''}
                    onChange={(e) => setEditingEmployee(prev => ({
                      ...prev,
                      end_time: e.target.value
                    }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Actual Hours</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingEmployee.actual_hours}
                    onChange={(e) => setEditingEmployee(prev => ({
                      ...prev,
                      actual_hours: Number(e.target.value)
                    }))}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Break Hours</label>
                  <input
                    type="number"
                    className="form-control"
                    value={editingEmployee.break_hours}
                    onChange={(e) => setEditingEmployee(prev => ({
                      ...prev,
                      break_hours: Number(e.target.value)
                    }))}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingEmployee(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveEdit}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1"></span>
                      Saving...
                    </>
                  ) : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .table th {
          font-weight: 600;
          font-size: 0.875rem;
          color: #6c757d;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .table td {
          vertical-align: middle;
          font-size: 0.875rem;
          border-color: #f8f9fa;
        }
        
        .table-hover tbody tr:hover {
          background-color: #f8f9fa;
        }
        
        .badge {
          font-size: 0.75rem;
          padding: 0.5em 0.75em;
          font-weight: 500;
        }
        
        .breadcrumb-item + .breadcrumb-item::before {
          content: "/";
          color: #6c757d;
        }
        
        .pagination .page-link {
          color: #6c757d;
          border-color: #dee2e6;
          padding: 0.5rem 0.75rem;
        }
        
        .pagination .page-item.active .page-link {
          background-color: #0d6efd;
          border-color: #0d6efd;
        } 
        
        .form-select-sm {
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
        }
        
        .dropdown-toggle::after {
          margin-left: 0.5em;
        }
      `}</style>
    </div>
  );
};

export default EmployeeList;