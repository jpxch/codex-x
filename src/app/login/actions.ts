'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const signupSchema = loginSchema.extend({
  displayName: z.string().trim().min(1).max(50),
});

function errorRedirect(message: string): never {
  redirect(`/login?error=${encodeURIComponent(message)}`);
}

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    errorRedirect('Enter a valid email and password.');
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    errorRedirect(error.message);
  }

  redirect('/lobby');
}

export async function signup(formData: FormData) {
  const parsed = signupSchema.safeParse({
    displayName: formData.get('displayName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    errorRedirect('Enter a display name, valid email, and password of at least 8 characters.');
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        display_name: parsed.data.displayName,
      },
    },
  });

  if (error) {
    errorRedirect(error.message);
  }

  if (!data.session) {
    redirect('/login?message=' + encodeURIComponent('Check your email to confirm your account'));
  }

  redirect('/lobby');
}
