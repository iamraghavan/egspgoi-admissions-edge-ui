
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { User } from '@/lib/types';
import { updateUserProfile } from '@/lib/auth';

const profileSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  phone: z.string().optional(),
  designation: z.string().optional(),
  agent_number: z.string().optional(),
  caller_id: z.string().optional(),
});

interface ProfileFormProps {
  user: User;
  onUpdate: (user: User) => void;
}

export function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name || '',
      phone: user.phone || '',
      designation: user.designation || '',
      agent_number: user.agent_number || '',
      caller_id: user.caller_id || '',
    },
  });

  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    setIsSubmitting(true);
    try {
      const updatedUser = await updateUserProfile(values);
      toast({
        title: 'Profile Updated',
        description: 'Your profile details have been saved.',
      });
      onUpdate(updatedUser);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Update your personal and telephony details.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="designation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4 border-b pb-2">Smartflo Configuration</h3>
               <div className="grid md:grid-cols-2 gap-6 mt-4">
                 <FormField
                    control={form.control}
                    name="agent_number"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Agent Number</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. 1001" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                 <FormField
                    control={form.control}
                    name="caller_id"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Caller ID</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g. 04412345678" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
               </div>
            </div>


            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
