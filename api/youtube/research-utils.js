const STOP_WORDS = new Set([
  'a', 'about', 'after', 'all', 'and', 'are', 'at', 'be', 'best', 'by', 'can',
  'for', 'from', 'get', 'guide', 'how', 'i', 'in', 'into', 'is', 'it', 'my',
  'new', 'of', 'on', 'or', 'our', 'review', 'the', 'this', 'to', 'top', 'video',
  'vs', 'was', 'what', 'when', 'why', 'with', 'you', 'your'
]);

const NICHE_BENCHMARKS = [
  {
    title: 'Business & Finance',
    keywords: ['bank', 'banking', 'business', 'cash flow', 'credit', 'dividend', 'etf', 'finance', 'financial', 'invest', 'investing', 'loan', 'money', 'portfolio', 'retirement', 'stocks', 'tax', 'wealth']
  },
  {
    title: 'Software & AI',
    keywords: ['ai', 'api', 'app', 'automation', 'chatgpt', 'code', 'coding', 'developer', 'gpt', 'javascript', 'machine learning', 'programming', 'python', 'saas', 'software', 'startup', 'tech']
  },
  {
    title: 'Marketing & Ecommerce',
    keywords: ['ads', 'affiliate', 'amazon', 'brand', 'dropshipping', 'ecommerce', 'email marketing', 'facebook ads', 'funnel', 'lead generation', 'marketing', 'sales', 'seo', 'shopify', 'social media', 'tiktok ads']
  },
  {
    title: 'Real Estate',
    keywords: ['airbnb', 'apartment', 'commercial real estate', 'home loan', 'mortgage', 'property', 'real estate', 'realtor', 'rent', 'rental', 'zillow']
  },
  {
    title: 'Education & Productivity',
    keywords: ['college', 'course', 'education', 'exam', 'how to study', 'learn', 'lesson', 'notion', 'productivity', 'school', 'skills', 'study', 'tutorial']
  },
  {
    title: 'Consumer Tech',
    keywords: ['android', 'camera', 'gadget', 'iphone', 'laptop', 'macbook', 'phone', 'review', 'smartphone', 'tech review', 'vision pro']
  },
  {
    title: 'Health & Fitness',
    keywords: ['diet', 'fitness', 'gym', 'health', 'meal plan', 'muscle', 'nutrition', 'protein', 'supplement', 'training', 'weight loss', 'workout']
  },
  {
    title: 'Automotive',
    keywords: ['auto', 'car', 'dealership', 'engine', 'ev', 'ford', 'tesla', 'truck', 'vehicle']
  },
  {
    title: 'News & Commentary',
    keywords: ['breaking news', 'commentary', 'debate', 'election', 'headline', 'interview', 'news', 'podcast', 'politics', 'reaction']
  },
  {
    title: 'Travel & Lifestyle',
    keywords: ['airport', 'cruise', 'hotel', 'lifestyle', 'packing', 'travel', 'trip', 'vacation', 'van life']
  },
  {
    title: 'Food & Cooking',
    keywords: ['baking', 'bbq', 'chef', 'cooking', 'food', 'kitchen', 'meal prep', 'recipe', 'restaurant']
  },
  {
    title: 'Beauty & Fashion',
    keywords: ['beauty', 'clothing', 'fashion', 'fragrance', 'hair', 'makeup', 'outfit', 'skincare', 'style']
  },
  {
    title: 'Gaming',
    keywords: ['call of duty', 'fortnite', 'gaming', 'minecraft', 'nintendo', 'playstation', 'roblox', 'speedrun', 'stream', 'xbox']
  },
  {
    title: 'Music & Entertainment',
    keywords: ['album', 'artist', 'celebrity', 'concert', 'entertainment', 'music', 'official video', 'performance', 'song', 'trailer']
  },
  {
    title: 'Sports',
    keywords: ['baseball', 'basketball', 'boxing', 'football', 'golf', 'mma', 'nba', 'nfl', 'soccer', 'sports', 'ufc']
  },
  {
    title: 'Kids & Family',
    keywords: ['abc song', 'baby', 'cartoon', 'children', 'family', 'kids', 'nursery rhyme', 'playtime', 'toys']
  },
  {
    title: 'General How-To',
    keywords: ['diy', 'explained', 'guide', 'help', 'how to', 'tips', 'walkthrough']
  }
];

const AUDIENCE_PATTERNS = [
  ['beginners', 'beginner audience'],
  ['advanced', 'advanced audience'],
  ['small channels', 'small creators'],
  ['creators', 'creator audience'],
  ['students', 'student audience'],
  ['business owners', 'business owner audience'],
  ['parents', 'parent/family audience'],
  ['gamers', 'gaming audience'],
  ['developers', 'developer audience'],
  ['freelancers', 'freelance/pro audience']
];

const ANGLE_PATTERNS = [
  ['mistake', 'mistake avoidance'],
  ['avoid', 'mistake avoidance'],
  ['truth', 'truth/reveal'],
  ['secret', 'curiosity reveal'],
  ['tested', 'test/proof'],
  ['review', 'review/comparison'],
  ['vs', 'comparison'],
  ['challenge', 'challenge/story'],
  ['beginner', 'beginner pathway'],
  ['cheap', 'budget angle'],
  ['expensive', 'premium angle']
];

function buildVideoResearchEnhancements({ videoData, channelVideos, topicTerms, formatSignal, opportunityScore }) {
  const title = decodeHtmlEntities(videoData?.snippet?.title || '');
  const description = decodeHtmlEntities(videoData?.snippet?.description || '');
  const tags = Array.isArray(videoData?.snippet?.tags) ? videoData.snippet.tags : [];
  const text = [title, description.slice(0, 1800), tags.join(' '), topicTerms?.join(' ')].join(' ');
  const nicheMap = buildNicheMap(text, channelVideos, topicTerms);
  const dynamicRecommendations = buildDynamicVideoRecommendations({
    seed: videoData?.id || title,
    formatSignal,
    nicheMap,
    opportunityScore,
    topicTerms: topicTerms || []
  });

  return {
    nicheMap,
    dynamicRecommendations
  };
}

function buildChannelResearchEnhancements({ channelData, playlistData, channelVideos, seed }) {
  const channelTitle = decodeHtmlEntities(channelData?.snippet?.title || '');
  const channelDescription = decodeHtmlEntities(channelData?.snippet?.description || '');
  const sampleVideos = Array.isArray(channelVideos) ? channelVideos.slice(0, 16) : [];
  const sampleText = sampleVideos.map((video) => {
    return [video.title, video.description, Array.isArray(video.tags) ? video.tags.join(' ') : ''].join(' ');
  }).join(' ');
  const text = [channelTitle, channelDescription, channelData?.brandingSettings?.channel?.keywords || '', sampleText].join(' ');
  const topicTerms = topTerms(text, 10);
  const nicheMap = buildNicheMap(text, sampleVideos, topicTerms);
  const dynamicRecommendations = buildDynamicChannelRecommendations({
    seed: channelData?.id || channelTitle,
    channelTitle,
    nicheMap,
    playlistData,
    sampleVideos,
    seedMetrics: seed || {}
  });

  return {
    nicheMap,
    dynamicRecommendations
  };
}

function buildNicheMap(text, channelVideos, fallbackTerms = []) {
  const categories = pickTopNiches(text);
  const terms = uniqueStrings([...(fallbackTerms || []), ...topTerms(text, 12)], 12);
  const audienceSignals = detectPatternLabels(text, AUDIENCE_PATTERNS, 4);
  const angleSignals = detectPatternLabels(text, ANGLE_PATTERNS, 5);
  const sampleTitles = Array.isArray(channelVideos) ? channelVideos.map((video) => video.title || '').filter(Boolean) : [];
  const repeatedTerms = topTerms(sampleTitles.join(' '), 8);
  const specificityScore = clamp(
    36 +
      Math.min(24, terms.length * 3) +
      Math.min(18, audienceSignals.length * 6) +
      Math.min(18, angleSignals.length * 4) +
      (categories[0]?.score >= 2.4 ? 8 : 0),
    0,
    100
  );
  const hasCategorySignal = Number(categories[0]?.score || 0) > 0;
  const primary = hasCategorySignal ? categories[0].title : 'Unclear / broad niche';
  const secondary = hasCategorySignal ? categories[1]?.title || 'General How-To' : 'Needs comment or thumbnail context';
  const confidence = categories[0]?.score >= 3
    ? 'high'
    : categories[0]?.score >= 1.5
      ? 'medium'
      : 'low';

  return {
    primaryNiche: primary,
    secondaryNiche: secondary,
    confidence,
    specificityScore,
    subNiches: terms.slice(0, 7),
    audienceSignals,
    angleSignals,
    recurringTerms: repeatedTerms.slice(0, 6),
    summary: `${primary} with ${confidence} confidence; strongest sub-signals: ${terms.slice(0, 4).join(', ') || 'not enough public metadata'}.`,
    notes: uniqueStrings([
      specificityScore >= 72
        ? 'The niche is specific enough to generate sharper ideas than broad category advice.'
        : 'The metadata is broad, so use comments/thumbnails to narrow the audience before copying the idea.',
      audienceSignals.length ? `Audience clue: ${audienceSignals.join(', ')}.` : '',
      angleSignals.length ? `Packaging angle clue: ${angleSignals.join(', ')}.` : '',
      repeatedTerms.length ? `Recurring channel terms to watch: ${repeatedTerms.slice(0, 4).join(', ')}.` : ''
    ], 4)
  };
}

function buildDynamicVideoRecommendations({ seed, formatSignal, nicheMap, opportunityScore, topicTerms }) {
  const primaryTerm = topicTerms[0] || nicheMap.subNiches?.[0] || nicheMap.primaryNiche;
  const secondaryTerm = topicTerms[1] || nicheMap.subNiches?.[1] || nicheMap.secondaryNiche;
  const templates = [
    `Make the next test narrower: "${primaryTerm} for ${nicheMap.audienceSignals?.[0] || 'one specific viewer type'}".`,
    `Study comments for pain language, then turn "${secondaryTerm}" into a title that promises a measurable outcome.`,
    `If copying the format, keep the ${formatSignal || 'core format'} but change the audience, price point, or difficulty level.`,
    `Use the niche read to branch into adjacent topics: ${nicheMap.subNiches?.slice(0, 3).join(', ') || primaryTerm}.`,
    Number(opportunityScore || 0) >= 70
      ? 'Make a three-video cluster around this idea: beginner, mistake-focused, and proof/test version.'
      : 'Before building a series, validate the niche with two more outliers from unrelated channels.'
  ];

  return pickDeterministic(uniqueStrings(templates, 5), seed, 4);
}

function buildDynamicChannelRecommendations({ seed, channelTitle, nicheMap, playlistData, sampleVideos, seedMetrics }) {
  const topTerm = nicheMap.subNiches?.[0] || nicheMap.primaryNiche;
  const formatTerm = nicheMap.angleSignals?.[0] || 'repeatable format';
  const templates = [
    `Track ${channelTitle || 'this channel'} for "${topTerm}" repeats; one repeat is a video, three repeats is a niche lane.`,
    `Look for adjacent branches of ${nicheMap.primaryNiche}: ${nicheMap.subNiches?.slice(0, 4).join(', ') || 'more specific audience problems'}.`,
    `Their ${formatTerm} angle is worth testing against a clearer audience segment.`,
    playlistData?.length < 3 ? 'Playlist structure is weak, so a better organized series could compete even with smaller reach.' : '',
    Number(seedMetrics.consistencyScore || 0) < 55 ? 'Consistency is a weakness here; a steadier publishing rhythm could beat them in the same niche.' : '',
    sampleVideos?.length >= 12 ? 'There is enough upload history here to compare outliers against normal performers instead of guessing from one hit.' : ''
  ];

  return pickDeterministic(uniqueStrings(templates, 6), seed, 5);
}

function pickTopNiches(text) {
  const normalized = normalizeText(text);
  const tokenSet = new Set(tokenize(normalized));
  const scored = NICHE_BENCHMARKS.map((benchmark) => ({
    ...benchmark,
    score: scoreNiche(benchmark, normalized, tokenSet)
  }))
    .sort((left, right) => right.score - left.score)
    .filter((benchmark) => benchmark.score > 0);

  if (scored.length >= 2) {
    return scored.slice(0, 2);
  }

  return [
    NICHE_BENCHMARKS.find((benchmark) => benchmark.title === 'General How-To') || NICHE_BENCHMARKS[0],
    NICHE_BENCHMARKS.find((benchmark) => benchmark.title === 'Music & Entertainment') || NICHE_BENCHMARKS[1]
  ].map((benchmark) => ({
    ...benchmark,
    score: 0
  }));
}

function scoreNiche(benchmark, normalizedText, tokenSet) {
  let score = 0;

  benchmark.keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);

    if (!normalizedKeyword) {
      return;
    }

    if (normalizedKeyword.includes(' ')) {
      if (normalizedText.includes(normalizedKeyword)) {
        score += 2.4;
        return;
      }

      const parts = tokenize(normalizedKeyword);
      const overlap = parts.filter((part) => tokenSet.has(part)).length;
      score += overlap === parts.length && parts.length > 0 ? 1.8 : overlap * 0.5;
      return;
    }

    if (tokenSet.has(normalizedKeyword)) {
      score += 1.2;
    }
  });

  return score;
}

function detectPatternLabels(text, patterns, limit) {
  const normalized = normalizeText(text);
  return uniqueStrings(
    patterns
      .filter(([term]) => containsTerm(normalized, term))
      .map(([, label]) => label),
    limit
  );
}

function topTerms(text, limit = 8) {
  const counts = new Map();

  tokenize(normalizeText(text)).forEach((token) => {
    if (STOP_WORDS.has(token) || token.length < 3) {
      return;
    }

    counts.set(token, (counts.get(token) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([term]) => term)
    .slice(0, limit);
}

function pickDeterministic(items, seed, count) {
  const list = uniqueStrings(items, items.length);
  if (list.length <= count) return list;

  const start = hashSeed(seed) % list.length;
  return [...list.slice(start), ...list.slice(0, start)].slice(0, count);
}

function hashSeed(value) {
  return String(value || '').split('').reduce((hash, char) => {
    return (hash * 31 + char.charCodeAt(0)) >>> 0;
  }, 2166136261);
}

function containsTerm(normalizedText, term) {
  const normalizedTerm = normalizeText(term);
  if (!normalizedTerm) return false;

  if (normalizedTerm.includes(' ')) {
    return normalizedText.includes(normalizedTerm);
  }

  return new RegExp(`\\b${escapeRegExp(normalizedTerm)}\\b`, 'i').test(normalizedText);
}

function tokenize(value) {
  return String(value || '').split(/\s+/).map((token) => token.trim()).filter(Boolean);
}

function normalizeText(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodeHtmlEntities(text) {
  const namedEntities = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: ' ',
    quot: '"'
  };

  return String(text || '').replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (match, entity) => {
    const lower = String(entity).toLowerCase();

    if (lower[0] === '#') {
      const isHex = lower[1] === 'x';
      const codePoint = parseInt(lower.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    return namedEntities[lower] || match;
  });
}

function uniqueStrings(values, limit = 8) {
  const seen = new Set();
  const result = [];

  values.forEach((value) => {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    const key = normalized.toLowerCase();
    if (!normalized || seen.has(key)) return;
    seen.add(key);
    result.push(normalized);
  });

  return result.slice(0, limit);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Math.round(Number(value) || 0)));
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  buildVideoResearchEnhancements,
  buildChannelResearchEnhancements
};
