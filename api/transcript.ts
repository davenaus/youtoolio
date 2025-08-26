// api/transcript.ts - Vercel Edge Function
export const config = {
  runtime: 'edge',
}

type RawCue = { startMs: number; durationMs: number; text: string };
type OutFormat = 'text' | 'inline' | 'srt' | 'vtt' | 'json';

interface Options {
  format?: OutFormat;
  includeTimestamps?: boolean;
  dedupe?: boolean;
  joinAdjacentThresholdMs?: number;
  minDurationMs?: number;
  overlapWindowMs?: number;
  similarityThreshold?: number;
}

// ---------- utilities ----------

function extractVideoId(input: string): string {
  const trimmed = input.trim();
  const patterns = [
    /(?:v=|vi=)([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /shorts\/([A-Za-z0-9_-]{11})/,
    /embed\/([A-Za-z0-9_-]{11})/,
    /^([A-Za-z0-9_-]{11})$/ // bare ID
  ];
  for (const re of patterns) {
    const m = trimmed.match(re);
    if (m) return m[1];
  }
  return trimmed;
}

async function getInnertubeKey(videoId: string, signal: AbortSignal) {
const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
headers: { 
  'Accept-Language': 'en', 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  signal
  });
if (!res.ok) throw new Error(`watch page status ${res.status}`);
const html = await res.text();

// Primary method
const m = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/); 
if (m?.[1]) return m[1];

// More thorough search methods
const patterns = [
  /"INNERTUBE_API_KEY":"([^"]+)"/g,
    /INNERTUBE_API_KEY":"([^"]+)"/g,
    /innertubeApiKey":"([^"]+)"/g,
    /"innertubeApiKey":"([^"]+)"/g
  ];

  for (const pattern of patterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      if (match[1] && match[1].length > 10) {
        return match[1];
      }
    }
  }

  // Script tag search (manual parsing since we can't use node-html-parser)
  const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
  if (scriptMatches) {
    for (const scriptTag of scriptMatches) {
      const scriptContent = scriptTag.replace(/<\/?script[^>]*>/gi, '');
      const keyMatch = scriptContent.match(/"INNERTUBE_API_KEY":"([^"]+)"/); 
      if (keyMatch?.[1]) return keyMatch[1];
    }
  }
  
  throw new Error('INNERTUBE_API_KEY not found');
}

function buildGetTranscriptBody(videoId: string) {
  const params = Buffer.from(JSON.stringify({ videoId })).toString('base64');
  return { context: { client: { clientName: 'WEB', clientVersion: '2.20240801.00.00' } }, params };
}

// --- text cleaning -----------------------------------------------------------

function htmlEntityDecode(s: string) {
  return s
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
}

function stripVttMarkup(s: string) {
  s = s.replace(/<\d{2}:\d{2}:\d{2}\.\d{3}>/g, '');
  s = s.replace(/<\/?c(?:\.[a-zA-Z0-9_-]+)*>/g, '');
  s = s.replace(/<\/?[a-zA-Z][^>]*>/g, '');
  return htmlEntityDecode(s).replace(/\s+/g, ' ').trim();
}

function normText(s: string) {
  return htmlEntityDecode(s).replace(/\s+/g, ' ').trim();
}

function slug(s: string) {
  return normText(s).toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

function pad(n: number, len = 2) { return String(n).padStart(len, '0'); }

function msToSrtTime(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const msR = ms % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)},${String(msR).padStart(3, '0')}`;
}

function msToVttTime(ms: number) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const msR = ms % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)}.${String(msR).padStart(3, '0')}`;
}

function msToInline(mm: number) {
  const total = Math.floor(mm / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `[${m}:${String(s).padStart(2, '0')}]`;
}

// ---------- smarter dedupe & join ----------

function jaccard(a: string, b: string) {
  const A = new Set(a.split(/\s+/).filter(Boolean));
  const B = new Set(b.split(/\s+/).filter(Boolean));
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

function overlapSuffix(a: string, b: string) {
  const aW = normText(a).split(/\s+/);
  const bW = normText(b).split(/\s+/);
  const maxLook = Math.min(aW.length, 12);
  let best = 0;
  for (let k = 1; k <= maxLook; k++) {
    const suffixA = aW.slice(-k).join(' ');
    const prefixB = bW.slice(0, k).join(' ');
    if (suffixA === prefixB) best = k;
  }
  return bW.slice(best).join(' ').trim();
}

function smartDedupe(cues: RawCue[], opts: { windowMs: number; sim: number }) {
  const out: RawCue[] = [];
  for (const c of cues) {
    const txt = slug(c.text);
    if (!out.length) { out.push(c); continue; }

    const prev = out[out.length - 1];
    if (slug(prev.text) === txt) {
      prev.durationMs = Math.max(prev.durationMs, (c.startMs + c.durationMs) - prev.startMs);
      continue;
    }

    const windowStart = c.startMs - opts.windowMs;
    let isDup = false;
    for (let i = out.length - 1; i >= 0; i--) {
      const p = out[i];
      if (p.startMs < windowStart) break;
      const sim = jaccard(slug(p.text), txt);
      if (sim >= opts.sim) { isDup = true; break; }
    }
    if (isDup) continue;

    out.push(c);
  }
  return out;
}

function joinAdjacent(cues: RawCue[], thresholdMs: number) {
  if (thresholdMs <= 0) return cues;
  const out: RawCue[] = [];
  for (const c of cues) {
    if (!out.length) { out.push({ ...c }); continue; }
    const prev = out[out.length - 1];
    const gap = c.startMs - (prev.startMs + prev.durationMs);
    if (gap >= 0 && gap <= thresholdMs && normText(c.text)) {
      const suffix = overlapSuffix(prev.text, c.text);
      if (suffix) prev.text = normText(prev.text + ' ' + suffix);
      prev.durationMs = (c.startMs + c.durationMs) - prev.startMs;
      continue;
    }
    out.push({ ...c });
  }
  return out;
}

function dropShort(cues: RawCue[], minDurationMs: number) {
  if (!minDurationMs || minDurationMs <= 0) return cues;
  return cues.filter(c => c.durationMs >= minDurationMs);
}

// ---------- output ----------

function toText(cues: RawCue[], includeTimestamps: boolean) {
  if (!includeTimestamps) return cues.map(c => normText(c.text)).join('\n');
  return cues.map(c => `${msToInline(c.startMs)} ${normText(c.text)}`).join('\n');
}

function toSRT(cues: RawCue[]) {
  return cues.map((c, i) => {
    const start = msToSrtTime(c.startMs);
    const end = msToSrtTime(c.startMs + Math.max(c.durationMs, 1));
    return `${i + 1}\n${start} --> ${end}\n${normText(c.text)}\n`;
  }).join('\n');
}

function toVTT(cues: RawCue[]) {
  const header = 'WEBVTT\n\n';
  const body = cues.map((c) => {
    const start = msToVttTime(c.startMs);
    const end = msToVttTime(c.startMs + Math.max(c.durationMs, 1));
    return `${start} --> ${end}\n${normText(c.text)}\n`;
  }).join('\n');
  return header + body;
}

// ---------- fetching paths ----------

async function tryGetTranscriptJSON(key: string, videoId: string, signal: AbortSignal): Promise<RawCue[]> {
  const url = `https://www.youtube.com/youtubei/v1/get_transcript?key=${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-youtube-client-name': '1',
      'x-youtube-client-version': '2.20240801.00.00',
      'accept-language': 'en',
    },
    body: JSON.stringify(buildGetTranscriptBody(videoId)),
    signal
  });
  if (!res.ok) throw new Error(`get_transcript status ${res.status}`);
  const data: any = await res.json();

  const actions = data?.actions || data?.onResponseReceivedActions || [];
  let segments: any[] = [];
  for (const act of actions) {
    const segs =
      act?.updateEngagementPanelAction?.content?.transcriptRenderer?.content
        ?.transcriptSearchPanelRenderer?.body?.transcriptSegmentListRenderer?.initialSegments;
    if (segs) { segments = segs; break; }
  }
  if (!segments.length) throw new Error('No transcript segments in JSON');

  const cues: RawCue[] = segments.map((s: any) => {
    const r = s.transcriptSegmentRenderer;
    const text = (r?.snippet?.runs ?? []).map((x: any) => x.text).join('');
    const startMs = Number(r?.startMs ?? 0);
    const durationMs = Number(r?.durationMs ?? 0);
    return { startMs, durationMs, text: normText(text) };
  });

  const byKey = new Map<string, RawCue>();
  for (const c of cues) {
    const k = `${c.startMs}|${slug(c.text)}`;
    if (!byKey.has(k)) byKey.set(k, c);
  }
  return Array.from(byKey.values()).sort((a,b)=>a.startMs-b.startMs);
}

function vttTimeToMs(t: string) {
  const m = t.match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
  if (!m) return 0;
  const h = Number(m[1]), mi = Number(m[2]), s = Number(m[3]), ms = Number(m[4]);
  return (((h*60)+mi)*60 + s)*1000 + ms;
}

function parseVtt(vtt: string): RawCue[] {
  const lines = vtt.replace(/\r/g, '').split('\n');
  const out: RawCue[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i].trim();
    i++;
    if (!line || /^\d+$/.test(line) || /^WEBVTT/.test(line)) continue;
    if (line.includes('-->')) {
      const [a, b] = line.split('-->').map(s => s.trim());
      const start = vttTimeToMs(a);
      const end = vttTimeToMs(b);
      const textLines: string[] = [];
      while (i < lines.length && lines[i].trim() && !lines[i].includes('-->')) {
        textLines.push(lines[i++]);
      }
      const text = stripVttMarkup(textLines.join(' '));
      out.push({ startMs: start, durationMs: Math.max(end - start, 1), text });
    }
  }
  return out;
}

async function fallbackTimedText(videoId: string, key: string, signal: AbortSignal): Promise<RawCue[]> {
  const playerUrl = `https://www.youtube.com/youtubei/v1/player?key=${encodeURIComponent(key)}`;
  const res = await fetch(playerUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'accept-language': 'en' },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: '2.20240801.00.00' } }, videoId }),
    signal
  });
  if (!res.ok) throw new Error(`player status ${res.status}`);
  const data: any = await res.json();
  const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  if (!tracks.length) throw new Error('No caption tracks');
  const preferred = tracks.find((t: any) => t.languageCode === 'en') || tracks[0];
  const timedtextUrl = preferred.baseUrl;

  const vttRes = await fetch(timedtextUrl + '&fmt=vtt', { signal });
  if (!vttRes.ok) throw new Error(`timedtext status ${vttRes.status}`);
  const cues = parseVtt(await vttRes.text());

  const byKey = new Map<string, RawCue>();
  for (const c of cues) {
    const k = `${c.startMs}|${slug(c.text)}`;
    if (!byKey.has(k)) byKey.set(k, c);
  }
  return Array.from(byKey.values()).sort((a,b)=>a.startMs-b.startMs);
}

// ---------- main handler ----------

export default async function handler(req: Request) {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  try {
    const body = await req.json();
    const { urlOrId } = body;
    const options: Options = {
      format: (body?.options?.format ?? 'text') as OutFormat,
      includeTimestamps: !!body?.options?.includeTimestamps,
      dedupe: body?.options?.dedupe !== false,
      joinAdjacentThresholdMs: Number(body?.options?.joinAdjacentThresholdMs ?? 400),
      minDurationMs: Number(body?.options?.minDurationMs ?? 0),
      overlapWindowMs: Number(body?.options?.overlapWindowMs ?? 4000),
      similarityThreshold: Number(body?.options?.similarityThreshold ?? 0.85),
    };

    console.log('Processing video:', urlOrId, 'with options:', options);

    if (!urlOrId || typeof urlOrId !== 'string') {
      return new Response(JSON.stringify({ error: 'Provide urlOrId' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    const videoId = extractVideoId(urlOrId);
    console.log('Extracted video ID:', videoId);
    
    const controller = new AbortController();
    
    let key: string;
    try {
      key = await getInnertubeKey(videoId, controller.signal);
      console.log('Got INNERTUBE key:', key.substring(0, 10) + '...');
    } catch (error) {
      console.error('Failed to get INNERTUBE key:', error);
      throw error;
    }

    let cues: RawCue[];
    try {
      console.log('Trying transcript JSON method...');
      cues = await tryGetTranscriptJSON(key, videoId, controller.signal);
      console.log('Success with JSON method, got', cues.length, 'cues');
    } catch (jsonError) {
      console.log('JSON method failed:', jsonError.message);
      console.log('Trying fallback timedtext method...');
      try {
        cues = await fallbackTimedText(videoId, key, controller.signal);
        console.log('Success with fallback method, got', cues.length, 'cues');
      } catch (fallbackError) {
        console.error('Both methods failed:', fallbackError.message);
        throw fallbackError;
      }
    }

    // Clean-up pipeline
    if (options.dedupe) cues = smartDedupe(cues, { windowMs: options.overlapWindowMs!, sim: options.similarityThreshold! });
    cues = joinAdjacent(cues, options.joinAdjacentThresholdMs || 0);
    cues = dropShort(cues, options.minDurationMs || 0);

    console.log('Final processed cues:', cues.length);

    // Build text output
    let textOut: string | undefined;
    switch (options.format) {
      case 'inline': textOut = toText(cues, true); break;
      case 'srt':    textOut = toSRT(cues); break;
      case 'vtt':    textOut = toVTT(cues); break;
      case 'text':   textOut = toText(cues, !!options.includeTimestamps); break;
      case 'json':   textOut = undefined; break;
    }

    return new Response(JSON.stringify({
      videoId,
      lineCount: cues.length,
      format: options.format,
      cues,
      text: textOut,
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    console.error('Handler error:', err);
    return new Response(JSON.stringify({ 
      error: err.message || 'Unknown error',
      details: err.stack || 'No stack trace available'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}