
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { login, getProfile } from "@/lib/auth";
import type { Role } from "@/lib/types";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

const roleToSlug: Record<Role, string> = {
    'Super Admin': 'sa',
    'Marketing Manager': 'mm',
    'Admission Manager': 'am',
    'Finance': 'fin',
    'Admission Executive': 'ae',
};

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      const loginResponse = await login(values.email, values.password);

      if (loginResponse && loginResponse.accessToken) {
          // Immediately fetch the full profile to get all details including preferences
          const userProfile = await getProfile();

          if (!userProfile) {
            throw new Error("Could not fetch user profile after login.");
          }

          toast({
              title: "Login Successful",
              description: `Welcome back, ${userProfile.name}! Redirecting...`,
          });
          
          const roleSlug = roleToSlug[userProfile.role as Role] || 'sa';
          const encryptedUserId = userProfile.id; 
          const encryptedPortalId = "egspgoi"; 

          // Wait a moment for toast to be seen
          setTimeout(() => {
            router.push(`/u/crm/${encryptedPortalId}/${roleSlug}/${encryptedUserId}/dashboard`);
          }, 1000);

      } else {
        throw new Error("Login response did not include an accessToken.");
      }
    } catch (error: any) {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: error.message || "Invalid email or password.",
        });
        setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="name@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
                <div className="flex items-center">
                    <FormLabel>Password</FormLabel>
                    <a
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                    >
                        Forgot your password?
                    </a>
                </div>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Login
        </Button>
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                Or continue with
                </span>
            </div>
        </div>
        <Button variant="outline" className="w-full" type="button">
          Google
        </Button>
      </form>
    </Form>
  );
}
