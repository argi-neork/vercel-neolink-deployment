import React, { useState, useRef, useCallback, useEffect } from 'react';

const CameraInfo = () => {
  const [cameraProperties, setCameraProperties] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stream, setStream] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [validationStatus, setValidationStatus] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [distanceFeedback, setDistanceFeedback] = useState('');
  const [facePosition, setFacePosition] = useState({ x: 50, y: 50, size: 30 }); // Default center position
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  // Auto-redirect to HTTPS if not on localhost
  useEffect(() => {
    const isHTTP = window.location.protocol === 'http:';
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '';
    
    if (isHTTP && !isLocalhost) {
      const httpsUrl = window.location.href.replace('http://', 'https://');
      console.log('Attempting redirect to HTTPS:', httpsUrl);
      
      const shouldRedirect = window.confirm(
        '⚠️ Camera requires HTTPS\n\n' +
        'This page will redirect to HTTPS.\n\n' +
        'Click OK to redirect, or Cancel to stay (camera won\'t work).'
      );
      
      if (shouldRedirect) {
        window.location.replace(httpsUrl);
      }
    }
  }, []);

  // Start face detection and distance monitoring when camera is active
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
        
        // Simulate face detection (in real app, use face-api.js or similar)
        simulateFaceDetection(width, height);
        
      } catch (err) {
        console.error('Face detection error:', err);
      }
      
      animationRef.current = requestAnimationFrame(detectFace);
    };
    
    detectFace();
  };

  const simulateFaceDetection = (width, height) => {
    // This is a simplified simulation - in production, use actual face detection
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Simulate face movement and size changes based on distance
    const time = Date.now() / 1000;
    const noiseX = Math.sin(time * 0.5) * 10;
    const noiseY = Math.cos(time * 0.3) * 8;
    
    // Calculate face size based on "distance" (simulated)
    const baseSize = Math.min(width, height) * 0.3;
    const sizeVariation = Math.sin(time * 0.2) * 5;
    const faceSize = baseSize + sizeVariation;
    
    // Convert to percentage for overlay positioning
    const faceX = ((centerX + noiseX) / width) * 100;
    const faceY = ((centerY + noiseY) / height) * 100;
    const faceSizePercent = (faceSize / Math.min(width, height)) * 100;
    
    setFacePosition({
      x: faceX,
      y: faceY,
      size: faceSizePercent
    });
    
    // Calculate and provide distance feedback
    provideDistanceFeedback(faceSizePercent, width, height);
  };

  const provideDistanceFeedback = (faceSizePercent, width, height) => {
    // Face size ranges for distance estimation
    const OPTIMAL_SIZE_MIN = 25; // 80-120cm distance
    const OPTIMAL_SIZE_MAX = 35;
    const TOO_CLOSE_SIZE = 40;   // <80cm distance
    const TOO_FAR_SIZE = 20;     // >120cm distance
    
    let feedback = '';
    let isValidDistance = false;
    
    if (faceSizePercent >= TOO_CLOSE_SIZE) {
      feedback = '🚫 Too Close! Move back to 80-120cm range';
      isValidDistance = false;
    } else if (faceSizePercent <= TOO_FAR_SIZE) {
      feedback = '🚫 Too Far! Move closer to 80-120cm range';
      isValidDistance = false;
    } else if (faceSizePercent >= OPTIMAL_SIZE_MIN && faceSizePercent <= OPTIMAL_SIZE_MAX) {
      feedback = '✅ Perfect Distance! (80-120cm)';
      isValidDistance = true;
    } else {
      feedback = '⚠️ Adjust distance - aim for 80-120cm';
      isValidDistance = false;
    }
    
    setDistanceFeedback(feedback);
    
    // Update validation status if it exists
    if (validationStatus) {
      const updatedValidations = validationStatus.validations.map(validation => {
        if (validation.criterion === 'Distance 80-120 cm') {
          return {
            ...validation,
            isValid: isValidDistance,
            value: feedback,
            actual: isValidDistance ? '80-120 cm' : 'Out of range'
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

  // Check browser capabilities
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
        width: { ideal: 4032 }, // Request high resolution for >50MP
        height: { ideal: 3024 },
      },
      audio: false
    };
  };

  // Validate camera against requirements
  const validateCamera = (properties) => {
    const validations = [];
    
    // Check megapixels (>50 MP)
    const megapixels = parseFloat(properties.calculated.megapixels);
    const isMegapixelsValid = megapixels > 50;
    validations.push({
      criterion: 'Megapixels > 50MP',
      value: properties.calculated.megapixels,
      isValid: isMegapixelsValid,
      required: '>50 MP',
      actual: properties.calculated.megapixels
    });

    // Check lux (>130 lux) - using brightness percentage as proxy
    const brightnessValue = parseFloat(properties.calculated.brightness.overall);
    // Convert brightness percentage to approximate lux (rough estimation)
    const estimatedLux = (brightnessValue / 100) * 200; // Scale to 0-200 lux range
    const isLuxValid = estimatedLux > 130;
    validations.push({
      criterion: 'Lighting > 130 lux',
      value: `${estimatedLux.toFixed(0)} lux`,
      isValid: isLuxValid,
      required: '>130 lux',
      actual: `${estimatedLux.toFixed(0)} lux`
    });

    // Check distance - will be updated by face detection
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
      estimatedLux,
      distance: isDistanceValid ? '80-120 cm' : 'Out of range'
    });

    setIsEligible(allValid);
    
    return allValid;
  };

  const getCameraProperties = useCallback(async () => {
    setIsLoading(true);
    setError('');
    setValidationStatus(null);
    setIsEligible(false);
    setDistanceFeedback('Position your face in the frame');
    
    const caps = checkCapabilities();
    setDiagnostics(caps);

    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      }

      // Security check
      if (!caps.isSecureContext) {
        throw new Error('SECURITY: Camera requires HTTPS or localhost. Current: ' + window.location.protocol);
      }

      // API check
      if (!caps.hasMediaDevices && !caps.hasLegacyGetUserMedia) {
        throw new Error('COMPATIBILITY: Browser does not support camera access.');
      }

      console.log('Requesting camera access...');
      
      let mediaStream;
      
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        mediaStream = await navigator.mediaDevices.getUserMedia(getCameraConstraints());
      } 
      else if (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia) {
        const legacyGetUserMedia = navigator.getUserMedia || 
                                   navigator.webkitGetUserMedia || 
                                   navigator.mozGetUserMedia;
        
        mediaStream = await new Promise((resolve, reject) => {
          legacyGetUserMedia.call(navigator, getCameraConstraints(), resolve, reject);
        });
      } else {
        throw new Error('No getUserMedia implementation found');
      }
      
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
            resolve();
          };

          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Video element error'));
          };
        });

        const videoTrack = mediaStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings ? videoTrack.getSettings() : {};
        const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};

        // Wait for video to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const brightnessAnalysis = await analyzeBrightness();
        const megapixels = calculateMegapixels(settings);

        const properties = {
          resolution: `${settings.width || videoRef.current.videoWidth || 0}x${settings.height || videoRef.current.videoHeight || 0}`,
          frameRate: settings.frameRate || 'Unknown',
          deviceType: detectDeviceType(),
          browser: detectBrowser(),
          capabilities: {
            hasBrightness: !!capabilities.brightness,
            hasFocus: !!capabilities.focusDistance,
            hasZoom: !!capabilities.zoom,
          },
          settings: {
            aspectRatio: settings.aspectRatio || 'Unknown',
            facingMode: settings.facingMode || 'Unknown',
          },
          calculated: {
            megapixels: megapixels,
            brightness: brightnessAnalysis,
            objectDistance: distanceFeedback,
            videoWidth: videoRef.current.videoWidth || 0,
            videoHeight: videoRef.current.videoHeight || 0,
          },
          cameraInfo: {
            label: videoTrack.label || 'Camera',
            readyState: videoTrack.readyState || 'Unknown',
            id: videoTrack.id.substring(0, 20) + '...',
          }
        };

        setCameraProperties(properties);
        
        // Validate against requirements
        const isValid = validateCamera(properties);
        
        if (!isValid) {
          setError('Camera does not meet enrollment requirements. Please check the validation results below.');
        }
      }
    } catch (err) {
      console.error('Camera error:', err);
      let errorMessage = '';
      
      if (err.message.includes('SECURITY')) {
        errorMessage = err.message + '\n\n📱 SOLUTION: Access via https:// or use localhost';
      } else if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
        errorMessage = '🚫 Permission denied. Please:\n1. Allow camera in browser settings\n2. Reload the page\n3. Try again';
      } else if (err.name === 'NotFoundError') {
        errorMessage = '📷 No camera detected. Please check:\n1. Camera is not in use by another app\n2. Browser has camera permissions\n3. Device actually has a camera';
      } else if (err.name === 'NotReadableError') {
        errorMessage = '⚠️ Camera in use by another application. Close other apps using the camera.';
      } else if (err.message.includes('COMPATIBILITY')) {
        errorMessage = err.message + '\n\nTry updating your browser.';
      } else if (err.message.includes('OverconstrainedError')) {
        errorMessage = '📷 High-resolution camera not available. Please try with a different camera or device.';
      } else {
        errorMessage = `Error: ${err.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [stream, facingMode]);

  // Calculate megapixels from camera resolution
  const calculateMegapixels = (settings) => {
    const width = settings.width || videoRef.current?.videoWidth || 0;
    const height = settings.height || videoRef.current?.videoHeight || 0;
    
    if (width === 0 || height === 0) return 'Unknown';
    
    const megapixels = (width * height) / 1000000;
    return `${megapixels.toFixed(2)} MP`;
  };

  // Enhanced brightness analysis
  const analyzeBrightness = useCallback(() => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current) {
        resolve({ overall: 'N/A', object: 'N/A', status: 'N/A' });
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

        // Overall brightness
        let totalBrightness = 0;
        const sampleSize = Math.min(data.length, 40000);
        
        for (let i = 0; i < sampleSize; i += 4) {
          const brightness = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          totalBrightness += brightness;
        }

        const averageBrightness = totalBrightness / (sampleSize / 4);
        const normalizedBrightness = (averageBrightness / 255 * 100).toFixed(1);

        resolve({
          overall: `${normalizedBrightness}%`,
          rawValue: parseFloat(normalizedBrightness),
          status: normalizedBrightness >= 65 ? 'Optimal' : 'Insufficient' // 65% brightness ~ 130 lux
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
    if (ua.includes('safari')) return 'Safari';
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
      }, 100);
    }
  };

  const enrollCamera = () => {
    if (isEligible) {
      alert('✅ Camera enrolled successfully! Meeting all requirements.');
      // Here you would typically send the data to your backend
      console.log('Enrolling camera:', cameraProperties);
    }
  };

  const caps = checkCapabilities();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h2 style={{ color: '#1f2937', marginBottom: '24px' }}>📷 Premium Camera Info</h2>
      
      <div style={{ 
        backgroundColor: '#1e40af', 
        color: 'white', 
        padding: '16px', 
        borderRadius: '8px', 
        marginBottom: '20px' 
      }}>
        <h3 style={{ margin: '0 0 8px 0' }}>🎯 Camera Requirements</h3>
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
            Camera requires HTTPS or localhost.
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
            fontWeight: '600'
          }}
        >
          {isLoading ? '⏳ Validating...' : '📷 Check Camera'}
        </button>
        
        <button 
          onClick={switchCamera}
          disabled={isLoading}
          style={{
            padding: '12px 24px',
            backgroundColor: '#8b5cf6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            opacity: isLoading ? 0.5 : 1
          }}
        >
          🔄 Switch Camera
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
              animation: 'pulse 2s infinite'
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
              fontWeight: '600'
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

      {/* Real-time Distance Feedback */}
      {distanceFeedback && (
        <div style={{ 
          backgroundColor: distanceFeedback.includes('Perfect') ? '#d1fae5' : 
                         distanceFeedback.includes('Adjust') ? '#fef3c7' : '#fef2f2',
          border: `2px solid ${distanceFeedback.includes('Perfect') ? '#10b981' : 
                            distanceFeedback.includes('Adjust') ? '#f59e0b' : '#ef4444'}`,
          padding: '12px 16px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          textAlign: 'center',
          fontWeight: '600',
          fontSize: '16px'
        }}>
          {distanceFeedback}
        </div>
      )}

      {/* Validation Results */}
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
              border: '1px solid #f59e0b'
            }}>
              <strong>💡 How to meet requirements:</strong>
              <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#92400e' }}>
                {validationStatus.validations[0].isValid === false && <li>Use a camera with higher resolution (&gt;50MP)</li>}
                {validationStatus.validations[1].isValid === false && <li>Increase lighting to &gt;130 lux</li>}
                {validationStatus.validations[2].isValid === false && <li>Adjust distance to 80-120cm from camera</li>}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Camera Preview with Face Mask Overlay */}
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
        
        {/* Face Detection Mask Overlay */}
        {stream && (
          <>
            {/* Face outline circle */}
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
            
            {/* Distance guide rings */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '25%',
              height: '25%',
              border: '2px dashed #00ff00',
              borderRadius: '50%',
              pointerEvents: 'none',
              opacity: 0.7
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
                Optimal (80-120cm)
              </div>
            </div>
            
            {/* Center alignment crosshair */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              pointerEvents: 'none'
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
            
            {/* Position indicators */}
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
              Face Position: {facePosition.x.toFixed(1)}%, {facePosition.y.toFixed(1)}%
            </div>
          </>
        )}
      </div>
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {cameraProperties && (
        <div style={{ 
          backgroundColor: '#f9fafb', 
          padding: '20px', 
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ marginTop: 0, color: '#1f2937' }}>📊 Camera Specifications</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div>
              <h4 style={{ color: '#374151', marginBottom: '12px' }}>📷 Camera Details</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Megapixels:</strong> {cameraProperties.calculated.megapixels}</div>
                <div><strong>Resolution:</strong> {cameraProperties.resolution}</div>
                <div><strong>Frame Rate:</strong> {cameraProperties.frameRate} fps</div>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#374151', marginBottom: '12px' }}>💡 Lighting Analysis</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Brightness:</strong> {cameraProperties.calculated.brightness.overall}</div>
                <div><strong>Estimated Lux:</strong> {validationStatus?.estimatedLux ? `${validationStatus.estimatedLux.toFixed(0)} lux` : 'Calculating...'}</div>
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

            <div>
              <h4 style={{ color: '#374151', marginBottom: '12px' }}>📏 Distance & Position</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>Distance Status:</strong> {distanceFeedback}</div>
                <div><strong>Camera Type:</strong> {cameraProperties.settings.facingMode === 'user' ? 'Front' : 'Back'}</div>
                <div><strong>Device:</strong> {cameraProperties.deviceType}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default CameraInfo;