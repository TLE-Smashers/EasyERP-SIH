/**
 * Geo-fencing Utilities
 * Calculate distances and check if location is within allowed boundaries
 */

import { GPSCoordinates, GeoFenceConfig, GeoFenceCheckResult } from '@/types/attendance';

/**
 * Calculate distance between two GPS coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  point1: { latitude: number; longitude: number },
  point2: { latitude: number; longitude: number }
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in meters

  return Math.round(distance * 10) / 10; // Round to 1 decimal
}

/**
 * Check if coordinates are within a geo-fence
 */
export function isWithinGeoFence(
  coordinates: GPSCoordinates,
  geoFence: GeoFenceConfig
): boolean {
  const distance = calculateDistance(
    { latitude: coordinates.latitude, longitude: coordinates.longitude },
    { latitude: geoFence.centerLat, longitude: geoFence.centerLng }
  );

  return distance <= geoFence.radiusMeters;
}

/**
 * Check coordinates against all active geo-fences
 * Returns the first matching geo-fence or null
 */
export function checkGeoFences(
  coordinates: GPSCoordinates,
  geoFences: GeoFenceConfig[]
): GeoFenceCheckResult {
  // Filter active geo-fences
  const activeGeoFences = geoFences.filter((gf) => gf.isActive);

  if (activeGeoFences.length === 0) {
    return {
      isWithinFence: false,
      distance: 0,
      error: 'No active geo-fences configured',
    };
  }

  // Check each geo-fence
  for (const geoFence of activeGeoFences) {
    const distance = calculateDistance(
      { latitude: coordinates.latitude, longitude: coordinates.longitude },
      { latitude: geoFence.centerLat, longitude: geoFence.centerLng }
    );

    if (distance <= geoFence.radiusMeters) {
      return {
        isWithinFence: true,
        geoFence,
        distance,
      };
    }
  }

  // Find nearest geo-fence for error message
  const nearest = activeGeoFences.reduce((prev, curr) => {
    const prevDist = calculateDistance(
      { latitude: coordinates.latitude, longitude: coordinates.longitude },
      { latitude: prev.centerLat, longitude: prev.centerLng }
    );
    const currDist = calculateDistance(
      { latitude: coordinates.latitude, longitude: coordinates.longitude },
      { latitude: curr.centerLat, longitude: curr.centerLng }
    );
    return currDist < prevDist ? curr : prev;
  });

  const nearestDistance = calculateDistance(
    { latitude: coordinates.latitude, longitude: coordinates.longitude },
    { latitude: nearest.centerLat, longitude: nearest.centerLng }
  );

  return {
    isWithinFence: false,
    geoFence: nearest,
    distance: nearestDistance,
    error: `Outside allowed area. Nearest: ${nearest.name} (${Math.round(nearestDistance)}m away, limit: ${nearest.radiusMeters}m)`,
  };
}

/**
 * Get current GPS coordinates from browser
 */
export async function getCurrentGPS(): Promise<GPSCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude || undefined,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let message = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please enable location access in browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable. Please check if location services are enabled on your device.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please ensure you have a clear view of the sky or try again.';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // Increased from 10s to 30s
        maximumAge: 5000, // Accept cached location up to 5s old
      }
    );
  });
}

/**
 * Validate GPS accuracy
 */
export function isGPSAccuracyAcceptable(
  coordinates: GPSCoordinates,
  requiredAccuracy: number = 50
): boolean {
  return coordinates.accuracy <= requiredAccuracy;
}

/**
 * Format GPS coordinates for display
 */
export function formatGPSCoordinates(coordinates: GPSCoordinates): string {
  return `${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)} (±${Math.round(coordinates.accuracy)}m)`;
}

/**
 * Generate Google Maps URL from coordinates
 */
export function getGoogleMapsUrl(coordinates: GPSCoordinates): string {
  return `https://www.google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`;
}

/**
 * Check if coordinates are suspiciously similar to previous location
 * (Helps detect GPS spoofing)
 */
export function isSuspiciousLocation(
  current: GPSCoordinates,
  previous: GPSCoordinates | null,
  maxSimilarityMeters: number = 5
): boolean {
  if (!previous) return false;

  const distance = calculateDistance(
    { latitude: current.latitude, longitude: current.longitude },
    { latitude: previous.latitude, longitude: previous.longitude }
  );

  // If distance is less than 5 meters and time diff is more than 1 hour, suspicious
  const timeDiff = current.timestamp - previous.timestamp;
  const hoursDiff = timeDiff / (1000 * 60 * 60);

  return distance < maxSimilarityMeters && hoursDiff > 1;
}
