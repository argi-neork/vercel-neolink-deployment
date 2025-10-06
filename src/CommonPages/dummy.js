import React, { useState, useEffect, useRef } from 'react';
import { FiActivity } from 'react-icons/fi';
import axios from '../axiosConfig';
import html2pdf from 'html2pdf.js';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import ExcelJS from 'exceljs';
import { Chart as ChartJS, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

// FIXED REGISTRATION
ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend);
ChartJS.register(ArcElement, Tooltip, Legend);
function ReportPage() {
   
    const [excelDownloading, setExcelDownloading] = useState(false);
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activityLoading, setActivityLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFilter, setShowFilter] = useState(false);
    const [activityData, setActivityData] = useState(null);
    const [showActivityModal, setShowActivityModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [filterParams, setFilterParams] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        user_ids: []
    });
    const [tempFilterParams, setTempFilterParams] = useState({
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        user_ids: []
    });
    const [userIdInput, setUserIdInput] = useState('');
    const productivityChartRef = useRef(null);
    const lateInEarlyOutChartRef = useRef(null);
    const attendanceChartRef = useRef(null);
    const printRef = useRef(null);
    const reportPrintRef = useRef(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [currentImage, setCurrentImage] = useState(null);
    const [imageTitle, setImageTitle] = useState('');
    const fetchActivityData = async (userId, startDate, endDate) => {
        try {
            const response = await axios.get(
                `/api/reports/checkinout_logs`,
                {
                    params: {
                        userid: userId,
                        start_date: startDate,
                        end_date: startDate
                        // end_date: endDate
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error fetching activity data:', error);
            return null;
        }
    };


    const Base64Image = ({ base64, alt, style, ...rest }) => {
        if (!base64) {
            return (
                <div style={{
                    ...style,
                    backgroundColor: '#e9ecef',
                    borderRadius: style?.borderRadius || '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#6c757d',
                    fontSize: '10px'
                }}>
                    N/A
                </div>
            );
        }

        // Check if base64 is already a complete data URI
        const isDataUri = base64.startsWith('data:image/');

        return (
            <img
                src={isDataUri ? base64 : `data:image/jpeg;base64,${base64}`}
                alt={alt}
                style={style}
                {...rest}
            />
        );
    };

    const handleActivityReport = async (record) => {
        setShowActivityModal(true);
        setActivityLoading(true); // Show loader
        setSelectedEmployee({
            id: record.emp_id,
            name: record.emp_name,
            workHours: record.work_hours
        });

        try {
            const data = await fetchActivityData(record.emp_id, filterParams.start_date, filterParams.end_date);
            setActivityData(data);
        } catch (error) {
            console.error('Failed to fetch activity data:', error);
        } finally {
            setActivityLoading(false); // Hide loader
        }
    };

    const downloadActivityReport = () => {
        if (!printRef.current) return;
        const element = printRef.current;
        const opt = {
            margin: [0.5, 0.5], // top/bottom, left/right
            filename: `Activity_Log_${selectedEmployee?.id || 'employee'}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, logging: false },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };
        html2pdf().set(opt).from(element).save();
    };

    // Working solution using ExcelJS with proper image embedding
    const downloadActivityExcelReport = async () => {
        if (!activityData || !activityData.checkin_out?.length) {
            alert('No activity data to export.');
            return;
        }

        // Make sure you have installed: npm install exceljs
        // And imported: import ExcelJS from 'exceljs';

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Activity Log');

        // Define columns with appropriate widths
        worksheet.columns = [
            { header: 'Session #', key: 'session', width: 12 },
            { header: 'Check-In Time', key: 'checkinTime', width: 25 },
            { header: 'Check-Out Time', key: 'checkoutTime', width: 25 },
            { header: 'Duration', key: 'duration', width: 15 },
            { header: 'Work Hours', key: 'workHours', width: 15 },
            { header: 'Check-In Image', key: 'checkinImage', width: 35 }, // Increased width for larger images
            { header: 'Check-Out Image', key: 'checkoutImage', width: 35 } // Increased width for larger images
        ];

        // Process each record
        for (let index = 0; index < activityData.checkin_out.length; index++) {
            const record = activityData.checkin_out[index];
            const rowNumber = index + 2; // Excel rows are 1-indexed, +1 for header

            // Add row data
            worksheet.addRow({
                session: index + 1,
                checkinTime: record.checkin ? new Date(record.checkin).toLocaleString() : 'N/A',
                checkoutTime: record.checkout ? new Date(record.checkout).toLocaleString() : 'N/A',
                duration: record.duration || 'N/A',
                workHours: selectedEmployee?.workHours || 'N/A',
                checkinImage: '', // Empty - no text labels
                checkoutImage: '' // Empty - no text labels
            });

            // Set row height to accommodate larger images (300px height ≈ 225 points)
            worksheet.getRow(rowNumber).height = 225;

            // Add check-in image if available
            if (record.in_face) {
                try {
                    // Clean the base64 string
                    const base64Data = record.in_face.replace(/^data:image\/[a-z]+;base64,/, '');

                    // Convert to buffer (Node.js environment) or Uint8Array (browser environment)
                    let imageBuffer;
                    if (typeof Buffer !== 'undefined') {
                        // Node.js environment
                        imageBuffer = Buffer.from(base64Data, 'base64');
                    } else {
                        // Browser environment
                        const binaryString = atob(base64Data);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        imageBuffer = bytes;
                    }

                    const imageId = workbook.addImage({
                        buffer: imageBuffer,
                        extension: 'jpeg',
                    });

                    // Position image in the check-in column with 200x300 dimensions
                    // Excel uses points: 200px ≈ 150 points width, 300px ≈ 225 points height
                    worksheet.addImage(imageId, {
                        tl: { col: 5, row: rowNumber - 1 }, // top-left position
                        ext: { width: 150, height: 225 } // width: 200px, height: 300px equivalent
                    });

                } catch (error) {
                    console.error(`Error adding check-in image for row ${rowNumber}:`, error);
                    // Don't add error text - leave cell empty
                }
            }

            // Add check-out image if available
            if (record.out_face) {
                try {
                    // Clean the base64 string
                    const base64Data = record.out_face.replace(/^data:image\/[a-z]+;base64,/, '');

                    // Convert to buffer (Node.js environment) or Uint8Array (browser environment)
                    let imageBuffer;
                    if (typeof Buffer !== 'undefined') {
                        // Node.js environment
                        imageBuffer = Buffer.from(base64Data, 'base64');
                    } else {
                        // Browser environment
                        const binaryString = atob(base64Data);
                        const bytes = new Uint8Array(binaryString.length);
                        for (let i = 0; i < binaryString.length; i++) {
                            bytes[i] = binaryString.charCodeAt(i);
                        }
                        imageBuffer = bytes;
                    }

                    const imageId = workbook.addImage({
                        buffer: imageBuffer,
                        extension: 'jpeg',
                    });

                    // Position image in the check-out column with 200x300 dimensions
                    worksheet.addImage(imageId, {
                        tl: { col: 6, row: rowNumber - 1 }, // top-left position
                        ext: { width: 150, height: 225 } // width: 200px, height: 300px equivalent
                    });

                } catch (error) {
                    console.error(`Error adding check-out image for row ${rowNumber}:`, error);
                    // Don't add error text - leave cell empty
                }
            }
        }

        // Style the header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Set header row height
        headerRow.height = 20;

        // Auto-fit columns for text content (images will maintain their size)
        worksheet.columns.forEach((column, index) => {
            if (index < 5) { // Only auto-fit the first 5 columns (not image columns)
                let maxLength = 0;
                column.eachCell({ includeEmpty: true }, (cell) => {
                    const columnLength = cell.value ? cell.value.toString().length : 10;
                    if (columnLength > maxLength) {
                        maxLength = columnLength;
                    }
                });
                column.width = maxLength < 10 ? 10 : maxLength + 2;
            }
        });

        // Generate and download the file
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Activity_Log_${selectedEmployee?.id || 'employee'}.xlsx`);
    };


    // const downloadActivityExcelReport = () => {
    //   if (!activityData || !activityData.checkin_out?.length) {
    //     alert('No activity data to export.');
    //     return;
    //   }

    //   const rows = activityData.checkin_out.map((record, index) => ({
    //     'Session #': index + 1,
    //     'Check-In Time': record.checkin ? new Date(record.checkin).toLocaleString() : 'N/A',
    //     'Check-Out Time': record.checkout ? new Date(record.checkout).toLocaleString() : 'N/A',
    //     'Duration': record.duration || 'N/A',
    //     'Work Hours': selectedEmployee?.workHours || 'N/A'
    //   }));

    //   const worksheet = XLSX.utils.json_to_sheet(rows);
    //   const workbook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(workbook, worksheet, 'Activity Log');

    //   const fileName = `Activity_Log_${selectedEmployee?.id || 'employee'}.xlsx`;
    //   XLSX.writeFile(workbook, fileName);
    // };

    const handleImageClick = (image, title) => {
        setCurrentImage(image);
        setImageTitle(title);
        setShowImageModal(true);
    };


    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async (params = filterParams) => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                start_date: params.start_date,
                end_date: params.end_date,
                ...(params.user_ids.length > 0 && { user_ids: params.user_ids.join(',') })
            }).toString();

            const response = await axios.get(
                `/api/reports/checkinout?${queryParams}`
            );

            // Handle empty response
            if (!response.data) {
                setReportData({
                    attendance_report: { present: 0, total_emps: 0 },
                    productivity_report: { productivity: 0 },
                    late_in_early_out_report: { total_late_in: 0 },
                    checkin_out: [],
                    start_date: params.start_date,
                    end_date: params.end_date,
                    total_days: 1
                });
                setLoading(false);
                return;
            }

            // Add default values if reports are missing
            const data = response.data;
            if (!data.attendance_report) {
                data.attendance_report = { present: 0, total_emps: 0 };
            }
            if (!data.productivity_report) {
                data.productivity_report = { productivity: 0 };
            }
            if (!data.late_in_early_out_report) {
                data.late_in_early_out_report = { total_late_in: 0 };
            }
            if (!data.checkin_out) {
                data.checkin_out = [];
            }

            // Add dates for display
            data.start_date = params.start_date;
            data.end_date = params.end_date;
            data.total_days = 1; // Default value

            setReportData(data);
            setLoading(false);

        } catch (err) {
            setError('Failed to fetch report data');
            console.error('Error fetching report data:', err);
            setLoading(false);
        }
    };

    // Fixed: Use reportData instead of apiResponse
    useEffect(() => {
        let productivityChart = null;
        let lateInChart = null;
        let attendanceChart = null;

        if (reportData) {
            // Productivity Chart
            const productivityCtx = productivityChartRef.current?.getContext('2d');
            if (productivityCtx) {
                const { Insufficient, Overtime, Pending, Sufficient } = reportData.productivity_report || {};

                productivityChart = new ChartJS(productivityCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Insufficient', 'Overtime', 'Pending', 'Sufficient'],
                        datasets: [{
                            data: [Insufficient, Overtime, Pending, Sufficient],
                            backgroundColor: [
                                '#FF6B6B', // Red for Insufficient
                                '#4ECDC4', // Teal for Overtime  
                                '#45B7D1', // Blue for Pending
                                '#96CEB4'  // Green for Sufficient
                            ],
                            borderWidth: 0,
                            cutout: '70%'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.label}: ${context.parsed}`;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Late In/Early Out Chart
            const lateInCtx = lateInEarlyOutChartRef.current?.getContext('2d');
            if (lateInCtx) {
                const { total_late_in, total_early_out } = reportData.late_in_early_out_report || {};
                const total = (total_late_in || 0) + (total_early_out || 0);

                lateInChart = new ChartJS(lateInCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Late In', 'Early Out'],
                        datasets: [{
                            data: [total_late_in, total_early_out],
                            backgroundColor: [
                                '#FF6B6B', // Red for Late In
                                '#45B7D1'  // Blue for Early Out
                            ],
                            borderWidth: 0,
                            cutout: '70%'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.label}: ${context.parsed?.toFixed(1) || 0}hrs`;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Attendance Chart
            const attendanceCtx = attendanceChartRef.current?.getContext('2d');
            if (attendanceCtx) {
                const { present, leave, total_emps } = reportData.attendance_report || {};
                const absent = (total_emps || 0) - (present || 0) - (leave || 0);

                attendanceChart = new ChartJS(attendanceCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Present', 'Leave', 'Absent'],
                        datasets: [{
                            data: [present, leave, absent],
                            backgroundColor: [
                                '#96CEB4', // Green for Present
                                '#FFD93D', // Yellow for Leave
                                '#FF6B6B'  // Red for Absent
                            ],
                            borderWidth: 0,
                            cutout: '70%'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `${context.label}: ${context.parsed}`;
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        // Cleanup function
        return () => {
            if (productivityChart) productivityChart.destroy();
            if (lateInChart) lateInChart.destroy();
            if (attendanceChart) attendanceChart.destroy();
        };
    }, [reportData]); // Added reportData as dependency

    const downloadExcelReport = async () => {
        setExcelDownloading(true);  // Only set download loader
        try {
            const formatDate = (date) => new Date(date).toLocaleDateString('en-CA').replace(/-/g, '/');
            const formattedStartDate = formatDate(filterParams.start_date);
            const formattedEndDate = formatDate(filterParams.end_date);

            const params = {
                start_date: formattedStartDate,
                end_date: formattedEndDate,
                user_ids: filterParams.user_ids?.join(',') || ''
            };

            const response = await axios.get(
                '/reports/download/excel',
                { params, responseType: 'blob' }
            );

            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance_report_${formattedStartDate.replace(/\//g, '-')}_to_${formattedEndDate.replace(/\//g, '-')}.xlsx`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }, 100);
        } catch (error) {
            console.error('Download failed:', error);
            alert(`Error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
        } finally {
            setExcelDownloading(false);  // Reset the download loader
        }
    };


    const handleFilterApply = () => {
        const userIds = userIdInput
            .split(',')
            .map(id => id.trim())
            .filter(id => id !== '')
            .map(id => parseInt(id))
            .filter(id => !isNaN(id));

        const newFilterParams = {
            ...tempFilterParams,
            user_ids: userIds
        };

        setFilterParams(newFilterParams);
        setShowFilter(false);
        fetchReportData(newFilterParams);
    };

    const handleFilterReset = () => {
        const defaultParams = {
            start_date: new Date().toISOString().split('T')[0],
            end_date: new Date().toISOString().split('T')[0],
            user_ids: []
        };
        setTempFilterParams(defaultParams);
        setUserIdInput('');
    };

    const handleUserIdChange = (e) => {
        setUserIdInput(e.target.value);
    };

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '400px',
                padding: '20px'
            }}>
                <div style={{
                    border: '3px solid #f3f3f3',
                    borderTop: '3px solid #007bff',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    animation: 'spin 1s linear infinite'
                }}>
                </div>
                <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '12px 20px',
                borderRadius: '4px',
                margin: '20px',
                border: '1px solid #f5c6cb'
            }}>
                {error}
            </div>
        );
    }

    // Destructure with safe defaults
    const {
        attendance_report = { present: 0, total_emps: 0, leave: 0 },
        productivity_report = { productivity: 0 },
        late_in_early_out_report = { total_late_in: 0, total_early_out: 0 },
        checkin_out = [],
        start_date = filterParams.start_date,
        end_date = filterParams.end_date,
        total_days = 1
    } = reportData || {};

    return (
        <div style={{
            backgroundColor: '#f8f9fa',
            minHeight: '100vh',
            padding: '20px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px'
            }}>
                <h2 style={{ color: '#343a40', margin: 0, fontWeight: '600' }}>
                    Check-In/out Report
                </h2>
                <button
                    onClick={() => setShowFilter(true)}
                    style={{
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
                    </svg>
                    Filter
                </button>
            </div>

            {/* Filter Canvas/Offcanvas */}
            {showFilter && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 1040
                        }}
                        onClick={() => setShowFilter(false)}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            width: '400px',
                            height: '100%',
                            backgroundColor: 'white',
                            boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
                            zIndex: 1050,
                            transform: showFilter ? 'translateX(0)' : 'translateX(100%)',
                            transition: 'transform 0.3s ease',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ padding: '24px' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px',
                                borderBottom: '1px solid #dee2e6',
                                paddingBottom: '16px'
                            }}>
                                <h5 style={{ margin: 0, fontWeight: '600' }}>Filter Options</h5>
                                <button
                                    onClick={() => setShowFilter(false)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        fontSize: '24px',
                                        cursor: 'pointer',
                                        color: '#6c757d'
                                    }}
                                >
                                    ×
                                </button>
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#495057'
                                }}>
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={tempFilterParams.start_date}
                                    onChange={(e) => setTempFilterParams({
                                        ...tempFilterParams,
                                        start_date: e.target.value
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#495057'
                                }}>
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={tempFilterParams.end_date}
                                    onChange={(e) => setTempFilterParams({
                                        ...tempFilterParams,
                                        end_date: e.target.value
                                    })}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '20px' }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: '8px',
                                    fontWeight: '500',
                                    color: '#495057'
                                }}>
                                    User IDs
                                </label>
                                <input
                                    type="text"
                                    value={userIdInput}
                                    onChange={handleUserIdChange}
                                    placeholder="Enter user IDs separated by commas (e.g., 402, 401, 403)"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontSize: '14px'
                                    }}
                                />
                                <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                                    Leave empty to show all users
                                </small>
                            </div>

                            <div style={{
                                display: 'flex',
                                gap: '12px',
                                marginTop: '32px'
                            }}>
                                <button
                                    onClick={handleFilterApply}
                                    style={{
                                        backgroundColor: '#28a745',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        flex: 1
                                    }}
                                >
                                    Apply Filter
                                </button>
                                <button
                                    onClick={handleFilterReset}
                                    style={{
                                        backgroundColor: '#6c757d',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px 24px',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        flex: 1
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Summary Cards */}
            <div className="container-fluid">
                <div className="row g-4 p-4" style={{ backgroundColor: '#f5f5f5' }}>
                    {/* Productivity Card */}
                    <div className="col-lg-4 col-md-6 col-12">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body text-center d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h6 className="card-title mb-0 fw-semibold">Productivity</h6>
                                    <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
                                        <span className="d-flex align-items-center gap-1">
                                            <span
                                                className="rounded-circle"
                                                style={{ width: '8px', height: '8px', backgroundColor: '#FF6B6B' }}
                                            ></span>
                                            Insufficient
                                        </span>
                                        <span className="d-flex align-items-center gap-1">
                                            <span
                                                className="rounded-circle"
                                                style={{ width: '8px', height: '8px', backgroundColor: '#4ECDC4' }}
                                            ></span>
                                            Overtime
                                        </span>
                                        <span className="d-flex align-items-center gap-1">
                                            <span
                                                className="rounded-circle"
                                                style={{ width: '8px', height: '8px', backgroundColor: '#45B7D1' }}
                                            ></span>
                                            Pending
                                        </span>
                                        <span className="d-flex align-items-center gap-1">
                                            <span
                                                className="rounded-circle"
                                                style={{ width: '8px', height: '8px', backgroundColor: '#96CEB4' }}
                                            ></span>
                                            Sufficient
                                        </span>
                                    </div>
                                </div>
                                <div className="position-relative flex-grow-1 mb-3" style={{ height: '200px' }}>
                                    <canvas ref={productivityChartRef} className="w-100 h-100"></canvas>
                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                        <div className="display-4 fw-bold text-dark" style={{ fontSize: '1.25rem' }}>
                                            {productivity_report.productivity}
                                        </div>
                                    </div>
                                </div>

                                <p className="card-text text-muted small mb-0">
                                    Total productivity for the last {total_days} day/s
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Late In and Early Out Card */}
                    <div className="col-lg-4 col-md-6 col-12">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body text-center d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="card-title mb-0 fw-semibold" style={{ fontSize: '1rem' }}>
                                        Late In and Early Out Loss
                                    </h5>
                                    <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
                                        <span className="d-flex align-items-center gap-1">
                                            <span
                                                className="rounded-circle"
                                                style={{ width: '8px', height: '8px', backgroundColor: '#FF6B6B' }}
                                            ></span>
                                            Late In
                                        </span>
                                        <span className="d-flex align-items-center gap-1">
                                            <span
                                                className="rounded-circle"
                                                style={{ width: '8px', height: '8px', backgroundColor: '#45B7D1' }}
                                            ></span>
                                            Early Out
                                        </span>
                                    </div>
                                </div>
                                <div className="position-relative flex-grow-1 mb-3" style={{ height: '200px' }}>
                                    <canvas ref={lateInEarlyOutChartRef} className="w-100 h-100"></canvas>
                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                        <div className="display-4 fw-bold text-dark" style={{ fontSize: '1.25rem' }}>
                                            {Math.round(late_in_early_out_report.total_late_in + late_in_early_out_report.total_early_out)}hrs
                                        </div>
                                    </div>
                                </div>

                                <p className="card-text text-muted small mb-0">
                                    Total late in and early out cost for the last {total_days} day/s
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Attendance Card */}
                    <div className="col-lg-4 col-md-6 col-12">
                        <div className="card h-100 shadow-sm">
                            <div className="card-body text-center d-flex flex-column">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h5 className="card-title mb-0 fw-semibold" style={{ fontSize: '1rem' }}>
                                        Attendance
                                    </h5>
                                    <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
                                        <span className="d-flex align-items-center gap-1">
                                            <span
                                                className="rounded-circle"
                                                style={{ width: '8px', height: '8px', backgroundColor: '#96CEB4' }}
                                            ></span>
                                            Present
                                        </span>
                                        <span className="d-flex align-items-center gap-1">
                                            <span
                                                className="rounded-circle"
                                                style={{ width: '8px', height: '8px', backgroundColor: '#FFD93D' }}
                                            ></span>
                                            Leave
                                        </span>
                                        <span className="d-flex align-items-center gap-1">
                                            <span
                                                className="rounded-circle"
                                                style={{ width: '8px', height: '8px', backgroundColor: '#FF6B6B' }}
                                            ></span>
                                            Absent
                                        </span>
                                    </div>
                                </div>

                                <div className="position-relative flex-grow-1 mb-3" style={{ height: '200px' }}>
                                    <canvas ref={attendanceChartRef} className="w-100 h-100"></canvas>
                                    <div className="position-absolute top-50 start-50 translate-middle text-center">
                                        <div className="display-4 fw-bold text-dark" style={{ fontSize: '1.25rem' }}>
                                            {attendance_report.present} of {attendance_report.total_emps}
                                        </div>
                                    </div>
                                </div>

                                <p className="card-text text-muted small mb-0">
                                    Total attendance for the last {total_days} day/s
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Summary Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: 'none'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h5 style={{ margin: 0, fontWeight: '600' }}>
                        Attendance Summary from {start_date} to {end_date}
                    </h5>

                    {/* Add Download Button */}
                    {excelDownloading && (
                        <div style={{
                            position: 'fixed',
                            top: '20px',
                            right: '20px',
                            zIndex: 9999,
                            backgroundColor: 'white',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid #f3f3f3',
                                borderTop: '2px solid #28a745',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite'
                            }}></div>
                            <span style={{ fontSize: '14px', color: '#28a745' }}>Exporting...</span>
                            <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
                        </div>
                    )}
                    <button
                        onClick={downloadExcelReport}
                        disabled={excelDownloading}
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '6px',
                            cursor: excelDownloading ? 'not-allowed' : 'pointer',
                            fontSize: '14px',
                            fontWeight: '500',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            opacity: excelDownloading ? 0.7 : 1,
                            transition: 'background-color 0.3s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7,10 12,15 17,10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download Excel
                    </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        fontSize: '14px'
                    }}>
                        <thead style={{ backgroundColor: '#f8f9fa' }}>
                            <tr>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Id</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Name</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-In Image</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-In Time</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-Out Image</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-Out Time</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Total Hours</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Worked Hours</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Late In</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Early Out</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Activity Log</th>
                            </tr>
                        </thead>
                        <tbody>
                            {checkin_out.length > 0 ? (
                                checkin_out.map((record, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>{record.emp_id}</td>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>{record.emp_name}</td>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }} onClick={() => handleImageClick(
                                            record.in_face,
                                            `Check-in for ${record.emp_name} at ${record.checkin ? new Date(record.checkin).toLocaleTimeString() : 'N/A'}`
                                        )}>
                                            <Base64Image
                                                base64={record.in_face}
                                                alt="Check-in"
                                                style={{
                                                    width: '100px',
                                                    height: '150px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                                            {record.checkin
                                                ? `${new Date(record.checkin).toLocaleDateString()} ${new Date(record.checkin).toLocaleTimeString()}`
                                                : 'N/A'}
                                        </td>

                                        <td style={{ padding: '12px', verticalAlign: 'middle' }} onClick={() => handleImageClick(
                                            record.out_face,
                                            `Check-out for ${record.emp_name} at ${record.checkout ? new Date(record.checkout).toLocaleTimeString() : 'N/A'}`
                                        )}>
                                            <Base64Image
                                                base64={record.out_face}
                                                alt="Check-out"
                                                style={{
                                                    width: '100px',
                                                    height: '150px',
                                                    borderRadius: '8px',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </td>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                                            {record.checkout
                                                ? `${new Date(record.checkout).toLocaleDateString()} ${new Date(record.checkout).toLocaleTimeString()}`
                                                : 'N/A'}
                                        </td>

                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>{record.duration || 'N/A'}</td>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>{record.work_hours || 'N/A'}</td>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>{record.late_in || 'N/A'}</td>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>{record.early_out || 'N/A'}</td>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                                            <span style={{
                                                background:
                                                    record.status === 'Insufficient' ? '#e53935' :  // Red
                                                        record.status === 'Overtime' ? '#1e88e5' :      // Blue
                                                            record.status === 'Sufficient' ? '#43a047' :    // Green
                                                                '#fb8c00',                                     // Orange (for Pending/default)
                                                color: 'white',
                                                padding: '8px 12px',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '500',
                                                display: 'inline-block',
                                                minWidth: '90px',
                                                textAlign: 'center'
                                            }}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '12px', verticalAlign: 'middle' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <button
                                                    onClick={() => handleActivityReport(record)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        padding: '4px',
                                                        borderRadius: '4px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                    title="Activity Report"
                                                >
                                                    <FiActivity size={25} color="#4A90E2" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="12" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                                        No attendance records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Activity Modal */}
            {showActivityModal && (
                <>
                    <div
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 1040
                        }}
                        className="activity-pdf"
                        onClick={() => setShowActivityModal(false)}
                    />
                    <div
                        style={{
                            position: 'fixed',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                            zIndex: 1050,
                            width: '90%',
                            maxWidth: '1200px',
                            maxHeight: '90vh',
                            overflowY: 'auto'
                        }}
                    >
                        <div style={{ padding: '24px' }} ref={printRef}>
                            {/* Modal Header */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '24px',
                                borderBottom: '1px solid #dee2e6',
                                paddingBottom: '16px'
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, fontWeight: '600', color: '#333' }}>
                                        Activity Report
                                    </h4>
                                    {selectedEmployee && (
                                        <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                                            Employee: {selectedEmployee.name} (ID: {selectedEmployee.id})
                                        </p>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <button
                                        onClick={downloadActivityReport}
                                        style={{
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7,10 12,15 17,10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Download as PDF
                                    </button>

                                    <button
                                        onClick={downloadActivityExcelReport}
                                        style={{
                                            backgroundColor: '#28a745',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7,10 12,15 17,10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        Download Excel
                                    </button>
                                    <button
                                        onClick={() => setShowActivityModal(false)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            cursor: 'pointer',
                                            color: '#6c757d'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Activity Loader */}
                            {activityLoading && (
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    minHeight: '400px',
                                    padding: '20px'
                                }}>
                                    <div style={{
                                        border: '3px solid #f3f3f3',
                                        borderTop: '3px solid #007bff',
                                        borderRadius: '50%',
                                        width: '40px',
                                        height: '40px',
                                        animation: 'spin 1s linear infinite'
                                    }}>
                                    </div>
                                    <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
                                </div>
                            )}

                            {!activityLoading && activityData && activityData.checkin_out && activityData.checkin_out.length > 0 ? (
                                <div style={{
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px',
                                    padding: '20px'
                                }}>
                                    {/* Calculate session metrics */}
                                    {(() => {
                                        const sessions = activityData.checkin_out.map(record => ({
                                            checkin: record,
                                            checkout: record
                                        }));
                                        // Calculate metrics
                                        const firstSeen = sessions.length > 0
                                            ? sessions[0].checkin?.checkin || sessions[0].checkout?.checkout
                                            : null;

                                        const lastSeen = sessions.length > 0
                                            ? sessions[sessions.length - 1].checkout?.checkout ||
                                            sessions[sessions.length - 1].checkin?.checkin
                                            : null;

                                        let totalWorkHours = 0;
                                        sessions.forEach(session => {
                                            if (session.checkin?.checkin && session.checkout?.checkout) {
                                                const checkinTime = new Date(session.checkin.checkin);
                                                const checkoutTime = new Date(session.checkout.checkout);

                                                if (!isNaN(checkinTime.getTime()) && !isNaN(checkoutTime.getTime())) {
                                                    const duration = (checkoutTime - checkinTime) / (1000 * 60 * 60); // in hours
                                                    totalWorkHours += duration;
                                                }
                                            }
                                        });

                                        return (
                                            <>
                                                {/* Summary boxes */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                                    gap: '20px',
                                                    marginBottom: '30px'
                                                }}>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <h3 style={{ color: '#007bff', margin: '0 0 8px 0', fontSize: '1rem' }}>
                                                            {firstSeen ? new Date(firstSeen).toLocaleString() : 'N/A'}
                                                        </h3>
                                                        <p style={{ color: '#6c757d', margin: 0, fontSize: '10px' }}>First Scene</p>
                                                    </div>
                                                    <div style={{ textAlign: 'center' }}>
                                                        <h3 style={{ color: '#28a745', margin: '0 0 8px 0', fontSize: '1rem' }}>
                                                            {lastSeen ? new Date(lastSeen).toLocaleString() : 'N/A'}
                                                        </h3>
                                                        <p style={{ color: '#6c757d', margin: 0, fontSize: '10px' }}>Last Scene</p>
                                                    </div>

                                                    <div style={{ textAlign: 'center' }}>
                                                        <h3 style={{ color: '#ffc107', margin: '0 0 8px 0', fontSize: '1rem' }}>
                                                            {selectedEmployee?.workHours || 'N/A'}
                                                        </h3>
                                                        <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>Work Hours</p>
                                                    </div>

                                                    <div style={{ textAlign: 'center' }}>
                                                        <h3 style={{ color: '#17a2b8', margin: '0 0 8px 0', fontSize: '1rem' }}>
                                                            {sessions.length}
                                                        </h3>
                                                        <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>Total Sessions</p>
                                                    </div>
                                                </div>

                                                {/* Activity Timeline */}
                                                <div style={{ borderLeft: '3px solid #28a745', paddingLeft: '0' }}>
                                                    {sessions.map((session, index) => {
                                                        const checkinRecord = session.checkin;
                                                        const checkoutRecord = session.checkout;
                                                        const status = checkinRecord && checkoutRecord
                                                            ? ['Completed', '#28a745']
                                                            : ['Incomplete', '#ff6b6b'];

                                                        return (
                                                            <div key={index} style={{
                                                                backgroundColor: 'white',
                                                                borderRadius: '8px',
                                                                padding: '20px',
                                                                marginBottom: '16px',
                                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                                position: 'relative',
                                                                marginLeft: '20px'
                                                            }}>
                                                                {/* Status indicator */}
                                                                <div style={{
                                                                    position: 'absolute',
                                                                    left: '-31px',
                                                                    top: '20px',
                                                                    width: '16px',
                                                                    height: '16px',
                                                                    borderRadius: '50%',
                                                                    backgroundColor: status[1],
                                                                    border: '3px solid white'
                                                                }}></div>

                                                                {/* Status badge */}
                                                                <div style={{
                                                                    display: 'flex',
                                                                    justifyContent: 'space-between',
                                                                    alignItems: 'flex-start',
                                                                    marginBottom: '16px'
                                                                }}>
                                                                    <div style={{ textAlign: 'right' }}>
                                                                        <div style={{ color: '#6c757d', fontSize: '14px' }}>
                                                                            {checkinRecord?.checkin
                                                                                ? new Date(checkinRecord.checkin).toLocaleDateString()
                                                                                : checkoutRecord?.checkout
                                                                                    ? new Date(checkoutRecord.checkout).toLocaleDateString()
                                                                                    : 'N/A'}
                                                                        </div>
                                                                        <div style={{ color: '#007bff', fontSize: '12px', marginTop: '4px' }}>
                                                                            Session {index + 1}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div style={{
                                                                    display: 'grid',
                                                                    gridTemplateColumns: '1fr 1fr',
                                                                    gap: '30px',
                                                                    alignItems: 'center'
                                                                }}>
                                                                    {/* Check-in Column */}
                                                                    <div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                                            <div style={{
                                                                                width: '8px',
                                                                                height: '8px',
                                                                                borderRadius: '50%',
                                                                                backgroundColor: '#28a745'
                                                                            }}></div>
                                                                            <span style={{ fontSize: '14px', color: '#6c757d' }}>First Seen</span>
                                                                        </div>
                                                                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                                                                            {checkinRecord?.checkin
                                                                                ? new Date(checkinRecord.checkin).toLocaleTimeString()
                                                                                : 'N/A'}
                                                                        </div>
                                                                        {checkinRecord ? (
                                                                            <div>
                                                                                <Base64Image
                                                                                    base64={checkinRecord.in_face}
                                                                                    alt="Check-in face"
                                                                                    style={{
                                                                                        width: '150px',
                                                                                        height: '200px',
                                                                                        borderRadius: '8px',
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                    onClick={() => handleImageClick(
                                                                                        checkinRecord.in_face,
                                                                                        `Check-in for ${selectedEmployee?.name} at ${checkinRecord.checkin}`
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                                                                                No check-in recorded
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Check-out Column */}
                                                                    <div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                                                            <div style={{
                                                                                width: '8px',
                                                                                height: '8px',
                                                                                borderRadius: '50%',
                                                                                backgroundColor: '#dc3545'
                                                                            }}></div>
                                                                            <span style={{ fontSize: '14px', color: '#6c757d' }}>Last Seen</span>
                                                                        </div>
                                                                        <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
                                                                            {checkoutRecord?.checkout
                                                                                ? new Date(checkoutRecord.checkout).toLocaleTimeString()
                                                                                : 'N/A'}
                                                                        </div>
                                                                        {checkoutRecord ? (
                                                                            <div>

                                                                                <Base64Image
                                                                                    base64={checkoutRecord.out_face}
                                                                                    alt="Check-out face"
                                                                                    style={{
                                                                                        width: '150px',
                                                                                        height: '200px',
                                                                                        borderRadius: '8px',
                                                                                        objectFit: 'cover'
                                                                                    }}
                                                                                    onClick={() => handleImageClick(
                                                                                        checkoutRecord.out_face,
                                                                                        `Check-out for ${selectedEmployee?.name} at ${checkoutRecord.checkout}`
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        ) : (
                                                                            <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
                                                                                No check-out recorded
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Duration */}
                                                                {checkinRecord?.duration && (
                                                                    <div style={{
                                                                        marginTop: '16px',
                                                                        padding: '12px',
                                                                        backgroundColor: '#f8f9fa',
                                                                        borderRadius: '6px',
                                                                        fontSize: '14px'
                                                                    }}>
                                                                        <strong>Duration:</strong> <span style={{ color: '#007bff' }}>
                                                                            {checkinRecord.duration}
                                                                        </span>
                                                                    </div>
                                                                )}

                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            ) : !activityLoading && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px',
                                    color: '#6c757d',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '8px'
                                }}>
                                    No activity data available
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

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
}

export default ReportPage;








// import React, { useState, useRef, useEffect } from 'react';
// import axios from 'axios';

// const EnrollmentPage = () => {
//     const [employeeId, setEmployeeId] = useState('');
//     const [employeeName, setEmployeeName] = useState('');
//     const [actualHours, setActualHours] = useState('');
//     const [breakHours, setBreakHours] = useState('');
//     const [isCapturing, setIsCapturing] = useState(false);
//     const [capturedVideo, setCapturedVideo] = useState(null);
//     const [currentStep, setCurrentStep] = useState('straight');
//     const [recordedChunks, setRecordedChunks] = useState([]);
//     const [stream, setStream] = useState(null);
//     const [mediaRecorder, setMediaRecorder] = useState(null);
//     const [enrollmentStatus, setEnrollmentStatus] = useState('');
//     const [isUploading, setIsUploading] = useState(false);
//     const [isSaving, setIsSaving] = useState(false);
//     const [uploadedFilename, setUploadedFilename] = useState('');

//     const videoRef = useRef(null);
//     const canvasRef = useRef(null);

//     const steps = {
//         straight: 'Please look straight at the camera',
//         left: 'Please slowly tilt your face to the left',
//         center: 'Please slowly tilt your face back to center',
//         right: 'Please slowly tilt your face to the right',
//         final: 'Please slowly tilt your face back to center'
//     };

//     const stepOrder = ['straight', 'left', 'center', 'right', 'final'];

//     // Effect to handle video stream and cleanup
//     useEffect(() => {
//         const video = videoRef.current;
//         if (!video) return;

//         // Cleanup function for component unmount
//         return () => {
//             if (stream) {
//                 stream.getTracks().forEach(track => track.stop());
//             }
//             if (video.srcObject) {
//                 video.srcObject.getTracks().forEach(track => track.stop());
//             }
//             if (capturedVideo) {
//                 URL.revokeObjectURL(capturedVideo);
//             }
//         };
//     }, [stream, capturedVideo]);

//     // Effect to handle video source changes
//     useEffect(() => {
//         const video = videoRef.current;
//         if (!video) return;

//         if (isCapturing && stream) {
//             video.srcObject = stream;
//             video.play().catch(error => {
//                 console.error("Video play error:", error);
//                 setEnrollmentStatus('Error: Failed to play video stream. Please try again.');
//             });
//         } else if (capturedVideo) {
//             video.srcObject = null;
//             video.src = capturedVideo;
//             video.controls = true;
//         } else {
//             video.srcObject = null;
//             video.src = '';
//             video.controls = false;
//         }
//     }, [isCapturing, capturedVideo, stream]);

//     const startCapture = async () => {
//         try {
//             // Check if getUserMedia is supported
//             if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
//                 setEnrollmentStatus('Error: Camera access is not supported in this browser. Please use a modern browser like Chrome, Firefox, or Safari.');
//                 return;
//             }

//             // Request camera permission
//             const mediaStream = await navigator.mediaDevices.getUserMedia({
//                 video: {
//                     width: { ideal: 640 },
//                     height: { ideal: 480 },
//                     facingMode: 'user' // Front camera
//                 },
//                 audio: false
//             });

//             setStream(mediaStream);
//             setIsCapturing(true);
//             setCurrentStep('straight');
//             setEnrollmentStatus(''); // Clear any previous errors
//             setUploadedFilename(''); // Reset uploaded filename

//             // Check if MediaRecorder is supported
//             if (!MediaRecorder.isTypeSupported('video/webm')) {
//                 setEnrollmentStatus('Error: Video recording is not supported in this browser.');
//                 return;
//             }

//             const recorder = new MediaRecorder(mediaStream, {
//                 mimeType: 'video/webm'
//             });
//             setMediaRecorder(recorder);

//             const chunks = [];

//             recorder.ondataavailable = (event) => {
//                 if (event.data.size > 0) {
//                     chunks.push(event.data);
//                 }
//             };

//             recorder.onstop = () => {
//                 const blob = new Blob(chunks, { type: 'video/webm' });
//                 const videoUrl = URL.createObjectURL(blob);
//                 setCapturedVideo(videoUrl);
//                 setRecordedChunks(chunks);
//                 setIsCapturing(false);
//             };

//             recorder.start();

//         } catch (error) {
//             console.error('Error accessing camera:', error);
//             let errorMessage = 'Error accessing camera. ';

//             switch (error.name) {
//                 case 'NotAllowedError':
//                     errorMessage += 'Please allow camera access and refresh the page.';
//                     break;
//                 case 'NotFoundError':
//                     errorMessage += 'No camera found. Please connect a camera.';
//                     break;
//                 case 'NotReadableError':
//                     errorMessage += 'Camera is being used by another application.';
//                     break;
//                 case 'OverconstrainedError':
//                     errorMessage += 'Camera constraints not supported.';
//                     break;
//                 default:
//                     errorMessage += 'Please check your camera permissions and try again.';
//             }

//             setEnrollmentStatus(errorMessage);
//         }
//     };

//     const stopCapture = () => {
//         if (mediaRecorder && mediaRecorder.state === 'recording') {
//             mediaRecorder.stop();
//         }
//         setIsCapturing(false);
//     };

//     const nextStep = () => {
//         const currentIndex = stepOrder.indexOf(currentStep);
//         if (currentIndex < stepOrder.length - 1) {
//             setCurrentStep(stepOrder[currentIndex + 1]);
//         } else {
//             stopCapture();
//         }
//     };

//     const uploadVideo = async () => {
//         if (!capturedVideo) {
//             alert('Please capture a video first');
//             return;
//         }

//         try {
//             setIsUploading(true);
//             setEnrollmentStatus('Uploading video...');

//             // Convert video blob to file
//             const videoBlob = await fetch(capturedVideo).then(r => r.blob());

//             // Sanitize filename: replace spaces with underscores
//             const sanitizedName = employeeName.replace(/\s+/g, '_');
//             const videoFilename = `${employeeId}_${sanitizedName}_enroll.webm`;
//             const videoFile = new File([videoBlob], videoFilename, { type: 'video/webm' });

//             // Upload video
//             const uploadFormData = new FormData();
//             uploadFormData.append('file', videoFile);

//             const uploadResponse = await axios.post(
//                 'http://localhost:5014/api/upload/video',
//                 uploadFormData,
//                 {
//                     headers: { 'Content-Type': 'multipart/form-data' }
//                 }
//             );

//             const { filename } = uploadResponse.data;
//             setUploadedFilename(filename);
//             setEnrollmentStatus('Video uploaded successfully!');

//         } catch (error) {
//             console.error('Upload error:', error);
//             let errorMessage = 'Error: ';

//             if (error.response) {
//                 errorMessage += error.response.data.message || 'Server error occurred';
//             } else if (error.request) {
//                 errorMessage += 'No response from server. Please check your connection.';
//             } else {
//                 errorMessage += error.message || 'Failed to upload video';
//             }

//             setEnrollmentStatus(errorMessage);
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     const saveEmployee = async () => {
//         if (!employeeId || !employeeName || !actualHours || !breakHours || !uploadedFilename) {
//             alert('Please fill in all fields, capture face video, and upload it first');
//             return;
//         }

//         try {
//             setIsSaving(true);
//             setEnrollmentStatus('Saving employee...');

//             // Call enroll API
//             const enrollResponse = await axios.post(
//                 'http://localhost:5014/api/enroll/employee',
//                 {
//                     emp_id: employeeId,
//                     emp_name: employeeName,
//                     face_video: uploadedFilename,
//                     actual_hours: actualHours,
//                     break_hours: breakHours
//                 }
//             );

//             setEnrollmentStatus('Employee enrolled successfully!');

//             // Reset form
//             setEmployeeId('');
//             setEmployeeName('');
//             setActualHours('');
//             setBreakHours('');
//             setCapturedVideo(null);
//             setRecordedChunks([]);
//             setUploadedFilename('');

//         } catch (error) {
//             console.error('Enrollment error:', error);
//             let errorMessage = 'Error: ';

//             if (error.response) {
//                 errorMessage += error.response.data.message || 'Server error occurred';
//             } else if (error.request) {
//                 errorMessage += 'No response from server. Please check your connection.';
//             } else {
//                 errorMessage += error.message || 'Failed to enroll employee';
//             }

//             setEnrollmentStatus(errorMessage);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     const resetCapture = () => {
//         if (capturedVideo) {
//             URL.revokeObjectURL(capturedVideo);
//         }
//         setCapturedVideo(null);
//         setRecordedChunks([]);
//         setCurrentStep('straight');
//         setUploadedFilename('');
//         if (stream) {
//             stream.getTracks().forEach(track => track.stop());
//             setStream(null);
//         }
//         setIsCapturing(false);
//     };

//     return (
//         <div className="container-fluid">
//             <div className="row">
//                 <div className="col-12">
//                     <div className="card">
//                         <div className="card-header bg-success text-white">
//                             <h5 className="mb-0">Employee Enrollment</h5>
//                         </div>
//                         <div className="card-body">
//                             <div className="row">
//                                 <div className="col-md-6">
//                                     <div className="form-group mb-3">
//                                         <label htmlFor="employeeId" className="form-label">Employee ID</label>
//                                         <input
//                                             type="text"
//                                             id="employeeId"
//                                             className="form-control"
//                                             value={employeeId}
//                                             onChange={(e) => setEmployeeId(e.target.value)}
//                                             placeholder="Enter unique employee ID"
//                                             disabled={isCapturing}
//                                         />
//                                     </div>

//                                     <div className="form-group mb-3">
//                                         <label htmlFor="employeeName" className="form-label">Employee Name</label>
//                                         <input
//                                             type="text"
//                                             id="employeeName"
//                                             className="form-control"
//                                             value={employeeName}
//                                             onChange={(e) => setEmployeeName(e.target.value)}
//                                             placeholder="Enter employee name"
//                                             disabled={isCapturing}
//                                         />
//                                     </div>

//                                     <div className="form-group mb-3">
//                                         <label htmlFor="actualHours" className="form-label">Actual Working Hours</label>
//                                         <input
//                                             type="number"
//                                             id="actualHours"
//                                             className="form-control"
//                                             value={actualHours}
//                                             onChange={(e) => setActualHours(e.target.value)}
//                                             placeholder="Enter daily working hours"
//                                             min="1"
//                                             max="24"
//                                             disabled={isCapturing}
//                                         />
//                                         <small className="text-muted">Daily hours required (e.g., 8)</small>
//                                     </div>

//                                     <div className="form-group mb-3">
//                                         <label htmlFor="breakHours" className="form-label">Break Hours</label>
//                                         <input
//                                             type="number"
//                                             id="breakHours"
//                                             className="form-control"
//                                             value={breakHours}
//                                             onChange={(e) => setBreakHours(e.target.value)}
//                                             placeholder="Enter daily break hours"
//                                             min="0"
//                                             max="5"
//                                             step="0.5"
//                                             disabled={isCapturing}
//                                         />
//                                         <small className="text-muted">Daily break duration (e.g., 1.5)</small>
//                                     </div>
//                                 </div>

//                                 <div className="col-md-6">
//                                     <div className="text-center">
//                                         <h6 className="mb-3">Face Enrollment</h6>

//                                         {/* Camera Access Instructions */}
//                                         <div className="alert alert-info mb-3">
//                                             <small>
//                                                 <strong>Important:</strong> Please ensure you're using HTTPS or localhost, and allow camera access when prompted.
//                                             </small>
//                                         </div>

//                                         {/* Video element - always in DOM */}
//                                         <video
//                                             ref={videoRef}
//                                             width="320"
//                                             height="240"
//                                             autoPlay
//                                             muted
//                                             playsInline
//                                             style={{
//                                                 display: (isCapturing || capturedVideo) ? 'inline-block' : 'none',
//                                                 border: capturedVideo ? '2px solid #28a745' :
//                                                     isCapturing ? '2px solid #007bff' : 'none',
//                                                 borderRadius: '8px'
//                                             }}
//                                         />

//                                         {/* Placeholder when not capturing */}
//                                         {!isCapturing && !capturedVideo && (
//                                             <div style={{
//                                                 width: '320px',
//                                                 height: '240px',
//                                                 display: 'inline-block',
//                                                 border: '2px solid #ddd',
//                                                 borderRadius: '8px',
//                                                 backgroundColor: '#f8f9fa',
//                                                 lineHeight: '240px',
//                                                 color: '#6c757d'
//                                             }}>
//                                                 Camera Feed Will Appear Here
//                                             </div>
//                                         )}

//                                         {/* Start Capture Button */}
//                                         {!isCapturing && !capturedVideo && (
//                                             <div className="mt-3">
//                                                 <button
//                                                     className="btn btn-primary"
//                                                     onClick={startCapture}
//                                                     disabled={!employeeId || !employeeName || !actualHours || !breakHours}
//                                                 >
//                                                     Start Face Capture
//                                                 </button>
//                                                 {(!employeeId || !employeeName || !actualHours || !breakHours) && (
//                                                     <div className="text-muted mt-2">
//                                                         <small>Please fill in all fields first</small>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}

//                                         {/* Capture Controls */}
//                                         {isCapturing && (
//                                             <div className="mt-3">
//                                                 <div className="alert alert-info">
//                                                     <strong>{steps[currentStep]}</strong>
//                                                 </div>
//                                                 <button
//                                                     className="btn btn-success me-2"
//                                                     onClick={nextStep}
//                                                 >
//                                                     Next Step
//                                                 </button>
//                                                 <button
//                                                     className="btn btn-danger"
//                                                     onClick={stopCapture}
//                                                 >
//                                                     Stop Capture
//                                                 </button>
//                                             </div>
//                                         )}

//                                         {/* After Capture Controls */}
//                                         {capturedVideo && (
//                                             <div className="mt-3">
//                                                 <div className="d-flex justify-content-center flex-wrap">
//                                                     <button
//                                                         className="btn btn-warning me-2 mb-2"
//                                                         onClick={resetCapture}
//                                                         disabled={isUploading || isSaving}
//                                                     >
//                                                         Recapture
//                                                     </button>

//                                                     <button
//                                                         className="btn btn-info me-2 mb-2"
//                                                         onClick={uploadVideo}
//                                                         disabled={isUploading || uploadedFilename || isSaving}
//                                                     >
//                                                         {isUploading ? 'Uploading...' : 'Upload Video'}
//                                                     </button>

//                                                     <button
//                                                         className="btn btn-success mb-2"
//                                                         onClick={saveEmployee}
//                                                         disabled={!uploadedFilename || isSaving}
//                                                     >
//                                                         {isSaving ? 'Saving...' : 'Save Employee'}
//                                                     </button>
//                                                 </div>

//                                                 {uploadedFilename && (
//                                                     <div className="alert alert-success mt-2">
//                                                         Video uploaded: {uploadedFilename}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>

//                             {enrollmentStatus && (
//                                 <div className={`alert mt-3 ${enrollmentStatus.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
//                                     {enrollmentStatus}
//                                 </div>
//                             )}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
 
// export default EnrollmentPage;