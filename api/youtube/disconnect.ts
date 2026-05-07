// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');
const { revokeYouTubeAnalyticsStorage } = require('../../lib/youtube-analytics-store');

const handler = async (req: any, res: any) => {
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });

    const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7));
    if (error || !user) return res.status(401).json({ error: 'unauthorized' });

    const { error: updateError } = await supabase
      .from('youtube_connections')
      .update({ disconnected_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .is('disconnected_at', null);

    if (updateError) return res.status(500).json({ error: updateError.message });

    await revokeYouTubeAnalyticsStorage(supabase, { userId: user.id });

    return res.status(200).json({ ok: true });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

module.exports = handler;
