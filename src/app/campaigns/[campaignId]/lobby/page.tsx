import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import { LiveLobby } from './LiveLobby';
import { ReadyButton } from './ReadyButton';
import styles from './page.module.scss';

type CampaignLobbyPageProps = {
  params: Promise<{
    campaignId: string;
  }>;
};

export default async function CampaignLobbyPage({ params }: CampaignLobbyPageProps) {
  const { campaignId } = await params;

  const supabase = await createClient();

  const { data: claimsData } = await supabase.auth.getClaims();

  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect('/login');
  }

  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, title, status, created_by')
    .eq('id', campaignId)
    .maybeSingle();

  if (!campaign) {
    notFound();
  }

  const { data: members, error: membersError } = await supabase
    .from('campaign_members')
    .select('user_id, role, ready, joined_at')
    .eq('campaign_id', campaignId)
    .order('joined_at');

  if (membersError) {
    throw new Error(membersError.message);
  }

  const memberIds = members?.map((member) => member.user_id) ?? [];

  const { data: profiles } = memberIds.length
    ? await supabase.from('profiles').select('id, display_name').in('id', memberIds)
    : { data: [] };

  const names = new Map(profiles?.map((profile) => [profile.id, profile.display_name]));

  const curerntMembership = members?.find((member) => member.user_id === userId);

  const isHost = campaign.created_by === userId;

  let inviteCode: string | null = null;

  if (isHost) {
    const { data } = await supabase.rpc('get_campaign_invite_code', {
      target_campaign_id: campaignId,
    });

    inviteCode = data;
  }

  return (
    <main className={styles.page}>
      <LiveLobby campaignId={campaignId} />

      <Link href="/lobby" className={styles.back}>
        ← Campaigns
      </Link>

      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>CAMPAIGN LOBBY</p>
          <h1>{campaign.title}</h1>
          <p>{campaign.status}</p>
        </div>

        {isHost && inviteCode && (
          <aside className={styles.invite}>
            <span>Invite code</span>
            <strong>{inviteCode}</strong>
          </aside>
        )}
      </header>

      <section>
        <div className={styles.sectionHeader}>
          <h2>Party</h2>
          <span>{members?.length ?? 0} players</span>
        </div>

        <div className={styles.members}>
          {members?.map((member) => (
            <article key={member.user_id} className={styles.member}>
              <div>
                <strong>{names.get(member.user_id) ?? 'Unnamed player'}</strong>

                <span>{member.role}</span>
              </div>

              <p className={member.ready ? styles.ready : styles.waiting}>
                {member.ready ? 'Ready' : 'Not ready'}
              </p>
            </article>
          ))}
        </div>
      </section>

      {curerntMembership && (
        <div className={styles.readyControl}>
          <ReadyButton campaignId={campaignId} ready={curerntMembership.ready} />
        </div>
      )}
    </main>
  );
}
