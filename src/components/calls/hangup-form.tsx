
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { hangupCall } from '@/lib/data';
import { Loader2, PhoneOff } from 'lucide-react';

const hangupSchema = z.object({
  call_id: z.string().min(1, { message: 'Call ID is required.' }),
});

export default function HangupForm() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof hangupSchema>>({
    resolver: zodResolver(hangupSchema),
    defaultValues: { call_id: '' },
  });

  const onSubmit = async (values: z.infer<typeof hangupSchema>) => {
    setLoading(true);
    try {
      await hangupCall(values.call_id);
      toast({
        title: 'Success',
        description: `Hang-up command sent for call ID: ${values.call_id}`,
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Failed to Hang Up',
        description: error.message || 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-end gap-4">
        <FormField
          control={form.control}
          name="call_id"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormLabel>Call ID</FormLabel>
              <FormControl>
                <Input placeholder="Enter the active call ID" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading} variant="destructive">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <PhoneOff className="mr-2 h-4 w-4" />
          )}
          Hang-up
        </Button>
      </form>
    </Form>
  );
}
