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

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

// Mock user data to simulate different roles and encrypted IDs
const mockUsers: { [email: string]: { id: string, name: string, role: string } } = {
    "sarah@example.com": { id: "a1b2c3d4-e5f6-7890-1234-567890abcdef", name: "Sarah Johnson", role: "Admission Manager"},
    "michael@example.com": { id: "b2c3d4e5-f6a7-8901-2345-67890abcdeff", name: "Michael Smith", role: "Admission Executive"},
    "emily@example.com": { id: "c3d4e5f6-a7b8-9012-3456-7890abcdef01", name: "Emily Davis", role: "Marketing Manager"},
    "david@example.com": { id: "d4e5f6a7-b8c9-0123-4567-890abcdef012", name: "David Chen", role: "Finance"},
    "admin@example.com": { id: "e5f6a7b8-c9d0-1234-5678-90abcdef0123", name: "Admin User", role: "Super Admin"},
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
    console.log("Login attempt with:", values);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = mockUsers[values.email];

    if (user && values.password) {
        toast({
            title: "Login Successful",
            description: `Welcome back, ${user.name}! Redirecting...`,
        });
        
        router.push(`/u/crm/egspgoi/portal/${user.id}/dashboard`);
    } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid email or password.",
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
        <Button variant="outline" className="w-full" type="button">
          Login with Google
        </Button>
      </form>
    </Form>
  );
}
