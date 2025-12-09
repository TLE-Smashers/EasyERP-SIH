/**
 * Server Action - Mark Faculty Attendance
 * Photo + GPS based attendance with comprehensive validation
 */

'use server';

import { 
  GPSCoordinates, 
  DeviceInfo, 
  GeoFenceConfig, 
  AttendanceFlag,
  AttendanceStatus,
  FacultyAttendanceRecord 
} from '@/types/attendance';
import {
  checkGeoFences,
  isGPSAccuracyAcceptable,
  isSuspiciousLocation,
} from '@/lib/attendance/geofence';
import { isSameDevice } from '@/lib/attendance/device';
import { uploadPhotoToDrive, generatePhotoFileName } from '@/lib/google/drive.attendance';
import { markAttendance as saveAttendanceRecord, fetchAttendanceByDate, updateAttendanceByRow, checkAttendanceExists } from '@/lib/google/sheets.attendance';

interface MarkAttendanceRequest {
  facultyId: string;
  facultyName: string;
  employeeId: string;
  department: string;
  type: 'check_in' | 'check_out';
  photo: string; // Base64
  gps: GPSCoordinates;
  device: DeviceInfo;
  bypassGPSAccuracy?: boolean; // Allow low accuracy GPS (user clicked "Continue Anyway")
}

interface MarkAttendanceResponse {
  success: boolean;
  message: string;
  data?: {
    attendanceId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    checkOutTime?: string;
    totalHours?: number;
    isWithinGeoFence: boolean;
    flags: AttendanceFlag[];
  };
  error?: string;
}

/**
 * Get geo-fence configuration from environment
 */
function getGeoFences(): GeoFenceConfig[] {
  try {
    const geoFencesJson = process.env.GEOFENCES;
    if (geoFencesJson) {
      return JSON.parse(geoFencesJson);
    }
    
    // Fallback to single geo-fence from individual env vars
    return [{
      id: 'main_campus',
      name: process.env.CAMPUS_NAME || 'Main Campus',
      centerLat: parseFloat(process.env.CAMPUS_CENTER_LAT || '0'),
      centerLng: parseFloat(process.env.CAMPUS_CENTER_LNG || '0'),
      radiusMeters: parseInt(process.env.CAMPUS_RADIUS_METERS || '100'),
      isActive: true,
    }];
  } catch (error) {
    console.error('[Attendance] Error parsing geo-fences:', error);
    return [];
  }
}

/**
 * Check if current time is within allowed window
 */
function isWithinTimeWindow(type: 'check_in' | 'check_out'): { 
  isValid: boolean; 
  message: string;
  isLate?: boolean;
  lateByMinutes?: number;
} {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  
  if (type === 'check_in') {
    const startTime = process.env.CHECKIN_START_TIME || '09:00';
    const endTime = process.env.CHECKIN_END_TIME || '10:00';
    const graceMinutes = parseInt(process.env.CHECKIN_GRACE_MINUTES || '15');
    
    const lateThresholdMinutes = parseInt(process.env.LATE_THRESHOLD_MINUTES || '15');
    
    // Calculate if late
    const [startHour, startMin] = startTime.split(':').map(Number);
    const startDate = new Date(now);
    startDate.setHours(startHour, startMin, 0, 0);
    
    const diffMs = now.getTime() - startDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    const isLate = diffMinutes > lateThresholdMinutes;
    
    if (currentTime < startTime || currentTime > endTime) {
      return {
        isValid: false,
        message: `Check-in allowed only between ${startTime} - ${endTime}. Current time: ${currentTime}`,
      };
    }
    
    return {
      isValid: true,
      message: 'Within check-in window',
      isLate,
      lateByMinutes: isLate ? diffMinutes : 0,
    };
  } else {
    const startTime = process.env.CHECKOUT_START_TIME || '15:00';
    const endTime = process.env.CHECKOUT_END_TIME || '16:00';
    
    if (currentTime < startTime || currentTime > endTime) {
      return {
        isValid: false,
        message: `Check-out allowed only between ${startTime} - ${endTime}. Current time: ${currentTime}`,
      };
    }
    
    return {
      isValid: true,
      message: 'Within check-out window',
    };
  }
}

/**
 * Calculate total working hours
 */
function calculateTotalHours(checkInTime: string, checkOutTime: string): number {
  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const diffMs = checkOut.getTime() - checkIn.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100; // Round to 2 decimals
}

/**
 * Determine attendance status
 */
function determineStatus(
  isLate: boolean,
  totalHours?: number
): AttendanceStatus {
  if (totalHours !== undefined) {
    const halfDayThreshold = parseInt(process.env.HALFDAY_THRESHOLD_HOURS || '4');
    const fullDayMin = parseInt(process.env.FULLDAY_MIN_HOURS || '6');
    
    if (totalHours < halfDayThreshold) {
      return 'half_day';
    } else if (totalHours >= fullDayMin) {
      return isLate ? 'late' : 'present';
    }
  }
  
  return isLate ? 'late' : 'present';
}

/**
 * Main function to mark attendance
 */
export async function markAttendance(
  request: MarkAttendanceRequest
): Promise<MarkAttendanceResponse> {
  try {
    console.log(`[Attendance] Mark ${request.type} for ${request.facultyId}`);
    
    const { facultyId, facultyName, employeeId, department, type, photo, gps, device, bypassGPSAccuracy } = request;
    const flags: AttendanceFlag[] = [];
    
    // 1. Validate GPS accuracy
    const requiredAccuracy = parseInt(process.env.MIN_GPS_ACCURACY_METERS || '500000');
    if (!isGPSAccuracyAcceptable(gps, requiredAccuracy)) {
      // If user clicked "Continue Anyway", allow it but flag for review
      if (bypassGPSAccuracy) {
        flags.push('low_gps_accuracy');
        console.log(`[Attendance] Low GPS accuracy bypassed by user (±${Math.round(gps.accuracy)}m)`);
      } else {
        return {
          success: false,
          message: '',
          error: `GPS accuracy too low (±${Math.round(gps.accuracy)}m). Required: ±${requiredAccuracy}m. Please move to an area with better signal or use "Continue Anyway" option.`,
        };
      }
    }
    
    // 2. Check geo-fence
    const geoFences = getGeoFences();
    console.log('[Attendance] Checking geofences:', { 
      gpsLat: gps.latitude, 
      gpsLng: gps.longitude,
      geoFencesCount: geoFences.length,
      geoFences: geoFences.map(gf => ({ name: gf.name, centerLat: gf.centerLat, centerLng: gf.centerLng, radius: gf.radiusMeters }))
    });
    const geoFenceCheck = checkGeoFences(gps, geoFences);
    console.log('[Attendance] Geofence check result:', geoFenceCheck);
    
    if (!geoFenceCheck.isWithin) {
      flags.push('outside_geofence');
      return {
        success: false,
        message: '',
        error: geoFenceCheck.message,
      };
    }
    
    // 3. Check time window
    const timeCheck = isWithinTimeWindow(type);
    if (!timeCheck.isValid) {
      flags.push('outside_time_window');
      return {
        success: false,
        message: '',
        error: timeCheck.message,
      };
    }
    
    // 4. Upload photo to Google Drive
    console.log('[Attendance] Uploading photo to Drive...');
    const photoType = type === 'check_in' ? 'checkin' : 'checkout';
    const photoFileName = generatePhotoFileName(facultyId, photoType);
    const photoUpload = await uploadPhotoToDrive(photo, photoFileName);
    
    if (!photoUpload.success) {
      return {
        success: false,
        message: '',
        error: photoUpload.error || 'Failed to upload photo',
      };
    }
    
    const photoUrl = photoUpload.url!;
    console.log('[Attendance] Photo uploaded:', photoUrl);
    
    // 5. Get today's date
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const timestamp = new Date().toISOString();
    
    // 6. Check if attendance already exists for today
    const todayRecords = await fetchAttendanceByDate(today);
    const existingAttendance = todayRecords.find(r => r.facultyId === facultyId);
    
    if (type === 'check_in') {
      // Check-in logic
      if (existingAttendance?.checkInTime) {
        return {
          success: false,
          message: '',
          error: 'You have already checked in today.',
        };
      }
      
      // Check device binding if required
      const requireDeviceBinding = process.env.REQUIRE_DEVICE_BINDING === 'true';
      if (requireDeviceBinding && existingAttendance) {
        // Compare with previous device (if any)
        const previousDevice = existingAttendance.checkInDevice;
        if (previousDevice && !isSameDevice(device.fingerprint, previousDevice.fingerprint)) {
          flags.push('different_device');
        }
      }
      
      const status = determineStatus(timeCheck.isLate || false);
      
      // Create or update attendance record
      if (existingAttendance) {
        await updateAttendanceByRow(existingAttendance.rowNumber!, {
          checkInTime: timestamp,
          checkInPhoto: photoUrl,
          checkInGPS: gps,
          checkInDevice: device,
          checkInGeoFence: geoFenceCheck.geoFence?.id,
          status,
          isLate: timeCheck.isLate,
          lateByMinutes: timeCheck.lateByMinutes,
          isWithinGeoFence: true,
          flags,
          requiresApproval: flags.length > 0,
        });
        
        return {
          success: true,
          message: `Check-in successful${timeCheck.isLate ? ' (Late)' : ''}!`,
          data: {
            attendanceId: existingAttendance.id,
            status,
            checkInTime: timestamp,
            isWithinGeoFence: true,
            flags,
          },
        };
      } else {
        const attendanceId = `ATT${Date.now()}`;
        await saveAttendanceRecord({
          id: attendanceId,
          facultyId,
          facultyName,
          employeeId,
          department,
          date: today,
          checkInTime: timestamp,
          checkInPhoto: photoUrl,
          checkInGPS: gps,
          checkInDevice: device,
          checkInGeoFence: geoFenceCheck.geoFence?.id,
          status,
          isLate: timeCheck.isLate,
          lateByMinutes: timeCheck.lateByMinutes,
          isWithinGeoFence: true,
          flags,
          requiresApproval: flags.length > 0,
          markedBy: facultyId,
          method: 'photo_gps',
        });
        
        return {
          success: true,
          message: `Check-in successful${timeCheck.isLate ? ' (Late)' : ''}!`,
          data: {
            attendanceId,
            status,
            checkInTime: timestamp,
            isWithinGeoFence: true,
            flags,
          },
        };
      }
    } else {
      // Check-out logic
      if (!existingAttendance) {
        return {
          success: false,
          message: '',
          error: 'No check-in found for today. Please check in first.',
        };
      }
      
      if (!existingAttendance.checkInTime) {
        return {
          success: false,
          message: '',
          error: 'No check-in time found. Please check in first.',
        };
      }
      
      if (existingAttendance.checkOutTime) {
        return {
          success: false,
          message: '',
          error: 'You have already checked out today.',
        };
      }
      
      // Calculate total hours
      const totalHours = calculateTotalHours(existingAttendance.checkInTime, timestamp);
      const finalStatus = determineStatus(existingAttendance.isLate || false, totalHours);
      
      // Update with check-out data
      await updateAttendanceByRow(existingAttendance.rowNumber!, {
        checkOutTime: timestamp,
        checkOutPhoto: photoUrl,
        checkOutGPS: gps,
        checkOutDevice: device,
        checkOutGeoFence: geoFenceCheck.geoFence?.id,
        totalHours,
        status: finalStatus,
      });
      
      return {
        success: true,
        message: `Check-out successful! Total hours: ${totalHours.toFixed(2)}`,
        data: {
          attendanceId: existingAttendance.id,
          status: finalStatus,
          checkInTime: existingAttendance.checkInTime,
          checkOutTime: timestamp,
          totalHours,
          isWithinGeoFence: true,
          flags,
        },
      };
    }
  } catch (error: any) {
    console.error('[Attendance] Error marking attendance:', error);
    return {
      success: false,
      message: '',
      error: error.message || 'Failed to mark attendance. Please try again.',
    };
  }
}

/**
 * Get today's attendance status for faculty
 */
export async function getTodayAttendanceStatus(facultyId: string): Promise<{
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  status?: AttendanceStatus;
  totalHours?: number;
  isLate?: boolean;
  lateByMinutes?: number;
}> {
  try {
    const today = new Date().toISOString().split('T')[0];
    const records = await fetchAttendanceByDate(today);
    const attendance = records.find(r => r.facultyId === facultyId);
    
    if (!attendance) {
      return {
        hasCheckedIn: false,
        hasCheckedOut: false,
      };
    }
    
    return {
      hasCheckedIn: !!attendance.checkInTime,
      hasCheckedOut: !!attendance.checkOutTime,
      checkInTime: attendance.checkInTime,
      checkOutTime: attendance.checkOutTime,
      status: attendance.status,
      totalHours: attendance.totalHours,
      isLate: attendance.isLate,
      lateByMinutes: attendance.lateByMinutes,
    };
  } catch (error) {
    console.error('[Attendance] Error fetching status:', error);
    return {
      hasCheckedIn: false,
      hasCheckedOut: false,
    };
  }
}
