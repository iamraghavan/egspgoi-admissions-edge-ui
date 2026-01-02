
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Phone, Delete, Loader2 } from 'lucide-react';
import { useDialer } from '@/hooks/use-dialer';
import { useToast } from '@/hooks/use-toast';
import { dialNumber } from '@/lib/data';

const dialerKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export function DialerSheet() {
  const { isDialerOpen, closeDialer } = useDialer();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);

  const handleKeyPress = (key: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(phoneNumber + key);
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(phoneNumber.slice(0, -1));
  };

  const handleCall = async () => {
    if (phoneNumber.length < 3) {
      toast({
        variant: 'destructive',
        title: 'Invalid Number',
        description: 'Please enter a valid phone number.',
      });
      return;
    }
    setIsCalling(true);
    try {
      await dialNumber(phoneNumber);
      toast({
        title: 'Calling...',
        description: `Initiating call to ${phoneNumber}`,
      });
      closeDialer();
      setPhoneNumber('');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Call Failed',
        description: error.message || 'Could not initiate the call.',
      });
    } finally {
      setIsCalling(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber('');
    closeDialer();
  };

  return (
    <Sheet open={isDialerOpen} onOpenChange={handleClose}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Dialer</SheetTitle>
          <SheetDescription>Enter a number to make an outbound call.</SheetDescription>
        </SheetHeader>
        <div className="flex-grow flex flex-col justify-between py-4">
          <div className="relative mb-4">
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              className="text-center text-2xl h-14 pr-10"
            />
            {phoneNumber.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={handleBackspace}
              >
                <Delete className="h-5 w-5 text-muted-foreground" />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {dialerKeys.map((key) => (
              <Button
                key={key}
                variant="outline"
                className="h-16 text-xl font-bold"
                onClick={() => handleKeyPress(key)}
              >
                {key}
              </Button>
            ))}
          </div>
          
           <div className="mt-auto pt-4">
             <Button
                size="lg"
                className="w-full h-16 bg-green-500 hover:bg-green-600 text-white"
                onClick={handleCall}
                disabled={isCalling}
              >
                {isCalling ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <Phone className="h-6 w-6" />
                )}
             </Button>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
