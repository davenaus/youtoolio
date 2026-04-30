import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { refresh_token } = req.body as { refresh_token: string };
  if (!refresh_token) return res.status(400).json({ error: 'invalid_request' });

  const refreshHash = createHash('sha256').update(refresh_token).digest('hex');

  await supabase
    .from('extension_sessions')
    .update({ revoked_at: new Date().toISOString() })
    .eq('refresh_token_hash', refreshHash);

  return res.status(200).json({ ok: true });
}
