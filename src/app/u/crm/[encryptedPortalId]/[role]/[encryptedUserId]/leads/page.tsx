
'use client';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getLeads, createLead, uploadLeads } from '@/lib/data';
import LeadsDataTable from '@/components/leads/data-table';
import { leadColumns } from '@/components/leads/columns';
import KanbanBoard from '@/components/leads/kanban-board';
import { PlusCircle, Loader2, Upload, Download, File } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Lead } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { logout, getAuthHeaders } from '@/lib/auth';


const courseData = [
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Biomedical Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Civil Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Computer Science and Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Electronics and Communication Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Electrical and Electronics Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.E", "Course / Specialization": "Mechanical Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.Tech", "Course / Specialization": "Artificial Intelligence and Data Science" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.Tech", "Course / Specialization": "Computer Science and Business Systems" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "UG", "Degree/Level": "B.Tech", "Course / Specialization": "Information Technology" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Communication Systems" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Computer Science and Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Environmental Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Power Electronics and Drives" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "M.E / M.Tech", "Course / Specialization": "Manufacturing Engineering" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "MCA", "Course / Specialization": "Master of Computer Application" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "PG", "Degree/Level": "MBA", "Course / Specialization": "Master of Business Administration" },
   { "Institution Name": "E.G.S. Pillay Engineering College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "All Departments" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.A", "Course / Specialization": "Tamil" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.A", "Course / Specialization": "English" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.A", "Course / Specialization": "Defense and Strategic Studies" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Com", "Course / Specialization": "General" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Com", "Course / Specialization": "Computer Application" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Com", "Course / Specialization": "Professional Accounting" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Com", "Course / Specialization": "Business Process Service" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.B.A", "Course / Specialization": "Business Administration" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.C.A", "Course / Specialization": "Computer Applications" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Computer Science" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Computer Science with Cognitive System" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Information Technology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Visual Communication" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Fashion Technology & Costume Designing" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Physics" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Maths" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Chemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Biochemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Biotechnology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Nutrition & Dietetics" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Hospital Administration" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Data Science" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Microbiology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Artificial Intelligence & Machine Learning" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Com", "Course / Specialization": "Commerce" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.B.A", "Course / Specialization": "Business Administration" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.A", "Course / Specialization": "English" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Computer Science" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Information Technology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Physics" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Maths" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Chemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Biochemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Biotechnology" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "PG", "Degree/Level": "M.Sc", "Course / Specialization": "Food Science & Nutrition" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "English" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Physics" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Commerce" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Management" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Computer Science" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Biochemistry" },
   { "Institution Name": "Edayathangudy G. S. Pillay Arts & Science College", "Category": "Ph.D", "Degree/Level": "Ph.D", "Course / Specialization": "Biotechnology" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Civil Engineering" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Computer Science and Engineering" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Electronics and Communication Engineering" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Electrical and Electronics Engineering" },
   { "Institution Name": "EGS Pillay Polytechnic College", "Category": "Diploma", "Degree/Level": "Diploma", "Course / Specialization": "Mechanical Engineering" },
   { "Institution Name": "EGS Pillay School & College of Nursing", "Category": "UG", "Degree/Level": "B.Sc", "Course / Specialization": "Nursing" },
   { "Institution Name": "EGS Pillay School & College of Nursing", "Category": "Diploma", "Degree/Level": "DGNM", "Course / Specialization": "Diploma in General Nursing and Midwifery" },
   { "Institution Name": "EGS Pillay College of Pharmacy", "Category": "Diploma", "Degree/Level": "D. Pharm", "Course / Specialization": "Pharmacy" },
   { "Institution Name": "EGS Pillay College of Pharmacy", "Category": "UG", "Degree/Level": "B. Pharm", "Course / Specialization": "Pharmacy" },
   { "Institution Name": "EGS Pillay College of Pharmacy", "Category": "Doctorate", "Degree/Level": "Pharm. D", "Course / Specialization": "Doctor of Pharmacy" },
   { "Institution Name": "EGS Pillay College of Pharmacy", "Category": "PG", "Degree/Level": "M. Pharm", "Course / Specialization": "Pharmacy" },
   { "Institution Name": "EGS Pillay Naturopathy & Yoga Medical College", "Category": "UG", "Degree/Level": "-", "Course / Specialization": "BNYS" },
   { "Institution Name": "EGS Pillay College of Education", "Category": "UG", "Degree/Level": "B.Ed", "Course / Specialization": "All Subjects" },
   { "Institution Name": "EGS Pillay School", "Category": "School", "Degree/Level": "-", "Course / Specialization": "International School" },
   { "Institution Name": "EGS Pillay School", "Category": "School", "Degree/Level": "-", "Course / Specialization": "Matriculation School" },
   { "Institution Name": "EGS Pillay School", "Category": "School", "Degree/Level": "-", "Course / Specialization": "Nursery and Primary School" }
];


export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [selectedCollege, setSelectedCollege] = useState('');
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);
  
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = useCallback(() => {
    logout();
    router.push('/');
  }, [router]);

  const colleges = useMemo(() => {
    return [...new Set(courseData.map(item => item['Institution Name']))];
  }, []);

  useEffect(() => {
    if (selectedCollege) {
      const courses = courseData
        .filter(item => item['Institution Name'] === selectedCollege)
        .map(item => item['Course / Specialization']);
      setAvailableCourses([...new Set(courses)]);
    } else {
      setAvailableCourses([]);
    }
  }, [selectedCollege]);


  const fetchLeads = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedLeads = await getLeads();
      setLeads(fetchedLeads);
    } catch (error: any) {
       if (error.message.includes('Authentication token') || error.message.includes('Invalid or expired token')) {
        toast({
          variant: "destructive",
          title: "Session Expired",
          description: "Your session has expired. Please log in again.",
        });
        handleLogout();
      } else {
        toast({
            variant: "destructive",
            title: "Failed to fetch leads",
            description: error.message || "Could not retrieve lead data from the server.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [toast, handleLogout]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleCreateLead = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    const newLead = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      college: formData.get('college') as string,
      course: formData.get('course') as string,
    };

    try {
      await createLead(newLead);
      toast({
        title: "Lead Created",
        description: `${newLead.name} has been successfully added.`,
      });
      fetchLeads(); // Refresh leads
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create lead",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setSubmitting(false);
      setCreateDialogOpen(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setUploadFile(event.target.files[0]);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      toast({
        variant: "destructive",
        title: "No file selected",
        description: "Please select a file to upload.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const response = await uploadLeads(uploadFile);
      toast({
        title: "Upload Successful",
        description: response.message || `${uploadFile.name} has been uploaded and is being processed.`,
      });
      setUploadDialogOpen(false);
      setUploadFile(null);
      fetchLeads();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || "An unexpected error occurred during the upload.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch("https://cms-egspgoi.vercel.app/api/v1/leads/bulk/template?type=xlsx", {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to download template. Please try again.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'lead_upload_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Leads" description="Manage and track all your prospective students.">
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Bulk Upload
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Lead
          </Button>
        </div>
      </PageHeader>
      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board">Kanban Board</TabsTrigger>
          <TabsTrigger value="table">Data Table</TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="mt-6">
          <KanbanBoard leads={leads} isLoading={loading} setLeads={setLeads} />
        </TabsContent>
        <TabsContent value="table">
          <LeadsDataTable 
            columns={leadColumns} 
            data={leads}
            searchKey="name"
            searchPlaceholder="Filter leads by name..."
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateDialogOpen} onOpenChange={(isOpen) => {
        setCreateDialogOpen(isOpen);
        if (!isOpen) {
          if(formRef.current) {
            formRef.current.reset();
          }
          setSelectedCollege('');
          setAvailableCourses([]);
        }
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateLead} ref={formRef}>
            <DialogHeader>
              <DialogTitle>Create New Lead</DialogTitle>
              <DialogDescription>
                Fill in the details below to add a new lead.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input id="name" name="name" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input id="email" name="email" type="email" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input id="phone" name="phone" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="college" className="text-right">
                  College
                </Label>
                <Select name="college" onValueChange={setSelectedCollege} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a college" />
                  </SelectTrigger>
                  <SelectContent>
                    {colleges.map(college => (
                      <SelectItem key={college} value={college}>{college}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="course" className="text-right">
                  Course
                </Label>
                <Select name="course" disabled={!selectedCollege} required>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map(course => (
                      <SelectItem key={course} value={course}>{course}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Lead
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isUploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Lead Upload</DialogTitle>
            <DialogDescription>
              Upload a .xlsx or .csv file with your leads. Make sure it follows the provided template.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <Button
              variant="link"
              className="inline-flex items-center justify-center text-sm font-medium text-primary hover:underline p-0 h-auto"
              onClick={handleDownloadTemplate}
              disabled={isDownloading}
            >
              {isDownloading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading...</>
              ) : (
                <><Download className="mr-2 h-4 w-4" /> Download Excel Template</>
              )}
            </Button>
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Label htmlFor="lead-file">Select File</Label>
              <Input id="lead-file" type="file" accept=".xlsx, .csv" onChange={handleFileSelect} className="file:text-foreground"/>
            </div>
            {uploadFile && (
              <div className="flex items-center gap-2 rounded-md border border-muted p-2 text-sm">
                <File className="h-5 w-5 text-muted-foreground" />
                <span>{uploadFile.name}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setUploadDialogOpen(false); setUploadFile(null); }}>
              Cancel
            </Button>
            <Button onClick={handleBulkUpload} disabled={isSubmitting || !uploadFile}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Upload & Process</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
