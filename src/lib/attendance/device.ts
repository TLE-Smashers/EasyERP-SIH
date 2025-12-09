/**
 * Device Fingerprinting Utility
 * Generate unique device identifier for attendance tracking
 */

import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { DeviceInfo } from '@/types/attendance';

/**
 * Get unique device fingerprint
 * Uses FingerprintJS for consistent device identification
 */
export async function getDeviceFingerprint(): Promise<string> {
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // Fallback to basic fingerprint
    return generateBasicFingerprint();
  }
}

/**
 * Fallback basic fingerprint (when FingerprintJS fails)
 */
function generateBasicFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  
  const canvasData = canvas.toDataURL();
  
  const data = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvasData,
  ].join('|');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  
  return Math.abs(hash).toString(36);
}

/**
 * Get complete device information
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const fingerprint = await getDeviceFingerprint();
  
  // Parse user agent
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';

  // Detect mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);

  return {
    fingerprint,
    userAgent: ua,
    platform: navigator.platform,
    browser,
    isMobile,
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}

/**
 * Compare two device fingerprints
 */
export function isSameDevice(fingerprint1: string, fingerprint2: string): boolean {
  return fingerprint1 === fingerprint2;
}

/**
 * Check if device is allowed (registered for this faculty)
 */
export function isDeviceAllowed(
  currentFingerprint: string,
  allowedFingerprints: string[]
): boolean {
  return allowedFingerprints.includes(currentFingerprint);
}

/**
 * Format device info for display
 */
export function formatDeviceInfo(device: DeviceInfo): string {
  return `${device.browser} on ${device.platform} (${device.isMobile ? 'Mobile' : 'Desktop'})`;
}
