// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash, randomBytes } = require('crypto');

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

const handler = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { grant_type, refresh_token, extension_id } = req.body;

    if (grant_type !== 'refresh_token' || !refresh_token || !extension_id) {
      return res.status(400).json({ error: 'invalid_request' });
    }

    const refreshHash = createHash('sha256').update(refresh_token).digest('hex');

    const { data: session, error } = await supabase
      .from('extension_sessions')
      .select('*')
      .eq('refresh_token_hash', refreshHash)
      .eq('extension_id', extension_id)
      .is('revoked_at', null)
      .single();

    if (error || !session) return res.status(401).json({ error: 'invalid_refresh_token' });

    const rawAccess      = randomBytes(40).toString('hex');
    const rawRefresh     = randomBytes(40).toString('hex');
    const accessHash     = createHash('sha256').update(rawAccess).digest('hex');
    const newRefreshHash = createHash('sha256').update(rawRefresh).digest('hex');
    const expiresAt      = new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString();

    await supabase
      .from('extension_sessions')
      .update({
        access_token_hash: accessHash,
        refresh_token_hash: newRefreshHash,
        expires_at: expiresAt,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    const { data: { user } } = await supabase.auth.admin.getUserById(session.user_id);

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
  } catch (err: any) {
    return res.status(500).json({ error: `Unexpected error: ${err?.message ?? String(err)}` });
  }
};

module.exports = handler;
