'use client';

import React, { useState } from 'react';

import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface MessageFieldProps {
  teamId: string;
}

export default function MessageField({ teamId }: MessageFieldProps) {
  const [message, setMessage] = useState('');
  const [placeholder, setPlaceholder] = useState('Type your message here...');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (text: string) => {
    const response = await fetch('/api/message', {
      method: 'POST',
      body: JSON.stringify({ text, teamId }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      setPlaceholder('Type your message...');
      setMessage('');
    } else {
      setPlaceholder('Failed to send message');
    }
    setIsLoading(false);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleClick = () => {
    setIsLoading(true);
    sendMessage(message);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleClick(); // Call handleClick function when Enter key is pressed
    }
  };

  return (
    <div className='grid w-full items-center gap-4 p-6'>
      <Label>Message</Label>
      <div className='flex w-full items-center space-x-2'>
        <Input
          type='text'
          placeholder={placeholder}
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress} // Add event listener for key press
        />
        <Button size='sm' onClick={handleClick} disabled={isLoading}>
          {isLoading && (
            <Icons.spinner
              className='mr-2 size-4 animate-spin'
              aria-hidden='true'
            />
          )}
          Send
        </Button>
      </div>
    </div>
  );
}
