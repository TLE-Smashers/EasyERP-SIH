'use client';

import * as React from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import { createPeriodAction, updatePeriodAction } from '@/actions/paymentPeriod/paymentPeriodActions';
import type { PaymentPeriod, PaymentPeriodType } from '@/types/paymentPeriod';

interface CreatePaymentPeriodSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  period?: PaymentPeriod | null;
  onSuccess?: () => void;
}

export function CreatePaymentPeriodSheet({
  open,
  onOpenChange,
  period,
  onSuccess,
}: CreatePaymentPeriodSheetProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState({
    type: 'semester' as PaymentPeriodType,
    title: '',
    description: '',
    academicYear: '',
    semester: '',
    startDate: '',
    endDate: '',
    targetCourses: 'ALL',
    targetBranches: 'ALL',
    targetYears: 'ALL',
    tuitionFee: '0',
    amalgamatedFund: '0',
    sportsFee: '0',
    cautionMoney: '0',
    transferCertificateFee: '0',
    libraryCardReissueFee: '0',
    penaltyFee: '0',
    otherFees: '0',
    transactionCharges: '0',
  });

  // Load period data when editing
  React.useEffect(() => {
    if (period && open) {
      setFormData({
        type: period.type,
        title: period.title,
        description: period.description || '',
        academicYear: period.academicYear,
        semester: period.semester?.toString() || '',
        startDate: period.startDate.split('T')[0],
        endDate: period.endDate.split('T')[0],
        targetCourses: period.targetCourses,
        targetBranches: period.targetBranches,
        targetYears: period.targetYears,
        tuitionFee: period.tuitionFee.toString(),
        amalgamatedFund: period.amalgamatedFund.toString(),
        sportsFee: period.sportsFee.toString(),
        cautionMoney: period.cautionMoney.toString(),
        transferCertificateFee: period.transferCertificateFee.toString(),
        libraryCardReissueFee: period.libraryCardReissueFee.toString(),
        penaltyFee: period.penaltyFee.toString(),
        otherFees: period.otherFees.toString(),
        transactionCharges: period.transactionCharges.toString(),
      });
    } else if (!open) {
      // Reset form when closed
      setFormData({
        type: 'semester',
        title: '',
        description: '',
        academicYear: '',
        semester: '',
        startDate: '',
        endDate: '',
        targetCourses: 'ALL',
        targetBranches: 'ALL',
        targetYears: 'ALL',
        tuitionFee: '0',
        amalgamatedFund: '0',
        sportsFee: '0',
        cautionMoney: '0',
        transferCertificateFee: '0',
        libraryCardReissueFee: '0',
        penaltyFee: '0',
        otherFees: '0',
        transactionCharges: '0',
      });
    }
  }, [period, open]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session?.user?.email) {
      toast.error('You must be logged in');
      return;
    }

    // Validation
    if (!formData.title || !formData.academicYear || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }

    setIsSubmitting(true);

    try {
      const params = {
        type: formData.type,
        title: formData.title,
        description: formData.description || undefined,
        academicYear: formData.academicYear,
        semester: formData.semester ? Number(formData.semester) : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        targetCourses: formData.targetCourses,
        targetBranches: formData.targetBranches,
        targetYears: formData.targetYears,
        tuitionFee: Number(formData.tuitionFee),
        amalgamatedFund: Number(formData.amalgamatedFund),
        sportsFee: Number(formData.sportsFee),
        cautionMoney: Number(formData.cautionMoney),
        transferCertificateFee: Number(formData.transferCertificateFee),
        libraryCardReissueFee: Number(formData.libraryCardReissueFee),
        penaltyFee: Number(formData.penaltyFee),
        otherFees: Number(formData.otherFees),
        transactionCharges: Number(formData.transactionCharges),
        createdBy: session.user.email,
      };

      let result;
      if (period) {
        // Update existing period
        result = await updatePeriodAction(period.id, {
          ...params,
          updatedBy: session.user.email,
        });
      } else {
        // Create new period
        result = await createPeriodAction(params);
      }

      if (result.success) {
        toast.success(period ? 'Payment period updated' : 'Payment period created');
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast.error(result.error || 'Failed to save payment period');
      }
    } catch (error) {
      toast.error('An error occurred');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = React.useMemo(() => {
    return (
      Number(formData.tuitionFee) +
      Number(formData.amalgamatedFund) +
      Number(formData.sportsFee) +
      Number(formData.cautionMoney) +
      Number(formData.transferCertificateFee) +
      Number(formData.libraryCardReissueFee) +
      Number(formData.penaltyFee) +
      Number(formData.otherFees) +
      Number(formData.transactionCharges)
    );
  }, [formData]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{period ? 'Edit Payment Period' : 'Create Payment Period'}</SheetTitle>
          <SheetDescription>
            {period
              ? 'Update the payment period details'
              : 'Create a new payment period for students to pay fees'}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Payment Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleChange('type', value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semester">Semester Fee</SelectItem>
                    <SelectItem value="hostel">Hostel Fee</SelectItem>
                    <SelectItem value="library">Library Fee</SelectItem>
                    <SelectItem value="exam">Exam Fee</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Semester 3 Fee Payment"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Optional description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="academicYear">Academic Year *</Label>
                  <Input
                    id="academicYear"
                    value={formData.academicYear}
                    onChange={(e) => handleChange('academicYear', e.target.value)}
                    placeholder="2024-25"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    type="number"
                    min="1"
                    max="8"
                    value={formData.semester}
                    onChange={(e) => handleChange('semester', e.target.value)}
                    placeholder="1-8"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="font-semibold">Payment Period</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Target Filters */}
          <div className="space-y-4">
            <h3 className="font-semibold">Target Students</h3>
            <p className="text-sm text-muted-foreground">
              Use &quot;ALL&quot; or comma-separated values like &quot;B.Tech,B.E&quot;
            </p>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetCourses">Courses</Label>
                <Input
                  id="targetCourses"
                  value={formData.targetCourses}
                  onChange={(e) => handleChange('targetCourses', e.target.value)}
                  placeholder="ALL or B.Tech,B.E"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetBranches">Branches</Label>
                <Input
                  id="targetBranches"
                  value={formData.targetBranches}
                  onChange={(e) => handleChange('targetBranches', e.target.value)}
                  placeholder="ALL or CSE,IT,ECE"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetYears">Years</Label>
                <Input
                  id="targetYears"
                  value={formData.targetYears}
                  onChange={(e) => handleChange('targetYears', e.target.value)}
                  placeholder="ALL or 1,2,3,4"
                />
              </div>
            </div>
          </div>

          {/* Fee Breakdown */}
          <div className="space-y-4">
            <h3 className="font-semibold">Fee Breakdown</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tuitionFee">Tuition Fee</Label>
                <Input
                  id="tuitionFee"
                  type="number"
                  min="0"
                  value={formData.tuitionFee}
                  onChange={(e) => handleChange('tuitionFee', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amalgamatedFund">Amalgamated Fund</Label>
                <Input
                  id="amalgamatedFund"
                  type="number"
                  min="0"
                  value={formData.amalgamatedFund}
                  onChange={(e) => handleChange('amalgamatedFund', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sportsFee">Sports Fee</Label>
                <Input
                  id="sportsFee"
                  type="number"
                  min="0"
                  value={formData.sportsFee}
                  onChange={(e) => handleChange('sportsFee', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cautionMoney">Caution Money</Label>
                <Input
                  id="cautionMoney"
                  type="number"
                  min="0"
                  value={formData.cautionMoney}
                  onChange={(e) => handleChange('cautionMoney', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transferCertificateFee">Transfer Certificate Fee</Label>
                <Input
                  id="transferCertificateFee"
                  type="number"
                  min="0"
                  value={formData.transferCertificateFee}
                  onChange={(e) => handleChange('transferCertificateFee', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="libraryCardReissueFee">Library Card Reissue Fee</Label>
                <Input
                  id="libraryCardReissueFee"
                  type="number"
                  min="0"
                  value={formData.libraryCardReissueFee}
                  onChange={(e) => handleChange('libraryCardReissueFee', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="penaltyFee">Penalty Fee</Label>
                <Input
                  id="penaltyFee"
                  type="number"
                  min="0"
                  value={formData.penaltyFee}
                  onChange={(e) => handleChange('penaltyFee', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="otherFees">Other Fees</Label>
                <Input
                  id="otherFees"
                  type="number"
                  min="0"
                  value={formData.otherFees}
                  onChange={(e) => handleChange('otherFees', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionCharges">Transaction Charges</Label>
                <Input
                  id="transactionCharges"
                  type="number"
                  min="0"
                  value={formData.transactionCharges}
                  onChange={(e) => handleChange('transactionCharges', e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? period
                  ? 'Updating...'
                  : 'Creating...'
                : period
                ? 'Update Period'
                : 'Create Period'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
