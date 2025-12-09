'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building2,
  Globe,
  Mail,
  Phone,
  Calendar,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { Institution } from '@/types/auth';
import { getInstitution, changeInstitutionStatus } from '@/actions/superadmin/institutions';
import { toast } from 'sonner';

interface Props {
  institutionId: string;
}

export default function InstitutionDetailsView({ institutionId }: Props) {
  const router = useRouter();
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    const fetchInstitution = async () => {
      try {
        setLoading(true);
        const result = await getInstitution(institutionId);
        if (result.success && result.data) {
          setInstitution(result.data);
        } else {
          toast.error(result.error || 'Institution not found');
          router.push('/dashboard/super-admin/institutions');
        }
      } catch (error) {
        console.error('Error fetching institution:', error);
        toast.error('Failed to load institution details');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitution();
  }, [institutionId, router]);

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'suspended') => {
    if (!institution) return;

    setStatusLoading(true);
    try {
      const result = await changeInstitutionStatus(institution.id, newStatus);
      if (result.success) {
        toast.success('Status updated successfully');
        setInstitution({ ...institution, status: newStatus });
      } else {
        toast.error(result.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading institution details...</p>
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-5 w-5" />
              Institution Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              The requested institution could not be found.
            </p>
            <Button onClick={() => router.push('/dashboard/super-admin/institutions')}>
              Back to Institutions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/super-admin/institutions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold">{institution.name}</h1>
              <Badge
                variant={
                  institution.status === 'active'
                    ? 'default'
                    : institution.status === 'suspended'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {institution.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {institution.code} • {institution.type}
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact & Location</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Students</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{institution.studentCount || 0}</div>
                <p className="text-xs text-muted-foreground">Total enrolled students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faculty</CardTitle>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{institution.facultyCount || 0}</div>
                <p className="text-xs text-muted-foreground">Teaching staff</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{institution.adminCount || 0}</div>
                <p className="text-xs text-muted-foreground">System administrators</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Institution Information</CardTitle>
              <CardDescription>Basic details about the institution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Institution Name</p>
                  <p className="text-base">{institution.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Institution Code</p>
                  <p className="text-base font-mono">{institution.code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Type</p>
                  <p className="text-base capitalize">{institution.type}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Principal/Dean</p>
                  <p className="text-base">{institution.principalName || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Registered Date</p>
                  <p className="text-base">
                    {new Date(institution.registeredDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Active</p>
                  <p className="text-base">
                    {institution.lastActive
                      ? new Date(institution.lastActive).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Tab */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Primary contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base">{institution.contactEmail}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="text-base">{institution.contactPhone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Complete address details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Globe className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-base">{institution.address}</p>
                  <p className="text-base">
                    {institution.city}, {institution.state} - {institution.pincode}
                  </p>
                  <p className="text-base text-muted-foreground">{institution.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Google Sheets integration and system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Google Spreadsheet ID</p>
                <p className="text-base font-mono text-sm bg-muted p-2 rounded mt-1">
                  {institution.spreadsheetId}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Institution ID</p>
                <p className="text-base font-mono text-sm bg-muted p-2 rounded mt-1">
                  {institution.id}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Management</CardTitle>
              <CardDescription>Change the institution's status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant={institution.status === 'active' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('active')}
                  disabled={statusLoading || institution.status === 'active'}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Set Active
                </Button>
                <Button
                  variant={institution.status === 'inactive' ? 'default' : 'outline'}
                  onClick={() => handleStatusChange('inactive')}
                  disabled={statusLoading || institution.status === 'inactive'}
                >
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Set Inactive
                </Button>
                <Button
                  variant={institution.status === 'suspended' ? 'destructive' : 'outline'}
                  onClick={() => handleStatusChange('suspended')}
                  disabled={statusLoading || institution.status === 'suspended'}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Suspend
                </Button>
              </div>
              {statusLoading && (
                <p className="text-sm text-muted-foreground flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating status...
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="mr-2 h-4 w-4" />
                View Institution Dashboard
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                Manage Users
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Globe className="mr-2 h-4 w-4" />
                Access Google Sheet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
