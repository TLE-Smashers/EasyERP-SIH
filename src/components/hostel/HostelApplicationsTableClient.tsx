"use client";
import * as React from "react";
import { HostelApplication } from "@/types/hostel";
import { HostelApplicationsTable } from "./HostelApplicationsTable";
import { HostelPaymentDrawer } from "./HostelPaymentDrawer";
import { Mars, Venus, X, RotateCcw, Loader2 } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

interface Props {
  data: HostelApplication[];
}

export function HostelApplicationsTableClient({ data }: Props) {
  const [loading, setLoading] = React.useState(false);
  // Track loading state per studentId for row actions
  const [rowLoading, setRowLoading] = React.useState<{ [studentId: string]: string | null }>({});
  const [message, setMessage] = React.useState<string | null>(null);
  const [applications, setApplications] = React.useState<HostelApplication[]>(data);
  const [paymentDrawerOpen, setPaymentDrawerOpen] = React.useState(false);
  const [selectedApplication, setSelectedApplication] = React.useState<HostelApplication | null>(null);

  // Session, year, and gender filter state
  const sessionOptions = [
    "2022-2023",
    "2023-2024",
    "2024-2025",
    "2025-2026",
    "2026-2027"
  ];
  const yearOptions = [1, 2, 3, 4, 5];
  const [selectedSession, setSelectedSession] = React.useState<string>("");
  const [selectedYear, setSelectedYear] = React.useState<string>("");
  const [selectedGender, setSelectedGender] = React.useState<"male" | "female" | "">("");

  // Filter applications by session, gender, and year
  const filteredApplications = React.useMemo(() => {
    return applications.filter(app => {
      let sessionMatch = true;
      let genderMatch = true;
      let yearMatch = true;
      if (selectedSession) {
        sessionMatch = typeof app.session === 'string' && app.session === selectedSession;
      }
      if (selectedGender) {
        genderMatch = app.gender && app.gender.toLowerCase() === selectedGender;
      }
      if (selectedYear) {
        yearMatch = app.currentYear != null && app.currentYear != undefined && String(app.currentYear) === selectedYear;
      }
      return sessionMatch && genderMatch && yearMatch;
    });
  }, [applications, selectedSession, selectedGender, selectedYear]);


  const handleAllocateAll = async (gender: "male" | "female") => {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/hostel/allocate-all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gender }),
    });
    const result = await res.json();
    setMessage(`Allocated: ${result.allocated.length}, Not allocated: ${result.notAllocated.length}`);
    // Update applications state for allocated students
    setApplications(apps =>
      apps.map(app =>
        result.allocated.includes(app.studentId)
          ? { ...app, status: "allocated" }
          : app
      )
    );
    setLoading(false);
  };

  const handleAllocate = async (studentId: string, gender: "male" | "female") => {
    setRowLoading(l => ({ ...l, [studentId]: "allocate" }));
    setMessage(null);
    try {
      const res = await fetch("/api/hostel/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, gender }),
      });
      const result = await res.json();
      setMessage(result.message || (result.success ? "Allocated" : "Allocation failed"));
      if (result.success) {
        setApplications(apps =>
          apps.map(app =>
            app.studentId === studentId
              ? {
                  ...app,
                  status: "allocated",
                  roomNumber: result.roomNumber,
                  allocationTimestamp: result.allocationTimestamp || new Date().toISOString()
                }
              : app
          )
        );
      }
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setRowLoading(l => ({ ...l, [studentId]: null }));
    }
  };

  const handleDeallocate = async (studentId: string) => {
    setRowLoading(l => ({ ...l, [studentId]: "deallocate" }));
    setMessage(null);
    try {
      const res = await fetch("/api/hostel/deallocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      const result = await res.json();
      setMessage(result.message || (result.success ? "Deallocated" : "Deallocation failed"));
      if (result.success) {
        setApplications(apps =>
          apps.map(app =>
            app.studentId === studentId
              ? { ...app, status: "deallocated", roomNumber: undefined, allocationTimestamp: undefined }
              : app
          )
        );
      }
    } catch (error) {
      setMessage((error as Error).message);
    } finally {
      setRowLoading(l => ({ ...l, [studentId]: null }));
    }
  };

  const handlePay = (app: HostelApplication) => {
    setSelectedApplication(app);
    setPaymentDrawerOpen(true);
  };

  const handlePaymentSuccess = () => {
    setPaymentDrawerOpen(false);
    // Update payment status in UI
    if (selectedApplication) {
      setApplications(apps =>
        apps.map(app =>
          app.studentId === selectedApplication.studentId
            ? { ...app, paymentConfirmed: true }
            : app
        )
      );
    }
    setSelectedApplication(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {message && <div className="mb-4 text-green-700 font-medium text-center bg-green-50 border border-green-200 rounded-lg py-2">{message}</div>}
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 mb-4">
        <div className="flex flex-row gap-3 items-center w-full flex-wrap">
          <div className="w-[180px]">
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Session" />
              </SelectTrigger>
              <SelectContent>
                {sessionOptions.map(session => (
                  <SelectItem key={session} value={session}>{session}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-[120px]">
            <Select value={selectedYear} onValueChange={val => setSelectedYear(val)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button
            className={`border rounded px-4 py-2 flex items-center gap-2 ${selectedGender === 'male' ? 'bg-blue-600 text-white' : ''}`}
            onClick={() => setSelectedGender('male')}
            title="Show male students"
          >
            <Mars className="w-4 h-4" />
            Male
          </button>
          <button
            className={`border rounded px-4 py-2 flex items-center gap-2 ${selectedGender === 'female' ? 'bg-pink-600 text-white' : ''}`}
            onClick={() => setSelectedGender('female')}
            title="Show female students"
          >
            <Venus className="w-4 h-4" />
            Female
          </button>
          <button
            className="border rounded px-4 py-2 flex items-center gap-2 bg-gray-200 text-gray-800 font-semibold"
            onClick={() => { setSelectedSession(""); setSelectedGender(""); setSelectedYear(""); }}
            title="Reset filters"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            className="border rounded px-4 py-2 flex items-center gap-2 bg-green-600 text-white font-semibold"
            onClick={() => handleAllocateAll(selectedGender ? selectedGender : 'male')}
            title="Allocate all"
          >
            <ArrowRight className="w-4 h-4" />
            Allocate All
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-md p-4 relative">
        {loading && (
          <div className="absolute inset-0 bg-white/70 dark:bg-zinc-900/70 flex items-center justify-center z-10">
            <span className="flex items-center gap-2 text-blue-600 font-semibold text-lg">
              <Loader2 className="animate-spin text-blue-600 w-7 h-7" />
              Loading...
            </span>
          </div>
        )}
        <HostelApplicationsTable
          data={filteredApplications}
          onAllocateAll={handleAllocateAll}
          onAllocate={handleAllocate}
          onDeallocate={handleDeallocate}
          onPay={handlePay}
          rowLoading={rowLoading}
        />
      </div>
      <HostelPaymentDrawer
        open={paymentDrawerOpen}
        onClose={() => setPaymentDrawerOpen(false)}
        application={selectedApplication}
        onPaymentSuccess={handlePaymentSuccess}
      />
      {loading && <div className="mt-6 flex justify-center"><span className="text-blue-600 font-medium">Processing...</span></div>}
    </div>
  );
}