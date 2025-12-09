/**
 * Admin Attendance Dashboard
 * Intelligent auto-approval system with minimal human intervention
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { 
  autoApproveAttendance, 
  getAttendanceStats,
  manualApprove,
  manualReject,
} from '@/actions/attendance/autoApprove';
import { fetchTodaysAttendance, fetchPendingApprovals } from '@/lib/google/sheets.attendance';
import { FacultyAttendanceRecord } from '@/types/attendance';
import { getFaculty } from '@/actions/faculty/getFaculty';

export default function AdminAttendanceDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [todayRecords, setTodayRecords] = useState<FacultyAttendanceRecord[]>([]);
  const [pendingRecords, setPendingRecords] = useState<FacultyAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoApproving, setIsAutoApproving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<FacultyAttendanceRecord | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'present' | 'absent' | 'late'>('all');
  const [totalFaculty, setTotalFaculty] = useState(0);

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 2 minutes
    const interval = setInterval(loadData, 120000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const [statsData, records, pending, allFaculty] = await Promise.all([
        getAttendanceStats(today),
        fetchTodaysAttendance(today),
        fetchPendingApprovals(),
        getFaculty(),
      ]);
      
      setStats(statsData);
      setTodayRecords(records);
      setPendingRecords(pending);
      setTotalFaculty(allFaculty.length);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Run intelligent auto-approval
   * Processes all pending records based on rules
   */
  async function handleAutoApprove() {
    setIsAutoApproving(true);
    setMessage(null);
    
    try {
      const result = await autoApproveAttendance();
      
      setMessage({
        type: 'success',
        text: `✨ Auto-approved ${result.autoApproved} records. ${result.needsReview} require manual review.`,
      });
      
      // Reload data
      setTimeout(loadData, 1000);
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Auto-approval failed',
      });
    } finally {
      setIsAutoApproving(false);
    }
  }

  async function handleManualApprove(record: FacultyAttendanceRecord) {
    const result = await manualApprove(record.id, record.rowNumber!, 'admin', 'Manually approved');
    
    if (result.success) {
      setMessage({ type: 'success', text: `Approved attendance for ${record.facultyName}` });
      loadData();
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  }

  async function handleManualReject(record: FacultyAttendanceRecord, reason: string) {
    const result = await manualReject(record.id, record.rowNumber!, 'admin', reason);
    
    if (result.success) {
      setMessage({ type: 'success', text: `Rejected attendance for ${record.facultyName}` });
      loadData();
    } else {
      setMessage({ type: 'error', text: result.message });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Filter records based on active filter
  const filteredRecords = todayRecords.filter((record) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'present') return record.status === 'present';
    if (activeFilter === 'absent') return record.status === 'absent';
    if (activeFilter === 'late') return record.status === 'late' || record.status === 'half_day';
    return true;
  });

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#303960]">Attendance Dashboard</h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          {pendingRecords.length > 0 && (
            <Button 
              onClick={handleAutoApprove}
              disabled={isAutoApproving}
              className="bg-gradient-to-r from-[#303960] to-[#F5B19C] hover:from-[#3d4670] hover:to-[#f7c4b0] text-white shadow-lg"
            >
              {isAutoApproving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Auto-Approve All ({pendingRecords.length})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className={`cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
            activeFilter === 'all' ? 'border-2 border-[#303960] shadow-lg bg-[#F0EDE3]' : 'bg-white'
          }`}
          onClick={() => setActiveFilter('all')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#303960] flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-[#303960]">{totalFaculty}</div>
              <div className="text-sm text-muted-foreground">Total Faculty</div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
            activeFilter === 'present' ? 'border-2 border-green-500 shadow-lg bg-green-50' : 'bg-white'
          }`}
          onClick={() => setActiveFilter('present')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-green-600">{stats?.present || 0}</div>
              <div className="text-sm text-muted-foreground">Present</div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
            activeFilter === 'late' ? 'border-2 border-[#F6C570] shadow-lg bg-[#FFF8EE]' : 'bg-white'
          }`}
          onClick={() => setActiveFilter('late')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#F6C570] flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#303960]" />
              </div>
              <div className="text-3xl font-bold text-[#F6C570]">{stats?.late || 0}</div>
              <div className="text-sm text-muted-foreground">Late</div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className={`cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
            activeFilter === 'absent' ? 'border-2 border-red-500 shadow-lg bg-red-50' : 'bg-white'
          }`}
          onClick={() => setActiveFilter('absent')}
        >
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-red-500 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-3xl font-bold text-red-600">{stats?.absent || 0}</div>
              <div className="text-sm text-muted-foreground">Absent</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Auto-Approval Info */}
      {pendingRecords.length > 0 && (
        <Card className="border-[#F5B19C] bg-[#FFF5F1]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#303960]">
              <Sparkles className="w-5 h-5 text-[#F6C570]" />
              Intelligent Auto-Approval Ready
            </CardTitle>
            <CardDescription>
              {pendingRecords.length} records pending approval. Our AI will automatically approve safe records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>Auto-approves: No anomalies, minor GPS issues, new devices</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span>Flags for review: Outside geo-fence, suspicious patterns</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Approvals */}
      {pendingRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>⚠️ Pending Manual Review ({pendingRecords.length})</CardTitle>
            <CardDescription>Records flagged by auto-approval system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRecords.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{record.facultyName}</h3>
                      <p className="text-sm text-gray-600">
                        {record.employeeId} • {record.department}
                      </p>
                    </div>
                    <Badge variant="destructive">Needs Review</Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>
                        Check-in: {record.checkInTime 
                          ? new Date(record.checkInTime).toLocaleTimeString()
                          : 'Not marked'}
                      </span>
                    </div>
                    
                    {record.checkInPhoto && (
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-gray-500" />
                        <a 
                          href={record.checkInPhoto} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Photo
                        </a>
                      </div>
                    )}

                    {record.checkInGPS && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <a
                          href={`https://www.google.com/maps?q=${record.checkInGPS.latitude},${record.checkInGPS.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          View Location
                        </a>
                      </div>
                    )}
                  </div>

                  {record.flags && record.flags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {record.flags.map((flag) => (
                        <Badge key={flag} variant="outline" className="text-xs">
                          {flag.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleManualApprove(record)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleManualReject(record, 'Security concerns')}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle>
            📋 Today's Attendance {activeFilter === 'all' 
              ? `(${todayRecords.length})` 
              : `(${filteredRecords.length} of ${todayRecords.length})`
            }
          </CardTitle>
          {activeFilter !== 'all' && (
            <CardDescription>
              Showing {activeFilter} records
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredRecords.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {activeFilter === 'all' 
                  ? 'No attendance records yet' 
                  : `No ${activeFilter} records found`
                }
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Faculty</th>
                      <th className="text-left p-2">Check In</th>
                      <th className="text-left p-2">Check Out</th>
                      <th className="text-left p-2">Hours</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record) => (
                      <tr key={record.id} className="border-t">
                        <td className="p-2">
                          <div className="font-medium">{record.facultyName}</div>
                          <div className="text-xs text-gray-500">{record.department}</div>
                        </td>
                        <td className="p-2">
                          {record.checkInTime 
                            ? new Date(record.checkInTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'}
                        </td>
                        <td className="p-2">
                          {record.checkOutTime 
                            ? new Date(record.checkOutTime).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'}
                        </td>
                        <td className="p-2">
                          {record.totalHours ? `${record.totalHours.toFixed(2)}h` : '-'}
                        </td>
                        <td className="p-2">
                          <Badge
                            variant={
                              record.status === 'present' ? 'default' :
                              record.status === 'late' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {record.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <div className="flex gap-1">
                            {record.checkInPhoto && (
                              <a
                                href={record.checkInPhoto}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-xs"
                              >
                                Photo
                              </a>
                            )}
                            {record.checkInGPS && (
                              <>
                                <span className="text-gray-300">•</span>
                                <a
                                  href={`https://www.google.com/maps?q=${record.checkInGPS.latitude},${record.checkInGPS.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline text-xs"
                                >
                                  Map
                                </a>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Automation Info */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span>Intelligent auto-approval enabled • Dashboard auto-refreshes every 2 minutes</span>
        </div>
        <div>
          <span className="text-xs">Photos stored in Google Drive • All data synced to Google Sheets</span>
        </div>
      </div>
    </div>
  );
}
