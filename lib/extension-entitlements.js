const FREE_WEEKLY_TOOL_LIMIT = 5;

const METERED_EXTENSION_TOOL_KEYS = Object.freeze([
  'video_analysis',
  'channel_analysis',
  'thumbnail_download',
  'comment_download',
]);

const PREMIUM_FEATURE_KEYS = Object.freeze({
  moreTimelines: false,
  customContentPageColumns: false,
  streamerMode: false,
  realtimeEngagedViews: false,
});

function isExtensionClient(req) {
  return String(req?.headers?.['x-youtool-client'] || '').toLowerCase() === 'chrome-extension';
}

function normalizeToolKey(value) {
  const toolKey = String(value || '').trim();
  return METERED_EXTENSION_TOOL_KEYS.includes(toolKey) ? toolKey : '';
}

function getCurrentWeekStart(date = new Date()) {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = utcDate.getUTCDay();
  const daysSinceMonday = (day + 6) % 7;
  utcDate.setUTCDate(utcDate.getUTCDate() - daysSinceMonday);
  return utcDate.toISOString().slice(0, 10);
}

function getResetAt(weekStart) {
  const reset = new Date(`${weekStart}T00:00:00.000Z`);
  reset.setUTCDate(reset.getUTCDate() + 7);
  return reset.toISOString();
}

function isMissingTableError(error) {
  const code = String(error?.code || '');
  const message = String(error?.message || '');
  return code === '42P01' || /does not exist|relation .* not found/i.test(message);
}

function parseDateValue(value) {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.getTime()) ? date : null;
}

function isActiveSubscription(row) {
  if (!row || typeof row !== 'object') return false;

  if (row.is_premium === true || row.creator_plus === true) {
    return true;
  }

  const statuses = [
    row.status,
    row.subscription_status,
    row.stripe_status,
    row.state,
  ].map((status) => String(status || '').toLowerCase());
  const hasActiveStatus = statuses.some((status) => status === 'active' || status === 'trialing');
  const hasEndedStatus = statuses.some((status) => {
    return ['canceled', 'cancelled', 'incomplete_expired', 'past_due', 'unpaid'].includes(status);
  });

  if (hasActiveStatus) return true;

  const periodEnd = parseDateValue(row.current_period_end || row.period_end || row.ends_at || row.expires_at);
  if (periodEnd && periodEnd.getTime() > Date.now() && !hasEndedStatus) {
    return true;
  }

  const plan = String(row.plan || row.plan_id || row.tier || row.product || '').toLowerCase();
  return Boolean(plan && plan !== 'free' && plan !== 'none' && !hasEndedStatus);
}

async function readSubscription(supabase, userId) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .maybeSingle();

    if (error) {
      if (!isMissingTableError(error)) {
        console.warn('YouTool entitlement subscription read failed:', error.message || error);
      }
      return null;
    }

    return data || null;
  } catch (error) {
    console.warn('YouTool entitlement subscription read failed:', error);
    return null;
  }
}

function buildEntitlement(subscription) {
  const isPremium = isActiveSubscription(subscription);
  const premiumFeatures = Object.keys(PREMIUM_FEATURE_KEYS).reduce((features, key) => {
    features[key] = isPremium;
    return features;
  }, {});

  return {
    plan: isPremium ? 'creator_plus' : 'free',
    label: isPremium ? 'Creator Plus' : 'Free',
    isPremium,
    weeklyLimit: isPremium ? null : FREE_WEEKLY_TOOL_LIMIT,
    premiumFeatures,
    meteredTools: METERED_EXTENSION_TOOL_KEYS,
  };
}

async function getExtensionEntitlement(supabase, userId) {
  const subscription = await readSubscription(supabase, userId);
  return buildEntitlement(subscription);
}

async function getWeeklyExtensionUsage(supabase, userId, entitlement) {
  const weekStart = getCurrentWeekStart();
  const activeEntitlement = entitlement || await getExtensionEntitlement(supabase, userId);
  const limit = activeEntitlement.isPremium ? null : FREE_WEEKLY_TOOL_LIMIT;
  const baseUsage = {
    weekStart,
    resetAt: getResetAt(weekStart),
    limit,
    used: 0,
    remaining: limit,
    toolCounts: {},
    trackingReady: true,
  };

  if (activeEntitlement.isPremium) {
    return {
      ...baseUsage,
      remaining: null,
    };
  }

  try {
    const { data, error } = await supabase
      .from('extension_tool_usage')
      .select('tool_key')
      .eq('user_id', userId)
      .eq('week_start', weekStart);

    if (error) {
      if (isMissingTableError(error)) {
        return {
          ...baseUsage,
          trackingReady: false,
        };
      }

      console.warn('YouTool extension usage read failed:', error.message || error);
      return baseUsage;
    }

    const toolCounts = {};
    (data || []).forEach((row) => {
      const toolKey = normalizeToolKey(row?.tool_key);
      if (!toolKey) return;
      toolCounts[toolKey] = (toolCounts[toolKey] || 0) + 1;
    });

    const used = Object.values(toolCounts).reduce((sum, count) => sum + Number(count || 0), 0);

    return {
      ...baseUsage,
      used,
      remaining: Math.max(0, FREE_WEEKLY_TOOL_LIMIT - used),
      toolCounts,
    };
  } catch (error) {
    console.warn('YouTool extension usage read failed:', error);
    return baseUsage;
  }
}

async function checkExtensionToolAccess(supabase, userId) {
  const entitlement = await getExtensionEntitlement(supabase, userId);
  const usage = await getWeeklyExtensionUsage(supabase, userId, entitlement);
  const allowed = entitlement.isPremium || !usage.trackingReady || Number(usage.remaining) > 0;

  return {
    allowed,
    status: allowed ? 200 : 402,
    error: allowed ? null : 'weekly_limit_reached',
    message: allowed
      ? ''
      : `You've used all ${FREE_WEEKLY_TOOL_LIMIT} free in-YouTube YouTool uses for this week.`,
    entitlement,
    usage,
  };
}

async function consumeExtensionToolUse(supabase, { userId, toolKey, metadata = {} }) {
  const normalizedToolKey = normalizeToolKey(toolKey);

  if (!normalizedToolKey) {
    return {
      allowed: false,
      status: 400,
      error: 'invalid_tool_key',
      message: 'Invalid YouTool extension tool.',
      entitlement: await getExtensionEntitlement(supabase, userId),
      usage: null,
    };
  }

  const access = await checkExtensionToolAccess(supabase, userId);
  if (!access.allowed) return access;

  if (access.entitlement.isPremium || !access.usage.trackingReady) {
    return access;
  }

  try {
    const weekStart = getCurrentWeekStart();
    const { error } = await supabase
      .from('extension_tool_usage')
      .insert({
        user_id: userId,
        tool_key: normalizedToolKey,
        week_start: weekStart,
        source: 'extension',
        metadata: metadata && typeof metadata === 'object' ? metadata : {},
      });

    if (error) {
      if (isMissingTableError(error)) {
        return {
          ...access,
          usage: {
            ...access.usage,
            trackingReady: false,
          },
        };
      }

      console.warn('YouTool extension usage insert failed:', error.message || error);
      return access;
    }

    return {
      ...access,
      usage: await getWeeklyExtensionUsage(supabase, userId, access.entitlement),
    };
  } catch (error) {
    console.warn('YouTool extension usage insert failed:', error);
    return access;
  }
}

module.exports = {
  FREE_WEEKLY_TOOL_LIMIT,
  METERED_EXTENSION_TOOL_KEYS,
  checkExtensionToolAccess,
  consumeExtensionToolUse,
  getExtensionEntitlement,
  getWeeklyExtensionUsage,
  isExtensionClient,
  normalizeToolKey,
};
