// @ts-nocheck
const { createClient } = require('@supabase/supabase-js');

const handler = async (req: any, res: any) => {
  if (req.method !== 'GET') return res.status(405).end();

  try {
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const authHeader: string | undefined = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const accessToken = authHeader.slice(7);
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) return res.status(401).json({ error: 'unauthorized' });

    const { data: session } = await supabase
      .from('extension_sessions')
      .select('last_used_at')
      .eq('user_id', user.id)
      .is('revoked_at', null)
      .order('last_used_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return res.status(200).json({
      connected: !!session,
      last_used_at: session?.last_used_at ?? null,
    });
  } catch (err: any) {
    return res.status(500).json({ error: `Unexpected error: ${err?.message ?? String(err)}` });
  }
};

module.exports = handler;
