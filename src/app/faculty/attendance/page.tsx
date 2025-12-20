/**
 * Faculty Attendance Page
 * Fully automated attendance marking with camera + GPS
 * Minimal user intervention - One tap to mark attendance
 */

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Camera, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { CameraGPSCapture } from '@/components/attendance/CameraGPSCapture';
import { getDeviceInfo } from '@/lib/attendance/device';
import { markAttendance, getTodayAttendanceStatus } from '@/actions/attendance/markAttendance';
import { GPSCoordinates } from '@/types/attendance';

export default function FacultyAttendancePage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [attendanceType, setAttendanceType] = useState<'check_in' | 'check_out'>('check_in');
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isMarking, setIsMarking] = useState(false);

  // Auto-load today's status on mount
  useEffect(() => {
    loadTodayStatus();
  }, [session]);

  async function loadTodayStatus() {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const status = await getTodayAttendanceStatus(session.user.id);
      setTodayStatus(status);
    } catch (error) {
      console.error('Error loading status:', error);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Auto-detect what action is needed
   * - If not checked in → Show check-in
   * - If checked in but not out → Show check-out
   * - If both done → Show completion
   */
  const getRequiredAction = () => {
    if (!todayStatus) return null;
    
    if (!todayStatus.hasCheckedIn) {
      return { type: 'check_in' as const, label: 'Check In', color: 'blue' };
    } else if (!todayStatus.hasCheckedOut) {
      return { type: 'check_out' as const, label: 'Check Out', color: 'green' };
    } else {
      return null; // All done
    }
  };

  const requiredAction = getRequiredAction();

  /**
   * One-tap attendance marking
   * Automatically captures photo + GPS and submits
   */
  const handleQuickMark = () => {
    if (!requiredAction) return;
    
    setAttendanceType(requiredAction.type);
    setShowCamera(true);
    setMessage(null);
  };

  /**
   * Handle camera + GPS capture
   * Automatically submits attendance
   */
  const handleCapture = async (photo: string, gps: GPSCoordinates, bypassGPSAccuracy?: boolean) => {
    setIsMarking(true);
    setMessage(null);

    try {
      // Get device info
      const device = await getDeviceInfo();

      // Mark attendance
      const result = await markAttendance({
        facultyId: session?.user?.id || '',
        facultyName: session?.user?.name || '',
        employeeId: (session?.user as any)?.employeeId || '',
        department: session?.user?.department || '',
        type: attendanceType,
        photo,
        gps,
        device,
        bypassGPSAccuracy,
      });

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setShowCamera(false);
        
        // Auto-reload status after 2 seconds (increased to allow Google Sheets to update)
        setTimeout(() => {
          loadTodayStatus();
        }, 2000);
      } else {
        console.error('[Faculty Attendance] Mark attendance failed:', result.error);
        setMessage({ type: 'error', text: result.error || 'Failed to mark attendance' });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred' });
    } finally {
      setIsMarking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Faculty Attendance</h1>
        <p className="text-gray-600">Automated attendance with photo + GPS verification</p>
      </div>

      {/* Today's Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Today's Status
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </div>
            {todayStatus?.status && (
              <Badge 
                variant={
                  todayStatus.status === 'present' ? 'default' :
                  todayStatus.status === 'late' ? 'destructive' :
                  todayStatus.status === 'half_day' ? 'secondary' :
                  'outline'
                }
                className="text-lg px-4 py-2"
              >
                {todayStatus.status.replace('_', ' ').toUpperCase()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status Timeline */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Check-in Status */}
            <div className={`p-4 rounded-lg border-2 ${
              todayStatus?.hasCheckedIn 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-start gap-3">
                {todayStatus?.hasCheckedIn ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                ) : (
                  <Clock className="w-6 h-6 text-gray-400 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold flex items-center gap-2">
                    Check In
                    {todayStatus?.isLate && (
                      <Badge variant="destructive" className="text-xs">
                        Late by {todayStatus.lateByMinutes} min
                      </Badge>
                    )}
                  </h3>
                  {todayStatus?.checkInTime ? (
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(todayStatus.checkInTime).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Not marked</p>
                  )}
                </div>
              </div>
            </div>

            {/* Check-out Status */}
            <div className={`p-4 rounded-lg border-2 ${
              todayStatus?.hasCheckedOut 
                ? 'border-green-500 bg-green-50' 
                : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="flex items-start gap-3">
                {todayStatus?.hasCheckedOut ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                ) : (
                  <Clock className="w-6 h-6 text-gray-400 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold">Check Out</h3>
                  {todayStatus?.checkOutTime ? (
                    <>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(todayStatus.checkOutTime).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {todayStatus.totalHours && (
                        <p className="text-xs text-gray-500 mt-1">
                          Total: {todayStatus.totalHours.toFixed(2)} hours
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Not marked</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          {message && (
            <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
              {message.type === 'error' ? (
                <XCircle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {/* Action Button - Auto-determines what's needed */}
          <div className="space-y-3">
            {requiredAction ? (
              <>
                <Button
                  onClick={handleQuickMark}
                  size="lg"
                  className="w-full text-lg py-6"
                  disabled={isMarking}
                >
                  {isMarking ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5 mr-2" />
                      {requiredAction.label} Now
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>Will capture photo + GPS automatically</span>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-700 mb-2">
                  Attendance Complete!
                </h3>
                <p className="text-gray-600">
                  You've successfully marked check-in and check-out for today.
                </p>
                {todayStatus?.totalHours && (
                  <p className="text-sm text-gray-500 mt-2">
                    Total hours worked: {todayStatus.totalHours.toFixed(2)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Camera Capture Modal */}
          {showCamera && (
            <div className="mt-4">
              <Separator className="my-4" />
              <CameraGPSCapture
                onCapture={handleCapture}
                onError={(error) => setMessage({ type: 'error', text: error })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📋 How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-semibold text-xs">1</span>
              </div>
              <div>
                <p className="font-medium">One-Tap Attendance</p>
                <p className="text-gray-600">System auto-detects if you need check-in or check-out</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-semibold text-xs">2</span>
              </div>
              <div>
                <p className="font-medium">Auto Validation</p>
                <p className="text-gray-600">GPS checked against campus boundary (100m radius)</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-semibold text-xs">3</span>
              </div>
              <div>
                <p className="font-medium">Time Window Enforcement</p>
                <p className="text-gray-600">Check-in: 9:00-10:00 AM • Check-out: 3:00-4:00 PM</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-blue-700 font-semibold text-xs">4</span>
              </div>
              <div>
                <p className="font-medium">Auto Status Calculation</p>
                <p className="text-gray-600">System determines: Present, Late, or Half-Day</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Badge */}
      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <AlertTriangle className="w-3 h-3" />
        <span>Secure: Device fingerprinting enabled • Photos stored in Google Drive</span>
      </div>
    </div>
  );
}
