// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');

const REDIRECT_URI = 'https://youtool.io/account/extension-youtube-connect/callback';
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
].join(' ');

const handler = async (req: any, res: any) => {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'unauthorized' });

    const { data: { user }, error } = await supabase.auth.getUser(authHeader.slice(7));
    if (error || !user) return res.status(401).json({ error: 'unauthorized' });

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID);
    url.searchParams.set('redirect_uri', REDIRECT_URI);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', SCOPES);
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    url.searchParams.set('state', Buffer.from(user.id).toString('base64'));

    return res.status(200).json({ url: url.toString() });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message ?? String(err) });
  }
};

module.exports = handler;
