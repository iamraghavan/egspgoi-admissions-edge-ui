import Image from "next/image";
import { AppLogo } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="w-full min-h-screen relative flex items-center justify-center p-4">
      <Image
        src="https://res.cloudinary.com/dtz0urit6/image/upload/f_webp,q_auto/cloudinary-tools-uploads/pjo73dbukwo1znq18szt.webp"
        alt="A modern university building with a striking architectural design, viewed from a low angle against a clear sky."
        fill
        priority
        className="object-cover"
        data-ai-hint="university campus"
      />
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <Card className="mx-auto max-w-sm w-full z-10">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <AppLogo className="w-10 h-10 text-primary" />
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
