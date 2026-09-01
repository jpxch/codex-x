import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';

import { login, signup } from './actions';
import styles from './page.module.scss';

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    message?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  if (data?.claims.sub) {
    redirect('/lobby');
  }

  const params = await searchParams;

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <div>
          <p className={styles.eyebrow}>CODEX</p>
          <h1>Enter the campaign</h1>
          <p className={styles.intro}>Sign in or create your player identity.</p>
        </div>

        {params.error && <p className={styles.error}>{params.error}</p>}

        {params.message && <p className={styles.message}>{params.message}</p>}

        <form className={styles.form}>
          <label>
            Display name
            <input name="displayName" type="text" maxLength={50} placeholder="Your name" />
          </label>

          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>

          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
            />
          </label>

          <div className={styles.actions}>
            <button formAction={login}>Sign in</button>

            <button className={styles.secondary} formAction={signup}>
              Create account
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
