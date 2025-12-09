'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  AlertCircle,
  TrendingUp,
  Globe,
  Link as LinkIcon,
  FileText,
  Video,
  BookMarked,
} from 'lucide-react';
import { Institution } from '@/types/auth';
import { getInstitutions } from '@/actions/superadmin/institutions';
import { getDashboardStats, getSharedResources } from '@/actions/superadmin/resources';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        console.log('Fetching super admin data...');
        
        const [statsRes, institutionsRes, resourcesRes] = await Promise.all([
          getDashboardStats(),
          getInstitutions(),
          getSharedResources(),
        ]);

        console.log('Stats response:', statsRes);
        console.log('Institutions response:', institutionsRes);
        console.log('Resources response:', resourcesRes);

        if (statsRes.success) {
          setStats(statsRes.data);
        } else {
          console.error('Stats error:', statsRes.error);
        }

        if (institutionsRes.success) {
          setInstitutions(institutionsRes.data || []);
        } else {
          console.error('Institutions error:', institutionsRes.error);
        }

        if (resourcesRes.success) {
          setResources(resourcesRes.data || []);
        } else {
          console.error('Resources error:', resourcesRes.error);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage institutions, shared resources, and system-wide settings
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Institutions</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <span className="animate-pulse">--</span>
              ) : (
                stats?.totalInstitutions || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '--' : stats?.activeInstitutions || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <span className="animate-pulse">--</span>
              ) : (
                stats?.totalUsers || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all institutions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <span className="animate-pulse">--</span>
              ) : (
                stats?.totalStudents || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? '--' : stats?.totalFaculty || 0} faculty members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Resources</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <span className="animate-pulse">--</span>
              ) : (
                stats?.totalResources || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for all institutions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="institutions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="institutions">Institutions</TabsTrigger>
          <TabsTrigger value="resources">Shared Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Institutions Tab */}
        <TabsContent value="institutions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Institutions</h2>
              <p className="text-muted-foreground">Manage all registered institutions</p>
            </div>
            <Button onClick={() => window.location.href = '/dashboard/super-admin/institutions'}>
              View All Institutions
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <Card className="col-span-full">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading institutions...</p>
                  </div>
                </CardContent>
              </Card>
            ) : institutions.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No institutions found</p>
                </CardContent>
              </Card>
            ) : (
              institutions.slice(0, 6).map((institution) => (
                <Card key={institution.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <CardTitle className="text-lg">{institution.name}</CardTitle>
                        <CardDescription className="text-xs">
                          {institution.code} • {institution.type}
                        </CardDescription>
                      </div>
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
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Globe className="mr-2 h-4 w-4" />
                      {institution.city}, {institution.state}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="mr-2 h-4 w-4" />
                      {institution.studentCount || 0} students, {institution.facultyCount || 0} faculty
                    </div>
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Shared Resources</h2>
              <p className="text-muted-foreground">Resources available to all institutions</p>
            </div>
            <Button>
              <LinkIcon className="mr-2 h-4 w-4" />
              Add Resource
            </Button>
          </div>

          {/* Temporary Resource Links */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <Card className="col-span-full">
                <CardContent className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading resources...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
            {/* E-Books */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookMarked className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">E-Books Library</CardTitle>
                    <CardDescription>Digital book collection</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Access thousands of e-books across various subjects
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Resources
                </Button>
              </CardContent>
            </Card>

            {/* Video Lectures */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Video Lectures</CardTitle>
                    <CardDescription>Educational videos</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Curated video content from top educators
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Resources
                </Button>
              </CardContent>
            </Card>

            {/* Study Materials */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Study Materials</CardTitle>
                    <CardDescription>Notes and documents</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive study materials and guides
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Resources
                </Button>
              </CardContent>
            </Card>

            {/* Templates */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Templates & Forms</CardTitle>
                    <CardDescription>Standard documents</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Ready-to-use templates for common tasks
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Resources
                </Button>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Course Content</CardTitle>
                    <CardDescription>Structured courses</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Full course materials and syllabi
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Resources
                </Button>
              </CardContent>
            </Card>

            {/* Research Papers */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Research Papers</CardTitle>
                    <CardDescription>Academic research</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Latest research papers and publications
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  View Resources
                </Button>
              </CardContent>
            </Card>
            </>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">System Analytics</h2>
            <p className="text-muted-foreground">Overview of system usage and performance</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Institution Performance</CardTitle>
                <CardDescription>Top performing institutions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {institutions.slice(0, 5).map((inst, index) => (
                    <div key={inst.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="font-semibold text-muted-foreground">#{index + 1}</div>
                        <div>
                          <p className="font-medium">{inst.name}</p>
                          <p className="text-xs text-muted-foreground">{inst.code}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{inst.studentCount || 0} students</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium">System updated successfully</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Building2 className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium">New institution registered</p>
                      <p className="text-xs text-muted-foreground">5 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <BookOpen className="h-5 w-5 text-purple-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Shared resource added</p>
                      <p className="text-xs text-muted-foreground">1 day ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
