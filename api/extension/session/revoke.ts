// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash } = require('crypto');

const handler = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { refresh_token } = req.body;
    if (!refresh_token) return res.status(400).json({ error: 'invalid_request' });

    const refreshHash = createHash('sha256').update(refresh_token).digest('hex');

    await supabase
      .from('extension_sessions')
      .update({ revoked_at: new Date().toISOString() })
      .eq('refresh_token_hash', refreshHash);

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: `Unexpected error: ${err?.message ?? String(err)}` });
  }
};

module.exports = handler;
