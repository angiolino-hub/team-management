'use client';
import { Label } from '@radix-ui/react-dropdown-menu';
import { useRouter } from 'next/navigation';
import React from 'react';
import toast from 'react-hot-toast';

import { useLogInStatusStore } from '@/lib/store';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser-clients';

import { Icons } from '@/components/icons';
import LoginWithGoogleButton from '@/components/login-buttons/google-login-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const LoginDialog = () => {
  const [email, setEmail] = React.useState('');
  const [isLoginLoading, setIsLoginLoading] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const { setLogInStatus } = useLogInStatusStore();

  const supabase = createSupabaseBrowserClient();
  const router = useRouter();

  async function signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      toast.error(error.message);
      setIsLoginLoading(false);
    } else if (data) {
      toast.success('Logged in successfully');
      setLogInStatus(true);
      setIsLoginLoading(false);
    }

    router.refresh();
  }

  function createAccountButtonClick() {
    router.push('/create-account');
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size='sm'>Log In</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader className='space-y-1'>
          <DialogTitle className='text-2xl'>Create an account</DialogTitle>
          <DialogDescription>
            Enter your email below to create your account
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='flex items-center justify-center'>
            <Icons.google className='mr-2 h-4 w-4' />
            <LoginWithGoogleButton />
          </div>
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <span className='w-full border-t' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-background px-2 text-muted-foreground'>
                Or continue with
              </span>
            </div>
          </div>
          <div className='grid gap-2'>
            <Label>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='email@gmail.com'
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
          </div>
          <div className='grid gap-2'>
            <Label>Password</Label>
            <Input
              id='password'
              type='password'
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </div>
          <Button
            onClick={() => {
              setIsLoginLoading(true);
              signInWithEmail(email, password);
            }}
          >
            {isLoginLoading && (
              <Icons.spinner className='animate-spin h-4 w-4 mr-2' />
            )}
            Log In
          </Button>
        </div>
        <DialogFooter>
          <div className='w-full flex items-center justify-center'>
            <p className='text-sm'>Don't have an account?</p>
            <DialogClose asChild>
              <Button
                variant='link'
                className='inline-flex text-white text-md focus-visible:ring-primary-500 focus:outline-none focus-visible:rounded focus-visible:ring focus-visible:ring-offset-2 hover:underline'
                onClick={() => createAccountButtonClick()}
              >
                Create account
              </Button>
            </DialogClose>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoginDialog;
