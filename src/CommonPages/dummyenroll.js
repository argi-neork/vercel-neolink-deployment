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
//                 '/api/upload/video',
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
//         if (!employeeId || !employeeName || !uploadedFilename) {
//             alert('Please fill in all fields, capture face video, and upload it first');
//             return;
//         }

//         try {
//             setIsSaving(true);
//             setEnrollmentStatus('Saving employee...');

//             // Call enroll API
//             const enrollResponse = await axios.post(
//                 '/api/enroll/employee',
//                 {
//                     emp_id: employeeId,
//                     emp_name: employeeName,
//                     face_video: uploadedFilename
//                 }
//             );

//             setEnrollmentStatus('Employee enrolled successfully!');

//             // Reset form
//             setEmployeeId('');
//             setEmployeeName('');
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
//                                                     disabled={!employeeId || !employeeName}
//                                                 >
//                                                     Start Face Capture
//                                                 </button>
//                                                 {(!employeeId || !employeeName) && (
//                                                     <div className="text-muted mt-2">
//                                                         <small>Please fill in Employee ID and Name first</small>
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