// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { createHash, randomBytes } = require('crypto');

const handler = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const authHeader: string = req.headers.authorization ?? '';
    const accessToken = authHeader.replace('Bearer ', '');
    if (!accessToken) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error: userError } = await supabase.auth.getUser(accessToken);
    const user = data?.user;
    if (userError || !user) return res.status(401).json({ error: 'Invalid session' });

    const { redirect_uri, state, extension_id } = req.body;

    if (!redirect_uri || !extension_id) {
      return res.status(400).json({ error: 'Missing redirect_uri or extension_id' });
    }

    const rawCode = randomBytes(32).toString('hex');
    const codeHash = createHash('sha256').update(rawCode).digest('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from('extension_auth_codes').insert({
      user_id: user.id,
      code_hash: codeHash,
      redirect_uri,
      extension_id,
      state: state ?? null,
      expires_at: expiresAt,
    });

    if (insertError) return res.status(500).json({ error: `DB error: ${insertError.message}` });

    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set('session_code', rawCode);
    if (state) redirectUrl.searchParams.set('state', state);

    return res.status(200).json({ redirect: redirectUrl.toString() });
  } catch (err: any) {
    return res.status(500).json({ error: `Unexpected error: ${err?.message ?? String(err)}` });
  }
};

module.exports = handler;
