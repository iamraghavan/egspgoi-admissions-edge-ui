
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { User, Role } from '@/lib/types';

interface UserFormDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onSubmit: (data: Partial<User>) => Promise<boolean>;
    user: User | null;
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  password: z.string().optional(),
  phone: z.string().optional(),
  designation: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  agent_number: z.string().optional(),
  caller_id: z.string().optional(),
  status: z.enum(['active', 'inactive']),
}).refine(data => !data.password || data.password.length >= 6, {
    message: "Password must be at least 6 characters long.",
    path: ["password"],
});

const roles: Role[] = ["Super Admin", "Marketing Manager", "Admission Manager", "Finance", "Admission Executive"];

export function UserFormDialog({ isOpen, onOpenChange, onSubmit, user }: UserFormDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    });

    useEffect(() => {
        if (isOpen) {
            if (user) {
                form.reset({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    designation: user.designation || '',
                    role: user.role,
                    agent_number: user.agent_number || '',
                    caller_id: user.caller_id || '',
                    status: (user as any).status || 'active',
                    password: '',
                });
            } else {
                form.reset({
                    name: '',
                    email: '',
                    phone: '',
                    designation: '',
                    role: 'Admission Executive',
                    agent_number: '',
                    caller_id: '',
                    status: 'active',
                    password: '',
                });
            }
        }
    }, [user, form, isOpen]);

    const handleFormSubmit = async (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);
        const payload: Partial<User> & { password?: string } = { ...values };
        if (!payload.password) {
            delete payload.password;
        }
        
        const success = await onSubmit(payload);
        if (!success) {
            setIsSubmitting(false);
        } else {
            setIsSubmitting(false);
            onOpenChange(false);
        }
    };
    
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
                    <DialogDescription>
                        {user ? `Update the details for ${user.name}.` : 'Fill in the form to add a new user.'}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 max-h-[70vh] overflow-y-auto p-1 pr-4">
                        {/* Basic Details */}
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} readOnly={!!user} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" placeholder={user ? "Leave blank to keep unchanged" : ""} {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                         <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name="designation" render={({ field }) => (
                                <FormItem><FormLabel>Designation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem><FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>{roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                                </Select><FormMessage /></FormItem>
                            )}/>
                             <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem><FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select><FormMessage /></FormItem>
                            )}/>
                        </div>

                         {/* Smartflo Config */}
                        <div>
                            <h3 className="text-md font-medium mb-2 border-b pb-2">Smartflo Configuration</h3>
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <FormField control={form.control} name="agent_number" render={({ field }) => (
                                    <FormItem><FormLabel>Agent Number</FormLabel><FormControl><Input placeholder="e.g. 1001" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="caller_id" render={({ field }) => (
                                    <FormItem><FormLabel>Caller ID</FormLabel><FormControl><Input placeholder="e.g. 04412345678" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                        </div>
                        
                        <DialogFooter className="pt-4 sticky bottom-0 bg-background py-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {user ? 'Save Changes' : 'Create User'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
