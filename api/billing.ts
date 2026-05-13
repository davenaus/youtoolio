// @ts-nocheck
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

export const config = {
  api: {
    bodyParser: false,
  },
};

const STRIPE_API_BASE = 'https://api.stripe.com/v1';
const ACTIVE_STATUSES = new Set(['active', 'trialing']);
const ENDED_STATUSES = new Set(['canceled', 'cancelled', 'incomplete_expired', 'past_due', 'unpaid']);

function getSupabase() {
  return createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

function getBaseUrl(req: any) {
  const configured = process.env.SITE_URL || process.env.REACT_APP_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) {
    return configured.startsWith('http') ? configured.replace(/\/$/, '') : `https://${configured.replace(/\/$/, '')}`;
  }

  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.youtool.io';
  return `${proto}://${host}`.replace(/\/$/, '');
}

function getStripeSecret() {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw createHttpError(500, 'Stripe is not configured.');
  return secret;
}

function createHttpError(status: number, message: string, code = 'billing_error') {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function readRawBody(req: any): Promise<string> {
  return await new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function safeJsonParse(raw: string) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (error) {
    throw createHttpError(400, 'Invalid JSON body.', 'invalid_json');
  }
}

async function resolveUser(supabase: any, req: any) {
  const authHeader = String(req.headers.authorization || '');
  if (!authHeader.startsWith('Bearer ')) {
    throw createHttpError(401, 'Sign in to manage billing.', 'unauthorized');
  }

  const token = authHeader.slice(7);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    throw createHttpError(401, 'Sign in to manage billing.', 'unauthorized');
  }

  return user;
}

async function stripeRequest(path: string, params?: Record<string, any>, method = 'POST') {
  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getStripeSecret()}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params ? toStripeFormData(params) : undefined,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.error?.message || `Stripe request failed with ${response.status}.`;
    throw createHttpError(response.status, message, payload?.error?.code || 'stripe_error');
  }

  return payload;
}

function toStripeFormData(params: Record<string, any>) {
  const body = new URLSearchParams();

  function append(prefix: string, value: any) {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((item, index) => append(`${prefix}[${index}]`, item));
      return;
    }
    if (typeof value === 'object') {
      Object.entries(value).forEach(([key, nested]) => append(`${prefix}[${key}]`, nested));
      return;
    }
    body.append(prefix, String(value));
  }

  Object.entries(params).forEach(([key, value]) => append(key, value));
  return body;
}

function getPriceId(interval: string) {
  if (interval === 'yearly') return process.env.STRIPE_PRICE_PREMIUM_YEARLY;
  if (interval === 'monthly') return process.env.STRIPE_PRICE_PREMIUM_MONTHLY;
  return '';
}

function normalizeInterval(value: string) {
  return value === 'yearly' ? 'yearly' : 'monthly';
}

async function readSubscription(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw createHttpError(500, `Could not read billing status: ${error.message}`, 'subscription_read_failed');
  }

  return data || null;
}

async function readYouTubeConnection(supabase: any, userId: string) {
  const { data } = await supabase
    .from('youtube_connections')
    .select('id')
    .eq('user_id', userId)
    .is('disconnected_at', null)
    .maybeSingle();

  return data || null;
}

async function ensureStripeCustomer(supabase: any, user: any, subscription: any) {
  if (subscription?.stripe_customer_id) return subscription.stripe_customer_id;

  const customer = await stripeRequest('/customers', {
    email: user.email || undefined,
    name: user.user_metadata?.full_name || undefined,
    metadata: {
      user_id: user.id,
      app: 'youtool',
    },
  });

  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      user_id: user.id,
      stripe_customer_id: customer.id,
      status: subscription?.status || 'free',
      plan: subscription?.plan || 'free',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (error) {
    throw createHttpError(500, `Could not save Stripe customer: ${error.message}`, 'customer_save_failed');
  }

  return customer.id;
}

function isActiveSubscription(row: any) {
  if (!row) return false;
  const status = String(row.status || row.subscription_status || row.stripe_status || '').toLowerCase();
  const periodEnd = row.current_period_end ? new Date(row.current_period_end) : null;
  const accessWindowOpen = !periodEnd || periodEnd.getTime() > Date.now();

  if (ACTIVE_STATUSES.has(status)) return accessWindowOpen;
  if (ENDED_STATUSES.has(status)) return false;

  return Boolean(row.is_premium || (periodEnd && periodEnd.getTime() > Date.now() && String(row.plan || '').toLowerCase() !== 'free'));
}

function publicBillingStatus(row: any) {
  const isPremium = isActiveSubscription(row);

  return {
    plan: isPremium ? 'premium' : 'free',
    label: isPremium ? 'Premium' : 'Free',
    isPremium,
    status: row?.status || 'free',
    interval: row?.price_interval || null,
    priceId: row?.stripe_price_id || null,
    currentPeriodEnd: row?.current_period_end || null,
    cancelAtPeriodEnd: Boolean(row?.cancel_at_period_end),
    hasStripeCustomer: Boolean(row?.stripe_customer_id),
  };
}

async function createCheckoutSession(req: any, supabase: any, user: any, body: any) {
  const youtubeConnection = await readYouTubeConnection(supabase, user.id);
  if (!youtubeConnection) {
    throw createHttpError(409, 'Connect your YouTube channel before upgrading to Premium.', 'youtube_required');
  }

  const interval = normalizeInterval(String(body.interval || body.plan || 'monthly'));
  const priceId = getPriceId(interval);
  if (!priceId) throw createHttpError(500, 'Stripe price is not configured.', 'stripe_price_missing');

  const subscription = await readSubscription(supabase, user.id);
  const customerId = await ensureStripeCustomer(supabase, user, subscription);
  const baseUrl = getBaseUrl(req);

  const session = await stripeRequest('/checkout/sessions', {
    mode: 'subscription',
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/account?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/account?checkout=cancelled`,
    allow_promotion_codes: true,
    metadata: {
      user_id: user.id,
      app: 'youtool',
      plan: 'premium',
      interval,
    },
    subscription_data: {
      metadata: {
        user_id: user.id,
        app: 'youtool',
        plan: 'premium',
        interval,
      },
    },
  });

  return { url: session.url };
}

async function createPortalSession(req: any, supabase: any, user: any) {
  const subscription = await readSubscription(supabase, user.id);
  if (!subscription?.stripe_customer_id) {
    throw createHttpError(404, 'No Stripe customer exists for this account yet.', 'missing_customer');
  }

  const baseUrl = getBaseUrl(req);
  const session = await stripeRequest('/billing_portal/sessions', {
    customer: subscription.stripe_customer_id,
    return_url: `${baseUrl}/account`,
  });

  return { url: session.url };
}

function verifyStripeSignature(rawBody: string, signature: string, secret: string) {
  const parts = String(signature || '').split(',').reduce((acc: any, part) => {
    const [key, value] = part.split('=');
    if (!key || !value) return acc;
    if (!acc[key]) acc[key] = [];
    acc[key].push(value);
    return acc;
  }, {});
  const timestamp = parts.t?.[0];
  const signatures = parts.v1 || [];

  if (!timestamp || !signatures.length) return false;

  const ageMs = Math.abs(Date.now() - Number(timestamp) * 1000);
  if (!Number.isFinite(ageMs) || ageMs > 5 * 60 * 1000) return false;

  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const expectedBuffer = Buffer.from(expected, 'hex');

  return signatures.some((candidate: string) => {
    const candidateBuffer = Buffer.from(candidate, 'hex');
    return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
  });
}

async function retrieveStripeSubscription(subscriptionId: string) {
  return await stripeRequest(
    `/subscriptions/${encodeURIComponent(subscriptionId)}?expand[]=items.data.price`,
    undefined,
    'GET'
  );
}

async function retrieveCheckoutSession(sessionId: string) {
  return await stripeRequest(
    `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=subscription&expand[]=subscription.items.data.price`,
    undefined,
    'GET'
  );
}

function timestampToIso(value: any) {
  const timestamp = Number(value || 0);
  return timestamp ? new Date(timestamp * 1000).toISOString() : null;
}

function subscriptionFieldsFromStripe(subscription: any, userId: string | null) {
  const price = subscription?.items?.data?.[0]?.price || {};
  const interval = price?.recurring?.interval === 'year'
    ? 'yearly'
    : price?.recurring?.interval === 'month'
      ? 'monthly'
      : price?.recurring?.interval || null;

  return {
    user_id: userId,
    stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer?.id,
    stripe_subscription_id: subscription.id,
    stripe_price_id: price.id || null,
    stripe_product_id: typeof price.product === 'string' ? price.product : price.product?.id || null,
    status: subscription.status || null,
    plan: ACTIVE_STATUSES.has(String(subscription.status || '').toLowerCase()) ? 'premium' : 'free',
    price_interval: interval,
    current_period_start: timestampToIso(subscription.current_period_start),
    current_period_end: timestampToIso(subscription.current_period_end),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    canceled_at: timestampToIso(subscription.canceled_at),
    trial_end: timestampToIso(subscription.trial_end),
    ended_at: timestampToIso(subscription.ended_at),
    metadata: subscription.metadata || {},
    updated_at: new Date().toISOString(),
  };
}

async function resolveWebhookUserId(supabase: any, subscription: any, fallbackUserId?: string | null) {
  const metadataUserId = subscription?.metadata?.user_id || fallbackUserId;
  if (metadataUserId) return metadataUserId;

  const customerId = typeof subscription?.customer === 'string' ? subscription.customer : subscription?.customer?.id;
  if (!customerId) return null;

  const { data } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .maybeSingle();

  return data?.user_id || null;
}

async function upsertStripeSubscription(supabase: any, subscription: any, fallbackUserId?: string | null) {
  const userId = await resolveWebhookUserId(supabase, subscription, fallbackUserId);
  if (!userId) return;

  const fields = subscriptionFieldsFromStripe(subscription, userId);
  const { error } = await supabase
    .from('subscriptions')
    .upsert(fields, { onConflict: 'user_id' });

  if (error) throw createHttpError(500, `Could not sync subscription: ${error.message}`, 'subscription_sync_failed');
}

async function syncCheckoutSession(supabase: any, user: any, sessionId: string) {
  if (!sessionId || !String(sessionId).startsWith('cs_')) {
    throw createHttpError(400, 'Invalid checkout session.', 'invalid_checkout_session');
  }

  const session = await retrieveCheckoutSession(sessionId);
  const ownerUserId = session.client_reference_id || session.metadata?.user_id || null;
  if (ownerUserId !== user.id) {
    throw createHttpError(403, 'This checkout session does not belong to this account.', 'checkout_session_mismatch');
  }

  const stripeSubscription = typeof session.subscription === 'string'
    ? await retrieveStripeSubscription(session.subscription)
    : session.subscription;

  if (!stripeSubscription?.id) {
    throw createHttpError(404, 'No subscription was found for this checkout.', 'missing_subscription');
  }

  await upsertStripeSubscription(supabase, stripeSubscription, user.id);
  const subscription = await readSubscription(supabase, user.id);
  return { billing: publicBillingStatus(subscription) };
}

async function handleStripeWebhook(supabase: any, req: any, rawBody: string) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw createHttpError(500, 'Stripe webhook secret is not configured.', 'webhook_secret_missing');

  const signature = String(req.headers['stripe-signature'] || '');
  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
    throw createHttpError(400, 'Invalid Stripe webhook signature.', 'invalid_signature');
  }

  const event = JSON.parse(rawBody);
  const object = event?.data?.object || {};

  if (event.type === 'checkout.session.completed' && object.mode === 'subscription' && object.subscription) {
    const subscription = await retrieveStripeSubscription(String(object.subscription));
    await upsertStripeSubscription(supabase, subscription, object.client_reference_id || object.metadata?.user_id || null);
  }

  if (event.type?.startsWith('customer.subscription.')) {
    await upsertStripeSubscription(supabase, object);
  }

  return { received: true };
}

async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Stripe-Signature');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).end();

  const rawBody = req.method === 'POST' ? await readRawBody(req) : '';
  const supabase = getSupabase();

  try {
    if (req.method === 'POST' && String(req.query?.stripe || '') === 'webhook') {
      const result = await handleStripeWebhook(supabase, req, rawBody);
      return res.status(200).json(result);
    }

    const user = await resolveUser(supabase, req);

    if (req.method === 'GET') {
      const subscription = await readSubscription(supabase, user.id);
      return res.status(200).json({
        billing: publicBillingStatus(subscription),
        prices: {
          monthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || null,
          yearly: process.env.STRIPE_PRICE_PREMIUM_YEARLY || null,
        },
      });
    }

    const body = safeJsonParse(rawBody);
    const action = String(body.action || '');

    if (action === 'create_checkout_session') {
      const result = await createCheckoutSession(req, supabase, user, body);
      return res.status(200).json(result);
    }

    if (action === 'create_customer_portal_session') {
      const result = await createPortalSession(req, supabase, user);
      return res.status(200).json(result);
    }

    if (action === 'sync_checkout_session') {
      const result = await syncCheckoutSession(supabase, user, String(body.sessionId || body.session_id || ''));
      return res.status(200).json(result);
    }

    return res.status(400).json({ error: 'invalid_action', message: 'Invalid billing action.' });
  } catch (error: any) {
    const status = Number(error?.status || 500);
    return res.status(status).json({
      error: error?.code || 'billing_error',
      message: error?.message || 'Billing request failed.',
    });
  }
}

export default handler;
