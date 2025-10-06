// import React, { useState, useRef, useCallback, useEffect } from 'react';

// const CustomMessageBox = ({ message, onClose }) => {
//   if (!message) return null;

//   const getStyle = (type) => {
//     switch (type) {
//       case 'success':
//         return { backgroundColor: '#d1fae5', borderColor: '#10b981', color: '#065f46' };
//       case 'error':
//         return { backgroundColor: '#fef2f2', borderColor: '#ef4444', color: '#dc2626' };
//       default:
//         return { backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' };
//     }
//   };

//   const style = getStyle(message.type);

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       display: 'flex',
//       alignItems: 'center',
//       justifyContent: 'center',
//       zIndex: 1000,
//     }}>
//       <div style={{
//         ...style,
//         padding: '25px',
//         borderRadius: '12px',
//         maxWidth: '400px',
//         width: '90%',
//         boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
//         borderWidth: '3px',
//         borderStyle: 'solid',
//         textAlign: 'center'
//       }}>
//         <h3 style={{ marginTop: 0 }}>{message.title}</h3>
//         <p style={{ whiteSpace: 'pre-line' }}>{message.message}</p>
//         <button
//           onClick={onClose}
//           style={{
//             padding: '10px 20px',
//             backgroundColor: style.color,
//             color: 'white',
//             border: 'none',
//             borderRadius: '6px',
//             cursor: 'pointer',
//             marginTop: '15px'
//           }}
//         >
//           Close
//         </button>
//       </div>
//     </div>
//   );
// };


// const CameraEnrollment = () => {
//   const [cameraProperties, setCameraProperties] = useState(null);
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [stream, setStream] = useState(null);
//   const [diagnostics, setDiagnostics] = useState(null);
//   const [facingMode, setFacingMode] = useState('user');
//   const [validationStatus, setValidationStatus] = useState(null);
//   const [isEligible, setIsEligible] = useState(false);
//   const [distanceFeedback, setDistanceFeedback] = useState('');
//   const [facePosition, setFacePosition] = useState({ x: 50, y: 50, size: 30 }); // Default center position
//   const [systemMessage, setSystemMessage] = useState(null); // Custom Message Box State

//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const animationRef = useRef(null);

//   // NOTE: Removed HTTPS redirect check as it relies on window.confirm() and can break the sandbox.

//   // Start face detection and distance monitoring when camera is active
//   useEffect(() => {
//     if (stream && videoRef.current) {
//       startFaceDetection();
//     }

//     return () => {
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//     };
//   }, [stream]);

//   const startFaceDetection = () => {
//     const detectFace = () => {
//       if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
//         animationRef.current = requestAnimationFrame(detectFace);
//         return;
//       }

//       try {
//         const video = videoRef.current;
//         const canvas = canvasRef.current;
//         const context = canvas.getContext('2d');

//         // Set canvas to video size for accurate context access
//         const width = video.videoWidth || 640;
//         const height = video.videoHeight || 480;

//         canvas.width = width;
//         canvas.height = height;

//         context.drawImage(video, 0, 0, width, height);

//         // Simulate face detection
//         simulateFaceDetection(width, height);

//       } catch (err) {
//         console.error('Face detection error:', err);
//       }

//       animationRef.current = requestAnimationFrame(detectFace);
//     };

//     detectFace();
//   };

//   const simulateFaceDetection = (width, height) => {
//     // This is a simplified simulation for face position and distance
//     const centerX = width / 2;
//     const centerY = height / 2;

//     // Simulate slight movement
//     const time = Date.now() / 1000;
//     const noiseX = Math.sin(time * 0.5) * 15;
//     const noiseY = Math.cos(time * 0.3) * 10;

//     // Simulate face size changes based on "distance" (critical for user feedback)
//     // Size changes sinusoidally to cycle through Too Close/Optimal/Too Far
//     const baseSize = Math.min(width, height) * 0.3;
//     const sizeVariation = Math.sin(time * 0.4) * (baseSize * 0.4); // Max size variation 40% of base
//     const faceSize = baseSize + sizeVariation;

//     // Convert to percentage for overlay positioning
//     const faceX = ((centerX + noiseX) / width) * 100;
//     const faceY = ((centerY + noiseY) / height) * 100;
//     const faceSizePercent = (faceSize / Math.min(width, height)) * 100;

//     setFacePosition({
//       x: faceX,
//       y: faceY,
//       size: faceSizePercent
//     });

//     // Calculate and provide distance feedback
//     provideDistanceFeedback(faceSizePercent, width, height);
//   };

//   const provideDistanceFeedback = (faceSizePercent, width, height) => {
//     // Face size ranges for distance estimation
//     const OPTIMAL_SIZE_MIN = 25; // 80-120cm distance: face should occupy 25-35% of the video's minimum dimension
//     const OPTIMAL_SIZE_MAX = 35;
//     const TOO_CLOSE_SIZE = 40;   // > 40%
//     const TOO_FAR_SIZE = 20;     // < 20%

//     let feedback = '';
//     let isValidDistance = false;

//     if (faceSizePercent >= TOO_CLOSE_SIZE) {
//       feedback = '🚫 Too Close! Move back slightly.';
//       isValidDistance = false;
//     } else if (faceSizePercent <= TOO_FAR_SIZE) {
//       feedback = '🚫 Too Far! Move closer slightly.';
//       isValidDistance = false;
//     } else if (faceSizePercent >= OPTIMAL_SIZE_MIN && faceSizePercent <= OPTIMAL_SIZE_MAX) {
//       feedback = '✅ Perfect Distance! (80-120cm)';
//       isValidDistance = true;
//     } else if (faceSizePercent > OPTIMAL_SIZE_MAX) {
//       feedback = '⚠️ Still too close. Move back to fit the green ring.';
//       isValidDistance = false;
//     } else if (faceSizePercent < OPTIMAL_SIZE_MIN) {
//       feedback = '⚠️ Still too far. Move closer to fill the green ring.';
//       isValidDistance = false;
//     }

//     setDistanceFeedback(feedback);

//     // Update validation status if it exists
//     if (validationStatus) {
//       const updatedValidations = validationStatus.validations.map(validation => {
//         if (validation.criterion === 'Distance 80-120 cm') {
//           return {
//             ...validation,
//             isValid: isValidDistance,
//             value: feedback,
//             actual: isValidDistance ? '80-120 cm' : faceSizePercent.toFixed(1) + '% (Out of range)'
//           };
//         }
//         return validation;
//       });

//       const allValid = updatedValidations.every(v => v.isValid);

//       setValidationStatus(prev => ({
//         ...prev,
//         validations: updatedValidations,
//         allValid
//       }));

//       setIsEligible(allValid);
//     }
//   };

//   // Check browser capabilities
//   const checkCapabilities = () => {
//     const isHTTPS = window.location.protocol === 'https:';
//     const isLocalhost = window.location.hostname === 'localhost' || 
//                         window.location.hostname === '127.0.0.1';
//     const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
//     const hasLegacyGetUserMedia = !!(navigator.getUserMedia || 
//                                      navigator.webkitGetUserMedia || 
//                                      navigator.mozGetUserMedia);

//     return {
//       isHTTPS,
//       isLocalhost,
//       isSecureContext: isHTTPS || isLocalhost,
//       hasMediaDevices,
//       hasLegacyGetUserMedia,
//       hasAnyCamera: hasMediaDevices || hasLegacyGetUserMedia,
//       userAgent: navigator.userAgent,
//     };
//   };

//   const getCameraConstraints = () => {
//     // Requesting a high ideal resolution to check camera capacity
//     return {
//       video: {
//         facingMode: facingMode,
//         width: { ideal: 4032 }, 
//         height: { ideal: 3024 },
//       },
//       audio: false
//     };
//   };

//   // Validate camera against requirements
//   const validateCamera = (properties) => {
//     const validations = [];

//     // 1. Check megapixels (>2 MP) - CHANGED from >50 MP
//     const megapixels = parseFloat(properties.calculated.megapixels);
//     const isMegapixelsValid = megapixels > 2; 
//     validations.push({
//       criterion: 'Megapixels > 2MP',
//       value: properties.calculated.megapixels,
//       isValid: isMegapixelsValid,
//       required: '>2 MP',
//       actual: properties.calculated.megapixels
//     });

//     // 2. Check lux (>130 lux) - using brightness percentage as proxy
//     const brightnessValue = parseFloat(properties.calculated.brightness.rawValue);
//     // 65% normalized brightness is a good proxy for sufficient light
//     const isLuxValid = brightnessValue >= 65; 
//     validations.push({
//       criterion: 'Lighting > 130 lux (65% brightness)',
//       value: `${properties.calculated.brightness.overall}`,
//       isValid: isLuxValid,
//       required: '>65% Brightness',
//       actual: properties.calculated.brightness.overall
//     });

//     // 3. Check distance - will be updated by face detection (initialize to false)
//     const isDistanceValid = distanceFeedback.includes('Perfect Distance');
//     validations.push({
//       criterion: 'Distance 80-120 cm',
//       value: distanceFeedback,
//       isValid: isDistanceValid,
//       required: '80-120 cm',
//       actual: isDistanceValid ? '80-120 cm' : 'Adjusting...'
//     });

//     const allValid = validations.every(v => v.isValid);

//     setValidationStatus({
//       validations,
//       allValid,
//       megapixels,
//       estimatedLux: isLuxValid ? '>130 lux' : 'Insufficient',
//       distance: isDistanceValid ? '80-120 cm' : 'Out of range'
//     });

//     setIsEligible(allValid);

//     return allValid;
//   };

//   const getCameraProperties = useCallback(async () => {
//     // Clear previous states
//     setIsLoading(true);
//     setError('');
//     setSystemMessage(null);
//     setValidationStatus(null);
//     setIsEligible(false);
//     setDistanceFeedback('Position your face in the frame');

//     const caps = checkCapabilities();
//     setDiagnostics(caps);

//     try {
//       // Stop existing stream
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//         if (animationRef.current) {
//           cancelAnimationFrame(animationRef.current);
//         }
//       }
//       setStream(null);

//       // Security check
//       if (!caps.isSecureContext) {
//         throw new Error('SECURITY: Camera requires HTTPS or localhost. Current: ' + window.location.protocol);
//       }

//       // API check
//       if (!caps.hasAnyCamera) {
//         throw new Error('COMPATIBILITY: Browser does not support camera access.');
//       }

//       console.log('Requesting camera access...');

//       const mediaStream = await navigator.mediaDevices.getUserMedia(getCameraConstraints());

//       console.log('Camera access granted');
//       setStream(mediaStream);

//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;

//         await new Promise((resolve, reject) => {
//           const timeout = setTimeout(() => {
//             reject(new Error('Video loading timeout'));
//           }, 10000);

//           videoRef.current.onloadedmetadata = () => {
//             clearTimeout(timeout);
//             videoRef.current.play(); // Ensure video starts playing
//             resolve();
//           };

//           videoRef.current.onerror = () => {
//             clearTimeout(timeout);
//             reject(new Error('Video element error'));
//           };
//         });

//         const videoTrack = mediaStream.getVideoTracks()[0];
//         const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};

//         // Wait for video to stabilize and light analysis
//         await new Promise(resolve => setTimeout(resolve, 1000));

//         const brightnessAnalysis = await analyzeBrightness();
//         const megapixels = calculateMegapixels(settings);

//         const properties = {
//           resolution: `${settings.width || videoRef.current.videoWidth || 0}x${settings.height || videoRef.current.videoHeight || 0}`,
//           frameRate: settings.frameRate || 'Unknown',
//           deviceType: detectDeviceType(),
//           browser: detectBrowser(),
//           settings: {
//             facingMode: settings.facingMode || 'Unknown',
//           },
//           calculated: {
//             megapixels: megapixels,
//             brightness: brightnessAnalysis,
//             videoWidth: videoRef.current.videoWidth || 0,
//             videoHeight: videoRef.current.videoHeight || 0,
//           },
//         };

//         setCameraProperties(properties);

//         // Validate against requirements
//         const isValid = validateCamera(properties);

//         if (!isValid) {
//           setError('Camera does not meet enrollment requirements. Please check the validation results below.');
//         }
//       }
//     } catch (err) {
//       console.error('Camera error:', err);
//       let errorMessage = '';

//       if (err.message.includes('SECURITY')) {
//         errorMessage = err.message + '\n\nSOLUTION: Access via https:// or use localhost';
//       } else if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
//         errorMessage = '🚫 Permission denied. Please:\n1. Allow camera in browser settings\n2. Reload the page\n3. Try again';
//       } else if (err.name === 'NotFoundError') {
//         errorMessage = '📷 No camera detected. Please check:\n1. Camera is not in use by another app\n2. Browser has camera permissions\n3. Device actually has a camera';
//       } else if (err.name === 'NotReadableError') {
//         errorMessage = '⚠️ Camera in use by another application. Close other apps using the camera.';
//       } else if (err.name === 'OverconstrainedError') {
//         errorMessage = '📷 Requested camera features not available. Trying lower resolution might help.';
//       } else {
//         errorMessage = `Error: ${err.message}`;
//       }

//       setError(errorMessage);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [stream, facingMode, distanceFeedback]);

//   // Calculate megapixels from camera resolution
//   const calculateMegapixels = (settings) => {
//     const width = settings.width || videoRef.current?.videoWidth || 0;
//     const height = settings.height || videoRef.current?.videoHeight || 0;

//     if (width === 0 || height === 0) return 'Unknown';

//     const megapixels = (width * height) / 1000000;
//     return `${megapixels.toFixed(2)} MP`;
//   };

//   // Enhanced brightness analysis
//   const analyzeBrightness = useCallback(() => {
//     return new Promise((resolve) => {
//       if (!videoRef.current || !canvasRef.current) {
//         resolve({ overall: 'N/A', rawValue: 0, status: 'N/A' });
//         return;
//       }

//       try {
//         const video = videoRef.current;
//         const canvas = canvasRef.current;
//         const context = canvas.getContext('2d');

//         const width = video.videoWidth || 640;
//         const height = video.videoHeight || 480;

//         canvas.width = width;
//         canvas.height = height;

//         context.drawImage(video, 0, 0, width, height);
//         const imageData = context.getImageData(0, 0, width, height);
//         const data = imageData.data;

//         // Overall brightness
//         let totalBrightness = 0;
//         const totalPixels = width * height;

//         // Sample every 4th pixel to speed up calculation
//         for (let i = 0; i < data.length; i += 16) { 
//           // RGB (skip Alpha)
//           const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
//           totalBrightness += brightness;
//         }

//         const pixelsSampled = data.length / 16;
//         const averageBrightness = totalBrightness / pixelsSampled;
//         const normalizedBrightness = (averageBrightness / 255 * 100).toFixed(1);
//         const rawValue = parseFloat(normalizedBrightness);

//         resolve({
//           overall: `${normalizedBrightness}%`,
//           rawValue: rawValue,
//           status: rawValue >= 65 ? 'Optimal' : 'Insufficient' 
//         });
//       } catch (err) {
//         resolve({ overall: 'Error', rawValue: 0, status: 'Error' });
//       }
//     });
//   }, []);

//   const detectDeviceType = () => {
//     const ua = navigator.userAgent.toLowerCase();
//     if (/android/.test(ua)) return 'Android';
//     if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
//     return 'Desktop';
//   };

//   const detectBrowser = () => {
//     const ua = navigator.userAgent.toLowerCase();
//     if (ua.includes('edg')) return 'Edge';
//     if (ua.includes('chrome')) return 'Chrome';
//     if (ua.includes('firefox')) return 'Firefox';
//     if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
//     if (ua.includes('samsung')) return 'Samsung Internet';
//     return 'Unknown';
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       setStream(null);
//       setCameraProperties(null);
//       setValidationStatus(null);
//       setIsEligible(false);
//       setDistanceFeedback('');
//       if (animationRef.current) {
//         cancelAnimationFrame(animationRef.current);
//       }
//     }
//   };

//   const switchCamera = async () => {
//     const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
//     setFacingMode(newFacingMode);

//     if (stream) {
//       // Stop old stream, then restart capture after a brief pause
//       stopCamera();
//       // Use a timeout to ensure stream resources are fully released before requesting a new one
//       setTimeout(() => {
//         getCameraProperties();
//       }, 500); 
//     }
//   };

//   const enrollCamera = () => {
//     if (isEligible) {
//       // Replaced alert() with CustomMessageBox
//       setSystemMessage({ 
//         type: 'success', 
//         title: 'Enrollment Successful!', 
//         message: 'Your camera meets all premium requirements and has been successfully enrolled.' 
//       });
//       // Here you would typically send the data to your backend
//       console.log('Enrolling camera:', cameraProperties);
//     }
//   };

//   const handleCloseMessage = () => setSystemMessage(null);

//   const caps = checkCapabilities();

//   return (
//     <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
//       <CustomMessageBox message={systemMessage} onClose={handleCloseMessage} />

//       <h2 style={{ color: '#1f2937', marginBottom: '24px' }}> Camera Enrollment</h2>

//       <div style={{ 
//         backgroundColor: '#1e40af', 
//         color: 'white', 
//         padding: '16px', 
//         borderRadius: '8px', 
//         marginBottom: '20px' 
//       }}>
//         <h3 style={{ margin: '0 0 8px 0' }}>🎯 Enrollment Requirements</h3>
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
//           {/* UPDATED REQUIREMENT to >2 MP */}
//           <div>✅ <strong>Megapixels:</strong> &gt;2 MP</div> 
//           <div>✅ <strong>Lighting:</strong> &gt;130 lux</div>
//           <div>✅ <strong>Distance:</strong> 1m ±20cm (80-120cm)</div>
//         </div>
//       </div>

//       {!caps.isSecureContext && (
//         <div style={{ 
//           backgroundColor: '#fef2f2', 
//           border: '2px solid #ef4444', 
//           padding: '16px', 
//           borderRadius: '8px', 
//           marginBottom: '20px' 
//         }}>
//           <strong style={{ color: '#dc2626' }}>⚠️ SECURITY ISSUE</strong>
//           <p style={{ margin: '8px 0', color: '#991b1b' }}>
//             Camera access is blocked when not using HTTPS or localhost. This may prevent the app from functioning.
//           </p>
//         </div>
//       )}

//       <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
//         <button 
//           onClick={getCameraProperties}
//           disabled={isLoading}
//           style={{
//             padding: '12px 24px',
//             backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
//             color: 'white',
//             border: 'none',
//             borderRadius: '8px',
//             cursor: isLoading ? 'not-allowed' : 'pointer',
//             fontSize: '16px',
//             fontWeight: '600',
//             transition: 'background-color 0.2s'
//           }}
//         >
//           {isLoading ? '⏳ Validating...' : (stream ? '🔄 Re-Check Eligibility' : '📷 Check Eligibility')}
//         </button>

//         <button 
//           onClick={switchCamera}
//           disabled={!stream || isLoading}
//           style={{
//             padding: '12px 24px',
//             backgroundColor: '#8b5cf6',
//             color: 'white',
//             border: 'none',
//             borderRadius: '8px',
//             cursor: (!stream || isLoading) ? 'not-allowed' : 'pointer',
//             fontSize: '16px',
//             fontWeight: '600',
//             opacity: (!stream || isLoading) ? 0.5 : 1,
//             transition: 'opacity 0.2s'
//           }}
//         >
//           🔄 Switch Camera ({facingMode === 'user' ? 'Front' : 'Back'})
//         </button>

//         {isEligible && (
//           <button 
//             onClick={enrollCamera}
//             style={{
//               padding: '12px 24px',
//               backgroundColor: '#10b981',
//               color: 'white',
//               border: 'none',
//               borderRadius: '8px',
//               cursor: 'pointer',
//               fontSize: '16px',
//               fontWeight: '600',
//               animation: 'pulse 2s infinite',
//               transition: 'background-color 0.2s'
//             }}
//           >
//             ✅ Enroll Camera
//           </button>
//         )}

//         {stream && (
//           <button 
//             onClick={stopCamera}
//             style={{
//               padding: '12px 24px',
//               backgroundColor: '#ef4444',
//               color: 'white',
//               border: 'none',
//               borderRadius: '8px',
//               cursor: 'pointer',
//               fontSize: '16px',
//               fontWeight: '600',
//               transition: 'background-color 0.2s'
//             }}
//           >
//             ⏹️ Stop Camera
//           </button>
//         )}
//       </div>

//       {error && (
//         <div style={{ 
//           backgroundColor: '#fef2f2', 
//           border: '1px solid #fecaca', 
//           padding: '16px', 
//           borderRadius: '8px', 
//           marginBottom: '20px',
//           whiteSpace: 'pre-line'
//         }}>
//           <strong style={{ color: '#dc2626' }}>Error:</strong>
//           <p style={{ margin: '8px 0', color: '#991b1b' }}>{error}</p>
//         </div>
//       )}

//       {/* Camera Preview with Face Mask Overlay - Moved UP for better visibility */}
//       <div style={{ 
//         backgroundColor: '#000', 
//         borderRadius: '8px', 
//         overflow: 'hidden', 
//         marginBottom: '20px',
//         aspectRatio: '16/9',
//         position: 'relative'
//       }}>
//         <video 
//           ref={videoRef}
//           autoPlay 
//           playsInline
//           muted
//           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
//         />

//         {/* Face Detection Mask Overlay */}
//         {stream && (
//           <>
//             {/* Face outline circle */}
//             <div style={{
//               position: 'absolute',
//               top: `${facePosition.y}%`,
//               left: `${facePosition.x}%`,
//               transform: 'translate(-50%, -50%)',
//               width: `${facePosition.size}%`,
//               height: `${facePosition.size}%`,
//               border: `3px solid ${distanceFeedback.includes('Perfect') ? '#00ff00' : '#ff0000'}`,
//               borderRadius: '50%',
//               pointerEvents: 'none',
//               boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
//               transition: 'all 0.3s ease'
//             }} />

//             {/* Distance guide ring (OPTIMAL SIZE - 30% of height/width min) */}
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               width: '30%', /* Optimal max size (35%) is slightly larger */
//               height: '30%',
//               border: '2px dashed #00ff00',
//               borderRadius: '50%',
//               pointerEvents: 'none',
//               opacity: 0.7,
//               zIndex: 10
//             }}>
//               <div style={{
//                 position: 'absolute',
//                 top: '-30px',
//                 left: '50%',
//                 transform: 'translateX(-50%)',
//                 color: '#00ff00',
//                 fontSize: '12px',
//                 backgroundColor: 'rgba(0,0,0,0.7)',
//                 padding: '2px 8px',
//                 borderRadius: '4px',
//                 whiteSpace: 'nowrap'
//               }}>
//                 Target Ring
//               </div>
//             </div>

//             {/* Center alignment crosshair */}
//             <div style={{
//               position: 'absolute',
//               top: '50%',
//               left: '50%',
//               transform: 'translate(-50%, -50%)',
//               width: '20px',
//               height: '20px',
//               pointerEvents: 'none',
//               zIndex: 9
//             }}>
//               <div style={{
//                 position: 'absolute',
//                 top: '50%',
//                 left: '0',
//                 right: '0',
//                 height: '2px',
//                 backgroundColor: 'rgba(255, 255, 255, 0.5)',
//                 transform: 'translateY(-50%)'
//               }} />
//               <div style={{
//                 position: 'absolute',
//                 left: '50%',
//                 top: '0',
//                 bottom: '0',
//                 width: '2px',
//                 backgroundColor: 'rgba(255, 255, 255, 0.5)',
//                 transform: 'translateX(-50%)'
//               }} />
//             </div>

//             {/* Distance Feedback Display INSIDE Camera Frame */}
//             <div style={{
//               position: 'absolute',
//               top: '10px',
//               left: '50%',
//               transform: 'translateX(-50%)',
//               color: distanceFeedback.includes('Perfect') ? '#00ff00' : 
//                      distanceFeedback.includes('Too') ? '#ff0000' : '#ffff00',
//               fontSize: '16px',
//               fontWeight: '700',
//               backgroundColor: 'rgba(0,0,0,0.7)',
//               padding: '8px 16px',
//               borderRadius: '8px',
//               textAlign: 'center',
//               zIndex: 11,
//               border: `2px solid ${distanceFeedback.includes('Perfect') ? '#00ff00' : 
//                               distanceFeedback.includes('Too') ? '#ff0000' : '#ffff00'}`,
//               whiteSpace: 'nowrap'
//             }}>
//               {distanceFeedback}
//             </div>

//             {/* Debug/Position indicators */}
//             <div style={{
//               position: 'absolute',
//               bottom: '10px',
//               left: '10px',
//               color: 'white',
//               fontSize: '12px',
//               backgroundColor: 'rgba(0,0,0,0.7)',
//               padding: '4px 8px',
//               borderRadius: '4px'
//             }}>
//               Face Size: {facePosition.size.toFixed(1)}% | Cam: {facingMode === 'user' ? 'Front' : 'Back'}
//             </div>
//           </>
//         )}

//         {!stream && (
//           <div style={{
//             position: 'absolute',
//             top: 0,
//             left: 0,
//             right: 0,
//             bottom: 0,
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             color: 'white',
//             fontSize: '18px',
//             backgroundColor: 'rgba(0,0,0,0.7)'
//           }}>
//             Click "Check Eligibility" to start camera
//           </div>
//         )}
//       </div>

//       <canvas ref={canvasRef} style={{ display: 'none' }} />

//       {/* Real-time Distance Feedback - MOVED BELOW CAMERA */}
//       {distanceFeedback && (
//         <div style={{ 
//           backgroundColor: distanceFeedback.includes('Perfect') ? '#d1fae5' : 
//                           distanceFeedback.includes('Too') ? '#fef2f2' : '#fef3c7',
//           border: `2px solid ${distanceFeedback.includes('Perfect') ? '#10b981' : 
//                             distanceFeedback.includes('Too') ? '#ef4444' : '#f59e0b'}`,
//           padding: '12px 16px', 
//           borderRadius: '8px', 
//           marginBottom: '20px',
//           textAlign: 'center',
//           fontWeight: '700',
//           fontSize: '18px',
//           color: distanceFeedback.includes('Perfect') ? '#065f46' : 
//                  distanceFeedback.includes('Too') ? '#991b1b' : '#92400e',
//         }}>
//           {distanceFeedback}
//         </div>
//       )}

//       {/* Validation Results - MOVED TO BOTTOM for better flow */}
//       {validationStatus && (
//         <div style={{ 
//           backgroundColor: isEligible ? '#d1fae5' : '#fef3c7',
//           border: `2px solid ${isEligible ? '#10b981' : '#f59e0b'}`,
//           padding: '20px', 
//           borderRadius: '8px', 
//           marginBottom: '20px'
//         }}>
//           <h3 style={{ 
//             color: isEligible ? '#065f46' : '#92400e',
//             marginTop: 0,
//             display: 'flex',
//             alignItems: 'center',
//             gap: '8px'
//           }}>
//             {isEligible ? '✅ ELIGIBLE FOR ENROLLMENT' : '⚠️ REQUIREMENTS NOT MET'}
//           </h3>

//           <div style={{ display: 'grid', gap: '12px' }}>
//             {validationStatus.validations.map((validation, index) => (
//               <div key={index} style={{
//                 display: 'flex',
//                 justifyContent: 'space-between',
//                 alignItems: 'center',
//                 padding: '12px',
//                 backgroundColor: 'white',
//                 borderRadius: '6px',
//                 border: `1px solid ${validation.isValid ? '#d1fae5' : '#fecaca'}`
//               }}>
//                 <div>
//                   <strong>{validation.criterion}</strong>
//                   <div style={{ fontSize: '14px', color: '#6b7280' }}>
//                     Required: {validation.required} | Actual: {validation.actual}
//                   </div>
//                 </div>
//                 <div style={{
//                   color: validation.isValid ? '#10b981' : '#ef4444',
//                   fontWeight: 'bold',
//                   fontSize: '18px'
//                 }}>
//                   {validation.isValid ? '✅' : '❌'}
//                 </div>
//               </div>
//             ))}
//           </div>

//           {!isEligible && (
//             <div style={{ 
//               marginTop: '16px', 
//               padding: '12px', 
//               backgroundColor: '#fef3c7',
//               borderRadius: '6px',
//               // border: '1px solid #f59e0b'
//             }}>
//               <strong>💡 How to meet requirements:</strong>
//               <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#92400e' }}>
//                 {validationStatus.validations[0].isValid === false && <li>Use a camera with higher resolution (&gt;2MP)</li>}
//                 {validationStatus.validations[1].isValid === false && <li>Increase lighting to &gt;130 lux (or 65% brightness)</li>}
//                 {validationStatus.validations[2].isValid === false && <li>Adjust distance to 80-120cm from camera (follow the feedback above)</li>}
//               </ul>
//             </div>
//           )}
//         </div>
//       )}

//       {cameraProperties && (
//         <div style={{ 
//           backgroundColor: '#f9fafb', 
//           padding: '20px', 
//           borderRadius: '8px',
//           // border: '1px solid '#e5e7eb'
//         }}>
//           <h3 style={{ marginTop: 0, color: '#1f2937' }}>📊 Camera Specifications</h3>

//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
//             <div>
//               <h4 style={{ color: '#374151', marginBottom: '12px' }}>📷 Camera Details</h4>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
//                 <div><strong>Megapixels:</strong> {cameraProperties.calculated.megapixels}</div>
//                 <div><strong>Resolution:</strong> {cameraProperties.resolution}</div>
//                 <div><strong>Frame Rate:</strong> {cameraProperties.frameRate} fps</div>
//               </div>
//             </div>

//             <div>
//               <h4 style={{ color: '#374151', marginBottom: '12px' }}>💡 Lighting Analysis</h4>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
//                 <div><strong>Brightness:</strong> {cameraProperties.calculated.brightness.overall}</div>
//                 <div><strong>Required:</strong> {validationStatus?.validations[1]?.required || 'N/A'}</div>
//                 <div><strong>Status:</strong> 
//                   <span style={{
//                     color: cameraProperties.calculated.brightness.status === 'Optimal' ? '#059669' : '#dc2626',
//                     fontWeight: '600',
//                     marginLeft: '8px'
//                   }}>
//                     {cameraProperties.calculated.brightness.status}
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <style jsx>{`
//         @keyframes pulse {
//           0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
//           70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
//           100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
//         }

//         button:hover {
//           filter: brightness(1.1);
//         }

//         button:active {
//           transform: translateY(1px);
//         }

//         /* Apply pulse animation only to the enroll button when eligible */
//         button:nth-child(3)[style*="animation: pulse"] {
//             animation: pulse 2s infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CameraEnrollment;


import React, { useState, useRef, useCallback, useEffect } from 'react';

const CustomMessageBox = ({ message, onClose }) => {
  if (!message) return null;

  const getStyle = (type) => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#d1fae5', borderColor: '#10b981', color: '#065f46' };
      case 'error':
        return { backgroundColor: '#fef2f2', borderColor: '#ef4444', color: '#dc2626' };
      default:
        return { backgroundColor: '#fef3c7', borderColor: '#f59e0b', color: '#92400e' };
    }
  };

  const style = getStyle(message.type);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        ...style,
        padding: '25px',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        borderWidth: '3px',
        borderStyle: 'solid',
        textAlign: 'center'
      }}>
        <h3 style={{ marginTop: 0 }}>{message.title}</h3>
        <p style={{ whiteSpace: 'pre-line' }}>{message.message}</p>
        <button
          onClick={onClose}
          style={{
            padding: '10px 20px',
            backgroundColor: style.color,
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginTop: '15px'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const CameraEnrollment = () => {
  const [cameraProperties, setCameraProperties] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [validationStatus, setValidationStatus] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [distanceFeedback, setDistanceFeedback] = useState('');
  const [facePosition, setFacePosition] = useState({ x: 50, y: 50, size: 30 });
  const [systemMessage, setSystemMessage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Start face detection when camera is active
  useEffect(() => {
    if (stream && videoRef.current) {
      startFaceDetection();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stream]);

  const startFaceDetection = () => {
    const detectFace = () => {
      if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        animationRef.current = requestAnimationFrame(detectFace);
        return;
      }

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        canvas.width = width;
        canvas.height = height;

        context.drawImage(video, 0, 0, width, height);
        simulateFaceDetection(width, height);

      } catch (err) {
        console.error('Face detection error:', err);
      }

      animationRef.current = requestAnimationFrame(detectFace);
    };

    detectFace();
  };

  const simulateFaceDetection = (width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;

    const time = Date.now() / 1000;
    const noiseX = Math.sin(time * 0.5) * 15;
    const noiseY = Math.cos(time * 0.3) * 10;

    const baseSize = Math.min(width, height) * 0.3;
    const sizeVariation = Math.sin(time * 0.4) * (baseSize * 0.4);
    const faceSize = baseSize + sizeVariation;

    const faceX = ((centerX + noiseX) / width) * 100;
    const faceY = ((centerY + noiseY) / height) * 100;
    const faceSizePercent = (faceSize / Math.min(width, height)) * 100;

    setFacePosition({
      x: faceX,
      y: faceY,
      size: faceSizePercent
    });

    provideDistanceFeedback(faceSizePercent, width, height);
  };

  const provideDistanceFeedback = (faceSizePercent, width, height) => {
    const OPTIMAL_SIZE_MIN = 25;
    const OPTIMAL_SIZE_MAX = 35;
    const TOO_CLOSE_SIZE = 40;
    const TOO_FAR_SIZE = 20;

    let feedback = '';
    let isValidDistance = false;

    if (faceSizePercent >= TOO_CLOSE_SIZE) {
      feedback = '🚫 Too Close! Move back slightly.';
      isValidDistance = false;
    } else if (faceSizePercent <= TOO_FAR_SIZE) {
      feedback = '🚫 Too Far! Move closer slightly.';
      isValidDistance = false;
    } else if (faceSizePercent >= OPTIMAL_SIZE_MIN && faceSizePercent <= OPTIMAL_SIZE_MAX) {
      feedback = '✅ Perfect Distance! (80-120cm)';
      isValidDistance = true;
    } else if (faceSizePercent > OPTIMAL_SIZE_MAX) {
      feedback = '⚠️ Still too close. Move back to fit the green ring.';
      isValidDistance = false;
    } else if (faceSizePercent < OPTIMAL_SIZE_MIN) {
      feedback = '⚠️ Still too far. Move closer to fill the green ring.';
      isValidDistance = false;
    }

    setDistanceFeedback(feedback);

    if (validationStatus) {
      const updatedValidations = validationStatus.validations.map(validation => {
        if (validation.criterion === 'Distance 80-120 cm') {
          return {
            ...validation,
            isValid: isValidDistance,
            value: feedback,
            actual: isValidDistance ? '80-120 cm' : faceSizePercent.toFixed(1) + '% (Out of range)'
          };
        }
        return validation;
      });

      const allValid = updatedValidations.every(v => v.isValid);

      setValidationStatus(prev => ({
        ...prev,
        validations: updatedValidations,
        allValid
      }));

      setIsEligible(allValid);
    }
  };

  const checkCapabilities = () => {
    const isHTTPS = window.location.protocol === 'https:';
    const isLocalhost = window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasLegacyGetUserMedia = !!(navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia);

    return {
      isHTTPS,
      isLocalhost,
      isSecureContext: isHTTPS || isLocalhost,
      hasMediaDevices,
      hasLegacyGetUserMedia,
      hasAnyCamera: hasMediaDevices || hasLegacyGetUserMedia,
      userAgent: navigator.userAgent,
    };
  };

  const getCameraConstraints = () => {
    return {
      video: {
        facingMode: facingMode,
        width: { ideal: 4032 },
        height: { ideal: 3024 },
      },
      audio: false
    };
  };

  const validateCamera = (properties) => {
    const validations = [];

    // CHANGED BACK to >50 MP
    const megapixels = parseFloat(properties.calculated.megapixels);
    const isMegapixelsValid = megapixels > 50;
    validations.push({
      criterion: 'Megapixels > 50MP', // CHANGED
      value: properties.calculated.megapixels,
      isValid: isMegapixelsValid,
      required: '>50 MP', // CHANGED
      actual: properties.calculated.megapixels
    });

    const brightnessValue = parseFloat(properties.calculated.brightness.rawValue);
    const isLuxValid = brightnessValue >= 65;
    validations.push({
      criterion: 'Lighting > 130 lux (65% brightness)',
      value: `${properties.calculated.brightness.overall}`,
      isValid: isLuxValid,
      required: '>65% Brightness',
      actual: properties.calculated.brightness.overall
    });

    const isDistanceValid = distanceFeedback.includes('Perfect Distance');
    validations.push({
      criterion: 'Distance 80-120 cm',
      value: distanceFeedback,
      isValid: isDistanceValid,
      required: '80-120 cm',
      actual: isDistanceValid ? '80-120 cm' : 'Adjusting...'
    });

    const allValid = validations.every(v => v.isValid);

    setValidationStatus({
      validations,
      allValid,
      megapixels,
      estimatedLux: isLuxValid ? '>130 lux' : 'Insufficient',
      distance: isDistanceValid ? '80-120 cm' : 'Out of range'
    });

    setIsEligible(allValid);

    return allValid;
  };

  const getCameraProperties = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setSystemMessage(null);
    setValidationStatus(null);
    setIsEligible(false);
    setDistanceFeedback('Position your face in the frame');

    const caps = checkCapabilities();
    setDiagnostics(caps);

    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }
      setStream(null);

      if (!caps.isSecureContext) {
        throw new Error('SECURITY: Camera requires HTTPS or localhost. Current: ' + window.location.protocol);
      }

      if (!caps.hasAnyCamera) {
        throw new Error('COMPATIBILITY: Browser does not support camera access.');
      }

      console.log('Requesting camera access...');

      const mediaStream = await navigator.mediaDevices.getUserMedia(getCameraConstraints());

      console.log('Camera access granted');
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video loading timeout'));
          }, 10000);

          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            videoRef.current.play();
            resolve();
          };

          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Video element error'));
          };
        });

        const videoTrack = mediaStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};

        await new Promise(resolve => setTimeout(resolve, 1000));

        const brightnessAnalysis = await analyzeBrightness();
        const megapixels = calculateMegapixels(settings);

        const properties = {
          resolution: `${settings.width || videoRef.current.videoWidth || 0}x${settings.height || videoRef.current.videoHeight || 0}`,
          frameRate: settings.frameRate || 'Unknown',
          deviceType: detectDeviceType(),
          browser: detectBrowser(),
          settings: {
            facingMode: settings.facingMode || 'Unknown',
          },
          calculated: {
            megapixels: megapixels,
            brightness: brightnessAnalysis,
            videoWidth: videoRef.current.videoWidth || 0,
            videoHeight: videoRef.current.videoHeight || 0,
          },
        };

        setCameraProperties(properties);

        const isValid = validateCamera(properties);

        if (!isValid) {
          setError('Camera does not meet enrollment requirements. Please check the validation results below.');
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = '';

      if (err.message.includes('SECURITY')) {
        errorMessage = err.message + '\n\nSOLUTION: Access via https:// or use localhost';
      } else if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
        errorMessage = '🚫 Permission denied. Please:\n1. Allow camera in browser settings\n2. Reload the page\n3. Try again';
      } else if (err.name === 'NotFoundError') {
        errorMessage = '📷 No camera detected. Please check:\n1. Camera is not in use by another app\n2. Browser has camera permissions\n3. Device actually has a camera';
      } else if (err.name === 'NotReadableError') {
        errorMessage = '⚠️ Camera in use by another application. Close other apps using the camera.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = '📷 Requested camera features not available. Trying lower resolution might help.';
      } else {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [stream, facingMode, distanceFeedback]);

  const calculateMegapixels = (settings) => {
    const width = settings.width || videoRef.current?.videoWidth || 0;
    const height = settings.height || videoRef.current?.videoHeight || 0;

    if (width === 0 || height === 0) return 'Unknown';

    const megapixels = (width * height) / 1000000;
    return `${megapixels.toFixed(2)} MP`;
  };

  const analyzeBrightness = useCallback(() => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) {
        resolve({ overall: 'N/A', rawValue: 0, status: 'N/A' });
        return;
      }

      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        canvas.width = width;
        canvas.height = height;

        context.drawImage(video, 0, 0, width, height);
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;

        let totalBrightness = 0;

        for (let i = 0; i < data.length; i += 16) {
          const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          totalBrightness += brightness;
        }

        const pixelsSampled = data.length / 16;
        const averageBrightness = totalBrightness / pixelsSampled;
        const normalizedBrightness = (averageBrightness / 255 * 100).toFixed(1);
        const rawValue = parseFloat(normalizedBrightness);

        resolve({
          overall: `${normalizedBrightness}%`,
          rawValue: rawValue,
          status: rawValue >= 65 ? 'Optimal' : 'Insufficient'
        });
      } catch (err) {
        resolve({ overall: 'Error', rawValue: 0, status: 'Error' });
      }
    });
  }, []);

  const detectDeviceType = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (/android/.test(ua)) return 'Android';
    if (/iphone|ipad|ipod/.test(ua)) return 'iOS';
    return 'Desktop';
  };

  const detectBrowser = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('edg')) return 'Edge';
    if (ua.includes('chrome')) return 'Chrome';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('samsung')) return 'Samsung Internet';
    return 'Unknown';
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setCameraProperties(null);
      setValidationStatus(null);
      setIsEligible(false);
      setDistanceFeedback('');
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    if (stream) {
      stopCamera();
      setTimeout(() => {
        getCameraProperties();
      }, 500);
    }
  };

  const enrollCamera = () => {
    if (isEligible) {
      setSystemMessage({
        type: 'success',
        title: 'Enrollment Successful!',
        message: 'Your camera meets all premium requirements and has been successfully enrolled.'
      });
      console.log('Enrolling camera:', cameraProperties);
    }
  };

  const handleCloseMessage = () => setSystemMessage(null);

  const caps = checkCapabilities();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <CustomMessageBox message={systemMessage} onClose={handleCloseMessage} />

      <h2 style={{ color: '#1f2937', marginBottom: '24px' }}>📷 Premium Camera Enrollment</h2>

      {/* CHANGED REQUIREMENTS BACK to >50 MP */}
      <div style={{
        backgroundColor: '#1e40af',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>🎯 Enrollment Requirements</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
          <div>✅ <strong>Megapixels:</strong> &gt;50 MP</div>
          <div>✅ <strong>Lighting:</strong> &gt;130 lux</div>
          <div>✅ <strong>Distance:</strong> 1m ±20cm (80-120cm)</div>
        </div>
      </div>

      {!caps.isSecureContext && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '2px solid #ef4444',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong style={{ color: '#dc2626' }}>⚠️ SECURITY ISSUE</strong>
          <p style={{ margin: '8px 0', color: '#991b1b' }}>
            Camera access is blocked when not using HTTPS or localhost. This may prevent the app from functioning.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={getCameraProperties}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: isLoading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'background-color 0.2s'
          }}
        >
          {isLoading ? '⏳ Validating...' : (stream ? '🔄 Re-Check Eligibility' : '📷 Check Eligibility')}
        </button>

        <button
          onClick={switchCamera}
          disabled={!stream || isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: (!stream || isLoading) ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            opacity: (!stream || isLoading) ? 0.5 : 1,
            transition: 'opacity 0.2s'
          }}
        >
          🔄 Switch Camera ({facingMode === 'user' ? 'Front' : 'Back'})
        </button>

        {isEligible && (
          <button
            onClick={enrollCamera}
            style={{
              padding: '12px 24px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              animation: 'pulse 2s infinite',
              transition: 'background-color 0.2s'
            }}
          >
            ✅ Enroll Camera
          </button>
        )}

        {stream && (
          <button
            onClick={stopCamera}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'background-color 0.2s'
            }}
          >
            ⏹️ Stop Camera
          </button>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          whiteSpace: 'pre-line'
        }}>
          <strong style={{ color: '#dc2626' }}>Error:</strong>
          <p style={{ margin: '8px 0', color: '#991b1b' }}>{error}</p>
        </div>
      )}

      <div style={{
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '20px',
        aspectRatio: '16/9',
        position: 'relative'
      }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {stream && (
          <>
            <div style={{
              position: 'absolute',
              top: `${facePosition.y}%`,
              left: `${facePosition.x}%`,
              transform: 'translate(-50%, -50%)',
              width: `${facePosition.size}%`,
              height: `${facePosition.size}%`,
              border: `3px solid ${distanceFeedback.includes('Perfect') ? '#00ff00' : '#ff0000'}`,
              borderRadius: '50%',
              pointerEvents: 'none',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.3)',
              transition: 'all 0.3s ease'
            }} />

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '30%',
              height: '30%',
              border: '2px dashed #00ff00',
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: 0.7,
              zIndex: 10
            }}>
              <div style={{
                position: 'absolute',
                top: '-30px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: '#00ff00',
                fontSize: '12px',
                backgroundColor: 'rgba(0,0,0,0.7)',
                padding: '2px 8px',
                borderRadius: '4px',
                whiteSpace: 'nowrap'
              }}>
                Target Ring
              </div>
            </div>

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              pointerEvents: 'none',
              zIndex: 9
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '0',
                right: '0',
                height: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateY(-50%)'
              }} />
              <div style={{
                position: 'absolute',
                left: '50%',
                top: '0',
                bottom: '0',
                width: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                transform: 'translateX(-50%)'
              }} />
            </div>

            <div style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: distanceFeedback.includes('Perfect') ? '#00ff00' :
                distanceFeedback.includes('Too') ? '#ff0000' : '#ffff00',
              fontSize: '16px',
              fontWeight: '700',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '8px 16px',
              borderRadius: '8px',
              textAlign: 'center',
              zIndex: 11,
              border: `2px solid ${distanceFeedback.includes('Perfect') ? '#00ff00' :
                distanceFeedback.includes('Too') ? '#ff0000' : '#ffff00'}`,
              whiteSpace: 'nowrap'
            }}>
              {distanceFeedback}
            </div>

            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '10px',
              color: 'white',
              fontSize: '12px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              Face Size: {facePosition.size.toFixed(1)}% | Cam: {facingMode === 'user' ? 'Front' : 'Back'}
            </div>
          </>
        )}

        {!stream && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '18px',
            backgroundColor: 'rgba(0,0,0,0.7)'
          }}>
            Click "Check Eligibility" to start camera
          </div>
        )}
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {distanceFeedback && (
        <div style={{
          backgroundColor: distanceFeedback.includes('Perfect') ? '#d1fae5' :
            distanceFeedback.includes('Too') ? '#fef2f2' : '#fef3c7',
          border: `2px solid ${distanceFeedback.includes('Perfect') ? '#10b981' :
            distanceFeedback.includes('Too') ? '#ef4444' : '#f59e0b'}`,
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '700',
          fontSize: '18px',
          color: distanceFeedback.includes('Perfect') ? '#065f46' :
            distanceFeedback.includes('Too') ? '#991b1b' : '#92400e',
        }}>
          {distanceFeedback}
        </div>
      )}

      {validationStatus && (
        <div style={{
          backgroundColor: isEligible ? '#d1fae5' : '#fef3c7',
          border: `2px solid ${isEligible ? '#10b981' : '#f59e0b'}`,
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <h3 style={{
            color: isEligible ? '#065f46' : '#92400e',
            marginTop: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {isEligible ? '✅ ELIGIBLE FOR ENROLLMENT' : '⚠️ REQUIREMENTS NOT MET'}
          </h3>

          <div style={{ display: 'grid', gap: '12px' }}>
            {validationStatus.validations.map((validation, index) => (
              <div key={index} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                backgroundColor: 'white',
                borderRadius: '6px',
                border: `1px solid ${validation.isValid ? '#d1fae5' : '#fecaca'}`
              }}>
                <div>
                  <strong>{validation.criterion}</strong>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    Required: {validation.required} | Actual: {validation.actual}
                  </div>
                </div>
                <div style={{
                  color: validation.isValid ? '#10b981' : '#ef4444',
                  fontWeight: 'bold',
                  fontSize: '18px'
                }}>
                  {validation.isValid ? '✅' : '❌'}
                </div>
              </div>
            ))}
          </div>

          {!isEligible && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: '#fef3c7',
              borderRadius: '6px',
            }}>
              <strong>💡 How to meet requirements:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#92400e' }}>
                {/* CHANGED BACK to >50MP */}
                {validationStatus.validations[0].isValid === false && <li>Use a camera with higher resolution (&gt;50MP)</li>}
                {validationStatus.validations[1].isValid === false && <li>Increase lighting to &gt;130 lux (or 65% brightness)</li>}
                {validationStatus.validations[2].isValid === false && <li>Adjust distance to 80-120cm from camera (follow the feedback above)</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {cameraProperties && (
        <div style={{
          backgroundColor: '#f9fafb',
          padding: '20px',
          borderRadius: '8px',
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>📊 Camera Specifications</h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#374151', marginBottom: '12px' }}>📷 Camera Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div><strong>Megapixels:</strong> {cameraProperties.calculated.megapixels}</div>
                <div><strong>Resolution:</strong> {cameraProperties.resolution}</div>
                <div><strong>Frame Rate:</strong> {cameraProperties.frameRate} fps</div>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#374151', marginBottom: '12px' }}>💡 Lighting Analysis</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                <div><strong>Brightness:</strong> {cameraProperties.calculated.brightness.overall}</div>
                <div><strong>Required:</strong> {validationStatus?.validations[1]?.required || 'N/A'}</div>
                <div><strong>Status:</strong>
                  <span style={{
                    color: cameraProperties.calculated.brightness.status === 'Optimal' ? '#059669' : '#dc2626',
                    fontWeight: '600',
                    marginLeft: '8px'
                  }}>
                    {cameraProperties.calculated.brightness.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        
        button:hover {
          filter: brightness(1.1);
        }
        
        button:active {
          transform: translateY(1px);
        }

        button:nth-child(3)[style*="animation: pulse"] {
            animation: pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default CameraEnrollment;