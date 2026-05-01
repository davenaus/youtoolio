// @ts-nocheck
const handler = (req: any, res: any) => {
  return res.status(200).json({
    ok: true,
    hasSupabaseUrl: !!process.env.REACT_APP_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });
};

module.exports = handler;
