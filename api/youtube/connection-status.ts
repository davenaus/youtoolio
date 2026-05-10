// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');

const handler = async (req: any, res: any) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'method_not_allowed' });

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7));
    if (error || !user) return res.status(401).json({ error: 'unauthorized' });

    const { data: connection, error: connectionError } = await supabase
      .from('youtube_connections')
      .select('channel_title, channel_thumbnail_url')
      .eq('user_id', user.id)
      .is('disconnected_at', null)
      .maybeSingle();

    if (connectionError) {
      return res.status(500).json({ error: 'connection_status_failed' });
    }

    return res.status(200).json({
      connected: Boolean(connection),
      channelTitle: connection?.channel_title || null,
      channelThumbnail: connection?.channel_thumbnail_url || null,
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'connection_status_failed',
      message: err?.message || 'Could not load YouTube connection status.',
    });
  }
};

module.exports = handler;
