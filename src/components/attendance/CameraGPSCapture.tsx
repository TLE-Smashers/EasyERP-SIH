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
  onCapture: (photo: string, gps: GPSCoordinates) => void;
  onError?: (error: string) => void;
  quality?: number; // 0.1 to 1.0
  maxSizeKB?: number;
  requireHighAccuracy?: boolean;
}

export function CameraGPSCapture({
  onCapture,
  onError,
  quality = 0.8,
  maxSizeKB = 500,
  requireHighAccuracy = true,
}: CameraGPSCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [gps, setGps] = useState<GPSCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  
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

      // Set canvas size to video size
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to base64 with compression
      let photoData = canvas.toDataURL('image/jpeg', quality);

      // Check size and compress further if needed
      let currentQuality = quality;
      while (photoData.length / 1024 > maxSizeKB && currentQuality > 0.1) {
        currentQuality -= 0.1;
        photoData = canvas.toDataURL('image/jpeg', currentQuality);
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
      if (requireHighAccuracy && !isGPSAccuracyAcceptable(coordinates)) {
        return {
          success: false,
          error: `GPS accuracy too low (±${Math.round(coordinates.accuracy)}m). Please move to an open area.`,
        };
      }

      return {
        success: true,
        coordinates,
      };
    } catch (err: any) {
      return { success: false, error: err.message || 'Failed to get GPS location' };
    }
  }, [requireHighAccuracy]);

  /**
   * Capture both photo and GPS
   */
  const handleCapture = useCallback(async () => {
    setIsCapturing(true);
    setError(null);
    setGpsError(null);

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
      setError(message);
      onError?.(message);
    } finally {
      setIsCapturing(false);
    }
  }, [capturePhoto, captureGPS, onCapture, onError, stopCamera]);

  /**
   * Retake photo
   */
  const handleRetake = useCallback(() => {
    setPhoto(null);
    setGps(null);
    setError(null);
    setGpsError(null);
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
            <AlertDescription>{gpsError}</AlertDescription>
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
            <li>Location must be within campus boundary</li>
            <li>Use front camera only (gallery upload disabled)</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
