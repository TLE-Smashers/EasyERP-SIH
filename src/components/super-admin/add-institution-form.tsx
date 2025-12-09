'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Building2, CheckCircle, Loader2 } from 'lucide-react';
import { createInstitution } from '@/actions/superadmin/institutions';
import { toast } from 'sonner';

export default function AddInstitutionForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'college' as 'university' | 'college' | 'school',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: '',
    contactEmail: '',
    contactPhone: '',
    principalName: '',
    spreadsheetId: '',
    status: 'active' as 'active' | 'inactive' | 'suspended',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await createInstitution(formData);
      
      if (result.success) {
        toast.success('Institution added successfully!');
        router.push('/dashboard/super-admin/institutions');
      } else {
        toast.error(result.error || 'Failed to add institution');
      }
    } catch (error) {
      console.error('Error adding institution:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) {
      return formData.name && formData.code && formData.type;
    }
    if (step === 2) {
      return formData.address && formData.city && formData.state && formData.pincode;
    }
    if (step === 3) {
      return formData.contactEmail && formData.contactPhone;
    }
    return true;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold">Add New Institution</h1>
          <p className="text-muted-foreground">
            Onboard a new institution to the ERP system
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4 py-4">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= s
                  ? 'bg-primary border-primary text-primary-foreground'
                  : 'border-muted-foreground/30 text-muted-foreground'
              }`}
            >
              {step > s ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
            {s < 4 && (
              <div
                className={`w-12 h-0.5 mx-2 ${
                  step > s ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && 'Basic Information'}
              {step === 2 && 'Location Details'}
              {step === 3 && 'Contact Information'}
              {step === 4 && 'System Configuration'}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'Enter the basic details of the institution'}
              {step === 2 && 'Provide the complete address information'}
              {step === 3 && 'Add primary contact details'}
              {step === 4 && 'Configure Google Sheets and system settings'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Institution Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., ABC University"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Institution Code *</Label>
                    <Input
                      id="code"
                      placeholder="e.g., ABCU"
                      value={formData.code}
                      onChange={(e) => handleChange('code', e.target.value.toUpperCase())}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Unique identifier (4-6 characters)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Institution Type *</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleChange('type', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university">University</SelectItem>
                        <SelectItem value="college">College</SelectItem>
                        <SelectItem value="school">School</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="principalName">Principal/Dean Name</Label>
                  <Input
                    id="principalName"
                    placeholder="e.g., Dr. John Doe"
                    value={formData.principalName}
                    onChange={(e) => handleChange('principalName', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Complete Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Street address, area, landmarks"
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    rows={3}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      placeholder="e.g., Mumbai"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      placeholder="e.g., Maharashtra"
                      value={formData.state}
                      onChange={(e) => handleChange('state', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input
                      id="pincode"
                      placeholder="e.g., 400001"
                      value={formData.pincode}
                      onChange={(e) => handleChange('pincode', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => handleChange('country', e.target.value)}
                      disabled
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Contact */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="admin@institution.edu"
                    value={formData.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be the primary email for all communications
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact Phone *</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Step 4: System Config */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="spreadsheetId">Google Spreadsheet ID *</Label>
                  <Input
                    id="spreadsheetId"
                    placeholder="Paste the Google Sheet ID here"
                    value={formData.spreadsheetId}
                    onChange={(e) => handleChange('spreadsheetId', e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    The unique ID from the institution's Google Sheet URL
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Initial Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Set to Active to immediately enable the institution
                  </p>
                </div>

                {/* Summary */}
                <div className="mt-6 p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-semibold">Summary</h4>
                  <div className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">Institution:</span> {formData.name}</p>
                    <p><span className="text-muted-foreground">Code:</span> {formData.code}</p>
                    <p><span className="text-muted-foreground">Type:</span> {formData.type}</p>
                    <p><span className="text-muted-foreground">Location:</span> {formData.city}, {formData.state}</p>
                    <p><span className="text-muted-foreground">Email:</span> {formData.contactEmail}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1 || loading}
              >
                Previous
              </Button>

              {step < 4 ? (
                <Button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Next Step
                </Button>
              ) : (
                <Button type="submit" disabled={loading || !formData.spreadsheetId}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Building2 className="mr-2 h-4 w-4" />
                      Add Institution
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
