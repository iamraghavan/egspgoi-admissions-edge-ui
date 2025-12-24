
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { User, UserPreferences } from '@/lib/types';
import { updateUserSettings } from '@/lib/auth';

const preferencesSchema = z.object({
  currency: z.enum(['INR', 'USD', 'EUR']),
  language: z.enum(['en', 'es', 'fr']),
  timezone: z.string().min(1, { message: 'Timezone is required.' }),
  theme: z.enum(['light', 'dark', 'system']),
});

const timezones = [
    'Asia/Kolkata',
    'America/New_York',
    'Europe/London',
    'Australia/Sydney',
];

interface PreferencesFormProps {
  user: User;
  onUpdate: (user: User) => void;
}

export function PreferencesForm({ user, onUpdate }: PreferencesFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detectedTimezone, setDetectedTimezone] = useState('');

  useEffect(() => {
    setDetectedTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const form = useForm<z.infer<typeof preferencesSchema>>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      currency: user.preferences?.currency || 'INR',
      language: user.preferences?.language || 'en',
      timezone: user.preferences?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      theme: user.preferences?.theme || 'system',
    },
  });

  const onSubmit = async (values: z.infer<typeof preferencesSchema>) => {
    setIsSubmitting(true);
    try {
      const updatedUser = await updateUserSettings({ preferences: values });
      toast({
        title: 'Settings Updated',
        description: 'Your preferences have been saved.',
      });
      onUpdate(updatedUser);
      // Apply theme immediately
      if (values.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (values.theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // Handle system preference
         if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
      }
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
        <CardTitle>Localization & Theme</CardTitle>
        <CardDescription>Customize your experience across the platform.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                        <SelectItem value="USD">USD (US Dollar)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español (Spanish)</SelectItem>
                        <SelectItem value="fr">Français (French)</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                 <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Timezone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            {detectedTimezone && <SelectItem value={detectedTimezone}>{detectedTimezone} (Auto-detected)</SelectItem>}
                            {timezones.filter(tz => tz !== detectedTimezone).map(tz => (
                                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Theme</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                    </Select>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Preferences
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
