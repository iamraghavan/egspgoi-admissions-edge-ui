
'use client';

import { useState, useMemo, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { updateLead } from '@/lib/data';
import type { Lead } from '@/lib/types';
import { courseData } from '@/lib/course-data';
import { Loader2 } from 'lucide-react';

interface EditLeadDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lead: Lead;
  onLeadUpdate: () => void;
}

const leadSchema = z.object({
  name: z.string().min(1, { message: "Name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phone: z.string().min(10, { message: "Phone number is required." }),
  college: z.string().min(1, { message: "College is required." }),
  course: z.string().min(1, { message: "Course is required." }),
  status: z.enum(["New", "Contacted", "Qualified", "Proposal", "On Board", "Failed"]),
});

export function EditLeadDialog({ isOpen, onOpenChange, lead, onLeadUpdate }: EditLeadDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof leadSchema>>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      college: lead.college || '',
      course: lead.course || '',
      status: lead.status,
    },
  });

  const selectedCollege = form.watch('college');

  const colleges = useMemo(() => [...new Set(courseData.map(item => item['Institution Name']))], []);
  const availableCourses = useMemo(() => {
    if (!selectedCollege) return [];
    return [...new Set(courseData
      .filter(item => item['Institution Name'] === selectedCollege)
      .map(item => item['Course / Specialization']))];
  }, [selectedCollege]);

  useEffect(() => {
    form.reset({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      college: lead.college || '',
      course: lead.course || '',
      status: lead.status,
    });
  }, [lead, form]);

  useEffect(() => {
    // Reset course if college changes and the previous course is no longer valid
    if (selectedCollege && !availableCourses.includes(form.getValues('course'))) {
        form.setValue('course', '');
    }
  }, [selectedCollege, availableCourses, form]);

  async function onSubmit(values: z.infer<typeof leadSchema>) {
    setIsSubmitting(true);
    try {
      await updateLead(lead.id, values);
      toast({
        title: "Lead Updated",
        description: "Lead details have been successfully saved.",
      });
      onLeadUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Could not save lead details.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Edit Lead</DialogTitle>
              <DialogDescription>
                Update the details for {lead.name}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="college"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>College</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a college" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {colleges.map(college => <SelectItem key={college} value={college}>{college}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCollege}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a course" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {availableCourses.map(course => <SelectItem key={course} value={course}>{course}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {["New", "Contacted", "Qualified", "Proposal", "On Board", "Failed"].map(status => (
                                <SelectItem key={status} value={status}>{status}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
