

'use client';
import PageHeader from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { getLeads, createLead, uploadLeads } from '@/lib/data';
import LeadsDataTable from '@/components/leads/data-table';
import { leadColumns } from '@/components/leads/columns';
import { PlusCircle, Loader2, Upload, Download, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { Lead } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { logout, getAuthHeaders } from '@/lib/auth';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { courseData } from '@/lib/course-data';

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

  const [uploadStep, setUploadStep] = useState<'select' | 'verify'>('select');
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [isParsing, setIsParsing] = useState(false);

  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);


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


  const fetchLeads = useCallback(async (cursor: string | null = null) => {
    if (cursor) {
        setIsFetchingMore(true);
    } else {
        setLoading(true);
    }
    try {
      const { leads: fetchedLeads, meta } = await getLeads(cursor);
      setLeads(prev => cursor ? [...prev, ...fetchedLeads] : fetchedLeads);
      setNextCursor(meta?.cursor || null);
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
      setIsFetchingMore(false);
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
      const file = event.target.files[0];
      setUploadFile(file);
      parseFile(file);
    }
  };

  const parseFile = (file: File) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet);
            setParsedData(json);
            setUploadStep('verify');
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Parsing Failed',
                description: 'Could not read the file. Please ensure it is a valid .xlsx or .csv file.',
            });
        } finally {
            setIsParsing(false);
        }
    };
    reader.onerror = () => {
        setIsParsing(false);
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
    }
    reader.readAsBinaryString(file);
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
      handleCloseUploadDialog();
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

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
    setParsedData([]);
    setUploadStep('select');
  };

  return (
    <div className="flex flex-col gap-8 h-full">
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
    
    <LeadsDataTable 
        columns={leadColumns} 
        data={leads}
        searchKey="name"
        searchPlaceholder="Filter leads by name..."
        onLoadMore={() => fetchLeads(nextCursor)}
        canLoadMore={!!nextCursor}
        isFetchingMore={isFetchingMore}
    />

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

    <Dialog open={isUploadDialogOpen} onOpenChange={handleCloseUploadDialog}>
        <DialogContent className={uploadStep === 'verify' ? "sm:max-w-4xl" : "sm:max-w-md"}>
        {uploadStep === 'select' && (
            <>
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
                {isParsing && (
                    <div className="flex items-center justify-center p-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Parsing file...</span>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={handleCloseUploadDialog}>
                Cancel
                </Button>
            </DialogFooter>
            </>
        )}

        {uploadStep === 'verify' && (
            <>
            <DialogHeader>
                <DialogTitle>Verify Uploaded Data</DialogTitle>
                <DialogDescription>
                Review the leads below. Click "Confirm & Import" to finalize the upload. Found {parsedData.length} records in {uploadFile?.name}.
                </DialogDescription>
            </DialogHeader>
            <div className="max-h-[50vh] overflow-auto border rounded-md my-4">
                <Table>
                    <TableHeader className='sticky top-0 bg-muted'>
                        <TableRow>
                            {parsedData.length > 0 && Object.keys(parsedData[0]).map(key => (
                                <TableHead key={key}>{key}</TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {parsedData.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                {Object.values(row).map((cell, cellIndex) => (
                                    <TableCell key={cellIndex} className='whitespace-nowrap'>{String(cell)}</TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setUploadStep('select')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
                </Button>
                <Button onClick={handleBulkUpload} disabled={isSubmitting}>
                {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Importing...</>
                ) : (
                    <><Upload className="mr-2 h-4 w-4" /> Confirm & Import</>
                )}
                </Button>
            </DialogFooter>
            </>
        )}
        </DialogContent>
    </Dialog>
    </div>
  );
}
