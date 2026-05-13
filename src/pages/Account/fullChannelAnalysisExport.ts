type DeltaEntry = {
  absolute: number | null;
  percent: number | null;
};

type MetricSet = Record<string, number | null>;

type SegmentRow = {
  key?: string;
  label?: string;
  views?: number;
  engagedViews?: number;
  watchHours?: number;
  shareOfViews?: number;
  engagedViewRate?: number;
  playlistViews?: number;
  playlistWatchHours?: number;
  playlistStarts?: number;
  playlistSaves?: number;
  viewerPercentage?: number;
};

type TopVideo = {
  id?: string;
  title?: string;
  thumbnailUrl?: string | null;
  views?: number;
  engagementRate?: number;
  averageViewDuration?: number;
  thumbnailCtr?: number | null;
  netSubscribers?: number;
};

type ResearchItem = {
  label?: string;
  answer?: string;
  confidence?: string;
  detail?: string;
};

type ResearchSection = {
  title?: string;
  items?: ResearchItem[];
};

type FullAnalysis = {
  generatedAt?: string;
  period?: {
    label?: string;
    startDate?: string;
    endDate?: string;
    previousStartDate?: string;
    previousEndDate?: string;
  };
  current?: MetricSet;
  deltas?: Record<string, DeltaEntry>;
  breakdowns?: Record<string, SegmentRow[] | undefined>;
  topVideos?: TopVideo[];
  insights?: string[];
  opportunities?: string[];
  actions?: string[];
  researchLab?: {
    note?: string;
    sections?: ResearchSection[];
  };
};

type DashboardChannel = {
  title?: string;
  thumbnailUrl?: string | null;
  subscriberCount?: number;
  videoCount?: number;
  viewCount?: number;
};

export type ChannelAnalysisExportFormat = 'html' | 'pdf';

export type ChannelAnalysisExportContext = {
  channelTitle: string;
  channel?: DashboardChannel;
  analysis: unknown;
};

type MetricExport = {
  label: string;
  value: string;
  delta?: string;
};

const FILE_SAFE_DATE = new Date().toISOString().slice(0, 10);

function safeNumber(value: number | null | undefined): number {
  const next = Number(value);
  return Number.isFinite(next) ? next : 0;
}

function formatCount(value: number | null | undefined): string {
  const next = safeNumber(value);
  return new Intl.NumberFormat('en-US', {
    notation: Math.abs(next) >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: Math.abs(next) >= 10000 ? 1 : 0,
  }).format(next);
}

function formatPrecise(value: number | null | undefined, digits = 1): string {
  const next = Number(value);
  if (!Number.isFinite(next)) return '-';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: digits }).format(next);
}

function formatPercent(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) return '-';
  return `${formatPrecise(Number(value), digits)}%`;
}

function formatDuration(seconds: number | null | undefined): string {
  const total = Math.round(safeNumber(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatSignedCount(value: number | null | undefined): string {
  const next = safeNumber(value);
  return `${next >= 0 ? '+' : ''}${formatCount(next)}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatUpdated(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDelta(delta: DeltaEntry | undefined): string {
  if (!delta || delta.percent === null || !Number.isFinite(Number(delta.percent))) {
    return 'No previous data';
  }
  const direction = delta.percent > 0 ? '+' : '';
  return `${direction}${formatPrecise(delta.percent, 1)}% vs previous`;
}

function metricExports(analysis: FullAnalysis): MetricExport[] {
  const current = analysis.current || {};
  const deltas = analysis.deltas || {};
  const metrics: MetricExport[] = [
    { label: 'Views', value: formatCount(current.views), delta: formatDelta(deltas.views) },
    { label: 'Watch hours', value: formatCount(Math.round(safeNumber(current.watchHours))), delta: formatDelta(deltas.watchHours) },
    { label: 'AVD', value: formatDuration(current.averageViewDuration), delta: formatDelta(deltas.averageViewDuration) },
    { label: 'Engagement', value: formatPercent(current.engagementRate), delta: formatDelta(deltas.engagementRate) },
    { label: 'Engaged views', value: formatCount(current.engagedViews), delta: formatDelta(deltas.engagedViews) },
    { label: 'Engaged rate', value: formatPercent(current.engagedViewRate), delta: formatDelta(deltas.engagedViewRate) },
    { label: 'Avg viewed', value: formatPercent(current.averageViewPercentage), delta: formatDelta(deltas.averageViewPercentage) },
    { label: 'Premium views', value: formatPercent(current.premiumViewRate), delta: formatDelta(deltas.premiumViewRate) },
    { label: 'Playlist saves', value: formatSignedCount(current.playlistNetAdds), delta: formatDelta(deltas.playlistNetAdds) },
    { label: 'Card CTR', value: formatPercent(current.cardClickRate), delta: formatDelta(deltas.cardClickRate) },
    { label: 'Subs / 1K views', value: formatPrecise(current.subsPerThousandViews, 2), delta: formatDelta(deltas.subsPerThousandViews) },
  ];

  if (current.thumbnailCtr !== null && current.thumbnailCtr !== undefined) {
    metrics.splice(2, 0, { label: 'Studio CTR', value: formatPercent(current.thumbnailCtr), delta: formatDelta(deltas.thumbnailCtr) });
  }

  return metrics;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'channel-analysis';
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function listHtml(title: string, rows: string[] | undefined, empty: string): string {
  const items = rows?.filter(Boolean) || [];
  return `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      ${items.length
        ? `<ul class="clean-list">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
        : `<p class="muted">${escapeHtml(empty)}</p>`}
    </section>
  `;
}

function segmentRowsHtml(title: string, rows: SegmentRow[] | undefined, empty: string, mode: 'standard' | 'playlist' | 'demographic' = 'standard'): string {
  const cleanRows = rows?.slice(0, 12) || [];
  if (!cleanRows.length) {
    return `
      <section class="section">
        <h2>${escapeHtml(title)}</h2>
        <p class="muted">${escapeHtml(empty)}</p>
      </section>
    `;
  }

  const maxValue = Math.max(...cleanRows.map((row) => {
    if (mode === 'playlist') return safeNumber(row.playlistViews ?? row.views);
    if (mode === 'demographic') return safeNumber(row.viewerPercentage);
    return safeNumber(row.shareOfViews);
  }), 1);

  return `
    <section class="section">
      <h2>${escapeHtml(title)}</h2>
      <div class="bar-list">
        ${cleanRows.map((row) => {
          const primary = mode === 'playlist'
            ? safeNumber(row.playlistViews ?? row.views)
            : mode === 'demographic'
              ? safeNumber(row.viewerPercentage)
              : safeNumber(row.shareOfViews);
          const width = Math.max(3, Math.min(100, (primary / maxValue) * 100));
          const value = mode === 'playlist'
            ? formatCount(primary)
            : formatPercent(primary, mode === 'demographic' ? 1 : 0);
          const meta = mode === 'playlist'
            ? `${formatCount(Math.round(safeNumber(row.playlistWatchHours ?? row.watchHours)))} watch hours · ${formatCount(row.playlistStarts)} starts · ${formatCount(row.playlistSaves)} saves`
            : mode === 'demographic'
              ? 'Known audience share'
              : `${formatCount(row.views)} views · ${formatCount(Math.round(safeNumber(row.watchHours)))} watch hours · ${formatPercent(row.engagedViewRate)} engaged`;

          return `
            <div class="bar-row">
              <div class="bar-head">
                <strong>${escapeHtml(row.label || row.key || 'Unknown')}</strong>
                <span>${escapeHtml(value)}</span>
              </div>
              <div class="track"><span style="width:${width}%"></span></div>
              <p>${escapeHtml(meta)}</p>
            </div>
          `;
        }).join('')}
      </div>
    </section>
  `;
}

function researchLabHtml(analysis: FullAnalysis): string {
  const lab = analysis.researchLab;
  if (!lab?.sections?.length) return '';

  return `
    <section class="section full">
      <h2>Private research lab</h2>
      ${lab.note ? `<p class="muted">${escapeHtml(lab.note)}</p>` : ''}
      <div class="research-grid">
        ${lab.sections.map((section) => `
          <article class="research-card">
            <h3>${escapeHtml(section.title || 'Research')}</h3>
            ${(section.items || []).map((item) => `
              <div class="research-item">
                <strong>${escapeHtml(item.label || '')}</strong>
                <p>${escapeHtml(item.answer || '')}</p>
                ${item.detail ? `<small>${escapeHtml(item.detail)}</small>` : ''}
                ${item.confidence ? `<em>${escapeHtml(item.confidence)}</em>` : ''}
              </div>
            `).join('')}
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

export function buildFullAnalysisHtml(context: ChannelAnalysisExportContext): string {
  const { channelTitle, channel } = context;
  const analysis = context.analysis as FullAnalysis;
  const period = analysis.period;
  const metrics = metricExports(analysis);
  const breakdowns = analysis.breakdowns || {};
  const generatedAt = formatUpdated(analysis.generatedAt);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(channelTitle)} - YouTool.io Channel Analysis</title>
  <style>
    :root { color-scheme: light; --red: #ef4444; --red-dark: #b91c1c; --ink: #151518; --muted: #696b73; --line: #e5e7eb; --soft: #f8fafc; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #ffffff; color: var(--ink); font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.5; }
    main { width: min(1080px, calc(100% - 48px)); margin: 0 auto; padding: 42px 0 56px; }
    header { border-bottom: 3px solid var(--red); padding-bottom: 24px; margin-bottom: 24px; display: grid; gap: 16px; grid-template-columns: 1fr auto; align-items: end; }
    .kicker { color: var(--red); font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; margin: 0 0 8px; }
    h1 { font-size: clamp(30px, 5vw, 48px); line-height: 1; margin: 0; letter-spacing: -0.02em; }
    .meta { color: var(--muted); font-size: 14px; margin: 12px 0 0; }
    .channel-stats { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
    .pill { border: 1px solid var(--line); border-radius: 999px; padding: 7px 12px; color: #3f4148; background: #fff; font-size: 12px; font-weight: 700; white-space: nowrap; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    .section { break-inside: avoid; page-break-inside: avoid; border: 1px solid var(--line); border-radius: 14px; background: #fff; padding: 18px; margin: 14px 0; }
    .section.full { grid-column: 1 / -1; }
    h2 { font-size: 18px; margin: 0 0 14px; }
    h3 { font-size: 15px; margin: 0 0 12px; }
    .metric-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    .metric { border: 1px solid var(--line); border-left: 4px solid var(--red); border-radius: 12px; padding: 12px; background: var(--soft); min-height: 86px; }
    .metric span { color: var(--muted); font-size: 11px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; display: block; }
    .metric strong { display: block; font-size: 24px; line-height: 1.05; margin-top: 7px; }
    .metric small { color: var(--muted); display: block; margin-top: 6px; font-size: 12px; }
    .clean-list { margin: 0; padding: 0; list-style: none; display: grid; gap: 9px; }
    .clean-list li { border-left: 3px solid rgba(239, 68, 68, 0.35); padding-left: 10px; color: #33343a; }
    .bar-list { display: grid; gap: 12px; }
    .bar-head { display: flex; justify-content: space-between; gap: 16px; font-size: 13px; }
    .bar-head span { color: var(--ink); font-weight: 800; white-space: nowrap; }
    .track { height: 7px; border-radius: 999px; background: #eceef2; overflow: hidden; margin-top: 7px; }
    .track span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--red), var(--red-dark)); }
    .bar-row p, .muted { color: var(--muted); font-size: 12px; margin: 6px 0 0; }
    .video-list { display: grid; gap: 12px; }
    .video { display: grid; grid-template-columns: 110px 1fr; gap: 14px; align-items: center; border: 1px solid var(--line); border-radius: 12px; padding: 10px; background: var(--soft); }
    .video img { width: 110px; aspect-ratio: 16 / 9; object-fit: cover; border-radius: 8px; background: #ddd; }
    .video strong { display: block; font-size: 14px; }
    .video p { color: var(--muted); margin: 5px 0 0; font-size: 12px; }
    .research-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .research-card { border: 1px solid var(--line); border-radius: 12px; padding: 14px; background: var(--soft); }
    .research-item { display: grid; gap: 4px; padding: 10px 0; border-top: 1px solid #e7e9ee; }
    .research-item:first-of-type { border-top: 0; padding-top: 0; }
    .research-item strong { font-size: 12px; }
    .research-item p { color: #4d4f57; font-size: 12px; margin: 0; }
    .research-item small { color: var(--muted); font-size: 11px; }
    .research-item em { color: var(--red-dark); font-size: 10px; font-style: normal; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
    footer { color: var(--muted); font-size: 11px; text-align: center; margin-top: 28px; }
    @media (max-width: 800px) { header { grid-template-columns: 1fr; } .channel-stats { justify-content: flex-start; } .metric-grid, .grid, .research-grid { grid-template-columns: 1fr; } }
    @media print { body { background: #fff; } main { width: 100%; padding: 20px; } .section { break-inside: avoid; } }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <p class="kicker">YouTool.io Channel Analysis</p>
        <h1>${escapeHtml(channelTitle)}</h1>
        <p class="meta">
          ${escapeHtml(period?.label || 'Full channel analysis')}
          ${period?.startDate && period?.endDate ? ` · ${escapeHtml(formatDate(period.startDate))} to ${escapeHtml(formatDate(period.endDate))}` : ''}
          ${generatedAt ? ` · Generated ${escapeHtml(generatedAt)}` : ''}
        </p>
      </div>
      <div class="channel-stats">
        ${channel?.subscriberCount !== undefined ? `<span class="pill">${escapeHtml(formatCount(channel.subscriberCount))} subscribers</span>` : ''}
        ${channel?.videoCount !== undefined ? `<span class="pill">${escapeHtml(formatCount(channel.videoCount))} videos</span>` : ''}
        ${channel?.viewCount !== undefined ? `<span class="pill">${escapeHtml(formatCount(channel.viewCount))} lifetime views</span>` : ''}
      </div>
    </header>

    <section class="section full">
      <h2>Channel overview</h2>
      <div class="metric-grid">
        ${metrics.map((metric) => `
          <article class="metric">
            <span>${escapeHtml(metric.label)}</span>
            <strong>${escapeHtml(metric.value)}</strong>
            ${metric.delta ? `<small>${escapeHtml(metric.delta)}</small>` : ''}
          </article>
        `).join('')}
      </div>
    </section>

    <div class="grid">
      ${listHtml('What stands out', analysis.insights, 'Not enough recent movement to call out yet.')}
      ${listHtml('Opportunities', analysis.opportunities, 'No major weakness detected in the current window.')}
      ${listHtml('Next actions', analysis.actions, 'Keep publishing consistently and compare this window again after the next upload cycle.')}
      ${segmentRowsHtml('Discovery sources', breakdowns.trafficSources, 'No discovery source data returned for this period.')}
      ${segmentRowsHtml('Search terms', breakdowns.searchTerms, 'No search term detail returned for this period.')}
      ${segmentRowsHtml('External sources', breakdowns.externalSources, 'No external source detail returned for this period.')}
      ${segmentRowsHtml('Viewer relationship', breakdowns.subscribedStatus, 'No subscribed viewer split returned for this period.')}
      ${segmentRowsHtml('Viewing surfaces', breakdowns.devices, 'No device data returned for this period.')}
      ${segmentRowsHtml('YouTube surfaces', breakdowns.youtubeProducts, 'No YouTube surface data returned for this period.')}
      ${segmentRowsHtml('Content mix', breakdowns.contentTypes, 'No content type split returned for this period.')}
      ${segmentRowsHtml('Playlist performance', breakdowns.topPlaylists, 'No playlist performance data returned for this period.', 'playlist')}
      ${segmentRowsHtml('Live vs on-demand', breakdowns.liveOrOnDemand, 'No live/on-demand split returned for this period.')}
      ${segmentRowsHtml('Top countries', breakdowns.countries, 'No geography data returned for this period.')}
      ${segmentRowsHtml('Known audience', breakdowns.demographics, 'Not enough audience data returned for this period.', 'demographic')}
      ${researchLabHtml(analysis)}
      <section class="section full">
        <h2>Top recent videos</h2>
        <div class="video-list">
          ${(analysis.topVideos || []).length
            ? (analysis.topVideos || []).map((video) => `
              <article class="video">
                ${video.thumbnailUrl ? `<img src="${escapeHtml(video.thumbnailUrl)}" alt="" />` : '<div></div>'}
                <div>
                  <strong>${escapeHtml(video.title || 'Untitled video')}</strong>
                  <p>${escapeHtml([
                    `${formatCount(video.views)} views`,
                    video.thumbnailCtr !== null && video.thumbnailCtr !== undefined ? `${formatPercent(video.thumbnailCtr)} CTR` : null,
                    `${formatPercent(video.engagementRate)} engagement`,
                    `${formatDuration(video.averageViewDuration)} AVD`,
                    `${formatSignedCount(video.netSubscribers)} subs`,
                  ].filter(Boolean).join(' · '))}</p>
                </div>
              </article>
            `).join('')
            : '<p class="muted">No top video data returned for this period.</p>'}
        </div>
      </section>
    </div>

    <footer>Exported from YouTool.io for personal use and sharing.</footer>
  </main>
</body>
</html>`;
}

function normalizePdfText(value: unknown): string {
  return String(value ?? '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/…/g, '...')
    .replace(/·/g, '-')
    .split('')
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code <= 126);
    })
    .join('');
}

function pdfEscape(value: unknown): string {
  return normalizePdfText(value)
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

function wrapText(value: string, maxWidth: number, fontSize: number): string[] {
  const normalized = normalizePdfText(value).replace(/\s+/g, ' ').trim();
  if (!normalized) return [];
  const words = normalized.split(' ');
  const lines: string[] = [];
  let line = '';
  const maxChars = Math.max(12, Math.floor(maxWidth / (fontSize * 0.52)));

  words.forEach((word) => {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });

  if (line) lines.push(line);
  return lines;
}

function colorToPdf(hex: string): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
}

function buildFullAnalysisPdf(context: ChannelAnalysisExportContext): Blob {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  const pages: string[][] = [[]];
  let y = pageHeight - margin;

  const currentPage = () => pages[pages.length - 1];
  const addPage = () => {
    pages.push([]);
    y = pageHeight - margin;
  };
  const ensure = (height: number) => {
    if (y - height < margin) addPage();
  };
  const text = (value: string, x: number, size: number, options: { bold?: boolean; color?: string; width?: number; lineHeight?: number } = {}) => {
    const lines = options.width ? wrapText(value, options.width, size) : [normalizePdfText(value)];
    const lineHeight = options.lineHeight || size * 1.35;
    ensure(lines.length * lineHeight + 2);
    const font = options.bold ? 'F2' : 'F1';
    const color = colorToPdf(options.color || '#151518');
    lines.forEach((line) => {
      currentPage().push(`BT /${font} ${size} Tf ${color} rg ${x.toFixed(2)} ${y.toFixed(2)} Td (${pdfEscape(line)}) Tj ET`);
      y -= lineHeight;
    });
  };
  const rect = (x: number, rectY: number, width: number, height: number, fill: string, stroke?: string) => {
    const fillColor = colorToPdf(fill);
    if (stroke) {
      currentPage().push(`${fillColor} rg ${colorToPdf(stroke)} RG ${x.toFixed(2)} ${rectY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re B`);
    } else {
      currentPage().push(`${fillColor} rg ${x.toFixed(2)} ${rectY.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re f`);
    }
  };
  const sectionTitle = (title: string) => {
    ensure(38);
    y -= 8;
    rect(margin, y - 4, 34, 2.5, '#ef4444');
    y -= 19;
    text(title, margin, 15, { bold: true });
    y -= 3;
  };
  const paragraphList = (title: string, rows: string[] | undefined, empty: string) => {
    sectionTitle(title);
    const items = rows?.filter(Boolean) || [];
    if (!items.length) {
      text(empty, margin, 9.5, { color: '#696b73', width: contentWidth });
      y -= 8;
      return;
    }
    items.forEach((item) => {
      text(`- ${item}`, margin, 9.5, { color: '#303139', width: contentWidth });
      y -= 2;
    });
    y -= 8;
  };
  const barRows = (title: string, rows: SegmentRow[] | undefined, empty: string, mode: 'standard' | 'playlist' | 'demographic' = 'standard') => {
    sectionTitle(title);
    const cleanRows = rows?.slice(0, 8) || [];
    if (!cleanRows.length) {
      text(empty, margin, 9.5, { color: '#696b73', width: contentWidth });
      y -= 8;
      return;
    }
    const maxValue = Math.max(...cleanRows.map((row) => {
      if (mode === 'playlist') return safeNumber(row.playlistViews ?? row.views);
      if (mode === 'demographic') return safeNumber(row.viewerPercentage);
      return safeNumber(row.shareOfViews);
    }), 1);
    cleanRows.forEach((row) => {
      ensure(40);
      const primary = mode === 'playlist'
        ? safeNumber(row.playlistViews ?? row.views)
        : mode === 'demographic'
          ? safeNumber(row.viewerPercentage)
          : safeNumber(row.shareOfViews);
      const value = mode === 'playlist' ? formatCount(primary) : formatPercent(primary, mode === 'demographic' ? 1 : 0);
      text(`${row.label || row.key || 'Unknown'}  ${value}`, margin, 9.5, { bold: true, width: contentWidth });
      const barY = y - 3;
      rect(margin, barY, contentWidth, 5, '#eceef2');
      rect(margin, barY, Math.max(8, (primary / maxValue) * contentWidth), 5, '#ef4444');
      y -= 13;
      const meta = mode === 'playlist'
        ? `${formatCount(Math.round(safeNumber(row.playlistWatchHours ?? row.watchHours)))} watch hours - ${formatCount(row.playlistStarts)} starts - ${formatCount(row.playlistSaves)} saves`
        : mode === 'demographic'
          ? 'Known audience share'
          : `${formatCount(row.views)} views - ${formatCount(Math.round(safeNumber(row.watchHours)))} watch hours - ${formatPercent(row.engagedViewRate)} engaged`;
      text(meta, margin, 8, { color: '#696b73', width: contentWidth });
      y -= 4;
    });
    y -= 8;
  };

  const { channelTitle, channel } = context;
  const analysis = context.analysis as FullAnalysis;
  const breakdowns = analysis.breakdowns || {};

  rect(0, pageHeight - 12, pageWidth, 12, '#ef4444');
  text('YOUTOOL.IO CHANNEL ANALYSIS', margin, 10, { bold: true, color: '#ef4444' });
  y -= 8;
  text(channelTitle, margin, 26, { bold: true, width: contentWidth, lineHeight: 30 });
  const period = analysis.period?.startDate && analysis.period?.endDate
    ? `${formatDate(analysis.period.startDate)} to ${formatDate(analysis.period.endDate)}`
    : analysis.period?.label || 'Full channel analysis';
  text(`${period}${analysis.generatedAt ? ` - Generated ${formatUpdated(analysis.generatedAt)}` : ''}`, margin, 9.5, { color: '#696b73', width: contentWidth });
  const channelStats = [
    channel?.subscriberCount !== undefined ? `${formatCount(channel.subscriberCount)} subscribers` : '',
    channel?.videoCount !== undefined ? `${formatCount(channel.videoCount)} videos` : '',
    channel?.viewCount !== undefined ? `${formatCount(channel.viewCount)} lifetime views` : '',
  ].filter(Boolean).join(' - ');
  if (channelStats) text(channelStats, margin, 9.5, { color: '#696b73', width: contentWidth });
  y -= 10;

  sectionTitle('Channel overview');
  const metrics = metricExports(analysis);
  const cardGap = 10;
  const cardWidth = (contentWidth - cardGap * 2) / 3;
  metrics.forEach((metric, index) => {
    const col = index % 3;
    if (col === 0) ensure(64);
    const rowY = y - 50;
    const x = margin + col * (cardWidth + cardGap);
    rect(x, rowY, cardWidth, 48, '#f8fafc', '#e5e7eb');
    rect(x, rowY, 3, 48, '#ef4444');
    currentPage().push(`BT /F2 7 Tf ${colorToPdf('#696b73')} rg ${(x + 10).toFixed(2)} ${(rowY + 32).toFixed(2)} Td (${pdfEscape(metric.label.toUpperCase())}) Tj ET`);
    currentPage().push(`BT /F2 14 Tf ${colorToPdf('#151518')} rg ${(x + 10).toFixed(2)} ${(rowY + 16).toFixed(2)} Td (${pdfEscape(metric.value)}) Tj ET`);
    currentPage().push(`BT /F1 7 Tf ${colorToPdf('#696b73')} rg ${(x + 10).toFixed(2)} ${(rowY + 6).toFixed(2)} Td (${pdfEscape(metric.delta || '')}) Tj ET`);
    if (col === 2 || index === metrics.length - 1) y -= 60;
  });

  paragraphList('What stands out', analysis.insights, 'Not enough recent movement to call out yet.');
  paragraphList('Opportunities', analysis.opportunities, 'No major weakness detected in the current window.');
  paragraphList('Next actions', analysis.actions, 'Keep publishing consistently and compare this window again after the next upload cycle.');

  barRows('Discovery sources', breakdowns.trafficSources, 'No discovery source data returned for this period.');
  barRows('Search terms', breakdowns.searchTerms, 'No search term detail returned for this period.');
  barRows('External sources', breakdowns.externalSources, 'No external source detail returned for this period.');
  barRows('Viewer relationship', breakdowns.subscribedStatus, 'No subscribed viewer split returned for this period.');
  barRows('Viewing surfaces', breakdowns.devices, 'No device data returned for this period.');
  barRows('YouTube surfaces', breakdowns.youtubeProducts, 'No YouTube surface data returned for this period.');
  barRows('Content mix', breakdowns.contentTypes, 'No content type split returned for this period.');
  barRows('Playlist performance', breakdowns.topPlaylists, 'No playlist performance data returned for this period.', 'playlist');
  barRows('Live vs on-demand', breakdowns.liveOrOnDemand, 'No live/on-demand split returned for this period.');
  barRows('Top countries', breakdowns.countries, 'No geography data returned for this period.');
  barRows('Known audience', breakdowns.demographics, 'Not enough audience data returned for this period.', 'demographic');

  if (analysis.researchLab?.sections?.length) {
    paragraphList('Private research lab', [analysis.researchLab.note || 'Private owner research view.'], '');
    analysis.researchLab.sections.forEach((section) => {
      sectionTitle(section.title || 'Research');
      (section.items || []).forEach((entry) => {
        text(entry.label || '', margin, 9.5, { bold: true, width: contentWidth });
        text(entry.answer || '', margin, 8.8, { color: '#4d4f57', width: contentWidth });
        if (entry.detail) text(entry.detail, margin, 8, { color: '#696b73', width: contentWidth });
        if (entry.confidence) text(entry.confidence, margin, 7.5, { bold: true, color: '#b91c1c', width: contentWidth });
        y -= 5;
      });
    });
  }

  sectionTitle('Top recent videos');
  const videos = analysis.topVideos || [];
  if (!videos.length) {
    text('No top video data returned for this period.', margin, 9.5, { color: '#696b73', width: contentWidth });
  } else {
    videos.forEach((video) => {
      text(video.title || 'Untitled video', margin, 9.5, { bold: true, width: contentWidth });
      text([
        `${formatCount(video.views)} views`,
        video.thumbnailCtr !== null && video.thumbnailCtr !== undefined ? `${formatPercent(video.thumbnailCtr)} CTR` : '',
        `${formatPercent(video.engagementRate)} engagement`,
        `${formatDuration(video.averageViewDuration)} AVD`,
        `${formatSignedCount(video.netSubscribers)} subs`,
      ].filter(Boolean).join(' - '), margin, 8.4, { color: '#696b73', width: contentWidth });
      y -= 5;
    });
  }

  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  const pageRefs: number[] = [];
  pages.forEach((commands) => {
    const stream = commands.join('\n');
    const contentRef = objects.length + 1;
    objects.push(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    const pageRef = objects.length + 1;
    pageRefs.push(pageRef);
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentRef} 0 R >>`);
  });
  objects[1] = `<< /Type /Pages /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(' ')}] /Count ${pageRefs.length} >>`;

  const encoder = new TextEncoder();
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets[index + 1] = encoder.encode(pdf).length;
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}

export function downloadFullChannelAnalysis(context: ChannelAnalysisExportContext, format: ChannelAnalysisExportFormat) {
  const filenameBase = `${slugify(context.channelTitle)}-youtool-analysis-${FILE_SAFE_DATE}`;

  if (format === 'html') {
    downloadBlob(`${filenameBase}.html`, new Blob([buildFullAnalysisHtml(context)], { type: 'text/html;charset=utf-8' }));
    return;
  }

  downloadBlob(`${filenameBase}.pdf`, buildFullAnalysisPdf(context));
}
