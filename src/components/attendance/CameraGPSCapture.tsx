/**
 * Camera + GPS Capture Component
 * Captures selfie and GPS location for attendance marking
 */

'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, MapPin, Loader2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GPSCoordinates, PhotoCaptureResult, GPSCaptureResult } from '@/types/attendance';
import { getCurrentGPS, formatGPSCoordinates, isGPSAccuracyAcceptable } from '@/lib/attendance/geofence';

interface CameraGPSCaptureProps {
  onCapture: (photo: string, gps: GPSCoordinates, bypassGPSAccuracy?: boolean) => void;
  onError?: (error: string) => void;
  quality?: number; // 0.1 to 1.0
  maxSizeKB?: number;
  requireHighAccuracy?: boolean;
}

export function CameraGPSCapture({
  onCapture,
  onError,
  quality = 0.3,
  maxSizeKB = 30,
  requireHighAccuracy = true,
}: CameraGPSCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [gps, setGps] = useState<GPSCoordinates | null>(null);
  const [lowAccuracyGps, setLowAccuracyGps] = useState<GPSCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [showContinueAnyway, setShowContinueAnyway] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Start camera stream
   */
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null);
      
      // Request front camera (for selfie)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (err: any) {
      const message = err.name === 'NotAllowedError'
        ? 'Camera permission denied. Please enable camera access.'
        : 'Failed to access camera. Please check your device settings.';
      
      setCameraError(message);
      onError?.(message);
    }
  }, [onError]);

  /**
   * Stop camera stream
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  /**
   * Capture photo from video stream
   */
  const capturePhoto = useCallback(async (): Promise<PhotoCaptureResult> => {
    if (!videoRef.current || !canvasRef.current) {
      return { success: false, error: 'Camera not initialized' };
    }

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        return { success: false, error: 'Failed to get canvas context' };
      }

      // Resize to smaller dimensions for smaller file size
      // Max 400px width to keep under Google Sheets 50k character limit
      const maxWidth = 400;
      const maxHeight = 400;
      
      let width = video.videoWidth;
      let height = video.videoHeight;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw video frame to canvas (resized)
      context.drawImage(video, 0, 0, width, height);

      // Convert to base64 with aggressive compression
      let photoData = canvas.toDataURL('image/jpeg', quality);

      // Check size and compress further if needed (target < 30KB)
      let currentQuality = quality;
      while (photoData.length / 1024 > maxSizeKB && currentQuality > 0.05) {
        currentQuality -= 0.05;
        photoData = canvas.toDataURL('image/jpeg', currentQuality);
      }

      // Final check - if still too large, fail gracefully
      if (photoData.length > 45000) { // Leave margin for safety
        return { 
          success: false, 
          error: `Photo too large (${Math.round(photoData.length / 1024)}KB). Please ensure good lighting and try again.` 
        };
      }

      return {
        success: true,
        photo: photoData,
        metadata: {
          width: canvas.width,
          height: canvas.height,
          size: photoData.length,
          quality: currentQuality,
        },
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to capture photo' };
    }
  }, [quality, maxSizeKB]);

  /**
   * Capture GPS coordinates
   */
  const captureGPS = useCallback(async (): Promise<GPSCaptureResult> => {
    try {
      const coordinates = await getCurrentGPS();
      
      // Check accuracy if required
      // For testing, allow up to 500km accuracy
      const maxAccuracy = requireHighAccuracy ? 500000 : 5000000; // Very relaxed for testing
      
      if (coordinates.accuracy > maxAccuracy) {
        return {
          success: false,
          error: `GPS accuracy too low (±${Math.round(coordinates.accuracy)}m). Please try:\n• Move to a window or open area\n• Wait 30 seconds for GPS to stabilize\n• Enable "High Accuracy" in location settings\n• Or continue anyway (will be flagged for admin review)`,
          coordinates, // Return coordinates anyway
        };
      }

      return {
        success: true,
        coordinates,
      };
    } catch (err: any) {
      // Return a more helpful error message
      const errorMessage = err.message || 'Failed to get GPS location';
      return { 
        success: false, 
        error: errorMessage.includes('timed out') 
          ? `${errorMessage}\n\nTroubleshooting:\n• Refresh the page and try again\n• Check if location is enabled on your device\n• Try using a different browser (Chrome recommended)\n• Move closer to a window or outdoors`
          : errorMessage
      };
    }
  }, [requireHighAccuracy]);

  /**
   * Capture both photo and GPS
   */
  const handleCapture = useCallback(async () => {
    setIsCapturing(true);
    setError(null);
    setGpsError(null);
    setShowContinueAnyway(false);
    setLowAccuracyGps(null);

    try {
      // Capture photo
      const photoResult = await capturePhoto();
      if (!photoResult.success) {
        throw new Error(photoResult.error);
      }

      // Capture GPS
      const gpsResult = await captureGPS();
      if (!gpsResult.success) {
        setGpsError(gpsResult.error || 'GPS failed');
        
        // If we have coordinates but low accuracy, allow continue anyway
        if (gpsResult.coordinates) {
          setLowAccuracyGps(gpsResult.coordinates);
          setShowContinueAnyway(true);
          setPhoto(photoResult.photo!);
        }
        
        throw new Error(gpsResult.error);
      }

      // Success - store and callback
      setPhoto(photoResult.photo!);
      setGps(gpsResult.coordinates!);
      onCapture(photoResult.photo!, gpsResult.coordinates!);
      
      // Stop camera
      stopCamera();
    } catch (err: any) {
      const message = err.message || 'Failed to capture attendance data';
      if (!showContinueAnyway) {
        setError(message);
        onError?.(message);
      }
    } finally {
      setIsCapturing(false);
    }
  }, [capturePhoto, captureGPS, onCapture, stopCamera, onError]);

  /**
   * Continue with low accuracy GPS
   */
  const handleContinueAnyway = useCallback(() => {
    if (photo && lowAccuracyGps) {
      console.log('[CameraGPSCapture] Continue anyway with GPS:', {
        lat: lowAccuracyGps.latitude,
        lng: lowAccuracyGps.longitude,
        accuracy: lowAccuracyGps.accuracy,
        bypassGPSAccuracy: true
      });
      setGps(lowAccuracyGps);
      setGpsError(null);
      setShowContinueAnyway(false);
      onCapture(photo, lowAccuracyGps, true); // Pass true to bypass GPS accuracy check
      stopCamera();
    }
  }, [photo, lowAccuracyGps, onCapture, stopCamera]);

  /**
   * Retake photo
   */
  const handleRetake = useCallback(() => {
    setPhoto(null);
    setGps(null);
    setLowAccuracyGps(null);
    setError(null);
    setGpsError(null);
    setShowContinueAnyway(false);
    startCamera();
  }, [startCamera]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="w-5 h-5" />
            Capture Attendance
          </h3>
          {gps && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <MapPin className="w-4 h-4" />
              <span>GPS Locked</span>
            </div>
          )}
        </div>

        {/* Error Messages */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {cameraError && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>{cameraError}</AlertDescription>
          </Alert>
        )}

        {gpsError && (
          <Alert variant="destructive">
            <XCircle className="w-4 h-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p className="whitespace-pre-line">{gpsError}</p>
                {showContinueAnyway && lowAccuracyGps && (
                  <Button
                    onClick={handleContinueAnyway}
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full bg-white"
                  >
                    ⚠️ Continue Anyway (Will be flagged for admin review)
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Camera View or Preview */}
        <div className="relative aspect-[4/3] bg-gray-900 rounded-lg overflow-hidden">
          {!photo ? (
            <>
              {/* Live Camera Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              
              {/* Camera Guidelines */}
              {isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-80 border-4 border-white/50 rounded-full"></div>
                </div>
              )}

              {/* Instructions */}
              {!isCameraActive && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center space-y-4">
                    <Camera className="w-16 h-16 mx-auto opacity-50" />
                    <p className="text-lg">Position your face in the circle</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Photo Preview */}
              <img
                src={photo}
                alt="Captured photo"
                className="w-full h-full object-cover"
              />
              
              {/* Success Overlay */}
              {gps && (
                <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Captured</span>
                </div>
              )}
            </>
          )}

          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* GPS Info */}
        {gps && (
          <div className="bg-gray-50 rounded-lg p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4 text-green-600" />
              <span>Location Captured</span>
            </div>
            <p className="text-xs text-gray-600">
              {formatGPSCoordinates(gps)}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!photo ? (
            <>
              {!isCameraActive ? (
                <Button
                  onClick={startCamera}
                  className="flex-1"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Open Camera
                </Button>
              ) : (
                <Button
                  onClick={handleCapture}
                  disabled={isCapturing}
                  className="flex-1"
                  size="lg"
                >
                  {isCapturing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      Capture Photo
                    </>
                  )}
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={handleRetake}
              variant="outline"
              className="flex-1"
              size="lg"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retake
            </Button>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium text-blue-900">📸 Instructions:</p>
          <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
            <li>Ensure good lighting for clear photo</li>
            <li>Position face within the circle</li>
            <li>Photo will be compressed to ~30KB for storage</li>
            <li>Location must be within campus boundary</li>
            <li>Use front camera only (gallery upload disabled)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
