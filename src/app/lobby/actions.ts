'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';

import { createClient } from '@/lib/supabase/server';

const campaignSchema = z.object({
  title: z.string().trim().min(1).max(100),
});

const inviteSchema = z.object({
  inviteCode: z.string().trim().min(4).max(32),
});

async function requireUser() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();

  const userId = data?.claims?.sub;

  if (error || !userId) {
    redirect('/login');
  }

  return {
    supabase,
    userId,
  };
}

export async function createCampaign(formData: FormData) {
  const parsed = campaignSchema.safeParse({
    title: formData.get('title'),
  });

  if (!parsed.success) {
    redirect('/lobby?error=' + encodeURIComponent('Enter a campaign title.'));
  }

  const { supabase } = await requireUser();

  const { data, error } = await supabase.rpc('create_campaign', {
    campaign_title: parsed.data.title,
  });

  if (error || !data) {
    redirect('/lobby?error=' + encodeURIComponent(error?.message ?? 'Could not create campaign.'));
  }

  redirect(`/campaigns/${data}/lobby`);
}

export async function joinCampaign(formData: FormData) {
  const parsed = inviteSchema.safeParse({
    inviteCode: formData.get('inviteCode'),
  });

  if (!parsed.success) {
    redirect('/lobby?error=' + encodeURIComponent('Enter a valid invite code.'));
  }

  const { supabase } = await requireUser();

  const { data, error } = await supabase.rpc('join_campaign_by_invite_code', {
    supplied_invite_code: parsed.data.inviteCode,
  });

  if (error || !data) {
    redirect('/lobby?error=' + encodeURIComponent(error?.message ?? 'Could not join campaign.'));
  }

  redirect(`/campaigns/${data}/lobby`);
}
