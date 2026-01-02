

"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { DataTableToolbar } from "./data-table-toolbar"
import { DataTablePagination } from "./data-table-pagination"
import { useToast } from "@/hooks/use-toast"
import { createLead, uploadLeads, getUsers, bulkTransferLeads } from "@/lib/data"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { courseData } from '@/lib/course-data';
import * as XLSX from 'xlsx';
import { ArrowLeft, Upload } from 'lucide-react';
import PageHeader from "../page-header"
import { Breadcrumbs, BreadcrumbItem } from "../ui/breadcrumbs"
import { useParams } from "next/navigation"
import { Lead, User } from "@/lib/types"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading: boolean
  onLoadMore?: () => void
  canLoadMore?: boolean
  isFetchingMore?: boolean
  refreshData: () => void;
}

export default function DataTable<TData, TValue>({
  columns,
  data,
  loading,
  onLoadMore,
  canLoadMore,
  isFetchingMore,
  refreshData
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [sorting, setSorting] = React.useState<SortingState>([])

  const [isCreateDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [isUploadDialogOpen, setUploadDialogOpen] = React.useState(false);
  const [isBulkTransferOpen, setBulkTransferOpen] = React.useState(false);
  const [isSubmitting, setSubmitting] = React.useState(false);
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const formRef = React.useRef<HTMLFormElement>(null);
  
  const [selectedCollege, setSelectedCollege] = React.useState('');
  const [availableCourses, setAvailableCourses] = React.useState<string[]>([]);
  const [availableAgents, setAvailableAgents] = React.useState<User[]>([]);
  const [selectedAgent, setSelectedAgent] = React.useState<string>('');
  
  const { toast } = useToast();
  const params = useParams() as { encryptedPortalId: string; role: string; encryptedUserId: string };

  const [uploadStep, setUploadStep] = React.useState<'select' | 'verify'>('select');
  const [parsedData, setParsedData] = React.useState<any[]>([]);
  const [isParsing, setIsParsing] = React.useState(false);

   const colleges = React.useMemo(() => {
    return [...new Set(courseData.map(item => item['Institution Name']))];
  }, []);

  React.useEffect(() => {
    if (selectedCollege) {
      const courses = courseData
        .filter(item => item['Institution Name'] === selectedCollege)
        .map(item => item['Course / Specialization']);
      setAvailableCourses([...new Set(courses)]);
    } else {
      setAvailableCourses([]);
    }
  }, [selectedCollege]);

  React.useEffect(() => {
    getUsers().then(users => {
      setAvailableAgents(users.filter(u => u.role === 'Admission Executive' || u.role === 'Admission Manager'));
    });
  }, []);


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
      refreshData();
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
      refreshData();
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

  const handleBulkTransfer = async () => {
    if (!selectedAgent) {
      toast({ variant: "destructive", title: "No agent selected" });
      return;
    }
    setSubmitting(true);
    const selectedLeadIds = table.getFilteredSelectedRowModel().rows.map(row => (row.original as Lead).id);

    try {
        await bulkTransferLeads(selectedLeadIds, selectedAgent);
        toast({
            title: "Leads Transferred",
            description: `${selectedLeadIds.length} leads have been transferred.`,
        });
        refreshData();
        table.resetRowSelection();
        setBulkTransferOpen(false);
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Transfer Failed",
            description: error.message,
        });
    } finally {
        setSubmitting(false);
    }
  }

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setUploadFile(null);
    setParsedData([]);
    setUploadStep('select');
  };


  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    meta: {
        refreshData
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
  })

  const breadcrumbUrl = `/u/crm/${params.encryptedPortalId}/${params.role}/${params.encryptedUserId}/dashboard`;

  return (
    <div className="space-y-4">
        <Breadcrumbs>
            <BreadcrumbItem href={breadcrumbUrl}>Dashboard</BreadcrumbItem>
            <BreadcrumbItem isCurrent>Leads</BreadcrumbItem>
        </Breadcrumbs>
      <PageHeader title="Leads" description="Manage and track all your prospective students."/>
      <div className="rounded-md border bg-card">
        <DataTableToolbar 
            table={table} 
            onCreateLead={() => setCreateDialogOpen(true)}
            onUploadLeads={() => setUploadDialogOpen(true)}
            onBulkTransfer={() => setBulkTransferOpen(true)}
            />
        <div className="border-t">
            <Table>
            <TableHeader className="bg-muted/50">
                {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b-0">
                    {headerGroup.headers.map((header) => {
                    return (
                        <TableHead key={header.id}>
                        {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                            )}
                        </TableHead>
                    )
                    })}
                </TableRow>
                ))}
            </TableHeader>
            <TableBody>
                {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                            <TableCell colSpan={columns.length} className="h-12 text-center">
                            <div className="animate-pulse bg-muted/50 rounded-md h-8 w-full" />
                            </TableCell>
                        </TableRow>
                    ))
                ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                        {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                        )}
                        </TableCell>
                    ))}
                    </TableRow>
                ))
                ) : (
                <TableRow>
                    <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                    >
                    No results.
                    </TableCell>
                </TableRow>
                )}
            </TableBody>
            </Table>
        </div>
      </div>
      <div className="flex items-center justify-between">
          <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {data.length} row(s) selected.
          </div>
          {onLoadMore && canLoadMore && (
                <Button
                variant="outline"
                size="sm"
                onClick={onLoadMore}
                disabled={isFetchingMore}
                >
                {isFetchingMore ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                    </>
                ) : (
                    'Load More'
                )}
                </Button>
            )}
      </div>
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

    <Dialog open={isBulkTransferOpen} onOpenChange={setBulkTransferOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Bulk Transfer Leads</DialogTitle>
                <DialogDescription>
                    Transfer {table.getFilteredSelectedRowModel().rows.length} selected leads to a new agent.
                </DialogDescription>
            </DialogHeader>
             <div className="py-4">
                <Label htmlFor="agent-select">New Agent</Label>
                <Select onValueChange={setSelectedAgent}>
                    <SelectTrigger id="agent-select">
                        <SelectValue placeholder="Select an agent" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableAgents.map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setBulkTransferOpen(false)}>Cancel</Button>
                <Button onClick={handleBulkTransfer} disabled={isSubmitting || !selectedAgent}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Confirm Transfer
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </div>
  )
}
