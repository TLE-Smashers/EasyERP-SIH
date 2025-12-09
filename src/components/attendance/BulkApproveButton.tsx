/**
 * Bulk Approve Button Component
 * Client-side button to trigger bulk approval actions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { bulkApproveAll, autoApproveAttendance } from '@/actions/attendance/autoApprove';

interface BulkApproveButtonProps {
  action: 'auto' | 'bulk';
  adminId: string;
  buttonText: string;
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

export function BulkApproveButton({ 
  action, 
  adminId, 
  buttonText,
  buttonVariant = 'default'
}: BulkApproveButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setIsLoading(true);
    
    try {
      if (action === 'auto') {
        const result = await autoApproveAttendance();
        toast.success(
          `Auto-Approval Complete`,
          {
            description: `✅ Approved: ${result.autoApproved} | ⚠️ Needs Review: ${result.needsReview}`,
          }
        );
      } else {
        const result = await bulkApproveAll(adminId);
        if (result.success) {
          toast.success(
            `Bulk Approval Complete`,
            {
              description: result.message,
            }
          );
        } else {
          toast.error('Approval Failed', {
            description: result.message,
          });
        }
      }
      
      // Refresh the page to show updated data
      router.refresh();
    } catch (error: any) {
      toast.error('Error', {
        description: error.message || 'Failed to approve records',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleApprove}
      disabled={isLoading}
      variant={buttonVariant}
      className="w-full"
      size="lg"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CheckCircle className="w-5 h-5 mr-2" />
          {buttonText}
        </>
      )}
    </Button>
  );
}
