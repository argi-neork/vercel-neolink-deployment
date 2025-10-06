


import React, { useState, useEffect } from 'react';
import axios from '../axiosConfig';

// Helper to format date for input[type="date"] to DD-MM-YYYY display
function formatDateForDisplay(dateString) {
  if (!dateString) return '';

  // If dateString is in YYYY-MM-DD format (from API or input)
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

// Helper to format date for API (convert DD-MM-YYYY to YYYY-MM-DD)
function formatDateForAPI(dateString) {
  if (!dateString) return '';

  // If already in YYYY-MM-DD format
  if (dateString.includes('-') && dateString.split('-')[0].length === 4) {
    return dateString;
  }

  // If in DD-MM-YYYY format, convert to YYYY-MM-DD
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return dateString;
}

// Helper to format date for input[type="date"] (needs YYYY-MM-DD)
function formatDateForInput(dateString) {
  if (!dateString) return '';

  // If dateString is in DD-MM-YYYY format
  if (dateString.includes('-')) {
    const parts = dateString.split('-');
    if (parts.length === 3 && parts[0].length <= 2) {
      // DD-MM-YYYY format, convert to YYYY-MM-DD
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    } else if (parts[0].length === 4) {
      // Already in YYYY-MM-DD format
      return dateString;
    }
  }

  // Try to parse as date
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return '';
}

// Helper to format time for input[type="time"]
function formatTimeForInput(time) {
  if (!time) return '';

  // Handle cases where time might be in "H:MM" format
  const parts = time.split(':');
  let hours = parts[0];
  let minutes = parts[1] || '00';

  // Pad single-digit hours with leading zero
  if (hours.length === 1) {
    hours = '0' + hours;
  }

  // Pad single-digit minutes with leading zero
  if (minutes.length === 1) {
    minutes = '0' + minutes;
  }

  return `${hours}:${minutes}`;
}

function SettingPage() {
  const [officeHours, setOfficeHours] = useState({
    start_time: '',
    end_time: ''
  });

  const [workHours, setWorkHours] = useState({
    required_hours: 0,
    break_hours: 0
  });

  // Updated state for Schedule Daily Report with date fields
  const [scheduleReport, setScheduleReport] = useState({
    report_generation_time: '',
    report_start_date: '', // New field for start date
    report_end_date: '',   // New field for end date
    receiver_emails: '',
    daily_attendance_report: false,
    intruder_report: false,
    attendance_mismatch_report: false
  });

  const [loading, setLoading] = useState({
    officeHours: false,
    workHours: false,
    scheduleReport: false,
    saveOffice: false,
    saveWork: false,
    saveSchedule: false
  });

  const [alerts, setAlerts] = useState({
    office: null,
    work: null,
    schedule: null
  });

  // Fetch existing settings on component mount
  useEffect(() => {
    fetchOfficeHours();
    fetchWorkHours();
    fetchScheduleReport();
  }, []);

  const fetchOfficeHours = async () => {
    setLoading(prev => ({ ...prev, officeHours: true }));
    try {
      const response = await axios.get('/api/settings/get/global/office_hours');
      // API returns array with object, so get first item
      const data = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : {};

      // Format times for input fields
      setOfficeHours({
        start_time: data.start_time ? formatTimeForInput(data.start_time) : '',
        end_time: data.end_time ? formatTimeForInput(data.end_time) : ''
      });
    } catch (error) {
      console.error('Error fetching office hours:', error);
      showAlert('office', 'Error loading office hours', 'danger');
    } finally {
      setLoading(prev => ({ ...prev, officeHours: false }));
    }
  };

  const fetchWorkHours = async () => {
    setLoading(prev => ({ ...prev, workHours: true }));
    try {
      const response = await axios.get('/api/settings/get/global/work_hours');
      // API returns array with object, so get first item
      const data = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : {};
      setWorkHours({
        required_hours: data.required_hours || 0,
        break_hours: data.break_hours || 0
      });
    } catch (error) {
      console.error('Error fetching work hours:', error);
      showAlert('work', 'Error loading work hours', 'danger');
    } finally {
      setLoading(prev => ({ ...prev, workHours: false }));
    }
  };

  // Updated function to fetch schedule report settings with date fields
  const fetchScheduleReport = async () => {
    setLoading(prev => ({ ...prev, scheduleReport: true }));
    try {
      const response = await axios.get('/api/settings/get/global/schedule_report');
      const data = Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : {};
      setScheduleReport({
        report_generation_time: data.report_generation_time ? formatTimeForInput(data.report_generation_time) : '',
        report_start_date: data.report_start_date ? formatDateForInput(data.report_start_date) : '',
        report_end_date: data.report_end_date ? formatDateForInput(data.report_end_date) : '',
        receiver_emails: data.receiver_emails || '',
        daily_attendance_report: data.daily_attendance_report || false,
        intruder_report: data.intruder_report || false,
        attendance_mismatch_report: data.attendance_mismatch_report || false
      });
    } catch (error) {
      console.error('Error fetching schedule report settings:', error);
      showAlert('schedule', 'Error loading schedule report settings', 'danger');
    } finally {
      setLoading(prev => ({ ...prev, scheduleReport: false }));
    }
  };

  const saveOfficeHours = async () => {
    if (!officeHours.start_time || !officeHours.end_time) {
      showAlert('office', 'Please fill in both start and end times', 'warning');
      return;
    }

    setLoading(prev => ({ ...prev, saveOffice: true }));

    try {
      await axios.post('/api/settings/set/global/office_hours', officeHours, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      showAlert('office', 'Office hours updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving office hours:', error);
      const errorMessage = error.response?.data?.message || 'Error saving office hours';
      showAlert('office', errorMessage, 'danger');
    } finally {
      setLoading(prev => ({ ...prev, saveOffice: false }));
    }
  };

  const saveWorkHours = async () => {
    if (workHours.required_hours <= 0) {
      showAlert('work', 'Required hours must be greater than 0', 'warning');
      return;
    }

    setLoading(prev => ({ ...prev, saveWork: true }));

    try {
      await axios.post('/api/settings/set/global/work_hours', workHours, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      showAlert('work', 'Work hours updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving work hours:', error);
      const errorMessage = error.response?.data?.message || 'Error saving work hours';
      showAlert('work', errorMessage, 'danger');
    } finally {
      setLoading(prev => ({ ...prev, saveWork: false }));
    }
  };

  // Updated function to save schedule report settings with date formatting
  const saveScheduleReport = async () => {
    if (!scheduleReport.report_generation_time) {
      showAlert('schedule', 'Please set report generation time', 'warning');
      return;
    }

    if (!scheduleReport.receiver_emails.trim()) {
      showAlert('schedule', 'Please enter receiver email addresses', 'warning');
      return;
    }

    if (!scheduleReport.daily_attendance_report && !scheduleReport.intruder_report && !scheduleReport.attendance_mismatch_report) {
      showAlert('schedule', 'Please select at least one report type', 'warning');
      return;
    }

    setLoading(prev => ({ ...prev, saveSchedule: true }));

    // Prepare data for API with properly formatted dates
    const scheduleDataForAPI = {
      ...scheduleReport,
      report_start_date: scheduleReport.report_start_date ? formatDateForAPI(scheduleReport.report_start_date) : '',
      report_end_date: scheduleReport.report_end_date ? formatDateForAPI(scheduleReport.report_end_date) : ''
    };

    // Console log all the entered values with DD-MM-YYYY format for display
    console.log('Schedule Report Settings:', {
      report_generation_time: scheduleReport.report_generation_time,
      report_start_date: scheduleReport.report_start_date ? formatDateForDisplay(scheduleReport.report_start_date) : '',
      report_end_date: scheduleReport.report_end_date ? formatDateForDisplay(scheduleReport.report_end_date) : '',
      receiver_emails: scheduleReport.receiver_emails,
      daily_attendance_report: scheduleReport.daily_attendance_report,
      intruder_report: scheduleReport.intruder_report,
      attendance_mismatch_report: scheduleReport.attendance_mismatch_report
    });

    try {
      await axios.post('/api/settings/set/global/schedule_report', scheduleDataForAPI, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      showAlert('schedule', 'Schedule report settings updated successfully!', 'success');
    } catch (error) {
      console.error('Error saving schedule report settings:', error);
      const errorMessage = error.response?.data?.message || 'Error saving schedule report settings';
      showAlert('schedule', errorMessage, 'danger');
    } finally {
      setLoading(prev => ({ ...prev, saveSchedule: false }));
    }
  };

  const showAlert = (type, message, variant) => {
    setAlerts(prev => ({ ...prev, [type]: { message, variant } }));
    setTimeout(() => {
      setAlerts(prev => ({ ...prev, [type]: null }));
    }, 5000);
  };

  const handleOfficeHoursChange = (field, value) => {
    setOfficeHours(prev => ({ ...prev, [field]: value }));
  };

  const handleWorkHoursChange = (field, value) => {
    setWorkHours(prev => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  // Updated handler for schedule report changes
  const handleScheduleReportChange = (field, value) => {
    if (field === 'daily_attendance_report' || field === 'intruder_report' || field === 'attendance_mismatch_report') {
      setScheduleReport(prev => ({ ...prev, [field]: value }));
    } else {
      setScheduleReport(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Bootstrap CSS */}
      <link
        href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css"
        rel="stylesheet"
      />

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-10 col-xl-8">
            <div className="row g-4">

              {/* Office Hours Card */}
              <div className="col-12 col-md-6">
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-header text-white" style={{ backgroundColor: " rgb(17, 59, 74)" }}>
                    <h5 className="card-title mb-0">
                      <i className="fas fa-clock me-2"></i>Office Hours
                    </h5>
                  </div>
                  <div className="card-body">
                    {alerts.office && (
                      <div className={`alert alert-${alerts.office.variant} alert-dismissible fade show`} role="alert">
                        {alerts.office.message}
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setAlerts(prev => ({ ...prev, office: null }))}
                        ></button>
                      </div>
                    )}

                    {loading.officeHours ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-3">
                          <label htmlFor="startTime" className="form-label fw-semibold">
                            <i className="fas fa-sun me-1 text-warning"></i>Start Time
                          </label>
                          <input
                            type="time"
                            className="form-control form-control-lg"
                            id="startTime"
                            value={officeHours.start_time}
                            onChange={(e) => handleOfficeHoursChange('start_time', e.target.value)}
                          />
                        </div>

                        <div className="mb-4">
                          <label htmlFor="endTime" className="form-label fw-semibold">
                            <i className="fas fa-moon me-1 text-info"></i>End Time
                          </label>
                          <input
                            type="time"
                            className="form-control form-control-lg"
                            id="endTime"
                            value={officeHours.end_time}
                            onChange={(e) => handleOfficeHoursChange('end_time', e.target.value)}
                          />
                        </div>

                        <button
                          type="button"
                          className="btn text-white btn-lg w-100"
                          disabled={loading.saveOffice}
                          onClick={saveOfficeHours}
                          style={{ backgroundColor: " rgb(17, 59, 74)" }}
                        >
                          {loading.saveOffice ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>Save Office Hours
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Work Hours Card */}
              <div className="col-12 col-md-6">
                <div className="card shadow-sm h-100 border-0">
                  <div className="card-header text-white" style={{ backgroundColor: " rgb(17, 59, 74)" }}>
                    <h5 className="card-title mb-0">
                      <i className="fas fa-business-time me-2"></i>Work Hours
                    </h5>
                  </div>
                  <div className="card-body">
                    {alerts.work && (
                      <div className={`alert alert-${alerts.work.variant} alert-dismissible fade show`} role="alert">
                        {alerts.work.message}
                        <button
                          type="button"
                          className="btn-close"
                          onClick={() => setAlerts(prev => ({ ...prev, work: null }))}
                        ></button>
                      </div>
                    )}

                    {loading.workHours ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-success" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="mb-3">
                          <label htmlFor="requiredHours" className="form-label fw-semibold">
                            <i className="fas fa-hourglass-half me-1 text-primary"></i>Required Hours
                          </label>
                          <div className="input-group input-group-lg">
                            <input
                              type="number"
                              className="form-control"
                              id="requiredHours"
                              value={workHours.required_hours}
                              onChange={(e) => handleWorkHoursChange('required_hours', e.target.value)}
                              min="1"
                              max="24"
                            />
                            <span className="input-group-text">hours</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <label htmlFor="breakHours" className="form-label fw-semibold">
                            <i className="fas fa-coffee me-1 text-warning"></i>Break Hours
                          </label>
                          <div className="input-group input-group-lg">
                            <input
                              type="number"
                              className="form-control"
                              id="breakHours"
                              value={workHours.break_hours}
                              onChange={(e) => handleWorkHoursChange('break_hours', e.target.value)}
                              min="0"
                              max="8"
                            />
                            <span className="input-group-text">hours</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-lg w-100 text-white"
                          disabled={loading.saveWork}
                          onClick={saveWorkHours}
                          style={{ backgroundColor: " rgb(17, 59, 74)" }}
                        >
                          {loading.saveWork ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>Save Work Hours
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="mt-5">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-light">
                  <h5 className="card-title mb-0 text-dark">
                    <i className="fas fa-info-circle me-2 text-info"></i>Current Settings Summary
                  </h5>
                </div>
                <div className="card-body bg-white">
                  <div className="row">
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded mb-3 mb-md-0">
                        <h6 className="fw-bold text-primary mb-2">
                          <i className="fas fa-clock me-1"></i>Office Hours
                        </h6>
                        <p className="mb-1">
                          <strong>Start:</strong> {officeHours.start_time || 'Not set'}
                        </p>
                        <p className="mb-0">
                          <strong>End:</strong> {officeHours.end_time || 'Not set'}
                        </p>
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className="p-3 bg-light rounded">
                        <h6 className="fw-bold text-success mb-2">
                          <i className="fas fa-business-time me-1"></i>Work Hours
                        </h6>
                        <p className="mb-1">
                          <strong>Required:</strong> {workHours.required_hours} hours
                        </p>
                        <p className="mb-0">
                          <strong>Break:</strong> {workHours.break_hours} hours
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Daily Report Section */}
          
          </div>
        </div>
      </div>

      {/* Font Awesome for Icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </div>
  );
}

export default SettingPage; 


  // <div className="mt-5">
  //             <div className="card shadow-sm border-0">
  //               <div className="card-header text-white" style={{ backgroundColor: " rgb(17, 59, 74)" }}>
  //                 <h5 className="card-title mb-0">
  //                   <i className="fas fa-calendar-alt me-2"></i>Schedule Daily Report
  //                 </h5>
  //               </div>
  //               <div className="card-body">
  //                 {alerts.schedule && (
  //                   <div className={`alert alert-${alerts.schedule.variant} alert-dismissible fade show`} role="alert">
  //                     {alerts.schedule.message}
  //                     <button
  //                       type="button"
  //                       className="btn-close"
  //                       onClick={() => setAlerts(prev => ({ ...prev, schedule: null }))}
  //                     ></button>
  //                   </div>
  //                 )}

  //                 {loading.scheduleReport ? (
  //                   <div className="text-center py-4">
  //                     <div className="spinner-border text-primary" role="status">
  //                       <span className="visually-hidden">Loading...</span>
  //                     </div>
  //                   </div>
  //                 ) : (
  //                   <div>
  //                     <div className="row g-4">
  //                       {/* Report Generation Time */}
  //                       <div className="col-12 col-md-6">
  //                         <label htmlFor="reportTime" className="form-label fw-semibold">
  //                           <i className="fas fa-clock me-1 text-primary"></i>Report Generation Time
  //                         </label>
  //                         <input
  //                           type="time"
  //                           className="form-control form-control-lg"
  //                           id="reportTime"
  //                           value={scheduleReport.report_generation_time}
  //                           onChange={(e) => handleScheduleReportChange('report_generation_time', e.target.value)}
  //                         />
  //                       </div>

  //                       {/* Receiver Email IDs */}
  //                       <div className="col-12 col-md-6">
  //                         <label htmlFor="receiverEmails" className="form-label fw-semibold">
  //                           <i className="fas fa-envelope me-1 text-success"></i>Receiver Email ID's
  //                         </label>
  //                         <textarea
  //                           className="form-control"
  //                           id="receiverEmails"
  //                           rows="3"
  //                           placeholder="Enter email addresses separated by commas"
  //                           value={scheduleReport.receiver_emails}
  //                           onChange={(e) => handleScheduleReportChange('receiver_emails', e.target.value)}
  //                         ></textarea>
  //                         <small className="form-text text-muted">Separate multiple emails with commas</small>
  //                       </div>
  //                     </div>

  //                     {/* Report Types */}
  //                     <div className="mt-4">
  //                       <h6 className="fw-bold mb-3">
  //                         <i className="fas fa-file-alt me-1 text-info"></i>Select Report Types
  //                       </h6>
  //                       <div className="row g-3">
  //                         <div className="col-12 col-md-4">
  //                           <div className="form-check">
  //                             <input
  //                               className="form-check-input"
  //                               type="checkbox"
  //                               id="dailyAttendanceReport"
  //                               checked={scheduleReport.daily_attendance_report}
  //                               onChange={(e) => handleScheduleReportChange('daily_attendance_report', e.target.checked)}
  //                             />
  //                             <label className="form-check-label fw-semibold" htmlFor="dailyAttendanceReport">
  //                               <i className="fas fa-user-check me-1 text-success"></i>Daily Attendance Report
  //                             </label>
  //                           </div>
  //                         </div>
  //                         <div className="col-12 col-md-4">
  //                           <div className="form-check">
  //                             <input
  //                               className="form-check-input"
  //                               type="checkbox"
  //                               id="intruderReport"
  //                               checked={scheduleReport.intruder_report}
  //                               onChange={(e) => handleScheduleReportChange('intruder_report', e.target.checked)}
  //                             />
  //                             <label className="form-check-label fw-semibold" htmlFor="intruderReport">
  //                               <i className="fas fa-exclamation-triangle me-1 text-warning"></i>Intruder Report
  //                             </label>
  //                           </div>
  //                         </div>
  //                         <div className="col-12 col-md-4">
  //                           <div className="form-check">
  //                             <input
  //                               className="form-check-input"
  //                               type="checkbox"
  //                               id="attendanceMismatchReport"
  //                               checked={scheduleReport.attendance_mismatch_report}
  //                               onChange={(e) => handleScheduleReportChange('attendance_mismatch_report', e.target.checked)}
  //                             />
  //                             <label className="form-check-label fw-semibold" htmlFor="attendanceMismatchReport">
  //                               <i className="fas fa-times-circle me-1 text-danger"></i>Attendance Mismatch Report
  //                             </label>
  //                           </div>
  //                         </div>
  //                       </div>
  //                     </div>
  //                     {/* Schedule Button */}
  //                     <div className="mt-4">
  //                       <button
  //                         type="button"
  //                         className="btn btn-lg text-white"
  //                         disabled={loading.saveSchedule}
  //                         onClick={saveScheduleReport}
  //                         style={{ backgroundColor: " rgb(17, 59, 74)" }}
  //                       >
  //                         {loading.saveSchedule ? (
  //                           <>
  //                             <span className="spinner-border spinner-border-sm me-2" role="status"></span>
  //                             Scheduling...
  //                           </>
  //                         ) : (
  //                           <>
  //                             <i className="fas fa-calendar-check me-2"></i>Schedule
  //                           </>
  //                         )}
  //                       </button>
  //                     </div>
  //                   </div>
  //                 )}
  //               </div>
  //             </div>
  //             <div className="mt-5">
  //               <div className="card shadow-sm border-0">
  //                 <div className="card-header bg-light">
  //                   <h5 className="card-title mb-0 text-dark">
  //                     <i className="fas fa-info-circle me-2 text-info"></i>Current Schedule Settings
  //                   </h5>
  //                 </div>
  //                 <div className="card-body bg-white">
  //                   <div className="row g-3">
  //                     <div className="col-12 col-md-6">
  //                       <p className="mb-1"><strong>Generation Time:</strong> {scheduleReport.report_generation_time || 'Not set'}</p>
  //                       <p className="mb-1"><strong>Start Date:</strong> {scheduleReport.report_start_date ? formatDateForDisplay(scheduleReport.report_start_date) : 'Not set'}</p>
  //                       <p className="mb-0"><strong>End Date:</strong> {scheduleReport.report_end_date ? formatDateForDisplay(scheduleReport.report_end_date) : 'Not set'}</p>
  //                     </div>
  //                     <div className="col-12 col-md-6">
  //                       <p className="mb-1"><strong>Receiver Emails:</strong> {scheduleReport.receiver_emails || 'Not set'}</p>
  //                       <p className="mb-0"><strong>Report Types:</strong> {
  //                         [
  //                           scheduleReport.daily_attendance_report && 'Daily Attendance',
  //                           scheduleReport.intruder_report && 'Intruder',
  //                           scheduleReport.attendance_mismatch_report && 'Attendance Mismatch'
  //                         ].filter(Boolean).join(', ') || 'None selected'
  //                       }</p>
  //                     </div>
  //                   </div>
  //                 </div>
  //               </div>
  //             </div>
  //           </div>