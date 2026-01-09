
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Phone, Delete, Loader2 } from 'lucide-react';
import { useDialer } from '@/hooks/use-dialer';
import { useToast } from '@/hooks/use-toast';
import { dialNumber } from '@/lib/data';
import { getProfile } from '@/lib/auth';

const dialerKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'];

export function DialerSheet() {
  const { isDialerOpen, closeDialer } = useDialer();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');


  useEffect(() => {
    const fetchProfile = async () => {
      if (isDialerOpen) {
        const profile = await getProfile();
        if (profile) {
          setUserName(profile.name);
          setUserPhone(profile.phone || '');
        }
      }
    }
    fetchProfile();
  }, [isDialerOpen]);

  const handleKeyPress = (key: string) => {
    if (phoneNumber.length < 15) {
      setPhoneNumber(phoneNumber + key);
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[^0-9*#]/g, '');
    if (sanitizedValue.length <= 15) {
        setPhoneNumber(sanitizedValue);
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
      <SheetContent className="flex flex-col p-4" side="left">
        <SheetHeader>
          <SheetTitle>Dialer</SheetTitle>
        </SheetHeader>
        <div className="flex-grow flex flex-col pt-4">
            <div className="space-y-4 text-sm mb-4">
                <div className="grid grid-cols-3 items-center">
                    <span className="text-muted-foreground">Welcome:</span>
                    <span className="col-span-2 text-primary font-semibold">{userName}</span>
                </div>
                 <div className="grid grid-cols-3 items-center">
                    <span className="text-muted-foreground">To:</span>
                    <div className='col-span-2 relative'>
                        <Input
                            value={phoneNumber}
                            onChange={handlePhoneNumberChange}
                            placeholder="Enter Number"
                            className="h-8 border-0 border-b rounded-none px-0 focus-visible:ring-0"
                        />
                        {phoneNumber.length > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8"
                            onClick={handleBackspace}
                        >
                            <Delete className="h-5 w-5 text-muted-foreground" />
                        </Button>
                        )}
                    </div>
                </div>
                 <div className="grid grid-cols-3 items-center">
                    <span className="text-muted-foreground">Mode:</span>
                    <p className="col-span-2">Agent Phone Number</p>
                </div>
                 <div className="grid grid-cols-3 items-center">
                    <span className="text-muted-foreground">From:</span>
                    <p className="col-span-2">{userPhone}</p>
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center">
                <div className="grid grid-cols-3 gap-4 my-4">
                    {dialerKeys.map((key) => (
                    <Button
                        key={key}
                        variant="outline"
                        className="h-16 w-16 text-xl font-bold rounded-full mx-auto"
                        onClick={() => handleKeyPress(key)}
                    >
                        {key}
                    </Button>
                    ))}
                </div>
            </div>
            
            <div className="flex justify-center mt-auto pb-4">
                <Button
                    size="icon"
                    className="w-16 h-16 rounded-full"
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
