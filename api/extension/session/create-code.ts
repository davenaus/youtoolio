import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const authHeader = req.headers.authorization ?? '';
  const accessToken = authHeader.replace('Bearer ', '');
  if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

  // Verify the Supabase session
  const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);
  if (userError || !user) return res.status(401).json({ error: 'Invalid session' });

  const { redirect_uri, state, extension_id } = req.body as {
    redirect_uri: string;
    state: string;
    extension_id: string;
  };

  if (!redirect_uri || !extension_id) {
    return res.status(400).json({ error: 'Missing redirect_uri or extension_id' });
  }

  // Generate one-time code
  const rawCode = randomBytes(32).toString('hex');
  const codeHash = createHash('sha256').update(rawCode).digest('hex');
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

  const { error: insertError } = await supabase.from('extension_auth_codes').insert({
    user_id: user.id,
    code_hash: codeHash,
    redirect_uri,
    extension_id,
    state: state ?? null,
    expires_at: expiresAt,
  });

  if (insertError) return res.status(500).json({ error: 'Failed to create code' });

  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set('session_code', rawCode);
  if (state) redirectUrl.searchParams.set('state', state);

  return res.status(200).json({ redirect: redirectUrl.toString() });
}
