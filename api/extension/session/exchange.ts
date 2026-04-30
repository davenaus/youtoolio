import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHash, randomBytes } from 'crypto';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ACCESS_TOKEN_TTL_MS  = 15 * 60 * 1000;       // 15 min
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { grant_type, code, redirect_uri, extension_id } = req.body as {
    grant_type: string;
    code: string;
    redirect_uri: string;
    extension_id: string;
  };

  if (grant_type !== 'authorization_code' || !code || !redirect_uri || !extension_id) {
    return res.status(400).json({ error: 'invalid_request' });
  }

  const codeHash = createHash('sha256').update(code).digest('hex');

  // Find and validate the one-time code
  const { data: row, error } = await supabase
    .from('extension_auth_codes')
    .select('*')
    .eq('code_hash', codeHash)
    .eq('redirect_uri', redirect_uri)
    .eq('extension_id', extension_id)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single();

  if (error || !row) return res.status(400).json({ error: 'invalid_code' });

  // Mark code as used
  await supabase
    .from('extension_auth_codes')
    .update({ used_at: new Date().toISOString() })
    .eq('id', row.id);

  // Issue tokens
  const rawAccess  = randomBytes(40).toString('hex');
  const rawRefresh = randomBytes(40).toString('hex');
  const accessHash  = createHash('sha256').update(rawAccess).digest('hex');
  const refreshHash = createHash('sha256').update(rawRefresh).digest('hex');
  const expiresAt   = new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString();

  await supabase.from('extension_sessions').insert({
    user_id: row.user_id,
    extension_id,
    access_token_hash: accessHash,
    refresh_token_hash: refreshHash,
    expires_at: expiresAt,
    user_agent: req.headers['user-agent'] ?? null,
  });

  // Get user info to return
  const { data: { user } } = await supabase.auth.admin.getUserById(row.user_id);

  return res.status(200).json({
    access_token: rawAccess,
    refresh_token: rawRefresh,
    expires_at: new Date(Date.now() + ACCESS_TOKEN_TTL_MS).getTime() / 1000,
    user: {
      id: user?.id,
      email: user?.email,
      user_metadata: user?.user_metadata,
    },
  });
}
