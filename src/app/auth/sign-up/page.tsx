'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser';

const schema = z
  .object({
    name: z.string().min(2).optional(),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export default function SignUpPage() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setFormError(null);
    setSuccessMessage(null);

    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: values.name ? { data: { name: values.name } } : undefined,
    });

    if (error) {
      setFormError(error.message);
      return;
    }

    if (!data.session) {
      setSuccessMessage(
        'Check your email to confirm your account, then come back to sign in.'
      );
      return;
    }

    router.replace('/products');
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign up</h1>
      <p className="text-gray-600 mb-6">
        Create an account to save your cart and place orders.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Name (optional)"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          leftIcon={<UserIcon className="w-4 h-4" />}
          fullWidth
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          leftIcon={<Mail className="w-4 h-4" />}
          fullWidth
          {...register('email')}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          leftIcon={<Lock className="w-4 h-4" />}
          fullWidth
          {...register('password')}
        />

        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          leftIcon={<Lock className="w-4 h-4" />}
          fullWidth
          {...register('confirmPassword')}
        />

        {formError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {formError}
          </div>
        )}
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
            {successMessage}
          </div>
        )}

        <Button type="submit" fullWidth loading={isSubmitting}>
          Sign up
        </Button>
      </form>

      <p className="text-sm text-gray-600 mt-6">
        Already have an account?{' '}
        <Link href="/auth/sign-in" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

