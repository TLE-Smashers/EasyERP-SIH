"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getAvailableFaculty, searchFaculty } from "@/actions/federation/getFaculty";
import { createFacultyRequest } from "@/actions/federation/facultyRequests";
import { FacultyProfile } from "@/types/facultyRequest";
import { Search, Loader2, Video, Calendar, Clock } from "lucide-react";
import { getInstitutionInfo } from "@/actions/federation/getStudentInfo";

export default function FacultyRequestPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [faculty, setFaculty] = useState<FacultyProfile[]>([]);
  const [filteredFaculty, setFilteredFaculty] = useState<FacultyProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyProfile | null>(null);

  const [formData, setFormData] = useState({
    subject: "",
    topic: "",
    description: "",
  });

  useEffect(() => {
    loadFaculty();
  }, []);

  useEffect(() => {
    // Filter locally when search query changes
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      // Reset to full faculty list when search is cleared
      setFilteredFaculty(faculty);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadFaculty = async () => {
    setSearching(true);
    try {
      const data = await getAvailableFaculty();
      setFaculty(data);
      setFilteredFaculty(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load faculty",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredFaculty(faculty);
      return;
    }

    setSearching(true);
    try {
      const results = await searchFaculty(searchQuery);
      setFilteredFaculty(results);
    } catch (error) {
      toast({
        title: "Error",
        description: "Search failed",
        variant: "destructive",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFaculty) {
      toast({
        title: "Error",
        description: "Please select a faculty member",
        variant: "destructive",
      });
      return;
    }

    if (!session?.user?.email || !session?.user?.name) {
      toast({
        title: "Error",
        description: "User session not found",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get student's institution info
      const institutionInfo = await getInstitutionInfo();
      
      if (!institutionInfo) {
        toast({
          title: "Error",
          description: "Failed to get institution information",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const result = await createFacultyRequest({
        studentEmail: session.user.email,
        studentName: session.user.name,
        studentInstitutionId: institutionInfo.institutionId,
        studentInstitutionName: institutionInfo.institutionName,
        facultyEmail: selectedFaculty.email,
        facultyName: selectedFaculty.name,
        facultyInstitutionId: selectedFaculty.institutionId,
        facultyInstitutionName: selectedFaculty.institutionName,
        subject: formData.subject,
        topic: formData.topic,
        description: formData.description,
      });

      if (result.success) {
        toast({
          title: "Success",
          description: "Faculty request sent successfully",
        });
        // Reset form
        setFormData({
          subject: "",
          topic: "",
          description: "",
        });
        setSelectedFaculty(null);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Request Faculty Consultation</h1>
        <p className="text-muted-foreground mt-2">
          Connect with faculty from any institution in the federation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faculty Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Faculty</CardTitle>
            <CardDescription>
              Search and select a faculty member for consultation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, department, specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredFaculty.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No faculty found
                </p>
              ) : (
                filteredFaculty.map((f) => (
                  <div
                    key={f.email}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedFaculty?.email === f.email
                        ? "border-primary bg-primary/5"
                        : "hover:bg-accent"
                    }`}
                    onClick={() => setSelectedFaculty(f)}
                  >
                    <div className="font-medium">{f.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {f.department && <span>{f.department}</span>}
                      {f.specialization && (
                        <span className="ml-2">• {f.specialization}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {f.institutionName}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Request Form */}
        <Card>
          <CardHeader>
            <CardTitle>Request Details</CardTitle>
            <CardDescription>
              Provide details about your consultation request
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Data Structures"
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Binary Search Trees"
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData({ ...formData, topic: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you'd like to learn or discuss..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <Clock className="h-4 w-4 inline mr-1" />
                  The faculty will set the meeting time and send you a Google Meet link once they accept your request.
                </p>
              </div>

              {selectedFaculty && (
                <div className="p-4 bg-accent rounded-lg">
                  <p className="text-sm font-medium">Selected Faculty:</p>
                  <p className="text-sm">{selectedFaculty.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedFaculty.institutionName}
                  </p>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading || !selectedFaculty}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    <Video className="mr-2 h-4 w-4" />
                    Send Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
