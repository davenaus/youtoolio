import React, { useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button/Button';
import { useAuth } from '../../context/AuthContext';

interface ConnectedChannel {
  title: string;
  thumbnail: string | null;
}

interface MetricSet {
  views: number;
  engagedViews: number;
  redViews: number;
  watchHours: number;
  premiumWatchHours: number;
  averageViewDuration: number;
  averageViewPercentage: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  engagementRate: number;
  engagedViewRate: number;
  premiumViewRate: number;
  likeRate: number;
  commentRate: number;
  shareRate: number;
  subscribersGained: number;
  subscribersLost: number;
  netSubscribers: number;
  videosAddedToPlaylists: number;
  videosRemovedFromPlaylists: number;
  playlistNetAdds: number;
  playlistAddRate: number;
  cardImpressions: number;
  cardClicks: number;
  cardClickRate: number;
  cardTeaserImpressions: number;
  cardTeaserClicks: number;
  cardTeaserClickRate: number;
  videoThumbnailImpressions: number;
  thumbnailCtr: number | null;
  subsPerThousandViews: number;
}

interface TrendDay {
  date: string;
  views: number;
  engagedViews: number;
  subscribersGained: number;
  subscribersLost: number;
  engagementRate: number;
  thumbnailCtr: number | null;
  averageViewDuration: number;
  averageViewPercentage: number;
}

interface DeltaEntry {
  absolute: number | null;
  percent: number | null;
}

interface TopVideo {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  publishedAt: string | null;
  views: number;
  engagedViews: number;
  redViews: number;
  watchHours: number;
  premiumWatchHours: number;
  averageViewDuration: number;
  averageViewPercentage: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  playlistNetAdds: number;
  engagementRate: number;
  thumbnailCtr: number | null;
  netSubscribers: number;
}

interface SegmentRow {
  key: string;
  label: string;
  views: number;
  engagedViews: number;
  watchHours: number;
  shareOfViews: number;
  engagedViewRate: number;
}

interface DemographicRow {
  key: string;
  label: string;
  viewerPercentage: number;
  shareOfKnownAudience: number;
}

interface AnalysisBreakdowns {
  trafficSources: SegmentRow[];
  devices: SegmentRow[];
  subscribedStatus: SegmentRow[];
  contentTypes: SegmentRow[];
  countries: SegmentRow[];
  youtubeProducts: SegmentRow[];
  liveOrOnDemand: SegmentRow[];
  demographics: DemographicRow[];
}

interface FullAnalysis {
  generatedAt: string;
  period: {
    label: string;
    startDate: string;
    endDate: string;
    previousStartDate: string;
    previousEndDate: string;
  };
  current: MetricSet;
  previous: MetricSet;
  deltas: Record<string, DeltaEntry>;
  breakdowns: AnalysisBreakdowns;
  topVideos: TopVideo[];
  insights: string[];
  opportunities: string[];
  actions: string[];
}

interface DashboardPayload {
  generatedAt: string;
  cacheMaxAgeMs: number;
  period: {
    label: string;
    currentStartDate: string;
    currentEndDate: string;
    previousStartDate: string;
    previousEndDate: string;
  };
  channel: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    subscriberCount: number;
    videoCount: number;
    viewCount: number;
  };
  trendDays: TrendDay[];
  current: MetricSet;
  previous: MetricSet;
  deltas: Record<string, DeltaEntry>;
  fullAnalysis?: FullAnalysis;
}

interface CacheEnvelope<T> {
  savedAt: number;
  payload: T;
}

const DASHBOARD_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const FULL_ANALYSIS_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_VERSION = 'v2';

const shimmer = keyframes`
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
`;

const Card = styled.section`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 16px;
  padding: 1.35rem;
  overflow: hidden;
`;

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 560px) {
    flex-direction: column;
  }
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Kicker = styled.p`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0 0 0.35rem;
`;

const Title = styled.h2`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Sub = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.76rem;
  line-height: 1.5;
  margin: 0.35rem 0 0;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 560px) {
    justify-content: flex-start;
  }
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 26px;
  border-radius: 999px;
  padding: 0 0.65rem;
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.72rem;
`;

const SnapshotGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MetricTile = styled.div`
  min-height: 86px;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.018);
  padding: 0.85rem;
`;

const MetricLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

const MetricValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.15rem;
  font-weight: 700;
  margin-top: 0.35rem;
`;

const MetricDelta = styled.div<{ $positive?: boolean; $negative?: boolean }>`
  color: ${({ $positive, $negative }) => {
    if ($positive) return '#86efac';
    if ($negative) return '#fca5a5';
    return 'rgba(255,255,255,0.45)';
  }};
  font-size: 0.72rem;
  margin-top: 0.2rem;
`;

const GraphPanel = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(20, 20, 24, 0.78), rgba(12, 12, 14, 0.72));
  padding: 0.75rem;
`;

const GraphHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
`;

const GraphTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.74rem;
  font-weight: 700;
`;

const Legend = styled.div`
  display: flex;
  gap: 0.65rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.68rem;
`;

const Dot = styled.span<{ $color: string }>`
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: ${({ $color }) => $color};
  display: inline-block;
  margin-right: 0.3rem;
`;

const TrendSvg = styled.svg`
  width: 100%;
  height: 74px;
  display: block;
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Footnote = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.72rem;
  line-height: 1.5;
`;

const ErrorText = styled.p`
  margin: 0.75rem 0 0;
  color: #fca5a5;
  font-size: 0.75rem;
`;

const SkeletonLine = styled.div<{ $width?: string; $height?: string }>`
  width: ${({ $width }) => $width || '100%'};
  height: ${({ $height }) => $height || '14px'};
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.12), rgba(255,255,255,0.05));
  background-size: 200% 100%;
  animation: ${shimmer} 1.2s ease-in-out infinite;
`;

const SkeletonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin-top: 1rem;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.68);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
`;

const Modal = styled.div`
  width: min(1080px, 100%);
  max-height: min(88vh, 860px);
  overflow: auto;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 18px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
  padding: 1.35rem;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CloseButton = styled.button`
  width: 32px;
  min-width: 32px;
  max-width: 32px;
  height: 32px;
  min-height: 32px;
  max-height: 32px;
  aspect-ratio: 1 / 1;
  flex: 0 0 32px;
  box-sizing: border-box;
  display: inline-grid;
  place-items: center;
  padding: 0;
  line-height: 1;
  border-radius: 999px;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 1rem;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

const AnalysisSection = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.018);
`;

const SectionTitle = styled.h3`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.86rem;
  margin: 0 0 0.75rem;
`;

const InsightList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 0.6rem;

  li {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.78rem;
    line-height: 1.45;
  }
`;

const TopVideoList = styled.div`
  display: grid;
  gap: 0.7rem;
`;

const BreakdownList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const BreakdownRow = styled.div`
  display: grid;
  gap: 0.35rem;
`;

const BreakdownHead = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
`;

const BreakdownLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.75rem;
  line-height: 1.3;
`;

const BreakdownValue = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
`;

const BreakdownMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.66rem;
  line-height: 1.35;
`;

const BarTrack = styled.div`
  height: 5px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  overflow: hidden;
`;

const BarFill = styled.div<{ $width: number }>`
  width: ${({ $width }) => Math.max(2, Math.min(100, $width))}%;
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #ef4444, #9ca3af);
`;

const TopVideoRow = styled.div`
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 0.75rem;
  align-items: center;
`;

const VideoThumb = styled.div<{ $url?: string | null }>`
  width: 74px;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  background: ${({ $url, theme }) => $url ? `url(${$url}) center / cover` : theme.colors.dark5};
`;

const VideoTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.78rem;
  line-height: 1.35;
`;

const VideoMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.68rem;
  margin-top: 0.25rem;
`;

function readCache<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEnvelope<T>;
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > ttlMs) return null;
    return parsed.payload;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, payload: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), payload }));
  } catch {
    // Cache is a speed optimization only.
  }
}

function formatCount(value: number | null | undefined): string {
  const next = Number(value || 0);
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
  const total = Math.round(Number(seconds || 0));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}:${String(secs).padStart(2, '0')}`;
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatUpdated(value: string | null | undefined): string {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDelta(delta: DeltaEntry | undefined, suffix = '') {
  if (!delta || delta.percent === null || !Number.isFinite(Number(delta.percent))) {
    return 'No previous data';
  }
  const direction = delta.percent > 0 ? '+' : '';
  return `${direction}${formatPrecise(delta.percent, 1)}% vs prev${suffix}`;
}

function formatSignedCount(value: number | null | undefined): string {
  const next = Number(value || 0);
  return `${next >= 0 ? '+' : ''}${formatCount(next)}`;
}

function renderSegmentRows(rows: SegmentRow[] | undefined, emptyLabel: string) {
  if (!rows?.length) {
    return <VideoMeta>{emptyLabel}</VideoMeta>;
  }

  return (
    <BreakdownList>
      {rows.map((row) => (
        <BreakdownRow key={row.key}>
          <BreakdownHead>
            <BreakdownLabel>{row.label}</BreakdownLabel>
            <BreakdownValue>{formatPercent(row.shareOfViews, 0)}</BreakdownValue>
          </BreakdownHead>
          <BarTrack>
            <BarFill $width={row.shareOfViews} />
          </BarTrack>
          <BreakdownMeta>
            {formatCount(row.views)} views · {formatCount(Math.round(row.watchHours))} watch hours · {formatPercent(row.engagedViewRate)} engaged
          </BreakdownMeta>
        </BreakdownRow>
      ))}
    </BreakdownList>
  );
}

function renderDemographicRows(rows: DemographicRow[] | undefined) {
  if (!rows?.length) {
    return <VideoMeta>Not enough audience data returned for this period.</VideoMeta>;
  }

  return (
    <BreakdownList>
      {rows.map((row) => (
        <BreakdownRow key={row.key}>
          <BreakdownHead>
            <BreakdownLabel>{row.label}</BreakdownLabel>
            <BreakdownValue>{formatPercent(row.viewerPercentage)}</BreakdownValue>
          </BreakdownHead>
          <BarTrack>
            <BarFill $width={row.viewerPercentage} />
          </BarTrack>
        </BreakdownRow>
      ))}
    </BreakdownList>
  );
}

function buildPath(values: number[]) {
  if (values.length < 2) return '';

  const left = 5;
  const right = 355;
  const top = 8;
  const bottom = 66;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const step = (right - left) / (values.length - 1);

  return values.map((value, index) => {
    const x = left + step * index;
    const y = bottom - ((value - min) / spread) * (bottom - top);
    return `${index === 0 ? 'M' : 'L'}${Math.round(x * 100) / 100} ${Math.round(y * 100) / 100}`;
  }).join(' ');
}

function MiniTrend({ rows }: { rows: TrendDay[] }) {
  const views = rows.map((row) => Number(row.views || 0));
  const subs = rows.map((row) => Number(row.subscribersGained || 0) - Number(row.subscribersLost || 0));
  const viewsPath = buildPath(views);
  const subsPath = buildPath(subs);

  return (
    <GraphPanel>
      <GraphHead>
        <GraphTitle>7-day channel trend</GraphTitle>
        <Legend>
          <span><Dot $color="#ef4444" />Views</span>
          <span><Dot $color="#9ca3af" />Subs</span>
        </Legend>
      </GraphHead>
      <TrendSvg viewBox="0 0 360 74" preserveAspectRatio="none" aria-label="Views and subscribers trend">
        {[18, 38, 58].map((y) => (
          <line key={y} x1="4" y1={y} x2="356" y2={y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        ))}
        {viewsPath && <path d={viewsPath} fill="none" stroke="#ef4444" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
        {subsPath && <path d={subsPath} fill="none" stroke="#9ca3af" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />}
        {rows.map((row, index) => {
          const x = rows.length > 1 ? 5 + ((355 - 5) / (rows.length - 1)) * index : 180;
          return (
            <circle key={row.date} cx={x} cy="67.5" r="1.5" fill="rgba(255,255,255,0.2)">
              <title>{`${formatDate(row.date)} - ${formatCount(row.views)} views, ${row.subscribersGained - row.subscribersLost} net subs`}</title>
            </circle>
          );
        })}
      </TrendSvg>
    </GraphPanel>
  );
}

function LoadingCard() {
  return (
    <Card aria-label="Loading YouTube account analytics">
      <Header>
        <TitleBlock>
          <SkeletonLine $width="130px" $height="10px" />
          <div style={{ height: 10 }} />
          <SkeletonLine $width="240px" $height="18px" />
          <div style={{ height: 8 }} />
          <SkeletonLine $width="320px" />
        </TitleBlock>
        <SkeletonLine $width="120px" $height="28px" />
      </Header>
      <GraphPanel>
        <SkeletonLine $width="160px" />
        <div style={{ height: 14 }} />
        <SkeletonLine $height="74px" />
      </GraphPanel>
      <SkeletonGrid>
        {Array.from({ length: 10 }).map((_, index) => (
          <MetricTile key={index}>
            <SkeletonLine $width="70%" $height="10px" />
            <div style={{ height: 14 }} />
            <SkeletonLine $width="50%" $height="20px" />
            <div style={{ height: 10 }} />
            <SkeletonLine $width="65%" $height="10px" />
          </MetricTile>
        ))}
      </SkeletonGrid>
    </Card>
  );
}

function metricTone(delta?: DeltaEntry) {
  if (!delta || delta.percent === null) return {};
  return {
    $positive: delta.percent > 0,
    $negative: delta.percent < 0,
  };
}

export const AccountYouTubeInsights: React.FC<{ channel: ConnectedChannel }> = ({ channel }) => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<DashboardPayload | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [dashboardError, setDashboardError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [fullAnalysis, setFullAnalysis] = useState<FullAnalysis | null>(null);
  const [loadingFullAnalysis, setLoadingFullAnalysis] = useState(false);
  const [fullAnalysisError, setFullAnalysisError] = useState('');

  const dashboardCacheKey = user?.id ? `youtool.account.dashboard.${CACHE_VERSION}.${user.id}` : '';
  const fullCacheKey = user?.id ? `youtool.account.fullAnalysis.${CACHE_VERSION}.${user.id}` : '';

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      if (!dashboardCacheKey) return;

      const cached = readCache<DashboardPayload>(dashboardCacheKey, DASHBOARD_CACHE_TTL_MS);
      if (cached) {
        setDashboard(cached);
        setLoadingDashboard(false);
        return;
      }

      setLoadingDashboard(true);
      setDashboardError('');

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('Sign in again to load channel analytics.');

        const response = await fetch('/api/youtube/account-dashboard', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await response.json();
        if (!response.ok || payload.error) {
          throw new Error(payload.message || payload.error || 'Could not load channel analytics.');
        }

        if (cancelled) return;
        setDashboard(payload);
        writeCache(dashboardCacheKey, payload);
      } catch (error) {
        if (!cancelled) {
          setDashboardError(error instanceof Error ? error.message : 'Could not load channel analytics.');
        }
      } finally {
        if (!cancelled) setLoadingDashboard(false);
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [dashboardCacheKey]);

  const metrics = useMemo(() => {
    if (!dashboard) return [];
    const current = dashboard.current;
    const deltas = dashboard.deltas;

    return [
      {
        label: 'Views',
        value: formatCount(current.views),
        delta: formatDelta(deltas.views),
        tone: metricTone(deltas.views),
      },
      {
        label: 'Net subs',
        value: formatSignedCount(current.netSubscribers),
        delta: formatDelta(deltas.netSubscribers),
        tone: metricTone(deltas.netSubscribers),
      },
      {
        label: 'Engaged views',
        value: formatCount(current.engagedViews),
        delta: formatDelta(deltas.engagedViews),
        tone: metricTone(deltas.engagedViews),
      },
      {
        label: 'Engaged rate',
        value: formatPercent(current.engagedViewRate),
        delta: formatDelta(deltas.engagedViewRate),
        tone: metricTone(deltas.engagedViewRate),
      },
      {
        label: 'Engagement',
        value: formatPercent(current.engagementRate),
        delta: formatDelta(deltas.engagementRate),
        tone: metricTone(deltas.engagementRate),
      },
      {
        label: 'CTR',
        value: current.thumbnailCtr === null ? '-' : formatPercent(current.thumbnailCtr),
        delta: formatDelta(deltas.thumbnailCtr),
        tone: metricTone(deltas.thumbnailCtr),
      },
      {
        label: 'AVD',
        value: formatDuration(current.averageViewDuration),
        delta: formatDelta(deltas.averageViewDuration),
        tone: metricTone(deltas.averageViewDuration),
      },
      {
        label: 'Avg viewed',
        value: formatPercent(current.averageViewPercentage),
        delta: formatDelta(deltas.averageViewPercentage),
        tone: metricTone(deltas.averageViewPercentage),
      },
      {
        label: 'Watch hours',
        value: formatCount(Math.round(current.watchHours)),
        delta: formatDelta(deltas.watchHours),
        tone: metricTone(deltas.watchHours),
      },
      {
        label: 'Playlist saves',
        value: formatSignedCount(current.playlistNetAdds),
        delta: formatDelta(deltas.playlistNetAdds),
        tone: metricTone(deltas.playlistNetAdds),
      },
    ];
  }, [dashboard]);

  const openFullAnalysis = async () => {
    setModalOpen(true);
    setFullAnalysisError('');

    if (fullCacheKey) {
      const cached = readCache<FullAnalysis>(fullCacheKey, FULL_ANALYSIS_CACHE_TTL_MS);
      if (cached) {
        setFullAnalysis(cached);
        return;
      }
    }

    setLoadingFullAnalysis(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sign in again to run the full channel analysis.');

      const response = await fetch('/api/youtube/account-dashboard?full=1', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok || payload.error || !payload.fullAnalysis) {
        throw new Error(payload.message || payload.error || 'Could not run the full channel analysis.');
      }

      setDashboard(payload);
      if (dashboardCacheKey) writeCache(dashboardCacheKey, payload);
      setFullAnalysis(payload.fullAnalysis);
      if (fullCacheKey) writeCache(fullCacheKey, payload.fullAnalysis);
    } catch (error) {
      setFullAnalysisError(error instanceof Error ? error.message : 'Could not run the full channel analysis.');
    } finally {
      setLoadingFullAnalysis(false);
    }
  };

  if (loadingDashboard && !dashboard) return <LoadingCard />;

  return (
    <>
      <Card>
        <Header>
          <TitleBlock>
            <Kicker>Connected channel</Kicker>
            <Title>{dashboard?.channel.title || channel.title || 'YouTube Studio pulse'}</Title>
            <Sub>
              This week compared to the previous 7 days, using the latest complete YouTube Analytics window.
            </Sub>
          </TitleBlock>
          <MetaRow>
            {dashboard?.channel.subscriberCount !== undefined && (
              <Pill>{formatCount(dashboard.channel.subscriberCount)} subs</Pill>
            )}
            {dashboard?.generatedAt && <Pill>Updated {formatUpdated(dashboard.generatedAt)}</Pill>}
          </MetaRow>
        </Header>

        {dashboard && (
          <>
            <MiniTrend rows={dashboard.trendDays || []} />
            <SnapshotGrid>
              {metrics.map((metric) => (
                <MetricTile key={metric.label}>
                  <MetricLabel>{metric.label}</MetricLabel>
                  <MetricValue>{metric.value}</MetricValue>
                  <MetricDelta {...metric.tone}>{metric.delta}</MetricDelta>
                </MetricTile>
              ))}
            </SnapshotGrid>
            <FooterRow>
              <Footnote>
                {formatDate(dashboard.period.currentStartDate)}-{formatDate(dashboard.period.currentEndDate)}
                {' '}vs{' '}
                {formatDate(dashboard.period.previousStartDate)}-{formatDate(dashboard.period.previousEndDate)}
              </Footnote>
              <Button variant="primary" size="sm" onClick={openFullAnalysis}>
                Run full analysis of my channel
              </Button>
            </FooterRow>
          </>
        )}

        {dashboardError && <ErrorText>{dashboardError}</ErrorText>}
      </Card>

      {modalOpen && (
        <Overlay role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setModalOpen(false);
        }}>
          <Modal role="dialog" aria-modal="true" aria-labelledby="account-channel-analysis-title">
            <ModalHeader>
              <TitleBlock>
                <Kicker>Full channel analysis</Kicker>
                <Title id="account-channel-analysis-title">
                  {dashboard?.channel.title || channel.title}
                </Title>
                <Sub>
                  A deeper read of your last 28 complete days across reach, retention, engagement, and top videos.
                </Sub>
              </TitleBlock>
              <CloseButton type="button" aria-label="Close analysis" onClick={() => setModalOpen(false)}>x</CloseButton>
            </ModalHeader>

            {loadingFullAnalysis && (
              <ModalGrid>
                {Array.from({ length: 4 }).map((_, index) => (
                  <AnalysisSection key={index}>
                    <SkeletonLine $width="45%" />
                    <div style={{ height: 14 }} />
                    <SkeletonLine />
                    <div style={{ height: 10 }} />
                    <SkeletonLine $width="90%" />
                    <div style={{ height: 10 }} />
                    <SkeletonLine $width="75%" />
                  </AnalysisSection>
                ))}
              </ModalGrid>
            )}

            {!loadingFullAnalysis && fullAnalysis && (
              <ModalGrid>
                <AnalysisSection>
                  <SectionTitle>28-day snapshot</SectionTitle>
                  <SnapshotGrid>
                    <MetricTile>
                      <MetricLabel>Views</MetricLabel>
                      <MetricValue>{formatCount(fullAnalysis.current.views)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.views)}>{formatDelta(fullAnalysis.deltas.views)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>Watch hours</MetricLabel>
                      <MetricValue>{formatCount(Math.round(fullAnalysis.current.watchHours))}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.watchHours)}>{formatDelta(fullAnalysis.deltas.watchHours)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>CTR</MetricLabel>
                      <MetricValue>{fullAnalysis.current.thumbnailCtr === null ? '-' : formatPercent(fullAnalysis.current.thumbnailCtr)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.thumbnailCtr)}>{formatDelta(fullAnalysis.deltas.thumbnailCtr)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>AVD</MetricLabel>
                      <MetricValue>{formatDuration(fullAnalysis.current.averageViewDuration)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.averageViewDuration)}>{formatDelta(fullAnalysis.deltas.averageViewDuration)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>Engagement</MetricLabel>
                      <MetricValue>{formatPercent(fullAnalysis.current.engagementRate)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.engagementRate)}>{formatDelta(fullAnalysis.deltas.engagementRate)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>Engaged views</MetricLabel>
                      <MetricValue>{formatCount(fullAnalysis.current.engagedViews)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.engagedViews)}>{formatDelta(fullAnalysis.deltas.engagedViews)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>Engaged rate</MetricLabel>
                      <MetricValue>{formatPercent(fullAnalysis.current.engagedViewRate)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.engagedViewRate)}>{formatDelta(fullAnalysis.deltas.engagedViewRate)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>Avg viewed</MetricLabel>
                      <MetricValue>{formatPercent(fullAnalysis.current.averageViewPercentage)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.averageViewPercentage)}>{formatDelta(fullAnalysis.deltas.averageViewPercentage)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>Premium views</MetricLabel>
                      <MetricValue>{formatPercent(fullAnalysis.current.premiumViewRate)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.premiumViewRate)}>{formatDelta(fullAnalysis.deltas.premiumViewRate)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>Playlist saves</MetricLabel>
                      <MetricValue>{formatSignedCount(fullAnalysis.current.playlistNetAdds)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.playlistNetAdds)}>{formatDelta(fullAnalysis.deltas.playlistNetAdds)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>Card CTR</MetricLabel>
                      <MetricValue>{formatPercent(fullAnalysis.current.cardClickRate)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.cardClickRate)}>{formatDelta(fullAnalysis.deltas.cardClickRate)}</MetricDelta>
                    </MetricTile>
                    <MetricTile>
                      <MetricLabel>Subs / 1K views</MetricLabel>
                      <MetricValue>{formatPrecise(fullAnalysis.current.subsPerThousandViews, 2)}</MetricValue>
                      <MetricDelta {...metricTone(fullAnalysis.deltas.subsPerThousandViews)}>{formatDelta(fullAnalysis.deltas.subsPerThousandViews)}</MetricDelta>
                    </MetricTile>
                  </SnapshotGrid>
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>What stands out</SectionTitle>
                  <InsightList>
                    {(fullAnalysis.insights.length ? fullAnalysis.insights : ['Not enough recent movement to call out yet.']).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </InsightList>
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>Opportunities</SectionTitle>
                  <InsightList>
                    {(fullAnalysis.opportunities.length ? fullAnalysis.opportunities : ['No major weakness detected in the current window.']).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </InsightList>
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>Next actions</SectionTitle>
                  <InsightList>
                    {(fullAnalysis.actions.length ? fullAnalysis.actions : ['Keep publishing consistently and compare this window again after the next upload cycle.']).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </InsightList>
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>Discovery sources</SectionTitle>
                  {renderSegmentRows(fullAnalysis.breakdowns?.trafficSources, 'No discovery source data returned for this period.')}
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>Viewer relationship</SectionTitle>
                  {renderSegmentRows(fullAnalysis.breakdowns?.subscribedStatus, 'No subscribed viewer split returned for this period.')}
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>Viewing surfaces</SectionTitle>
                  {renderSegmentRows(fullAnalysis.breakdowns?.devices, 'No device data returned for this period.')}
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>YouTube surfaces</SectionTitle>
                  {renderSegmentRows(fullAnalysis.breakdowns?.youtubeProducts, 'No YouTube surface data returned for this period.')}
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>Content mix</SectionTitle>
                  {renderSegmentRows(fullAnalysis.breakdowns?.contentTypes, 'No content type split returned for this period.')}
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>Live vs on-demand</SectionTitle>
                  {renderSegmentRows(fullAnalysis.breakdowns?.liveOrOnDemand, 'No live/on-demand split returned for this period.')}
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>Top countries</SectionTitle>
                  {renderSegmentRows(fullAnalysis.breakdowns?.countries, 'No geography data returned for this period.')}
                </AnalysisSection>

                <AnalysisSection>
                  <SectionTitle>Known audience</SectionTitle>
                  {renderDemographicRows(fullAnalysis.breakdowns?.demographics)}
                </AnalysisSection>

                <AnalysisSection style={{ gridColumn: '1 / -1' }}>
                  <SectionTitle>Top recent videos</SectionTitle>
                  <TopVideoList>
                    {fullAnalysis.topVideos.map((video) => (
                      <TopVideoRow key={video.id}>
                        <VideoThumb $url={video.thumbnailUrl} />
                        <div>
                          <VideoTitle>{video.title}</VideoTitle>
                          <VideoMeta>
                            {formatCount(video.views)} views · {formatPercent(video.thumbnailCtr)} CTR · {formatPercent(video.engagementRate)} engagement · {formatDuration(video.averageViewDuration)} AVD · {formatSignedCount(video.netSubscribers)} subs
                          </VideoMeta>
                        </div>
                      </TopVideoRow>
                    ))}
                    {!fullAnalysis.topVideos.length && <VideoMeta>No top video data returned for this period.</VideoMeta>}
                  </TopVideoList>
                </AnalysisSection>
              </ModalGrid>
            )}

            {!loadingFullAnalysis && fullAnalysisError && <ErrorText>{fullAnalysisError}</ErrorText>}
          </Modal>
        </Overlay>
      )}
    </>
  );
};

export default AccountYouTubeInsights;
