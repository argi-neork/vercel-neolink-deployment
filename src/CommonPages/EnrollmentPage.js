// import React, { useState, useRef, useEffect } from 'react';
// import axios from '../axiosConfig';

// const EnrollmentPage = () => {
//     const [employeeId, setEmployeeId] = useState('');
//     const [employeeName, setEmployeeName] = useState('');
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
//     const [officeHours, setOfficeHours] = useState({ start_time: '', end_time: '' });
//     const [workHours, setWorkHours] = useState({ required_hours: 0, break_hours: 0 });
//     const [enrollmentMethod, setEnrollmentMethod] = useState('camera'); // 'camera' or 'upload'
//     const [selectedFile, setSelectedFile] = useState(null);

//     const videoRef = useRef(null);
//     const canvasRef = useRef(null);
//     const fileInputRef = useRef(null);

//     const steps = {
//         straight: 'Please look straight at the camera',
//         left: 'Please slowly tilt your face to the left',
//         center: 'Please slowly tilt your face back to center',
//         right: 'Please slowly tilt your face to the right',
//         final: 'Please slowly tilt your face back to center'
//     };

//     const stepOrder = ['straight', 'left', 'center', 'right', 'final'];

//     // Fetch global settings on component mount
//     useEffect(() => {
//         const fetchSettings = async () => {
//             try {
//                 // Fetch office hours
//                 const officeResponse = await axios.get('/api/settings/get/global/office_hours');
//                 const officeData = officeResponse.data;
//                 if (Array.isArray(officeData) && officeData.length > 0) {
//                     setOfficeHours({
//                         start_time: officeData[0].start_time || '',
//                         end_time: officeData[0].end_time || ''
//                     });
//                 }

//                 // Fetch work hours
//                 const workResponse = await axios.get('/api/settings/get/global/work_hours');
//                 const workData = workResponse.data;
//                 if (Array.isArray(workData) && workData.length > 0) {
//                     setWorkHours({
//                         required_hours: workData[0].required_hours || 0,
//                         break_hours: workData[0].break_hours || 0
//                     });
//                 }
//             } catch (error) {
//                 console.error('Error fetching global settings:', error);
//                 setEnrollmentStatus('Error loading global settings. Using default values.');
//             }
//         };

//         fetchSettings();
//     }, []);

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
//         } else if (capturedVideo && enrollmentMethod === 'camera') {
//             video.srcObject = null;
//             video.src = capturedVideo;
//             video.controls = true;
//         } else {
//             video.srcObject = null;
//             video.src = '';
//             video.controls = false;
//         }
//     }, [isCapturing, capturedVideo, stream, enrollmentMethod]);

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

//     const handleFileChange = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;
        
//         // Validate file type
//         if (!file.type.startsWith('video/')) {
//             setEnrollmentStatus('Error: Please select a valid video file');
//             return;
//         }
        
//         // Validate file size (max 50MB)
//         if (file.size > 50 * 1024 * 1024) {
//             setEnrollmentStatus('Error: File size exceeds 50MB limit');
//             return;
//         }
        
//         setSelectedFile(file);
//         setCapturedVideo(URL.createObjectURL(file));
//         setEnrollmentStatus('');
//     };

//     const uploadVideo = async () => {
//         let videoFile;
//         let videoBlob;
        
//         try {
//             setIsUploading(true);
//             setEnrollmentStatus('Uploading video...');

//             // Sanitize filename
//             const sanitizedName = employeeName.replace(/\s+/g, '_');
//             const videoFilename = `${employeeId}_${sanitizedName}_enroll.webm`;

//             if (enrollmentMethod === 'camera') {
//                 if (!capturedVideo) {
//                     alert('Please capture a video first');
//                     return;
//                 }
                
//                 // Convert captured video to blob
//                 videoBlob = await fetch(capturedVideo).then(r => r.blob());
//                 videoFile = new File([videoBlob], videoFilename, { type: 'video/webm' });
//             } else {
//                 if (!selectedFile) {
//                     alert('Please select a video file first');
//                     return;
//                 }
                
//                 // Use the selected file
//                 videoFile = new File([selectedFile], videoFilename, { type: selectedFile.type });
//             }

//             // Upload video
//             const uploadFormData = new FormData();
//             uploadFormData.append('file', videoFile);

//             const uploadResponse = await axios.post(
//                 '/api/upload/video',
//                 uploadFormData,
//                 { headers: { 'Content-Type': 'multipart/form-data' } }
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

//     // Handle changes for office hours
//     const handleOfficeHoursChange = (field, value) => {
//         setOfficeHours(prev => ({ ...prev, [field]: value }));
//     };

//     // Handle changes for work hours
//     const handleWorkHoursChange = (field, value) => {
//         // Convert to number if it's a numeric field
//         const numericValue = field === 'required_hours' || field === 'break_hours' 
//             ? parseFloat(value) || 0 
//             : value;
        
//         setWorkHours(prev => ({ ...prev, [field]: numericValue }));
//     };

//     const saveEmployee = async () => {
//         if (!employeeId || !employeeName || !uploadedFilename) {
//             alert('Please fill in all fields, capture face video, and upload it first');
//             return;
//         }

//         try {
//             setIsSaving(true);
//             setEnrollmentStatus('Saving employee...');

//             // Call enroll API with additional fields
//             await axios.post(
//                 '/api/enroll/employee',
//                 {
//                     emp_id: employeeId,
//                     emp_name: employeeName,
//                     face_video: uploadedFilename,
//                     office_hours: officeHours,
//                     work_hours: workHours
//                 }
//             );

//             setEnrollmentStatus('Employee enrolled successfully!');

//             // Reset form
//             setEmployeeId('');
//             setEmployeeName('');
//             setCapturedVideo(null);
//             setRecordedChunks([]);
//             setUploadedFilename('');
//             setSelectedFile(null);
//             setOfficeHours({ start_time: '', end_time: '' });
//             setWorkHours({ required_hours: 0, break_hours: 0 });
//             setEnrollmentMethod('camera');

//             // Reset file input
//             if (fileInputRef.current) {
//                 fileInputRef.current.value = '';
//             }

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
//         setSelectedFile(null);
//         setCurrentStep('straight');
//         setUploadedFilename('');
//         if (stream) {
//             stream.getTracks().forEach(track => track.stop());
//             setStream(null);
//         }
//         setIsCapturing(false);
        
//         // Reset file input
//         if (fileInputRef.current) {
//             fileInputRef.current.value = '';
//         }
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
                                    
//                                     {/* Office Hours Section */}
//                                     <div className="card mt-3">
//                                         <div className="card-header bg-info text-white">
//                                             <h6 className="mb-0">Office Hours</h6>
//                                         </div>
//                                         <div className="card-body">
//                                             <div className="row">
//                                                 <div className="col-md-6">
//                                                     <div className="form-group mb-3">
//                                                         <label className="form-label">Start Time</label>
//                                                         <input
//                                                             type="time"
//                                                             className="form-control"
//                                                             value={officeHours.start_time}
//                                                             onChange={(e) => handleOfficeHoursChange('start_time', e.target.value)}
//                                                             disabled={isCapturing}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                                 <div className="col-md-6">
//                                                     <div className="form-group mb-3">
//                                                         <label className="form-label">End Time</label>
//                                                         <input
//                                                             type="time"
//                                                             className="form-control"
//                                                             value={officeHours.end_time}
//                                                             onChange={(e) => handleOfficeHoursChange('end_time', e.target.value)}
//                                                             disabled={isCapturing}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Work Hours Section */}
//                                     <div className="card mt-3">
//                                         <div className="card-header bg-info text-white">
//                                             <h6 className="mb-0">Work Hours</h6>
//                                         </div>
//                                         <div className="card-body">
//                                             <div className="row">
//                                                 <div className="col-md-6">
//                                                     <div className="form-group mb-3">
//                                                         <label className="form-label">Required Hours</label>
//                                                         <input
//                                                             type="number"
//                                                             className="form-control"
//                                                             value={workHours.required_hours}
//                                                             onChange={(e) => handleWorkHoursChange('required_hours', e.target.value)}
//                                                             min="1"
//                                                             max="24"
//                                                             step="0.5"
//                                                             disabled={isCapturing}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                                 <div className="col-md-6">
//                                                     <div className="form-group mb-3">
//                                                         <label className="form-label">Break Hours</label>
//                                                         <input
//                                                             type="number"
//                                                             className="form-control"
//                                                             value={workHours.break_hours}
//                                                             onChange={(e) => handleWorkHoursChange('break_hours', e.target.value)}
//                                                             min="0"
//                                                             max="5"
//                                                             step="0.5"
//                                                             disabled={isCapturing}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 <div className="col-md-6">
//                                     <div className="text-center">
//                                         <h6 className="mb-3">Face Enrollment</h6>
                                        
//                                         {/* Enrollment Method Selection */}
//                                         <div className="mb-3">
//                                             <div className="btn-group" role="group">
//                                                 <button
//                                                     type="button"
//                                                     className={`btn ${enrollmentMethod === 'camera' ? 'btn-primary' : 'btn-outline-primary'}`}
//                                                     onClick={() => setEnrollmentMethod('camera')}
//                                                     disabled={isCapturing || capturedVideo}
//                                                 >
//                                                     Use Camera
//                                                 </button>
//                                                 <button
//                                                     type="button"
//                                                     className={`btn ${enrollmentMethod === 'upload' ? 'btn-primary' : 'btn-outline-primary'}`}
//                                                     onClick={() => setEnrollmentMethod('upload')}
//                                                     disabled={isCapturing || capturedVideo}
//                                                 >
//                                                     Upload Video
//                                                 </button>
//                                             </div>
//                                         </div>

//                                         {enrollmentMethod === 'camera' ? (
//                                             <>
//                                                 {/* Camera Access Instructions */}
//                                                 <div className="alert alert-info mb-3">
//                                                     <small>
//                                                         <strong>Important:</strong> Please ensure you're using HTTPS or localhost, and allow camera access when prompted.
//                                                     </small>
//                                                 </div>

//                                                 {/* Video element - always in DOM */}
//                                                 <video
//                                                     ref={videoRef}
//                                                     width="320"
//                                                     height="240"
//                                                     autoPlay
//                                                     muted
//                                                     playsInline
//                                                     style={{
//                                                         display: (isCapturing || capturedVideo) ? 'inline-block' : 'none',
//                                                         border: capturedVideo ? '2px solid #28a745' :
//                                                             isCapturing ? '2px solid #007bff' : 'none',
//                                                         borderRadius: '8px'
//                                                     }}
//                                                 />

//                                                 {/* Placeholder when not capturing */}
//                                                 {!isCapturing && !capturedVideo && (
//                                                     <div style={{
//                                                         width: '320px',
//                                                         height: '240px',
//                                                         display: 'inline-block',
//                                                         border: '2px solid #ddd',
//                                                         borderRadius: '8px',
//                                                         backgroundColor: '#f8f9fa',
//                                                         lineHeight: '240px',
//                                                         color: '#6c757d'
//                                                     }}>
//                                                         Camera Feed Will Appear Here
//                                                     </div>
//                                                 )}

//                                                 {/* Start Capture Button */}
//                                                 {!isCapturing && !capturedVideo && (
//                                                     <div className="mt-3">
//                                                         <button
//                                                             className="btn btn-primary"
//                                                             onClick={startCapture}
//                                                             disabled={!employeeId || !employeeName}
//                                                         >
//                                                             Start Face Capture
//                                                         </button>
//                                                         {(!employeeId || !employeeName) && (
//                                                             <div className="text-muted mt-2">
//                                                                 <small>Please fill in Employee ID and Name first</small>
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 )}

//                                                 {/* Capture Controls */}
//                                                 {isCapturing && (
//                                                     <div className="mt-3">
//                                                         <div className="alert alert-info">
//                                                             <strong>{steps[currentStep]}</strong>
//                                                         </div>
//                                                         <button
//                                                             className="btn btn-success me-2"
//                                                             onClick={nextStep}
//                                                         >
//                                                             Next Step
//                                                         </button>
//                                                         <button
//                                                             className="btn btn-danger"
//                                                             onClick={stopCapture}
//                                                         >
//                                                             Stop Capture
//                                                         </button>
//                                                     </div>
//                                                 )}
//                                             </>
//                                         ) : (
//                                             <>
//                                                 {/* File Upload Section */}
//                                                 <div className="mb-3">
//                                                     <input
//                                                         type="file"
//                                                         ref={fileInputRef}
//                                                         accept="video/*"
//                                                         onChange={handleFileChange}
//                                                         className="d-none"
//                                                     />
//                                                     <button
//                                                         className="btn btn-secondary"
//                                                         onClick={() => fileInputRef.current.click()}
//                                                         disabled={capturedVideo}
//                                                     >
//                                                         {selectedFile ? 'Change Video' : 'Select Video File'}
//                                                     </button>
                                                    
//                                                     {selectedFile && (
//                                                         <div className="mt-2">
//                                                             <small>
//                                                                 Selected: {selectedFile.name} 
//                                                                 ({Math.round(selectedFile.size / 1024)} KB)
//                                                             </small>
//                                                         </div>
//                                                     )}
//                                                 </div>
                                                
//                                                 {/* Video Preview */}
//                                                 {capturedVideo && (
//                                                     <div className="mt-3">
//                                                         <video
//                                                             src={capturedVideo}
//                                                             width="320"
//                                                             height="240"
//                                                             controls
//                                                             style={{
//                                                                 border: '2px solid #28a745',
//                                                                 borderRadius: '8px'
//                                                             }}
//                                                         />
//                                                     </div>
//                                                 )}
                                                
//                                                 <div className="alert alert-warning mt-3">
//                                                     <small>
//                                                         <strong>Requirements:</strong> 
//                                                         <ul className="mb-0">
//                                                             <li>Video should show face movements similar to camera capture</li>
//                                                             <li>Supported formats: MP4, WebM, MOV</li>
//                                                             <li>Max file size: 50MB</li>
//                                                             <li>Duration: 10-30 seconds</li>
//                                                         </ul>
//                                                     </small>
//                                                 </div>
//                                             </>
//                                         )}

//                                         {/* After Capture/Upload Controls */}
//                                         {(capturedVideo) && (
//                                             <div className="mt-3">
//                                                 <div className="d-flex justify-content-center flex-wrap">
//                                                     <button
//                                                         className="btn btn-warning me-2 mb-2"
//                                                         onClick={resetCapture}
//                                                         disabled={isUploading || isSaving}
//                                                     >
//                                                         {enrollmentMethod === 'camera' ? 'Recapture' : 'Change Video'}
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







import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from '../axiosConfig';

const EnrollmentPage = () => {
    // State management
    const [employeeId, setEmployeeId] = useState('');
    const [employeeName, setEmployeeName] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedVideo, setCapturedVideo] = useState(null);
    const [currentStep, setCurrentStep] = useState('straight');
    const [recordedChunks, setRecordedChunks] = useState([]);
    const [stream, setStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [enrollmentStatus, setEnrollmentStatus] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadedFilename, setUploadedFilename] = useState('');
    const [officeHours, setOfficeHours] = useState({ start_time: '', end_time: '' });
    const [workHours, setWorkHours] = useState({ required_hours: 0, break_hours: 0 });
    const [enrollmentMethod, setEnrollmentMethod] = useState('camera');
    const [selectedFile, setSelectedFile] = useState(null);

    // Refs
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);

    // Constants
    const steps = {
        straight: 'Please look straight at the camera',
        left: 'Please slowly tilt your face to the left',
        center: 'Please slowly tilt your face back to center',
        right: 'Please slowly tilt your face to the right',
        final: 'Please slowly tilt your face back to center'
    };

    const stepOrder = ['straight', 'left', 'center', 'right', 'final'];

    // Fetch global settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const [officeResponse, workResponse] = await Promise.all([
                    axios.get('/api/settings/get/global/office_hours'),
                    axios.get('/api/settings/get/global/work_hours')
                ]);

                if (Array.isArray(officeResponse.data) && officeResponse.data.length > 0) {
                    setOfficeHours({
                        start_time: officeResponse.data[0].start_time || '',
                        end_time: officeResponse.data[0].end_time || ''
                    });
                }

                if (Array.isArray(workResponse.data) && workResponse.data.length > 0) {
                    setWorkHours({
                        required_hours: workResponse.data[0].required_hours || 0,
                        break_hours: workResponse.data[0].break_hours || 0
                    });
                }
            } catch (error) {
                console.error('Error fetching global settings:', error);
                setEnrollmentStatus('Error loading global settings. Using default values.');
            }
        };

        fetchSettings();
    }, []);

    // Cleanup function for video resources
    const cleanupVideoResources = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        
        if (capturedVideo) {
            URL.revokeObjectURL(capturedVideo);
            setCapturedVideo(null);
        }
        
        setRecordedChunks([]);
        setMediaRecorder(null);
        setIsCapturing(false);
        setCurrentStep('straight');
        setUploadedFilename('');
        setSelectedFile(null);
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [stream, capturedVideo]);

    // Setup video element based on state
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isCapturing && stream) {
            video.srcObject = stream;
            video.play().catch(error => {
                console.error("Video play error:", error);
                setEnrollmentStatus('Error: Failed to play video stream. Please try again.');
            });
        } else if (capturedVideo && enrollmentMethod === 'camera') {
            video.srcObject = null;
            video.src = capturedVideo;
            video.controls = true;
        } else {
            video.srcObject = null;
            video.src = '';
            video.controls = false;
        }

        return () => {
            if (video.srcObject) {
                video.srcObject.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCapturing, capturedVideo, stream, enrollmentMethod]);

    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            cleanupVideoResources();
        };
    }, [cleanupVideoResources]);

    const startCapture = async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                setEnrollmentStatus('Error: Camera access is not supported in this browser.');
                return;
            }

            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                },
                audio: false
            });

            setStream(mediaStream);
            setIsCapturing(true);
            setCurrentStep('straight');
            setEnrollmentStatus('');
            setUploadedFilename('');

            if (!MediaRecorder.isTypeSupported('video/webm')) {
                setEnrollmentStatus('Error: Video recording is not supported in this browser.');
                return;
            }

            const recorder = new MediaRecorder(mediaStream, {
                mimeType: 'video/webm'
            });
            
            setMediaRecorder(recorder);

            const chunks = [];
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const videoUrl = URL.createObjectURL(blob);
                setCapturedVideo(videoUrl);
                setRecordedChunks(chunks);
                setIsCapturing(false);
            };

            recorder.start();

        } catch (error) {
            console.error('Error accessing camera:', error);
            
            const errorMessages = {
                NotAllowedError: 'Please allow camera access and refresh the page.',
                NotFoundError: 'No camera found. Please connect a camera.',
                NotReadableError: 'Camera is being used by another application.',
                OverconstrainedError: 'Camera constraints not supported.',
                default: 'Please check your camera permissions and try again.'
            };

            setEnrollmentStatus(`Error accessing camera. ${errorMessages[error.name] || errorMessages.default}`);
        }
    };

    const stopCapture = () => {
        if (mediaRecorder?.state === 'recording') {
            mediaRecorder.stop();
        }
        setIsCapturing(false);
    };

    const nextStep = () => {
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex < stepOrder.length - 1) {
            setCurrentStep(stepOrder[currentIndex + 1]);
        } else {
            stopCapture();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('video/')) {
            setEnrollmentStatus('Error: Please select a valid video file');
            return;
        }
        
        if (file.size > 50 * 1024 * 1024) {
            setEnrollmentStatus('Error: File size exceeds 50MB limit');
            return;
        }
        
        setSelectedFile(file);
        setCapturedVideo(URL.createObjectURL(file));
        setEnrollmentStatus('');
    };

    const uploadVideo = async () => {
        let videoFile;
        
        try {
            setIsUploading(true);
            setEnrollmentStatus('Uploading video...');

            const sanitizedName = employeeName.replace(/\s+/g, '_');
            const videoFilename = `${employeeId}_${sanitizedName}_enroll.webm`;

            if (enrollmentMethod === 'camera') {
                if (!capturedVideo) {
                    alert('Please capture a video first');
                    return;
                }
                
                const videoBlob = await fetch(capturedVideo).then(r => r.blob());
                videoFile = new File([videoBlob], videoFilename, { type: 'video/webm' });
            } else {
                if (!selectedFile) {
                    alert('Please select a video file first');
                    return;
                }
                
                videoFile = new File([selectedFile], videoFilename, { type: selectedFile.type });
            }

            const uploadFormData = new FormData();
            uploadFormData.append('file', videoFile);

            const uploadResponse = await axios.post(
                '/api/upload/video',
                uploadFormData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            const { filename } = uploadResponse.data;
            setUploadedFilename(filename);
            setEnrollmentStatus('Video uploaded successfully!');

        } catch (error) {
            console.error('Upload error:', error);
            
            let errorMessage = 'Error: ';
            if (error.response) {
                errorMessage += error.response.data.message || 'Server error occurred';
            } else if (error.request) {
                errorMessage += 'No response from server. Please check your connection.';
            } else {
                errorMessage += error.message || 'Failed to upload video';
            }

            setEnrollmentStatus(errorMessage);
        } finally {
            setIsUploading(false);
        }
    };

    const handleOfficeHoursChange = (field, value) => {
        setOfficeHours(prev => ({ ...prev, [field]: value }));
    };

    const handleWorkHoursChange = (field, value) => {
        const numericValue = ['required_hours', 'break_hours'].includes(field) 
            ? parseFloat(value) || 0 
            : value;
        
        setWorkHours(prev => ({ ...prev, [field]: numericValue }));
    };

    const saveEmployee = async () => {
        if (!employeeId || !employeeName || !uploadedFilename) {
            alert('Please fill in all fields, capture face video, and upload it first');
            return;
        }

        try {
            setIsSaving(true);
            setEnrollmentStatus('Saving employee...');

            await axios.post('/api/enroll/employee', {
                emp_id: employeeId,
                emp_name: employeeName,
                face_video: uploadedFilename,
                office_hours: officeHours,
                work_hours: workHours
            });

            setEnrollmentStatus('Employee enrolled successfully!');

            // Reset form
            setEmployeeId('');
            setEmployeeName('');
            setOfficeHours({ start_time: '', end_time: '' });
            setWorkHours({ required_hours: 0, break_hours: 0 });
            setEnrollmentMethod('camera');
            cleanupVideoResources();

        } catch (error) {
            console.error('Enrollment error:', error);
            
            let errorMessage = 'Error: ';
            if (error.response) {
                errorMessage += error.response.data.message || 'Server error occurred';
            } else if (error.request) {
                errorMessage += 'No response from server. Please check your connection.';
            } else {
                errorMessage += error.message || 'Failed to enroll employee';
            }

            setEnrollmentStatus(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    const resetCapture = () => {
        cleanupVideoResources();
    };

    // Memoized form sections to prevent unnecessary re-renders
    const renderEmployeeForm = () => (
        <>
            <div className="form-group mb-3">
                <label htmlFor="employeeId" className="form-label">Employee ID</label>
                <input
                    type="text"
                    id="employeeId"
                    className="form-control"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="Enter unique employee ID"
                    disabled={isCapturing}
                />
            </div>

            <div className="form-group mb-3">
                <label htmlFor="employeeName" className="form-label">Employee Name</label>
                <input
                    type="text"
                    id="employeeName"
                    className="form-control"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    placeholder="Enter employee name"
                    disabled={isCapturing}
                />
            </div>
        </>
    );

    const renderOfficeHoursForm = () => (
        <div className="card mt-3">
            <div className="card-header bg-info text-white">
                <h6 className="mb-0">Office Hours</h6>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">Start Time</label>
                            <input
                                type="time"
                                className="form-control"
                                value={officeHours.start_time}
                                onChange={(e) => handleOfficeHoursChange('start_time', e.target.value)}
                                disabled={isCapturing}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">End Time</label>
                            <input
                                type="time"
                                className="form-control"
                                value={officeHours.end_time}
                                onChange={(e) => handleOfficeHoursChange('end_time', e.target.value)}
                                disabled={isCapturing}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderWorkHoursForm = () => (
        <div className="card mt-3">
            <div className="card-header bg-info text-white">
                <h6 className="mb-0">Work Hours</h6>
            </div>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">Required Hours</label>
                            <input
                                type="number"
                                className="form-control"
                                value={workHours.required_hours}
                                onChange={(e) => handleWorkHoursChange('required_hours', e.target.value)}
                                min="1"
                                max="24"
                                step="0.5"
                                disabled={isCapturing}
                            />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="form-group mb-3">
                            <label className="form-label">Break Hours</label>
                            <input
                                type="number"
                                className="form-control"
                                value={workHours.break_hours}
                                onChange={(e) => handleWorkHoursChange('break_hours', e.target.value)}
                                min="0"
                                max="5"
                                step="0.5"
                                disabled={isCapturing}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderVideoSection = () => (
        <div className="text-center">
            <h6 className="mb-3">Face Enrollment</h6>
            
            {/* Enrollment Method Selection */}
            <div className="mb-3">
                <div className="btn-group" role="group">
                    <button
                        type="button"
                        className={`btn ${enrollmentMethod === 'camera' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setEnrollmentMethod('camera')}
                        disabled={isCapturing || capturedVideo}
                    >
                        Use Camera
                    </button>
                    <button
                        type="button"
                        className={`btn ${enrollmentMethod === 'upload' ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setEnrollmentMethod('upload')}
                        disabled={isCapturing || capturedVideo}
                    >
                        Upload Video
                    </button>
                </div>
            </div>

            {enrollmentMethod === 'camera' ? renderCameraSection() : renderUploadSection()}
        </div>
    );

    const renderCameraSection = () => (
        <>
            <div className="alert alert-info mb-3">
                <small>
                    <strong>Important:</strong> Please ensure you're using HTTPS or localhost, and allow camera access when prompted.
                </small>
            </div>

            <video
                ref={videoRef}
                width="320"
                height="240"
                autoPlay
                muted
                playsInline
                style={{
                    display: (isCapturing || capturedVideo) ? 'inline-block' : 'none',
                    border: capturedVideo ? '2px solid #28a745' :
                        isCapturing ? '2px solid #007bff' : 'none',
                    borderRadius: '8px'
                }}
            />

            {!isCapturing && !capturedVideo && (
                <div className="video-placeholder">
                    Camera Feed Will Appear Here
                </div>
            )}

            {!isCapturing && !capturedVideo && (
                <div className="mt-3">
                    <button
                        className="btn btn-primary"
                        onClick={startCapture}
                        disabled={!employeeId || !employeeName}
                    >
                        Start Face Capture
                    </button>
                    {(!employeeId || !employeeName) && (
                        <div className="text-muted mt-2">
                            <small>Please fill in Employee ID and Name first</small>
                        </div>
                    )}
                </div>
            )}

            {isCapturing && (
                <div className="mt-3">
                    <div className="alert alert-info">
                        <strong>{steps[currentStep]}</strong>
                    </div>
                    <button
                        className="btn btn-success me-2"
                        onClick={nextStep}
                    >
                        Next Step
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={stopCapture}
                    >
                        Stop Capture
                    </button>
                </div>
            )}
        </>
    );

    const renderUploadSection = () => (
        <>
            <div className="mb-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    accept="video/*"
                    onChange={handleFileChange}
                    className="d-none"
                />
                <button
                    className="btn btn-secondary"
                    onClick={() => fileInputRef.current.click()}
                    disabled={capturedVideo}
                >
                    {selectedFile ? 'Change Video' : 'Select Video File'}
                </button>
                
                {selectedFile && (
                    <div className="mt-2">
                        <small>
                            Selected: {selectedFile.name} 
                            ({Math.round(selectedFile.size / 1024)} KB)
                        </small>
                    </div>
                )}
            </div>
            
            {capturedVideo && (
                <div className="mt-3">
                    <video
                        src={capturedVideo}
                        width="320"
                        height="240"
                        controls
                        style={{
                            border: '2px solid #28a745',
                            borderRadius: '8px'
                        }}
                    />
                </div>
            )}
            
            <div className="alert alert-warning mt-3">
                <small>
                    <strong>Requirements:</strong> 
                    <ul className="mb-0">
                        <li>Video should show face movements similar to camera capture</li>
                        <li>Supported formats: MP4, WebM, MOV</li>
                        <li>Max file size: 50MB</li>
                        <li>Duration: 10-30 seconds</li>
                    </ul>
                </small>
            </div>
        </>
    );

    const renderActionButtons = () => (
        capturedVideo && (
            <div className="mt-3">
                <div className="d-flex justify-content-center flex-wrap">
                    <button
                        className="btn btn-warning me-2 mb-2"
                        onClick={resetCapture}
                        disabled={isUploading || isSaving}
                    >
                        {enrollmentMethod === 'camera' ? 'Recapture' : 'Change Video'}
                    </button>

                    <button
                        className="btn btn-info me-2 mb-2"
                        onClick={uploadVideo}
                        disabled={isUploading || uploadedFilename || isSaving}
                    >
                        {isUploading ? 'Uploading...' : 'Upload Video'}
                    </button>

                    <button
                        className="btn btn-success mb-2"
                        onClick={saveEmployee}
                        disabled={!uploadedFilename || isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Save Employee'}
                    </button>
                </div>

                {uploadedFilename && (
                    <div className="alert alert-success mt-2">
                        Video uploaded: {uploadedFilename}
                    </div>
                )}
            </div>
        )
    );

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header bg-success text-white">
                            <h5 className="mb-0">Employee Enrollment</h5>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-6">
                                    {renderEmployeeForm()}
                                    {renderOfficeHoursForm()}
                                    {renderWorkHoursForm()}
                                </div>

                                <div className="col-md-6">
                                    {renderVideoSection()}
                                    {renderActionButtons()}
                                </div>
                            </div>

                            {enrollmentStatus && (
                                <div className={`alert mt-3 ${enrollmentStatus.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
                                    {enrollmentStatus}
                                </div>
                            )}
                        </div>
                    </div> 
                </div>
            </div>
            
            <style jsx>{`
                .video-placeholder {
                    width: 320px;
                    height: 240px;
                    display: inline-block;
                    border: 2px solid #ddd;
                    border-radius: 8px;
                    background-color: #f8f9fa;
                    line-height: 240px;
                    color: #6c757d;
                }
            `}</style>
        </div>
    );
};

export default EnrollmentPage;