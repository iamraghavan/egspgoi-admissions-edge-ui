import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/login-form';
import { AppLogo } from '@/components/icons';
import placeholderImages from '@/lib/placeholder-images.json';

export default function LoginPage() {
  const loginBg = placeholderImages.placeholderImages.find(p => p.id === 'login-background');

  return (
    <div className="w-full min-h-screen relative flex items-center justify-center p-4">
      {loginBg && (
        <Image
          src={loginBg.imageUrl}
          alt={loginBg.description}
          fill
          priority
          className="object-cover"
          data-ai-hint={loginBg.imageHint}
        />
      )}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <Card className="mx-auto max-w-sm w-full z-10">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <AppLogo className="w-10 h-10 text-primary" />
            </div>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
