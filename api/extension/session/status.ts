import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const authHeader = req.headers.authorization;
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
}
