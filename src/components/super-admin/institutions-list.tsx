'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Building2,
  Search,
  Filter,
  ArrowLeft,
  Globe,
  Users,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';
import { Institution } from '@/types/auth';
import { getInstitutions } from '@/actions/superadmin/institutions';

export default function InstitutionsListView() {
  const router = useRouter();
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true);
        const result = await getInstitutions();
        if (result.success) {
          setInstitutions(result.data || []);
        }
      } catch (error) {
        console.error('Error fetching institutions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  const filteredInstitutions = institutions.filter(
    (inst) =>
      inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/super-admin')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Institutions</h1>
            <p className="text-muted-foreground">
              Manage all {institutions.length} registered institutions
            </p>
          </div>
        </div>
        <Button onClick={() => router.push('/dashboard/super-admin/institutions/new')}>
          <Building2 className="mr-2 h-4 w-4" />
          Add Institution
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search institutions by name, code, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Institutions Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading institutions...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredInstitutions.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'No institutions found matching your search' : 'No institutions registered yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInstitutions.map((institution) => (
            <Card key={institution.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-xl">{institution.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-2">
                      <span className="font-mono text-xs">{institution.code}</span>
                      <span>•</span>
                      <span className="capitalize">{institution.type}</span>
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
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-start space-x-3 text-sm">
                  <Globe className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-muted-foreground">{institution.address}</p>
                    <p className="text-muted-foreground">
                      {institution.city}, {institution.state} - {institution.pincode}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{institution.contactEmail}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{institution.contactPhone}</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {institution.studentCount || 0} students
                      </span>
                    </div>
                    <div className="text-muted-foreground">
                      {institution.facultyCount || 0} faculty
                    </div>
                  </div>
                </div>

                {/* Registered Date */}
                <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Registered: {new Date(institution.registeredDate).toLocaleDateString()}
                  </span>
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => router.push(`/dashboard/super-admin/institutions/${institution.id}`)}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
        </div>
      )}
    </div>
  );
}
