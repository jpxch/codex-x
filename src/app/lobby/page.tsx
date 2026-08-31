import Link from 'next/link';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import { createCampaign, joinCampaign } from './actions';
import styles from './page.module.scss';

type LobbyPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LobbyPage({ searchParams }: LobbyPageProps) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) {
    redirect('/login');
  }

  const params = await searchParams;

  const { data: memberships } = await supabase
    .from('campaign_members')
    .select('campaign_id, role')
    .eq('user_id', userId);

  const campaignIds = memberships?.map((membership) => membership.campaign_id) ?? [];

  const { data: campaigns } = campaignIds.length
    ? await supabase.from('campaigns').select('id, title, status').in('id', campaignIds)
    : { data: [] };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>CODEX</p>
          <h1>Campaigns</h1>
        </div>

        <form action="/auth/signout" method="post">
          <button className={styles.signout}>Sign out</button>
        </form>
      </header>

      {params.error && <p className={styles.error}>{params.error}</p>}

      <section className={styles.grid}>
        <form action={createCampaign} className={styles.card}>
          <span>Create</span>
          <h2>Begin a new campaign</h2>

          <label>
            Campaign title
            <input name="title" placeholder="The Ashen Crown" maxLength={100} required />
          </label>

          <button>Create campaign</button>
        </form>

        <form action={joinCampaign} className={styles.card}>
          <span>Join</span>
          <h2>Enter an existing campaign</h2>

          <label>
            Invite code
            <input name="inviteCode" placeholder="A1B2C3D4" autoCapitalize="characters" required />
          </label>

          <button>Join campaign</button>
        </form>
      </section>

      {campaigns && campaigns.length > 0 && (
        <section className={styles.campaigns}>
          <h2>Your campaigns</h2>

          <div className={styles.campaignList}>
            {campaigns.map((campaign) => (
              <Link
                key={campaign.id}
                href={`/campaings/${campaign.id}/lobby`}
                className={styles.campaign}
              >
                <strong>{campaign.title}</strong>
                <span>{campaign.status}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
