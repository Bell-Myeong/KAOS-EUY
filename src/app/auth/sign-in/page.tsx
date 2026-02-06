import { Suspense } from 'react';
import { SignInForm } from '@/app/auth/sign-in/sign-in-form';

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 animate-pulse">
          <div className="h-7 bg-gray-200 rounded w-32 mb-3" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-6" />
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

