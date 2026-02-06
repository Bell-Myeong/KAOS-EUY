'use client';

import Link from 'next/link';
import { LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/contexts/AuthContext';

export function AuthButton() {
  const { user, isLoading, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="hidden md:block">
        <div className="h-10 w-24 rounded-lg bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="hidden md:block">
        <Link href="/auth/sign-in">
          <Button variant="outline" size="sm" leftIcon={LogIn}>
            Sign in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="hidden md:block">
      <Button
        variant="ghost"
        size="sm"
        leftIcon={LogOut}
        onClick={async () => {
          await signOut();
        }}
      >
        Sign out
      </Button>
    </div>
  );
}

