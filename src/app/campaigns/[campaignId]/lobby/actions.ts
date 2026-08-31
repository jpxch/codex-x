'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

export async function setReady(campaignId: string, ready: boolean) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    redirect('/login');
  }

  const { error } = await supabase
    .from('campaing_members')
    .update({ ready })
    .eq('campaing_id', campaignId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/campaigns/${campaignId}/lobby`);
}
