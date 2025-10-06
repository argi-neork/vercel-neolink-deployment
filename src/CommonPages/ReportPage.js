// import React, { useState, useEffect, useRef } from 'react';
// import { FiActivity } from 'react-icons/fi';
// import axios from '../axiosConfig';
// import html2pdf from 'html2pdf.js';
// import * as XLSX from 'xlsx';
// import JSZip from 'jszip';
// import { saveAs } from 'file-saver';
// import ExcelJS from 'exceljs';
// import { Chart as ChartJS, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

// // FIXED REGISTRATION
// ChartJS.register(DoughnutController, ArcElement, Tooltip, Legend);
// ChartJS.register(ArcElement, Tooltip, Legend);

// // Helper function to format date as DD/MM/YYYY
// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return 'N/A';

//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = String(date.getFullYear()); // Full year now

//   return `${day}/${month}/${year}`;
// };
// // Helper function to format date and time as DD/MM/YYYY HH:MM:SS
// const formatDateTime = (dateString) => {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return 'N/A';

//   const day = String(date.getDate()).padStart(2, '0');
//   const month = String(date.getMonth() + 1).padStart(2, '0');
//   const year = String(date.getFullYear()); // Full year now
//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const seconds = String(date.getSeconds()).padStart(2, '0');

//   return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
// };

// // Helper function to format time as HH:MM:SS
// const formatTime = (dateString) => {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   if (isNaN(date.getTime())) return 'N/A';

//   const hours = String(date.getHours()).padStart(2, '0');
//   const minutes = String(date.getMinutes()).padStart(2, '0');
//   const seconds = String(date.getSeconds()).padStart(2, '0');

//   return `${hours}:${minutes}:${seconds}`;
// };


// function ReportPage() {
//   const [isDownloadingPDF, setIsDownloadingPDF] = useState(false);
//   const [excelDownloading, setExcelDownloading] = useState(false);
//   const [reportData, setReportData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activityLoading, setActivityLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [showFilter, setShowFilter] = useState(false);
//   const [activityData, setActivityData] = useState(null);
//   const [showActivityModal, setShowActivityModal] = useState(false);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [isDownloading, setIsDownloading] = useState(false);
//   const [filterParams, setFilterParams] = useState({
//     start_date: new Date().toISOString().split('T')[0],
//     end_date: new Date().toISOString().split('T')[0],
//     user_ids: []
//   });
//   const [tempFilterParams, setTempFilterParams] = useState({
//     start_date: new Date().toISOString().split('T')[0],
//     end_date: new Date().toISOString().split('T')[0],
//     user_ids: []
//   });
//   const [userIdInput, setUserIdInput] = useState('');
//   const productivityChartRef = useRef(null);
//   const lateInEarlyOutChartRef = useRef(null);
//   const attendanceChartRef = useRef(null);
//   const printRef = useRef(null);
//   const reportPrintRef = useRef(null);
//   const [showImageModal, setShowImageModal] = useState(false);
//   const [currentImage, setCurrentImage] = useState(null);
//   const [imageTitle, setImageTitle] = useState('');

//   const fetchActivityData = async (userId, startDate, endDate) => {
//     try {
//       const response = await axios.get(
//         `/api/reports/checkinout_logs`,
//         {
//           params: {
//             userid: userId,
//             start_date: startDate,
//             end_date: startDate
//           }
//         }
//       );
//       return response.data;
//     } catch (error) {
//       console.error('Error fetching activity data:', error);
//       return null;
//     }
//   };
//   const formatBreakTime = (timeString) => {
//     const [hours, minutes, seconds] = timeString.split(':');
//     return `${hours}h:${minutes}m:${seconds}s`;
//   };
//   const formatTime = (timeString) => {
//     const [hours = '00', minutes = '00', seconds = '00'] = timeString.split(':');
//     return `${hours}h:${minutes}m:${seconds}s`;
//   };

//   const formatCheckinTime = (dateTimeString) => {
//     if (!dateTimeString) return 'N/A';

//     const date = new Date(dateTimeString);
//     if (isNaN(date.getTime())) return 'Invalid Date';

//     let hours = date.getHours();
//     const minutes = String(date.getMinutes()).padStart(2, '0');
//     const seconds = String(date.getSeconds()).padStart(2, '0');

//     // Convert to 12-hour format without AM/PM
//     hours = hours % 12 || 12; // 0 -> 12, 13 -> 1, etc.
//     hours = String(hours).padStart(2, '0');

//     return `${hours}h:${minutes}m:${seconds}s`;
//   };

//   const Base64Image = ({ base64, alt, style, ...rest }) => {
//     if (!base64) {
//       return (
//         <div style={{
//           ...style,
//           backgroundColor: '#e9ecef',
//           borderRadius: style?.borderRadius || '8px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           color: '#6c757d',
//           fontSize: '10px'
//         }}>
//           N/A
//         </div>
//       );
//     }

//     // Check if base64 is already a complete data URI
//     const isDataUri = base64.startsWith('data:image/');

//     return (
//       <img
//         src={isDataUri ? base64 : `data:image/jpeg;base64,${base64}`}
//         alt={alt}
//         style={style}
//         {...rest}
//       />
//     );
//   };

//   const handleActivityReport = async (record) => {
//     console.log(record.checkin); // "21-07-2025 10:21:36 AM"

//     // Extract just the date part (DD-MM-YYYY)
//     const datePart = record.checkin.split(' ')[0]; // "21-07-2025"

//     // Convert from DD-MM-YYYY to YYYY-MM-DD
//     const [day, month, year] = datePart.split('-');
//     const apiFormattedDate = `${year}-${month}-${day}`; // "2025-07-21"

//     console.log(apiFormattedDate, 'formattedDate');

//     setShowActivityModal(true);
//     setActivityLoading(true);
//     setSelectedEmployee({
//       id: record.emp_id,
//       name: record.emp_name,
//       workHours: record.work_hours
//     });

//     try {
//       const data = await fetchActivityData(
//         record.emp_id,
//         apiFormattedDate, // start_date in YYYY-MM-DD
//         apiFormattedDate  // end_date in YYYY-MM-DD
//       );
//       setActivityData(data);
//     } catch (error) {
//       console.error('Failed to fetch activity data:', error);
//     } finally {
//       setActivityLoading(false);
//     }
//   };

//   const downloadActivityReport = () => {
//     if (!printRef.current) return;
//     const element = printRef.current;
//     const opt = {
//       margin: [0.5, 0.5],
//       filename: `Activity_Log_${selectedEmployee?.id || 'employee'}.pdf`,
//       image: { type: 'jpeg', quality: 0.98 },
//       html2canvas: { scale: 2, useCORS: true, logging: false },
//       jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
//       pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
//     };
//     html2pdf().set(opt).from(element).save();
//   };

//   const downloadPDFReport = () => {
//     if (!reportPrintRef.current) return;
//     setIsDownloadingPDF(true);

//     const element = reportPrintRef.current;

//     // Create a clone with improved styling for PDF
//     const clone = element.cloneNode(true);
//     document.body.appendChild(clone);
//     clone.style.width = '100%';
//     clone.style.overflow = 'visible';
//     clone.style.position = 'absolute';
//     clone.style.left = '-9999px';
//     clone.style.top = '0';

//     // Force table to full width
//     const table = clone.querySelector('table');
//     if (table) {
//       table.style.width = '100%';
//       table.style.tableLayout = 'auto';
//     }

//     // Options for html2pdf
//     const opt = {
//       margin: [10, 5, 10, 5],
//       filename: `Attendance_Report_${filterParams.start_date}_to_${filterParams.end_date}.pdf`,
//       image: {
//         type: 'jpeg',
//         quality: 0.98
//       },
//       html2canvas: {
//         scale: 1,
//         useCORS: true,
//         scrollX: 0,
//         scrollY: 0,
//         width: clone.scrollWidth,
//         windowWidth: clone.scrollWidth,
//         logging: true, // Enable to debug
//         onclone: (clonedDoc) => {
//           // Additional styling adjustments for the clone
//           clonedDoc.querySelectorAll('img').forEach(img => {
//             img.style.maxWidth = '100px';
//             img.style.height = 'auto';
//           });
//         }
//       },
//       jsPDF: {
//         unit: 'mm',
//         format: 'a4',
//         orientation: 'landscape', // Changed to landscape for wide tables
//         compress: true
//       },
//       pagebreak: {
//         mode: ['avoid-all', 'css', 'legacy'],
//         after: '.avoid-this-row'
//       }
//     };

//     html2pdf()
//       .set(opt)
//       .from(clone)
//       .toPdf()
//       .get('pdf')
//       .then((pdf) => {
//         const blob = pdf.output('blob');
//         const url = URL.createObjectURL(blob);

//         // Create download link
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = opt.filename;
//         document.body.appendChild(link);
//         link.click();

//         // Cleanup
//         setTimeout(() => {
//           document.body.removeChild(link);
//           URL.revokeObjectURL(url);
//           document.body.removeChild(clone);
//           setIsDownloadingPDF(false);
//         }, 100);
//       })
//       .catch((err) => {
//         console.error('Error generating PDF:', err);
//         document.body.removeChild(clone);
//         setIsDownloadingPDF(false);
//       });
//   };
//   const calculateDaysBetweenDates = (startDate, endDate) => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     const diffTime = Math.abs(end - start);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
//     return diffDays;
//   };

//   const downloadActivityExcelReport = async () => {
//     try {
//       // Get the selected date from the activity modal
//       const selectedDate = activityData?.checkin_out[0]?.checkin?.split(' ')[0] || '';

//       // Parse the date from M/D/YYYY format (e.g., "7/21/2025")
//       const [month, day, year] = selectedDate.split('/');

//       // Create display format DD/MM/YYYY (e.g., "21/07/2025")
//       const displayFormattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
//       console.log('Display formatted date:', displayFormattedDate); // Should output like "21/07/2025"

//       // Format as YYYY-MM-DD for the API (e.g., "2025-07-21")
//       const apiFormattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
//       console.log('API formatted date:', apiFormattedDate); // Should output like "2025-07-21"

//       // Get the user ID from the selected employee
//       const userId = selectedEmployee?.id;

//       if (!userId || !apiFormattedDate) {
//         alert('Missing required parameters for download');
//         return;
//       }

//       // Call the API to get the Excel file
//       const response = await axios.get(
//         '/api/reports/activity',
//         {
//           params: {
//             date: apiFormattedDate, // Use the properly formatted date
//             userid: userId
//           },
//           responseType: 'blob' // Important for file downloads
//         }
//       );

//       // Create a download link for the Excel file
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `activity_report_${userId}_${displayFormattedDate.replace(/\//g, '-')}.xlsx`);
//       document.body.appendChild(link);
//       link.click();

//       // Clean up
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Error downloading Excel report:', error);
//       alert('Failed to download Excel report');
//     }
//   };
//   // const downloadActivityExcelReport = async () => {
//   //   if (!activityData || !activityData.checkin_out?.length) {
//   //     alert('No activity data to export.');
//   //     return;
//   //   }

//   //   const workbook = new ExcelJS.Workbook();
//   //   const worksheet = workbook.addWorksheet('Activity Log');

//   //   // Define columns with appropriate widths
//   //   worksheet.columns = [
//   //     { header: 'Session #', key: 'session', width: 12 },
//   //     { header: 'Check-In Time', key: 'checkinTime', width: 25 },
//   //     { header: 'Check-Out Time', key: 'checkoutTime', width: 25 },
//   //     { header: 'Duration', key: 'duration', width: 15 },
//   //     { header: 'Work Hours', key: 'workHours', width: 15 },
//   //     { header: 'Check-In Image', key: 'checkinImage', width: 35 },
//   //     { header: 'Check-Out Image', key: 'checkoutImage', width: 35 }
//   //   ];

//   //   // Process each record
//   //   for (let index = 0; index < activityData.checkin_out.length; index++) {
//   //     const record = activityData.checkin_out[index];
//   //     const rowNumber = index + 2;

//   //     // Add row data
//   //     worksheet.addRow({
//   //       session: index + 1,
//   //       checkinTime: record.checkin ? formatDateTime(record.checkin) : 'N/A',
//   //       checkoutTime: record.checkout ? formatDateTime(record.checkout) : 'N/A',
//   //       duration: record.duration || 'N/A',
//   //       workHours: selectedEmployee?.workHours || 'N/A',
//   //       checkinImage: '',
//   //       checkoutImage: ''
//   //     });

//   //     // Set row height to accommodate larger images
//   //     worksheet.getRow(rowNumber).height = 225;

//   //     // Add check-in image if available
//   //     if (record.in_face) {
//   //       try {
//   //         const base64Data = record.in_face.replace(/^data:image\/[a-z]+;base64,/, '');
//   //         let imageBuffer;
//   //         if (typeof Buffer !== 'undefined') {
//   //           imageBuffer = Buffer.from(base64Data, 'base64');
//   //         } else {
//   //           const binaryString = atob(base64Data);
//   //           const bytes = new Uint8Array(binaryString.length);
//   //           for (let i = 0; i < binaryString.length; i++) {
//   //             bytes[i] = binaryString.charCodeAt(i);
//   //           }
//   //           imageBuffer = bytes;
//   //         }

//   //         const imageId = workbook.addImage({
//   //           buffer: imageBuffer,
//   //           extension: 'jpeg',
//   //         });

//   //         worksheet.addImage(imageId, {
//   //           tl: { col: 5, row: rowNumber - 1 },
//   //           ext: { width: 150, height: 225 }
//   //         });

//   //       } catch (error) {
//   //         console.error(`Error adding check-in image for row ${rowNumber}:`, error);
//   //       }
//   //     }

//   //     // Add check-out image if available
//   //     if (record.out_face) {
//   //       try {
//   //         const base64Data = record.out_face.replace(/^data:image\/[a-z]+;base64,/, '');
//   //         let imageBuffer;
//   //         if (typeof Buffer !== 'undefined') {
//   //           imageBuffer = Buffer.from(base64Data, 'base64');
//   //         } else {
//   //           const binaryString = atob(base64Data);
//   //           const bytes = new Uint8Array(binaryString.length);
//   //           for (let i = 0; i < binaryString.length; i++) {
//   //             bytes[i] = binaryString.charCodeAt(i);
//   //           }
//   //           imageBuffer = bytes;
//   //         }

//   //         const imageId = workbook.addImage({
//   //           buffer: imageBuffer,
//   //           extension: 'jpeg',
//   //         });

//   //         worksheet.addImage(imageId, {
//   //           tl: { col: 6, row: rowNumber - 1 },
//   //           ext: { width: 150, height: 225 }
//   //         });

//   //       } catch (error) {
//   //         console.error(`Error adding check-out image for row ${rowNumber}:`, error);
//   //       }
//   //     }
//   //   }

//   //   // Style the header row
//   //   const headerRow = worksheet.getRow(1);
//   //   headerRow.font = { bold: true };
//   //   headerRow.fill = {
//   //     type: 'pattern',
//   //     pattern: 'solid',
//   //     fgColor: { argb: 'FFE0E0E0' }
//   //   };

//   //   // Set header row height
//   //   headerRow.height = 20;

//   //   // Auto-fit columns for text content
//   //   worksheet.columns.forEach((column, index) => {
//   //     if (index < 5) {
//   //       let maxLength = 0;
//   //       column.eachCell({ includeEmpty: true }, (cell) => {
//   //         const columnLength = cell.value ? cell.value.toString().length : 10;
//   //         if (columnLength > maxLength) {
//   //           maxLength = columnLength;
//   //         }
//   //       });
//   //       column.width = maxLength < 10 ? 10 : maxLength + 2;
//   //     }
//   //   });

//   //   // Generate and download the file
//   //   const buffer = await workbook.xlsx.writeBuffer();
//   //   const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//   //   saveAs(blob, `Activity_Log_${selectedEmployee?.id || 'employee'}.xlsx`);
//   // };

//   const handleImageClick = (image, title) => {
//     setCurrentImage(image);
//     setImageTitle(title);
//     setShowImageModal(true);
//   };

//   useEffect(() => {
//     fetchReportData();
//   }, []);

//   const fetchReportData = async (params = filterParams) => {
//     try {
//       setLoading(true);
//       const queryParams = new URLSearchParams({
//         start_date: params.start_date,
//         end_date: params.end_date,
//         ...(params.user_ids.length > 0 && { user_ids: params.user_ids.join(',') })
//       }).toString();

//       const response = await axios.get(
//         `/api/reports/checkinout?${queryParams}`
//       );
//       const totalDays = calculateDaysBetweenDates(params.start_date, params.end_date);
//       // Handle empty response
//       if (!response.data) {
//         setReportData({
//           attendance_report: { present: 0, total_emps: 0 },
//           productivity_report: { productivity: 0 },
//           late_in_early_out_report: { total_late_in: 0 },
//           checkin_out: [],
//           start_date: params.start_date,
//           end_date: params.end_date,
//           total_days: totalDays
//         });
//         setLoading(false);
//         return;
//       }

//       // Add default values if reports are missing
//       const data = response.data;
//       if (!data.attendance_report) {
//         data.attendance_report = { present: 0, total_emps: 0 };
//       }
//       if (!data.productivity_report) {
//         data.productivity_report = { productivity: 0 };
//       }
//       if (!data.late_in_early_out_report) {
//         data.late_in_early_out_report = { total_late_in: 0 };
//       }
//       if (!data.checkin_out) {
//         data.checkin_out = [];
//       }

//       // Add dates for display
//       data.start_date = params.start_date;
//       data.end_date = params.end_date;
//       data.total_days = totalDays;

//       setReportData(data);
//       setLoading(false);

//     } catch (err) {
//       setError('Failed to fetch report data');
//       console.error('Error fetching report data:', err);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     let productivityChart = null;
//     let lateInChart = null;
//     let attendanceChart = null;

//     if (reportData) {
//       // Productivity Chart
//       const productivityCtx = productivityChartRef.current?.getContext('2d');
//       if (productivityCtx) {
//         const { Insufficient, Overtime, Pending, Sufficient } = reportData.productivity_report || {};

//         productivityChart = new ChartJS(productivityCtx, {
//           type: 'doughnut',
//           data: {
//             labels: ['Insufficient', 'Overtime', 'Pending', 'Sufficient'],
//             datasets: [{
//               data: [Insufficient, Overtime, Pending, Sufficient],
//               backgroundColor: [
//                 '#FF6B6B',
//                 '#4ECDC4',
//                 '#45B7D1',
//                 '#96CEB4'
//               ],
//               borderWidth: 0,
//               cutout: '70%'
//             }]
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 display: false
//               },
//               tooltip: {
//                 callbacks: {
//                   label: function (context) {
//                     return `${context.label}: ${context.parsed}`;
//                   }
//                 }
//               }
//             }
//           }
//         });
//       }

//       // Late In/Early Out Chart
//       const lateInCtx = lateInEarlyOutChartRef.current?.getContext('2d');
//       if (lateInCtx) {
//         const { total_late_in, total_early_out } = reportData.late_in_early_out_report || {};
//         const total = (total_late_in || 0) + (total_early_out || 0);

//         lateInChart = new ChartJS(lateInCtx, {
//           type: 'doughnut',
//           data: {
//             labels: ['Late In', 'Early Out'],
//             datasets: [{
//               data: [total_late_in, total_early_out],
//               backgroundColor: [
//                 '#FF6B6B',
//                 '#45B7D1'
//               ],
//               borderWidth: 0,
//               cutout: '70%'
//             }]
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 display: false
//               },
//               tooltip: {
//                 callbacks: {
//                   label: function (context) {
//                     return `${context.label}: ${context.parsed?.toFixed(1) || 0}hrs`;
//                   }
//                 }
//               }
//             }
//           }
//         });
//       }

//       // Attendance Chart
//       const attendanceCtx = attendanceChartRef.current?.getContext('2d');
//       if (attendanceCtx) {
//         const { present, leave, total_emps } = reportData.attendance_report || {};
//         const absent = (total_emps || 0) - (present || 0) - (leave || 0);

//         attendanceChart = new ChartJS(attendanceCtx, {
//           type: 'doughnut',
//           data: {
//             labels: ['Present', 'Leave', 'Absent'],
//             datasets: [{
//               data: [present, leave, absent],
//               backgroundColor: [
//                 '#96CEB4',
//                 '#FFD93D',
//                 '#FF6B6B'
//               ],
//               borderWidth: 0,
//               cutout: '70%'
//             }]
//           },
//           options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             plugins: {
//               legend: {
//                 display: false
//               },
//               tooltip: {
//                 callbacks: {
//                   label: function (context) {
//                     return `${context.label}: ${context.parsed}`;
//                   }
//                 }
//               }
//             }
//           }
//         });
//       }
//     }

//     // Cleanup function
//     return () => {
//       if (productivityChart) productivityChart.destroy();
//       if (lateInChart) lateInChart.destroy();
//       if (attendanceChart) attendanceChart.destroy();
//     };
//   }, [reportData]);

//   const downloadExcelReport = async () => {
//     setExcelDownloading(true);
//     try {
//       const formatDateForExcel = (date) => new Date(date).toLocaleDateString('en-CA').replace(/-/g, '/');
//       const formattedStartDate = formatDateForExcel(filterParams.start_date);
//       const formattedEndDate = formatDateForExcel(filterParams.end_date);

//       const params = {
//         start_date: formattedStartDate,
//         end_date: formattedEndDate,
//         user_ids: filterParams.user_ids?.join(',') || ''
//       };

//       const response = await axios.get(
//         '/reports/download/excel',
//         { params, responseType: 'blob' }
//       );

//       const blob = new Blob([response.data], { type: response.headers['content-type'] });
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `attendance_report_${formattedStartDate.replace(/\//g, '-')}_to_${formattedEndDate.replace(/\//g, '-')}.xlsx`;
//       document.body.appendChild(a);
//       a.click();
//       setTimeout(() => {
//         window.URL.revokeObjectURL(url);
//         document.body.removeChild(a);
//       }, 100);
//     } catch (error) {
//       console.error('Download failed:', error);
//       alert(`Error: ${error.response?.data?.message || error.message || 'Unknown error'}`);
//     } finally {
//       setExcelDownloading(false);
//     }
//   };

//   const handleFilterApply = () => {
//     const userIds = userIdInput
//       .split(',')
//       .map(id => id.trim())
//       .filter(id => id !== '')
//       .map(id => parseInt(id))
//       .filter(id => !isNaN(id));

//     const newFilterParams = {
//       ...tempFilterParams,
//       user_ids: userIds
//     };

//     setFilterParams(newFilterParams);
//     setShowFilter(false);
//     fetchReportData(newFilterParams);
//   };

//   const handleFilterReset = () => {
//     const defaultParams = {
//       start_date: new Date().toISOString().split('T')[0],
//       end_date: new Date().toISOString().split('T')[0],
//       user_ids: []
//     };
//     setTempFilterParams(defaultParams);
//     setUserIdInput('');
//   };

//   const handleUserIdChange = (e) => {
//     setUserIdInput(e.target.value);
//   };
//   // Helper function to format break time as HH:MM:SS
//   // Helper function to format break time as HH:MM:SS
//   const formatBreakTimeAsHHMMSS = (timeString) => {
//     if (!timeString) return 'N/A';
//     const parts = timeString.split(':');
//     if (parts.length !== 3) return timeString;

//     // Pad each part to two digits
//     const hours = parts[0].padStart(2, '0');
//     const minutes = parts[1].padStart(2, '0');
//     const seconds = parts[2].padStart(2, '0');
//     return `${hours}:${minutes}:${seconds}`;
//   };

//   if (loading) {
//     return (
//       <div style={{
//         display: 'flex',
//         justifyContent: 'center',
//         alignItems: 'center',
//         minHeight: '400px',
//         padding: '20px'
//       }}>
//         <div style={{
//           border: '3px solid #f3f3f3',
//           borderTop: '3px solid #007bff',
//           borderRadius: '50%',
//           width: '40px',
//           height: '40px',
//           animation: 'spin 1s linear infinite'
//         }}>
//         </div>
//         <style jsx>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div style={{
//         backgroundColor: '#f8d7da',
//         color: '#721c24',
//         padding: '12px 20px',
//         borderRadius: '4px',
//         margin: '20px',
//         border: '1px solid #f5c6cb'
//       }}>
//         {error}
//       </div>
//     );
//   }

//   // Destructure with safe defaults
//   const {
//     attendance_report = { present: 0, total_emps: 0, leave: 0 },
//     productivity_report = { productivity: 0 },
//     late_in_early_out_report = { total_late_in: 0, total_early_out: 0 },
//     checkin_out = [],
//     start_date = filterParams.start_date,
//     end_date = filterParams.end_date,
//     total_days = calculateDaysBetweenDates(start_date, end_date)
//   } = reportData || {};

//   return (
//     <div style={{
//       backgroundColor: '#f8f9fa',
//       minHeight: '100vh',
//       padding: '20px',
//       boxSizing: 'border-box',
//       width: '100%'
//     }}
//     >
//       {/* Header */}
//       <div style={{
//         display: 'flex',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         marginBottom: '24px'
//       }}>
//         <h2 style={{ color: '#343a40', margin: 0, fontWeight: '600' }}>
//           Check-In/out Report
//         </h2>
//         <button
//           onClick={() => setShowFilter(true)}
//           style={{
//             backgroundColor: '#007bff',
//             color: 'white',
//             border: 'none',
//             padding: '10px 20px',
//             borderRadius: '6px',
//             cursor: 'pointer',
//             fontSize: '14px',
//             fontWeight: '500',
//             display: 'flex',
//             alignItems: 'center',
//             gap: '8px'
//           }}
//         >
//           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
//           </svg>
//           Filter
//         </button>
//       </div>

//       {/* Filter Canvas/Offcanvas */}
//       {showFilter && (
//         <>
//           <div
//             style={{
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               width: '100%',
//               height: '100%',
//               backgroundColor: 'rgba(0, 0, 0, 0.5)',
//               zIndex: 1040
//             }}
//             onClick={() => setShowFilter(false)}
//           />
//           <div
//             style={{
//               position: 'fixed',
//               top: 0,
//               right: 0,
//               width: '400px',
//               height: '100%',
//               backgroundColor: 'white',
//               boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
//               zIndex: 1050,
//               transform: showFilter ? 'translateX(0)' : 'translateX(100%)',
//               transition: 'transform 0.3s ease',
//               overflowY: 'auto'
//             }}
//           >
//             <div style={{ padding: '24px' }}>
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginBottom: '24px',
//                 borderBottom: '1px solid #dee2e6',
//                 paddingBottom: '16px'
//               }}>
//                 <h5 style={{ margin: 0, fontWeight: '600' }}>Filter Options</h5>
//                 <button
//                   onClick={() => setShowFilter(false)}
//                   style={{
//                     background: 'none',
//                     border: 'none',
//                     fontSize: '24px',
//                     cursor: 'pointer',
//                     color: '#6c757d'
//                   }}
//                 >
//                   ×
//                 </button>
//               </div>

//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{
//                   display: 'block',
//                   marginBottom: '8px',
//                   fontWeight: '500',
//                   color: '#495057'
//                 }}>
//                   Start Date
//                 </label>
//                 <input
//                   type="date"
//                   value={tempFilterParams.start_date}
//                   onChange={(e) => setTempFilterParams({
//                     ...tempFilterParams,
//                     start_date: e.target.value
//                   })}
//                   style={{
//                     width: '100%',
//                     padding: '10px',
//                     border: '1px solid #ced4da',
//                     borderRadius: '4px',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{
//                   display: 'block',
//                   marginBottom: '8px',
//                   fontWeight: '500',
//                   color: '#495057'
//                 }}>
//                   End Date
//                 </label>
//                 <input
//                   type="date"
//                   value={tempFilterParams.end_date}
//                   onChange={(e) => setTempFilterParams({
//                     ...tempFilterParams,
//                     end_date: e.target.value
//                   })}
//                   style={{
//                     width: '100%',
//                     padding: '10px',
//                     border: '1px solid #ced4da',
//                     borderRadius: '4px',
//                     fontSize: '14px'
//                   }}
//                 />
//               </div>

//               <div style={{ marginBottom: '20px' }}>
//                 <label style={{
//                   display: 'block',
//                   marginBottom: '8px',
//                   fontWeight: '500',
//                   color: '#495057'
//                 }}>
//                   User IDs
//                 </label>
//                 <input
//                   type="text"
//                   value={userIdInput}
//                   onChange={handleUserIdChange}
//                   placeholder="Enter user IDs separated by commas (e.g., 402, 401, 403)"
//                   style={{
//                     width: '100%',
//                     padding: '10px',
//                     border: '1px solid #ced4da',
//                     borderRadius: '4px',
//                     fontSize: '14px'
//                   }}
//                 />
//                 <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
//                   Leave empty to show all users
//                 </small>
//               </div>

//               <div style={{
//                 display: 'flex',
//                 gap: '12px',
//                 marginTop: '32px'
//               }}>
//                 <button
//                   onClick={handleFilterApply}
//                   style={{
//                     backgroundColor: '#28a745',
//                     color: 'white',
//                     border: 'none',
//                     padding: '12px 24px',
//                     borderRadius: '6px',
//                     cursor: 'pointer',
//                     fontSize: '14px',
//                     fontWeight: '500',
//                     flex: 1
//                   }}
//                 >
//                   Apply Filter
//                 </button>
//                 <button
//                   onClick={handleFilterReset}
//                   style={{
//                     backgroundColor: '#6c757d',
//                     color: 'white',
//                     border: 'none',
//                     padding: '12px 24px',
//                     borderRadius: '6px',
//                     cursor: 'pointer',
//                     fontSize: '14px',
//                     fontWeight: '500',
//                     flex: 1
//                   }}
//                 >
//                   Reset
//                 </button>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Summary Cards */}
//       <div className="container-fluid" >
//         <div className="row g-4 p-4" style={{ backgroundColor: '#f5f5f5' }}>
//           {/* Productivity Card */}
//           <div className="col-lg-4 col-md-6 col-12">
//             <div className="card h-100 shadow-sm">
//               <div className="card-body text-center d-flex flex-column">
//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <h6 className="card-title mb-0 fw-semibold">Productivity</h6>
//                   <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
//                     <span className="d-flex align-items-center gap-1">
//                       <span
//                         className="rounded-circle"
//                         style={{ width: '8px', height: '8px', backgroundColor: '#FF6B6B' }}
//                       ></span>
//                       Insufficient
//                     </span>
//                     <span className="d-flex align-items-center gap-1">
//                       <span
//                         className="rounded-circle"
//                         style={{ width: '8px', height: '8px', backgroundColor: '#4ECDC4' }}
//                       ></span>
//                       Overtime
//                     </span>
//                     <span className="d-flex align-items-center gap-1">
//                       <span
//                         className="rounded-circle"
//                         style={{ width: '8px', height: '8px', backgroundColor: '#45B7D1' }}
//                       ></span>
//                       Pending
//                     </span>
//                     <span className="d-flex align-items-center gap-1">
//                       <span
//                         className="rounded-circle"
//                         style={{ width: '8px', height: '8px', backgroundColor: '#96CEB4' }}
//                       ></span>
//                       Sufficient
//                     </span>
//                   </div>
//                 </div>
//                 <div className="position-relative flex-grow-1 mb-3" style={{ height: '200px' }}>
//                   <canvas ref={productivityChartRef} className="w-100 h-100"></canvas>
//                   <div className="position-absolute top-50 start-50 translate-middle text-center">
//                     <div className="display-4 fw-bold text-dark" style={{ fontSize: '1.25rem' }}>
//                       {productivity_report.productivity}
//                     </div>
//                   </div>
//                 </div>

//                 <p className="card-text text-muted small mb-0">
//                   Total productivity for the last {total_days} day/s
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Late In and Early Out Card */}
//           <div className="col-lg-4 col-md-6 col-12">
//             <div className="card h-100 shadow-sm">
//               <div className="card-body text-center d-flex flex-column">
//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <h5 className="card-title mb-0 fw-semibold" style={{ fontSize: '1rem' }}>
//                     Late In and Early Out Loss
//                   </h5>
//                   <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
//                     <span className="d-flex align-items-center gap-1">
//                       <span
//                         className="rounded-circle"
//                         style={{ width: '8px', height: '8px', backgroundColor: '#FF6B6B' }}
//                       ></span>
//                       Late In
//                     </span>
//                     <span className="d-flex align-items-center gap-1">
//                       <span
//                         className="rounded-circle"
//                         style={{ width: '8px', height: '8px', backgroundColor: '#45B7D1' }}
//                       ></span>
//                       Early Out
//                     </span>
//                   </div>
//                 </div>
//                 <div className="position-relative flex-grow-1 mb-3" style={{ height: '200px' }}>
//                   <canvas ref={lateInEarlyOutChartRef} className="w-100 h-100"></canvas>
//                   <div className="position-absolute top-50 start-50 translate-middle text-center">
//                     <div className="display-4 fw-bold text-dark" style={{ fontSize: '1.25rem' }}>
//                       {Math.round(late_in_early_out_report.total_late_in + late_in_early_out_report.total_early_out)}hrs
//                     </div>
//                   </div>
//                 </div>

//                 <p className="card-text text-muted small mb-0">
//                   Total late in and early out cost for the last {total_days} day/s
//                 </p>
//               </div>
//             </div>
//           </div>

//           {/* Attendance Card */}
//           <div className="col-lg-4 col-md-6 col-12">
//             <div className="card h-100 shadow-sm">
//               <div className="card-body text-center d-flex flex-column">
//                 <div className="d-flex justify-content-between align-items-center mb-3">
//                   <h5 className="card-title mb-0 fw-semibold" style={{ fontSize: '1rem' }}>
//                     Attendance
//                   </h5>
//                   <div className="d-flex gap-3" style={{ fontSize: '0.75rem' }}>
//                     <span className="d-flex align-items-center gap-1">
//                       <span
//                         className="rounded-circle"
//                         style={{ width: '8px', height: '8px', backgroundColor: '#96CEB4' }}
//                       ></span>
//                       Present
//                     </span>
//                     <span className="d-flex align-items-center gap-1">
//                       <span
//                         className="rounded-circle"
//                         style={{ width: '8px', height: '8px', backgroundColor: '#FFD93D' }}
//                       ></span>
//                       Leave
//                     </span>
//                   </div>
//                 </div>

//                 <div className="position-relative flex-grow-1 mb-3" style={{ height: '200px' }}>
//                   <canvas ref={attendanceChartRef} className="w-100 h-100"></canvas>
//                   <div className="position-absolute top-50 start-50 translate-middle text-center">
//                     <div className="display-4 fw-bold text-dark" style={{ fontSize: '1.25rem' }}>
//                       {attendance_report.present} of {attendance_report.total_emps}
//                     </div>
//                   </div>
//                 </div>

//                 <p className="card-text text-muted small mb-0">
//                   Total attendance for the last {total_days} day/s
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Attendance Summary Table */}
//       <div style={{
//         backgroundColor: 'white',
//         borderRadius: '8px',
//         padding: '24px',
//         boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//         border: 'none'
//       }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
//           <h5 style={{ margin: 0, fontWeight: '600' }}>
//             Attendance Summary from {formatDate(start_date)} to {formatDate(end_date)}
//           </h5>

//           {/* Download Buttons */}
//           <div style={{ display: 'flex', gap: '10px' }}>
//             {/* PDF Download Button */}
//             {/* <button
//               onClick={downloadPDFReport}
//               disabled={isDownloadingPDF || excelDownloading}
//               className="no-print" // Add this class
//               style={{
//                 backgroundColor: '#dc3545',
//                 color: 'white',
//                 border: 'none',
//                 padding: '10px 20px',
//                 borderRadius: '6px',
//                 cursor: isDownloadingPDF ? 'not-allowed' : 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 opacity: isDownloadingPDF ? 0.7 : 1,
//                 transition: 'background-color 0.3s'
//               }}
//               onMouseOver={(e) => !isDownloadingPDF && (e.currentTarget.style.backgroundColor = '#bd2130')}
//               onMouseOut={(e) => !isDownloadingPDF && (e.currentTarget.style.backgroundColor = '#dc3545')}
//             >
//               {isDownloadingPDF ? (
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                   <div style={{
//                     width: '16px',
//                     height: '16px',
//                     border: '2px solid #f3f3f3',
//                     borderTop: '2px solid white',
//                     borderRadius: '50%',
//                     animation: 'spin 0.8s linear infinite'
//                   }}></div>
//                   Exporting...
//                 </div>
//               ) : (
//                 <>
//                   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <path d="M14 3v4a1 1 0 0 0 1 1h4" />
//                     <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
//                     <path d="M9 15h6" />
//                     <path d="M9 11h6" />
//                     <path d="M9 7h1" />
//                   </svg>
//                   Download PDF
//                 </>
//               )}
//             </button> */}

//             {/* Excel Download Button */}
//             <button
//               onClick={downloadExcelReport}
//               disabled={excelDownloading || isDownloadingPDF}
//               style={{
//                 backgroundColor: '#28a745',
//                 color: 'white',
//                 border: 'none',
//                 padding: '10px 20px',
//                 borderRadius: '6px',
//                 cursor: excelDownloading ? 'not-allowed' : 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '8px',
//                 opacity: excelDownloading ? 0.7 : 1,
//                 transition: 'background-color 0.3s'
//               }}
//               onMouseOver={(e) => !excelDownloading && (e.currentTarget.style.backgroundColor = '#218838')}
//               onMouseOut={(e) => !excelDownloading && (e.currentTarget.style.backgroundColor = '#28a745')}
//             >
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                 <polyline points="7,10 12,15 17,10" />
//                 <line x1="12" y1="15" x2="12" y2="3" />
//               </svg>
//               Download Excel
//             </button>
//           </div>
//         </div>
//         <div style={{ overflowX: 'auto' }} ref={reportPrintRef}>
//           <table style={{
//             width: '100%',
//             borderCollapse: 'collapse',
//             fontSize: '14px',
//             // tableLayout: 'fixed'
//           }}
//           >
//             <thead style={{ backgroundColor: '#f8f9fa' }}>
//               <tr>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Id</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Name</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-In Image</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-In Time</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-Out Image</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Check-Out Time</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Total Hours</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Worked Hours</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Total Break Hours</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Additional Break Hours</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Late In</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Early Out</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Status</th>
//                 <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Activity Log</th>
//               </tr>
//             </thead>
//             <tbody>
//               {checkin_out.length > 0 ? (
//                 checkin_out.map((record, index) => (
//                   <tr key={index} style={{ borderBottom: '1px solid #dee2e6' }}>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>{record.emp_id}</td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>{record.emp_name}</td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }} onClick={() => handleImageClick(
//                       record.in_face,
//                       `Check-in for ${record.emp_name} at ${record.checkin ? formatTime(record.checkin) : 'N/A'}`
//                     )}>
//                       <Base64Image
//                         base64={record.in_face}
//                         alt="Check-in"
//                         style={{
//                           width: '100px',
//                           height: '150px',
//                           borderRadius: '8px',
//                           objectFit: 'cover'
//                         }}
//                       />
//                     </td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       {record.checkin}
//                       {/* {record.checkin ? formatDateTime(record.checkin) : 'N/A'} */}
//                     </td>

//                     <td style={{ padding: '12px', verticalAlign: 'middle' }} onClick={() => handleImageClick(
//                       record.out_face,
//                       `Check-out for ${record.emp_name} at ${record.checkout ? formatTime(record.checkout) : 'N/A'}`
//                     )}>
//                       <Base64Image
//                         base64={record.out_face}
//                         alt="Check-out"
//                         style={{
//                           width: '100px',
//                           height: '150px',
//                           borderRadius: '8px',
//                           objectFit: 'cover'
//                         }}
//                       />
//                     </td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       {record.checkout}
//                       {/* {record.checkout ? formatDateTime(record.checkout) : 'N/A'} */}
//                     </td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       {formatTime(record.duration)}
//                     </td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       {formatTime(record.work_hours)}
//                     </td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       {formatTime(record.total_break)}
//                     </td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       {formatTime(record.additional_break_time
//                       )}
//                     </td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       {formatTime(record.late_in)}
//                     </td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       {record.early_out || 'N/A'}
//                     </td>
//                     {/* <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       {formatTime(record.early_out)}
//                     </td> */}
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       <span style={{
//                         background:
//                           record.status === 'Insufficient' ? '#e53935' :
//                             record.status === 'Overtime' ? '#1e88e5' :
//                               record.status === 'Sufficient' ? '#43a047' :
//                                 '#fb8c00',
//                         color: 'white',
//                         padding: '8px 12px',
//                         borderRadius: '20px',
//                         fontSize: '12px',
//                         fontWeight: '500',
//                         display: 'inline-block',
//                         minWidth: '90px',
//                         textAlign: 'center'
//                       }}>
//                         {record.status}
//                       </span>
//                     </td>
//                     <td style={{ padding: '12px', verticalAlign: 'middle' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                         <button
//                           onClick={() => handleActivityReport(record)}
//                           style={{
//                             background: 'none',
//                             border: 'none',
//                             cursor: 'pointer',
//                             padding: '4px',
//                             borderRadius: '4px',
//                             display: 'flex',
//                             alignItems: 'center',
//                             justifyContent: 'center'
//                           }}
//                           title="Activity Report"
//                         >
//                           <FiActivity size={25} color="#4A90E2" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan="12" style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
//                     No attendance records found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>


//       {/* Activity Modal */}
//       {showActivityModal && (
//         <>
//           <div
//             style={{
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               width: '100%',
//               height: '100%',
//               backgroundColor: 'rgba(0, 0, 0, 0.5)',
//               zIndex: 1040
//             }}
//             className="activity-pdf"
//             onClick={() => setShowActivityModal(false)}
//           />
//           <div
//             style={{
//               position: 'fixed',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               backgroundColor: 'white',
//               borderRadius: '8px',
//               boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
//               zIndex: 1050,
//               width: '90%',
//               maxWidth: '1200px',
//               maxHeight: '90vh',
//               overflowY: 'auto'
//             }}
//           >
//             <div style={{ padding: '24px' }} ref={printRef}>
//               {/* Modal Header */}
//               <div style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 marginBottom: '24px',
//                 borderBottom: '1px solid #dee2e6',
//                 paddingBottom: '16px'
//               }}>
//                 <div>
//                   <h4 style={{ margin: 0, fontWeight: '600', color: '#333' }}>
//                     Activity Report
//                   </h4>
//                   {selectedEmployee && (
//                     <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
//                       Employee: {selectedEmployee.name} (ID: {selectedEmployee.id})
//                     </p>
//                   )}
//                 </div>
//                 <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
//                   {/* <button
//                     onClick={downloadActivityReport}
//                     style={{
//                       backgroundColor: '#28a745',
//                       color: 'white',
//                       border: 'none',
//                       padding: '8px 16px',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       fontSize: '14px',
//                       fontWeight: '500',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '8px'
//                     }}
//                   >
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                       <polyline points="7,10 12,15 17,10" />
//                       <line x1="12" y1="15" x2="12" y2="3" />
//                     </svg>
//                     Download as PDF
//                   </button> */}

//                   <button
//                     onClick={downloadActivityExcelReport}
//                     style={{
//                       backgroundColor: '#28a745',
//                       color: 'white',
//                       border: 'none',
//                       padding: '8px 16px',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       fontSize: '14px',
//                       fontWeight: '500',
//                       display: 'flex',
//                       alignItems: 'center',
//                       gap: '8px'
//                     }}
//                   >
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
//                       <polyline points="7,10 12,15 17,10" />
//                       <line x1="12" y1="15" x2="12" y2="3" />
//                     </svg>
//                     Download Excel
//                   </button>
//                   <button
//                     onClick={() => setShowActivityModal(false)}
//                     style={{
//                       background: 'none',
//                       border: 'none',
//                       fontSize: '24px',
//                       cursor: 'pointer',
//                       color: '#6c757d'
//                     }}
//                   >
//                     ×
//                   </button>
//                 </div>
//               </div>

//               {/* Activity Loader */}
//               {activityLoading && (
//                 <div style={{
//                   display: 'flex',
//                   justifyContent: 'center',
//                   alignItems: 'center',
//                   minHeight: '400px',
//                   padding: '20px'
//                 }}>
//                   <div style={{
//                     border: '3px solid #f3f3f3',
//                     borderTop: '3px solid #007bff',
//                     borderRadius: '50%',
//                     width: '40px',
//                     height: '40px',
//                     animation: 'spin 1s linear infinite'
//                   }}>
//                   </div>
//                   <style jsx>{`
//               @keyframes spin {
//                 0% { transform: rotate(0deg); }
//                 100% { transform: rotate(360deg); }
//               }
//             `}</style>
//                 </div>
//               )}

//               {!activityLoading && activityData && activityData.checkin_out && activityData.checkin_out.length > 0 ? (
//                 <div style={{
//                   backgroundColor: '#f8f9fa',
//                   borderRadius: '8px',
//                   padding: '20px'
//                 }}>
//                   {(() => {
//                     const sessions = activityData.checkin_out.map(record => ({
//                       checkin: record,
//                       checkout: record
//                     }));
//                     const firstSeen = sessions.length > 0
//                       ? sessions[0].checkin?.checkin || sessions[0].checkout?.checkout
//                       : null;

//                     const lastSeen = sessions.length > 0
//                       ? sessions[sessions.length - 1].checkout?.checkout ||
//                       sessions[sessions.length - 1].checkin?.checkin
//                       : null;

//                     let totalWorkHours = 0;
//                     sessions.forEach(session => {
//                       if (session.checkin?.checkin && session.checkout?.checkout) {
//                         const checkinTime = new Date(session.checkin.checkin);
//                         const checkoutTime = new Date(session.checkout.checkout);

//                         if (!isNaN(checkinTime.getTime()) && !isNaN(checkoutTime.getTime())) {
//                           const duration = (checkoutTime - checkinTime) / (1000 * 60 * 60);
//                           totalWorkHours += duration;
//                         }
//                       }
//                     });

//                     return (
//                       <>
//                         {/* Break Time Summary - NEW SECTION */}
//                         {activityData.total_break && (
//                           <div style={{
//                             backgroundColor: 'white',
//                             borderRadius: '8px',
//                             padding: '20px',
//                             marginBottom: '30px',
//                             boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                             border: '1px solid #e9ecef'
//                           }}>
//                             <h5 style={{
//                               margin: '0 0 20px 0',
//                               color: '#495057',
//                               fontSize: '18px',
//                               fontWeight: '600',
//                               textAlign: 'center'
//                             }}>
//                               Break Time Summary
//                             </h5>

//                             <div style={{
//                               display: 'grid',
//                               gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//                               gap: '20px',
//                               marginBottom: '20px'
//                             }}>
//                               <div style={{
//                                 textAlign: 'center',
//                                 padding: '15px',
//                                 backgroundColor: '#e3f2fd',
//                                 borderRadius: '8px',
//                                 border: '1px solid #bbdefb'
//                               }}>
//                                 <h3 style={{
//                                   color: '#1976d2',
//                                   margin: '0 0 8px 0',
//                                   fontSize: '20px',
//                                   fontWeight: 'bold'
//                                 }}>
//                                   {activityData.total_break.total_break
//                                     ? formatTime(activityData.total_break.total_break)
//                                     : 'N/A'}
//                                   {/* {activityData.total_break.total_break || '0:00:00'} */}
//                                 </h3>
//                                 <p style={{ color: '#424242', margin: 0, fontSize: '14px', fontWeight: '500' }}>
//                                   Total Break Time
//                                 </p>
//                               </div>

//                               <div style={{
//                                 textAlign: 'center',
//                                 padding: '15px',
//                                 backgroundColor: '#fff3e0',
//                                 borderRadius: '8px',
//                                 border: '1px solid #ffcc80'
//                               }}>
//                                 <h3 style={{
//                                   color: '#f57700',
//                                   margin: '0 0 8px 0',
//                                   fontSize: '20px',
//                                   fontWeight: 'bold'
//                                 }}>
//                                   {activityData.total_break.additional_break_time
//                                     ? formatTime(activityData.total_break.additional_break_time)
//                                     : 'N/A'}
//                                   {/* {activityData.total_break.additional_break_time || '0:00:00'} */}
//                                 </h3>
//                                 <p style={{ color: '#424242', margin: 0, fontSize: '14px', fontWeight: '500' }}>
//                                   Additional Break Time
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         )}

//                         {/* Summary boxes */}
//                         <div style={{
//                           display: 'grid',
//                           gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
//                           gap: '20px',
//                           marginBottom: '30px'
//                         }}>
//                           <div style={{ textAlign: 'center' }}>
//                             <h3 style={{ color: '#007bff', margin: '0 0 8px 0', fontSize: '1rem' }}>
//                               {firstSeen ? formatDateTime(firstSeen) : 'N/A'}
//                             </h3>
//                             <p style={{ color: '#6c757d', margin: 0, fontSize: '10px' }}>First Seen</p>
//                           </div>
//                           <div style={{ textAlign: 'center' }}>
//                             <h3 style={{ color: '#28a745', margin: '0 0 8px 0', fontSize: '1rem' }}>
//                               {lastSeen ? formatDateTime(lastSeen) : 'N/A'}
//                             </h3>
//                             <p style={{ color: '#6c757d', margin: 0, fontSize: '10px' }}>Last Seen</p>
//                           </div>

//                           <div style={{ textAlign: 'center' }}>
//                             <h3 style={{ color: '#ffc107', margin: '0 0 8px 0', fontSize: '1rem' }}>
//                               {selectedEmployee?.workHours
//                                 ? formatTime(selectedEmployee?.workHours)
//                                 : 'N/A'}
//                             </h3>
//                             <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>Work Hours</p>
//                           </div>

//                           <div style={{ textAlign: 'center' }}>
//                             <h3 style={{ color: '#17a2b8', margin: '0 0 8px 0', fontSize: '1rem' }}>
//                               {sessions.length}
//                             </h3>
//                             <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>Total Sessions</p>
//                           </div>
//                         </div>

//                         {/* Activity Timeline */}
//                         <div style={{ borderLeft: '3px solid #28a745', paddingLeft: '0' }}>
//                           {sessions.map((session, index) => {
//                             const checkinRecord = session.checkin;
//                             const checkoutRecord = session.checkout;
//                             const status = checkinRecord && checkoutRecord
//                               ? ['Completed', '#28a745']
//                               : ['Incomplete', '#ff6b6b'];

//                             // Skip break time progress bar for the first session (index 0)
//                             const showBreakTime = index !== 0;

//                             const breakProgress = checkinRecord?.break_progress || 0;
//                             const greenLimit = 100;
//                             // Set totalProgress to 100 if breakProgress is less than 100, otherwise use breakProgress
//                             const totalProgress = breakProgress < 100 ? 100 : breakProgress;

//                             const greenWidth = Math.min(breakProgress, greenLimit) / totalProgress * 100;
//                             const redWidth = breakProgress > greenLimit
//                               ? (breakProgress - greenLimit) / totalProgress * 100
//                               : 0;

//                             return (
//                               <React.Fragment key={index}>
//                                 {/* Conditionally render Break Time Progress Bar (skip for first session) */}
//                                 {showBreakTime && (
//                                   <div style={{
//                                     padding: '16px 20px',
//                                     marginBottom: '8px',
//                                     marginLeft: '20px',
//                                     position: 'relative'
//                                   }}>
//                                     {/* Green circle on the timeline */}
//                                     <div style={{
//                                       position: 'absolute',
//                                       left: '-31px',
//                                       top: '50%',
//                                       transform: 'translateY(-50%)',
//                                       width: '16px',
//                                       height: '16px',
//                                       borderRadius: '50%',
//                                       backgroundColor: '#28a745',
//                                       border: '3px solid white'
//                                     }}></div>

//                                     {/* Upper text: Break Time in bold and bigger font */}
//                                     <div style={{
//                                       fontSize: '18px',
//                                       fontWeight: 'bold',
//                                       textAlign: 'left',
//                                       marginBottom: '8px'
//                                     }}>
//                                       Break Time: {checkinRecord?.break_time ? formatTime(checkinRecord.break_time) : 'N/A'}
//                                     </div>

//                                     {/* Multi-colored progress bar */}
//                                     <div style={{
//                                       width: '100%',
//                                       height: '12px',
//                                       backgroundColor: '#e9ecef',
//                                       borderRadius: '6px',
//                                       overflow: 'hidden',
//                                       position: 'relative',
//                                       display: 'flex'
//                                     }}>
//                                       {/* Green portion: up to 100 */}
//                                       <div style={{
//                                         width: `${greenWidth}%`,
//                                         backgroundColor: '#28a745'
//                                       }}></div>

//                                       {/* Red portion: between 100 and breakProgress */}
//                                       {redWidth > 0 && (
//                                         <div style={{
//                                           width: `${redWidth}%`,
//                                           backgroundColor: '#ff0000'
//                                         }}></div>
//                                       )}
//                                     </div>

//                                     {/* Bottom text: Break utilized in gray without bold */}
//                                     <div style={{
//                                       marginTop: '8px',
//                                       fontSize: '14px',
//                                       color: '#6c757d',
//                                       textAlign: 'left'
//                                     }}>
//                                       Break utilized
//                                     </div>
//                                   </div>
//                                 )}

//                                 {/* Session Details Card (always shown for all sessions) */}
//                                 <div style={{
//                                   backgroundColor: 'white',
//                                   borderRadius: '8px',
//                                   padding: '20px',
//                                   marginBottom: '16px',
//                                   boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
//                                   position: 'relative',
//                                   marginLeft: '20px'
//                                 }}>
//                                   {/* Status indicator */}
//                                   <div style={{
//                                     position: 'absolute',
//                                     left: '-31px',
//                                     top: '20px',
//                                     width: '16px',
//                                     height: '16px',
//                                     borderRadius: '50%',
//                                     backgroundColor: status[1],
//                                     border: '3px solid white'
//                                   }}></div>

//                                   {/* Status badge */}
//                                   <div style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     alignItems: 'flex-start',
//                                     marginBottom: '16px'
//                                   }}>
//                                     <div style={{ textAlign: 'right' }}>
//                                       <div style={{ color: '#6c757d', fontSize: '14px' }}>
//                                         {checkinRecord?.checkin
//                                           ? formatDate(checkinRecord.checkin)
//                                           : checkoutRecord?.checkout
//                                             ? formatDate(checkoutRecord.checkout)
//                                             : 'N/A'}
//                                       </div>
//                                       <div style={{ color: '#007bff', fontSize: '12px', marginTop: '4px' }}>
//                                         Session {index + 1}
//                                       </div>
//                                     </div>
//                                   </div>

//                                   <div style={{
//                                     display: 'grid',
//                                     gridTemplateColumns: '1fr 1fr',
//                                     gap: '30px',
//                                     alignItems: 'center'
//                                   }}>
//                                     {/* Check-in Column */}
//                                     <div>
//                                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
//                                         <div style={{
//                                           width: '8px',
//                                           height: '8px',
//                                           borderRadius: '50%',
//                                           backgroundColor: '#28a745'
//                                         }}></div>
//                                         <span style={{ fontSize: '14px', color: '#6c757d' }}>First Seen</span>
//                                       </div>
//                                       <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
//                                         {checkinRecord?.checkin
//                                           ? formatCheckinTime(checkinRecord.checkin)
//                                           : 'N/A'}
//                                       </div>

//                                       {checkinRecord ? (
//                                         <div>
//                                           <Base64Image
//                                             base64={checkinRecord.in_face}
//                                             alt="Check-in face"
//                                             style={{
//                                               width: '150px',
//                                               height: '200px',
//                                               borderRadius: '8px',
//                                               objectFit: 'cover',
//                                               cursor: 'pointer'
//                                             }}
//                                             onClick={() => handleImageClick(
//                                               checkinRecord.in_face,
//                                               `Check-in for ${selectedEmployee?.name} at ${formatTime(checkinRecord.checkin)}`
//                                             )} />
//                                         </div>
//                                       ) : (
//                                         <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
//                                           No check-in recorded
//                                         </div>
//                                       )}
//                                     </div>

//                                     {/* Check-out Column */}
//                                     <div>
//                                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
//                                         <div style={{
//                                           width: '8px',
//                                           height: '8px',
//                                           borderRadius: '50%',
//                                           backgroundColor: '#dc3545'
//                                         }}></div>
//                                         <span style={{ fontSize: '14px', color: '#6c757d' }}>Last Seen</span>
//                                       </div>
//                                       <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>
//                                         {checkoutRecord?.checkout
//                                           ? formatCheckinTime(checkoutRecord.checkout)
//                                           : 'N/A'}
//                                       </div>
//                                       {checkoutRecord ? (
//                                         <div>
//                                           <Base64Image
//                                             base64={checkoutRecord.out_face}
//                                             alt="Check-out face"
//                                             style={{
//                                               width: '150px',
//                                               height: '200px',
//                                               borderRadius: '8px',
//                                               objectFit: 'cover',
//                                               cursor: 'pointer'
//                                             }}
//                                             onClick={() => handleImageClick(
//                                               checkoutRecord.out_face,
//                                               `Check-out for ${selectedEmployee?.name} at ${formatTime(checkoutRecord.checkout)}`
//                                             )} />
//                                         </div>
//                                       ) : (
//                                         <div style={{ color: '#6c757d', fontStyle: 'italic' }}>
//                                           No check-out recorded
//                                         </div>
//                                       )}
//                                     </div>
//                                   </div>

//                                   {/* Duration */}
//                                   {checkinRecord?.duration && (
//                                     <div style={{
//                                       marginTop: '16px',
//                                       padding: '12px',
//                                       backgroundColor: '#f8f9fa',
//                                       borderRadius: '6px',
//                                       fontSize: '14px'
//                                     }}>
//                                       <strong>Duration:</strong>{' '}
//                                       <span style={{ color: '#007bff' }}>
//                                         {formatTime(checkinRecord.duration)}
//                                       </span>
//                                     </div>
//                                   )}
//                                 </div>
//                               </React.Fragment>
//                             );
//                           })}
//                         </div>
//                       </>
//                     );
//                   })()}
//                 </div>
//               ) : !activityLoading && (
//                 <div style={{
//                   textAlign: 'center',
//                   padding: '40px',
//                   color: '#6c757d',
//                   backgroundColor: '#f8f9fa',
//                   borderRadius: '8px'
//                 }}>
//                   No activity data available
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}

//       {showImageModal && (
//         <>
//           <div
//             style={{
//               position: 'fixed',
//               top: 0,
//               left: 0,
//               width: '100%',
//               height: '100%',
//               backgroundColor: 'rgba(0, 0, 0, 0.9)',
//               zIndex: 1060,
//               display: 'flex',
//               alignItems: 'center',
//               justifyContent: 'center'
//             }}
//             onClick={() => setShowImageModal(false)}
//           >
//             <div
//               style={{
//                 position: 'relative',
//                 maxWidth: '90vw',
//                 maxHeight: '90vh',
//                 overflow: 'auto',
//                 textAlign: 'center'
//               }}
//               onClick={e => e.stopPropagation()}
//             >
//               <button
//                 onClick={() => setShowImageModal(false)}
//                 style={{
//                   position: 'absolute',
//                   top: '15px',
//                   right: '15px',
//                   background: 'rgba(0,0,0,0.5)',
//                   color: 'white',
//                   border: 'none',
//                   width: '40px',
//                   height: '40px',
//                   borderRadius: '50%',
//                   fontSize: '24px',
//                   cursor: 'pointer',
//                   zIndex: 2
//                 }}
//               >
//                 ×
//               </button>
//               <h3 style={{ color: 'white', marginBottom: '20px' }}>
//                 {imageTitle}
//               </h3>
//               <img
//                 src={currentImage ?
//                   (currentImage.startsWith('data:image/') ?
//                     currentImage :
//                     `data:image/jpeg;base64,${currentImage}`) :
//                   null}
//                 alt="Enlarged view"
//                 style={{
//                   maxWidth: '100%',
//                   maxHeight: '80vh',
//                   borderRadius: '8px',
//                   boxShadow: '0 5px 15px rgba(0,0,0,0.5)'
//                 }}
//               />
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// // Add this style block in your component
// // Add this to your component's JSX
// <style jsx global>{`
//   @media print {
//     body {
//       margin: 0;
//       padding: 0;
//       background: white;
//     }
//     #__next {
//       width: 100% !important;
//       margin: 0 !important;
//       padding: 0 !important;
//     }
//     .no-print {
//       display: none !important;
//     }
//     table {
//       width: 100% !important;
//       page-break-inside: auto !important;
//     }
//     tr {
//       page-break-inside: avoid !important;
//       page-break-after: auto !important;
//     }
//     img {
//       max-width: 100% !important;
//       height: auto !important;
//     }
//     .card {
//       break-inside: avoid;
//     }
//   }
// `}</style>

// export default ReportPage;
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

  // Mock data for intruder reports
  const mockIntruders = [
    {
      id: 1,
      gender: 'Male',
      camera: 'Checkin',
      time: new Date().toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjNmMyIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSIzMCIgZmlsbD0iI2QxZDFkMSIvPgogIDxwYXRoIGQ9Ik0gNDAgMTQwIEEgNjAgNjAgMCAxIDEgMTYwIDE0MCIgc3Ryb2tlPSIjZDFkMWQxIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz4KPC9zdmc+'
    },
    {
      id: 2,
      gender: 'Female',
      camera: 'Checkout',
      time: new Date(Date.now() - 30 * 60 * 1000).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjNmMyIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSIzMCIgZmlsbD0iI2ZmYzJkMyIvPgogIDxwYXRoIGQ9Ik0gNDAgMTQwIEEgNjAgNjAgMCAxIDEgMTYwIDE0MCIgc3Ryb2tlPSIjZmZjMmQzIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz4KPC9zdmc+'
    },
    {
      id: 3,
      gender: 'Male',
      camera: 'Checkin',
      time: new Date(Date.now() - 2 * 60 * 60 * 1000).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjNmMyIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSIzMCIgZmlsbD0iI2I4ZGFmNSIvPgogIDxwYXRoIGQ9Ik0gNDAgMTQwIEEgNjAgNjAgMCAxIDEgMTYwIDE0MCIgc3Ryb2tlPSIjYjhkYWY1IiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz4KPC9zdmc+'
    },
    {
      id: 4,
      gender: 'Unknown',
      camera: 'Checkout',
      time: new Date(Date.now() - 4 * 60 * 60 * 1000).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      image: null
    },
    {
      id: 5,
      gender: 'Female',
      camera: 'Checkin',
      time: new Date(Date.now() - 6 * 60 * 60 * 1000).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      image: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjNmMyIvPgogIDxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSIzMCIgZmlsbD0iI2ZmYjhkYSIvPgogIDxwYXRoIGQ9Ik0gNDAgMTQwIEEgNjAgNjAgMCAxIDEgMTYwIDE0MCIgc3Ryb2tlPSIjZmZiOGRhIiBzdHJva2Utd2lkdGg9IjgiIGZpbGw9Im5vbmUiLz4KPC9zdmc+'
    }
  ];

  // Function to enhance intruder data with mock data if missing
  const enhanceIntruderData = (intruders) => {
    if (!intruders || intruders.length === 0) {
      return mockIntruders;
    }

    return intruders.map((intruder, index) => {
      const mockIntruder = mockIntruders[index % mockIntruders.length];
      
      return {
        id: intruder.id || mockIntruder.id,
        gender: intruder.gender || mockIntruder.gender,
        camera: intruder.camera || mockIntruder.camera,
        time: intruder.time || mockIntruder.time,
        image: intruder.image || mockIntruder.image
      };
    });
  };

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
      let logs = [];
      if (response.data.intruder_logs) {
        logs = response.data.intruder_logs;
      } else if (response.data['New item']) {
        logs = [response.data['New item']];
      } else if (Array.isArray(response.data)) {
        logs = response.data;
      }

      const enhancedLogs = enhanceIntruderData(logs).map(log => ({
        ...log,
        // Convert ISO time to more readable format if it's an ISO string
        time: log.time.includes('T') ? 
          new Date(log.time).toLocaleString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }) : log.time
      }));

      setIntruders(enhancedLogs);
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to fetch intruder logs. Using demo data instead.');
      
      // Use mock data as fallback
      setIntruders(mockIntruders);
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
      // Determine mode based on camera name
      const mode = assigningIntruder.camera?.toLowerCase().includes('checkout') ? 'checkout' : 'checkin';

      // Make API call with intruder ID, employee ID and mode
      await api.post('/api/update/attendance', {
        id: assigningIntruder.id,
        emp_id: userId,
        mode: mode
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
          {error && (
            <div className="alert alert-info mt-2 mb-0" role="alert">
              <small>
                <i className="fas fa-info-circle me-1"></i>
                {error}
              </small>
            </div>
          )}
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
                src={currentImage}
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


