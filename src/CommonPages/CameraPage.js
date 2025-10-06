import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';
import { Pencil, Trash2 } from 'lucide-react';

const CameraPage = () => {
  const [cameraList, setCameraList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    camera_id: '',
    camera_name: '',
    camera_type: 'Check In',
    camera_description: '',
    camera_ip: '',
    camera_rtsp_port: '',
    camera_username: '',
    camera_password: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calculate pagination values
  const totalPages = Math.ceil(cameraList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCameras = cameraList.slice(startIndex, endIndex);

  // Fetch cameras on component mount
  useEffect(() => {
    fetchCameras();
  }, []);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('/get/cameras');
      setCameraList(response.data);
      
      // Reset to first page if current page is beyond available pages
      const totalPages = Math.ceil(response.data.length / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(1);
      }
    } catch (err) {
      setError('Failed to fetch cameras. ' + (err.response?.data?.message || err.message));
      console.error('Error fetching cameras:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setError('');

    // Basic validation
    if (!formData.camera_id || !formData.camera_name || !formData.camera_ip) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);

      // Use POST for both create and update
      await axios.post('/camera', formData);

      await fetchCameras();
      handleCloseModal();
    } catch (err) {
      setError('Operation failed. ' + (err.response?.data?.message || err.message));
      console.error('Error saving camera:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (camera) => {
    setFormData(camera);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (cameraId) => {
    if (!window.confirm('Are you sure you want to delete this camera?')) return;

    try {
      setLoading(true);
      setError('');
      
      // Use POST for delete operation
      await axios.post(`/delete/camera/${cameraId}`);
      await fetchCameras();
      
      // Adjust current page if needed after deletion
      const remainingItems = cameraList.length - 1;
      const totalPages = Math.ceil(remainingItems / itemsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
      }
    } catch (err) {
      setError('Delete failed. ' + (err.response?.data?.message || err.message));
      console.error('Error deleting camera:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCamera = () => {
    setFormData({
      camera_id: '',
      camera_name: '',
      camera_type: 'Check In',
      camera_description: '',
      camera_ip: '',
      camera_rtsp_port: '',
      camera_username: '',
      camera_password: ''
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setError('');
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>Camera Management</h4>
        <button
          className="btn btn-primary"
          onClick={handleAddCamera}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Add Camera'}
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="bg-white rounded shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Type</th>
                <th>Description</th>
                <th>IP Address</th>
                <th>RTSP Port</th>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : currentCameras.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center">No cameras found</td>
                </tr>
              ) : (
                currentCameras.map((camera) => (
                  <tr key={camera.camera_id}>
                    <td>{camera.camera_name}</td>
                    <td>{camera.camera_id}</td>
                    <td>{camera.camera_type}</td>
                    <td>{camera.camera_description}</td>
                    <td>{camera.camera_ip}</td>
                    <td>{camera.camera_rtsp_port}</td>
                    <td>{camera.camera_username}</td>
                    <td>
                      <button 
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => handleEdit(camera)}
                         title="Edit Camera"
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#28a745'}}
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(camera.camera_id)}
                        title="Delete Employee"
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '4px',
                            color: '#dc3545',
                          }}
                      >
                      <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {cameraList.length > 0 && (
          <div className="d-flex justify-content-between align-items-center p-3 border-top">
            <div className="text-muted small">
              Showing {startIndex + 1} to {Math.min(endIndex, cameraList.length)} of {cameraList.length} entries
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
        )}
      </div>

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEditMode ? 'Edit Camera' : 'Add New Camera'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {error}
                  </div>
                )}

                <div>
                  <div className="row g-3">
                    {[
                      {
                        label: 'Camera ID',
                        name: 'camera_id',
                        disabled: isEditMode,
                        note: isEditMode ? 'Camera ID cannot be changed' : ''
                      },
                      { label: 'Name', name: 'camera_name' },
                      {
                        label: 'Type',
                        name: 'camera_type',
                        type: 'select',
                        options: ['Check In', 'Check Out']
                      },
                      { label: 'Description', name: 'camera_description' },
                      { label: 'IP Address', name: 'camera_ip' },
                      { label: 'RTSP Port', name: 'camera_rtsp_port' },
                      { label: 'Username', name: 'camera_username' },
                      {
                        label: 'Password',
                        name: 'camera_password',
                        type: 'password',
                        note: isEditMode ? 'Leave blank to keep existing password' : ''
                      },
                    ].map((field) => (
                      <div className="col-md-6" key={field.name}>
                        <label className="form-label">{field.label}</label>
                        {field.type === 'select' ? (
                          <select
                            className="form-select"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            disabled={loading || field.disabled}
                          >
                            {field.options.map(option => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={field.type || 'text'}
                            className="form-control"
                            name={field.name}
                            value={formData[field.name]}
                            onChange={handleInputChange}
                            disabled={loading || field.disabled}
                            placeholder={field.note || ''}
                          />
                        )}
                        {field.note && (
                          <small className="form-text text-muted">{field.note}</small>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="modal-footer mt-4">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          {isEditMode ? 'Updating...' : 'Adding...'}
                        </>
                      ) : isEditMode ? 'Update Camera' : 'Add Camera'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CameraPage;

// import React, { useState, useEffect } from 'react';
// import axios from '../axiosConfig';
// import { Pencil, Trash2 } from 'lucide-react';

// const CameraPage = () => {
//   const [cameraList, setCameraList] = useState([]);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     camera_id: '',
//     camera_name: '',
//     camera_type: 'Check In',
//     camera_description: '',
//     camera_ip: '',
//     camera_rtsp_port: '',
//     camera_rtsp_url: '', // New field added
//     camera_username: '',
//     camera_password: ''
//   });
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
  
//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   // Calculate pagination values
//   const totalPages = Math.ceil(cameraList.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentCameras = cameraList.slice(startIndex, endIndex);

//   // Fetch cameras on component mount
//   useEffect(() => {
//     fetchCameras();
//   }, []);

//   const fetchCameras = async () => {
//     try {
//       setLoading(true);
//       setError('');
      
//       const response = await axios.get('/get/cameras');
//       setCameraList(response.data);
      
//       // Reset to first page if current page is beyond available pages
//       const totalPages = Math.ceil(response.data.length / itemsPerPage);
//       if (currentPage > totalPages && totalPages > 0) {
//         setCurrentPage(1);
//       }
//     } catch (err) {
//       setError('Failed to fetch cameras. ' + (err.response?.data?.message || err.message));
//       console.error('Error fetching cameras:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     setError('');

//     // Basic validation
//     if (!formData.camera_id || !formData.camera_name || !formData.camera_ip) {
//       setError('Please fill in all required fields');
//       return;
//     }

//     try {
//       setLoading(true);

//       // Use POST for both create and update
//       await axios.post('/camera', formData);

//       await fetchCameras();
//       handleCloseModal();
//     } catch (err) {
//       setError('Operation failed. ' + (err.response?.data?.message || err.message));
//       console.error('Error saving camera:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (camera) => {
//     setFormData(camera);
//     setIsEditMode(true);
//     setShowModal(true);
//   };

//   const handleDelete = async (cameraId) => {
//     if (!window.confirm('Are you sure you want to delete this camera?')) return;

//     try {
//       setLoading(true);
//       setError('');
      
//       // Use POST for delete operation
//       await axios.post(`/delete/camera/${cameraId}`);
//       await fetchCameras();
      
//       // Adjust current page if needed after deletion
//       const remainingItems = cameraList.length - 1;
//       const totalPages = Math.ceil(remainingItems / itemsPerPage);
//       if (currentPage > totalPages && totalPages > 0) {
//         setCurrentPage(totalPages);
//       }
//     } catch (err) {
//       setError('Delete failed. ' + (err.response?.data?.message || err.message));
//       console.error('Error deleting camera:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddCamera = () => {
//     setFormData({
//       camera_id: '',
//       camera_name: '',
//       camera_type: 'Check In',
//       camera_description: '',
//       camera_ip: '',
//       camera_rtsp_port: '',
//       camera_rtsp_url: '', // Initialize new field
//       camera_username: '',
//       camera_password: ''
//     });
//     setIsEditMode(false);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setError('');
//   };

//   return (
//     <div className="container mt-4">
//       <div className="d-flex justify-content-between align-items-center mb-3">
//         <h4>Camera Management</h4>
//         <button
//           className="btn btn-primary"
//           onClick={handleAddCamera}
//           disabled={loading}
//         >
//           {loading ? 'Loading...' : 'Add Camera'}
//         </button>
//       </div>

//       {error && (
//         <div className="alert alert-danger" role="alert">
//           {error}
//         </div>
//       )}

//       <div className="bg-white rounded shadow-sm">
//         <div className="table-responsive">
//           <table className="table table-hover mb-0">
//             <thead className="table-light">
//               <tr>
//                 <th>Name</th>
//                 <th>ID</th>
//                 <th>Type</th>
//                 <th>Description</th>
//                 <th>IP Address</th>
//                 <th>RTSP Port</th>
//                 <th>RTSP URL</th> {/* New column added */}
//                 <th>Username</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan="9" className="text-center">
//                     <div className="spinner-border text-primary" role="status">
//                       <span className="visually-hidden">Loading...</span>
//                     </div>
//                   </td>
//                 </tr>
//               ) : currentCameras.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" className="text-center">No cameras found</td>
//                 </tr>
//               ) : (
//                 currentCameras.map((camera) => (
//                   <tr key={camera.camera_id}>
//                     <td>{camera.camera_name}</td>
//                     <td>{camera.camera_id}</td>
//                     <td>{camera.camera_type}</td>
//                     <td>{camera.camera_description}</td>
//                     <td>{camera.camera_ip}</td>
//                     <td>{camera.camera_rtsp_port}</td>
//                     <td>{camera.camera_rtsp_url}</td> {/* New data cell */}
//                     <td>{camera.camera_username}</td>
//                     <td>
//                       <button 
//                         className="btn btn-sm btn-warning me-2"
//                         onClick={() => handleEdit(camera)}
//                          title="Edit Camera"
//                           style={{
//                             background: 'none',
//                             border: 'none',
//                             cursor: 'pointer',
//                             padding: '4px',
//                             color: '#28a745'}}
//                       >
//                         <Pencil size={16} />
//                       </button>
//                       <button 
//                         className="btn btn-sm btn-danger"
//                         onClick={() => handleDelete(camera.camera_id)}
//                         title="Delete Employee"
//                           style={{
//                             background: 'none',
//                             border: 'none',
//                             padding: '4px',
//                             color: '#dc3545',
//                           }}
//                       >
//                       <Trash2 size={16} />
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {/* Pagination */}
//         {cameraList.length > 0 && (
//           <div className="d-flex justify-content-between align-items-center p-3 border-top">
//             <div className="text-muted small">
//               Showing {startIndex + 1} to {Math.min(endIndex, cameraList.length)} of {cameraList.length} entries
//             </div>
//             <nav aria-label="Table pagination">
//               <ul className="pagination pagination-sm mb-0">
//                 <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
//                     disabled={currentPage === 1}
//                   >
//                     PREVIOUS
//                   </button>
//                 </li>
//                 {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
//                   <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
//                     <button
//                       className="page-link"
//                       onClick={() => setCurrentPage(page)}
//                     >
//                       {page}
//                     </button>
//                   </li>
//                 ))}
//                 <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
//                   <button
//                     className="page-link"
//                     onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
//                     disabled={currentPage === totalPages}
//                   >
//                     NEXT
//                   </button>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//         )}
//       </div>

//       {/* Modal for Add/Edit */}
//       {showModal && (
//         <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog modal-lg">
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">
//                   {isEditMode ? 'Edit Camera' : 'Add New Camera'}
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={handleCloseModal}
//                   disabled={loading}
//                 ></button>
//               </div>
//               <div className="modal-body">
//                 {error && (
//                   <div className="alert alert-danger mb-3" role="alert">
//                     {error}
//                   </div>
//                 )}

//                 <div>
//                   <div className="row g-3">
//                     {[
//                       {
//                         label: 'Camera ID',
//                         name: 'camera_id',
//                         disabled: isEditMode,
//                         note: isEditMode ? 'Camera ID cannot be changed' : ''
//                       },
//                       { label: 'Name', name: 'camera_name' },
//                       {
//                         label: 'Type',
//                         name: 'camera_type',
//                         type: 'select',
//                         options: ['Check In', 'Check Out']
//                       },
//                       { label: 'Description', name: 'camera_description' },
//                       { label: 'IP Address', name: 'camera_ip' },
//                       { label: 'RTSP Port', name: 'camera_rtsp_port' },
//                       // New RTSP URL field added here
//                       { 
//                         label: 'RTSP URL', 
//                         name: 'camera_rtsp_url',
//                       },
//                       { label: 'Username', name: 'camera_username' },
//                       {
//                         label: 'Password',
//                         name: 'camera_password',
//                         type: 'password',
//                         note: isEditMode ? 'Leave blank to keep existing password' : ''
//                       },
//                     ].map((field) => (
//                       <div className="col-md-6" key={field.name}>
//                         <label className="form-label">{field.label}</label>
//                         {field.type === 'select' ? (
//                           <select
//                             className="form-select"
//                             name={field.name}
//                             value={formData[field.name]}
//                             onChange={handleInputChange}
//                             disabled={loading || field.disabled}
//                           >
//                             {field.options.map(option => (
//                               <option key={option} value={option}>
//                                 {option}
//                               </option>
//                             ))}
//                           </select>
//                         ) : (
//                           <input
//                             type={field.type || 'text'}
//                             className="form-control"
//                             name={field.name}
//                             value={formData[field.name]}
//                             onChange={handleInputChange}
//                             disabled={loading || field.disabled}
//                             placeholder={field.note || ''}
//                           />
//                         )}
//                         {field.note && (
//                           <small className="form-text text-muted">{field.note}</small>
//                         )}
//                       </div>
//                     ))}
//                   </div>
//                   <div className="modal-footer mt-4">
//                     <button
//                       type="button"
//                       className="btn btn-secondary"
//                       onClick={handleCloseModal}
//                       disabled={loading}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       className="btn btn-primary"
//                       onClick={handleSubmit}
//                       disabled={loading}
//                     >
//                       {loading ? (
//                         <>
//                           <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
//                           {isEditMode ? 'Updating...' : 'Adding...'}
//                         </>
//                       ) : isEditMode ? 'Update Camera' : 'Add Camera'}
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CameraPage;