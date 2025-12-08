"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, QrCode } from "lucide-react";
import { toast } from "sonner";
import { issueBookWithCode } from "@/actions/library/issueBook";

interface IssueBookFormProps {
  open: boolean;
  onClose: () => void;
  studentId: string;
  onSuccess: (issueId: string) => void;
}

export function IssueBookForm({
  open,
  onClose,
  studentId,
  onSuccess,
}: IssueBookFormProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (code.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      const result = await issueBookWithCode(code, studentId);

      if (result.success) {
        toast.success(result.message || "Book issued successfully!");
        onSuccess(result.data?.issueId || "");
        onClose();
        setCode("");
      } else {
        toast.error(result.error || "Failed to issue book");
      }
    } catch (error) {
      toast.error("An error occurred while issuing book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Issue Book</DialogTitle>
          <DialogDescription>
            Enter the 6-digit code provided by the librarian
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="code">Issue Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                className="text-2xl text-center font-mono tracking-widest"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                The librarian will provide you with this code after approving your request
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <QrCode className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    How to get your code:
                  </h4>
                  <ul className="text-xs text-amber-800 dark:text-amber-200 mt-1 space-y-1">
                    <li>1. Submit a book request</li>
                    <li>2. Wait for librarian approval (check your email)</li>
                    <li>3. Visit the library physically</li>
                    <li>4. Librarian will provide the code</li>
                    <li>5. Enter the code here to complete the issue</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || code.length !== 6}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Issue Book
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
