
import { AppLogo } from '@/components/icons';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import placeholderImagesData from '@/lib/placeholder-images.json';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
};

export default function LoginPage() {
  const loginImage = placeholderImagesData.placeholderImages.find(p => p.id === "login-background");

  return (
    <div 
      className="w-full min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${loginImage?.imageUrl})` }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <Card className="mx-auto max-w-sm w-full z-10">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <AppLogo className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
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
