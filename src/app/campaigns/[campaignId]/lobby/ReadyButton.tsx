'use client';

import { useTransition } from 'react';

import { setReady } from './actions';

type ReadyButtonProps = {
  campaignId: string;
  ready: boolean;
};

export function ReadyButton({ campaignId, ready }: ReadyButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await setReady(campaignId, !ready);
        });
      }}
    >
      {pending ? 'Updating...' : ready ? "I'm not ready" : "I'm ready"}
    </button>
  );
}
