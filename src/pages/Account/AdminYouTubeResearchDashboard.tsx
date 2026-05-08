import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button/Button';

interface AdminTotals {
  activeConnectedChannels: number;
  storedChannels: number;
  allStoredChannels: number;
  storedUsers: number;
  channelSnapshotRows: number;
  videoSnapshotRows: number;
  channelDailyRows: number;
  videoDailyRows: number;
  breakdownRows: number;
  commentRows: number;
  latestSync: string | null;
}

interface AdminCoverage {
  live: number;
  building: number;
  needsCollector: number;
  total: number;
}

interface AdminResearchItem {
  label: string;
  answer: string;
  status: string;
  detail?: string;
}

interface AdminResearchSection {
  title: string;
  items: AdminResearchItem[];
}

interface AdminFilter {
  minSubscribers: number;
  includedChannels: number;
  excludedChannels: number;
  totalChannels: number;
  unknownSubscriberChannels: number;
  truncatedTables: string[];
}

interface AdminResearchDashboardPayload {
  generatedAt: string;
  note: string;
  filter: AdminFilter;
  totals: AdminTotals;
  coverage: AdminCoverage;
  sections: AdminResearchSection[];
}

const ADMIN_CACHE_KEY = 'youtool.admin.youtubeResearch.v1';
const ADMIN_FILTER_KEY = 'youtool.admin.youtubeResearch.minSubscribers.v1';
const ADMIN_CACHE_TTL_MS = 5 * 60 * 1000;
const SUBSCRIBER_FILTERS = [
  { label: 'All channels', value: 0 },
  { label: '100+ subs', value: 100 },
  { label: '500+ subs', value: 500 },
  { label: '1K+ subs', value: 1000 },
  { label: '5K+ subs', value: 5000 },
  { label: '10K+ subs', value: 10000 },
  { label: '50K+ subs', value: 50000 },
  { label: '100K+ subs', value: 100000 },
];

const shimmer = keyframes`
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
`;

const Card = styled.section`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid rgba(248, 113, 113, 0.22);
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

const Kicker = styled.p`
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #fca5a5;
  margin: 0 0 0.35rem;
`;

const Title = styled.h2`
  font-size: 1.08rem;
  line-height: 1.25;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const Sub = styled.p`
  font-size: 0.78rem;
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.55;
  margin: 0.45rem 0 0;
`;

const MetaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  margin: 1rem 0;

  @media (max-width: 680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const MetaTile = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  padding: 0.8rem;
`;

const MetaValue = styled.div`
  font-size: 1.05rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const MetaLabel = styled.div`
  margin-top: 0.25rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.68rem;
  line-height: 1.35;
`;

const CoverageRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  margin-bottom: 1rem;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const CoverageTile = styled.div<{ $tone?: 'live' | 'building' | 'collector' }>`
  border-radius: 12px;
  padding: 0.85rem;
  border: 1px solid ${({ $tone }) =>
    $tone === 'live'
      ? 'rgba(74, 222, 128, 0.24)'
      : $tone === 'collector'
        ? 'rgba(251, 191, 36, 0.28)'
        : 'rgba(96, 165, 250, 0.22)'};
  background: ${({ $tone }) =>
    $tone === 'live'
      ? 'rgba(34, 197, 94, 0.08)'
      : $tone === 'collector'
        ? 'rgba(251, 191, 36, 0.07)'
        : 'rgba(96, 165, 250, 0.07)'};
`;

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  padding: 0.8rem;
  margin: 1rem 0;

  @media (max-width: 560px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

const FilterCopy = styled.div`
  min-width: 0;
`;

const FilterLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.78rem;
  font-weight: 800;
`;

const FilterHelp = styled.div`
  margin-top: 0.22rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.7rem;
  line-height: 1.4;
`;

const FilterSelect = styled.select`
  min-width: 140px;
  border: 1px solid rgba(248, 113, 113, 0.24);
  border-radius: 10px;
  background: ${({ theme }) => theme.colors.dark4};
  color: ${({ theme }) => theme.colors.text.primary};
  font: inherit;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.55rem 0.7rem;
  outline: none;

  &:focus {
    border-color: rgba(248, 113, 113, 0.55);
    box-shadow: 0 0 0 3px rgba(248, 113, 113, 0.08);
  }
`;

const Notice = styled.p`
  margin: 0 0 1rem;
  color: #fcd34d;
  font-size: 0.74rem;
  line-height: 1.5;
`;

const SectionList = styled.div`
  display: grid;
  gap: 0.75rem;
`;

const Section = styled.details`
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;

  &[open] summary {
    border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  }
`;

const SectionSummary = styled.summary`
  cursor: pointer;
  padding: 0.9rem 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.86rem;
  font-weight: 800;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }
`;

const ItemList = styled.div`
  display: grid;
  gap: 0;
`;

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: minmax(160px, 0.95fr) minmax(220px, 1.4fr) auto;
  gap: 0.85rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.055);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const ItemLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.45;
`;

const ItemAnswer = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.76rem;
  line-height: 1.5;
`;

const Badge = styled.span<{ $status: string }>`
  justify-self: end;
  align-self: start;
  border-radius: 999px;
  padding: 0.26rem 0.55rem;
  border: 1px solid ${({ $status }) =>
    $status === 'Live'
      ? 'rgba(74, 222, 128, 0.3)'
      : $status === 'Needs collector'
        ? 'rgba(251, 191, 36, 0.34)'
        : 'rgba(255, 255, 255, 0.12)'};
  color: ${({ $status }) =>
    $status === 'Live'
      ? '#86efac'
      : $status === 'Needs collector'
        ? '#fcd34d'
        : '#cbd5e1'};
  background: rgba(255, 255, 255, 0.03);
  font-size: 0.62rem;
  font-weight: 800;
  white-space: nowrap;

  @media (max-width: 720px) {
    justify-self: start;
  }
`;

const ErrorText = styled.p`
  margin: 0;
  color: #fca5a5;
  font-size: 0.78rem;
`;

const Skeleton = styled.div`
  height: 11rem;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09), rgba(255,255,255,0.04));
  background-size: 200% 100%;
  animation: ${shimmer} 1.25s infinite;
`;

function cacheKeyFor(minSubscribers: number) {
  return `${ADMIN_CACHE_KEY}.${minSubscribers}`;
}

function readStoredMinSubscribers() {
  try {
    const stored = Number(localStorage.getItem(ADMIN_FILTER_KEY) || 0);
    return SUBSCRIBER_FILTERS.some((option) => option.value === stored) ? stored : 0;
  } catch {
    return 0;
  }
}

function writeStoredMinSubscribers(value: number) {
  try {
    localStorage.setItem(ADMIN_FILTER_KEY, String(value));
  } catch {
    // Local preference is best-effort only.
  }
}

function readCache(minSubscribers: number): AdminResearchDashboardPayload | null {
  try {
    const raw = localStorage.getItem(cacheKeyFor(minSubscribers));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > ADMIN_CACHE_TTL_MS) return null;
    return parsed.payload || null;
  } catch {
    return null;
  }
}

function writeCache(minSubscribers: number, payload: AdminResearchDashboardPayload) {
  try {
    localStorage.setItem(cacheKeyFor(minSubscribers), JSON.stringify({ savedAt: Date.now(), payload }));
  } catch {
    // Local cache is best-effort only.
  }
}

function formatCount(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

function formatUpdated(value: string | null | undefined) {
  if (!value) return 'No sync yet';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'No sync yet';
  return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export const AdminYouTubeResearchDashboard: React.FC = () => {
  const initialMinSubscribers = readStoredMinSubscribers();
  const [minSubscribers, setMinSubscribers] = useState(initialMinSubscribers);
  const [dashboard, setDashboard] = useState<AdminResearchDashboardPayload | null>(() => readCache(initialMinSubscribers));
  const [loading, setLoading] = useState(!readCache(initialMinSubscribers));
  const [error, setError] = useState('');

  const refresh = useCallback(async (force = false, requestedMinSubscribers = minSubscribers) => {
    if (!force) {
      const cached = readCache(requestedMinSubscribers);
      if (cached) {
        setDashboard(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sign in again to load the research dashboard.');

      const response = await fetch(`/api/youtube/account-dashboard?admin=research&minSubscribers=${encodeURIComponent(requestedMinSubscribers)}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok || payload.error) {
        throw new Error(payload.message || payload.error || 'Could not load research dashboard.');
      }

      setDashboard(payload);
      writeCache(requestedMinSubscribers, payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load research dashboard.');
    } finally {
      setLoading(false);
    }
  }, [minSubscribers]);

  useEffect(() => {
    refresh(false, minSubscribers);
  }, [minSubscribers, refresh]);

  const onMinSubscribersChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextValue = Number(event.target.value) || 0;
    writeStoredMinSubscribers(nextValue);
    setMinSubscribers(nextValue);
  };

  const metaTiles = useMemo(() => {
    if (!dashboard) return [];
    return [
      ['Active channels', dashboard.totals.activeConnectedChannels],
      ['Included channels', dashboard.totals.storedChannels],
      ['All stored channels', dashboard.totals.allStoredChannels],
      ['Stored videos', dashboard.totals.videoSnapshotRows],
      ['Video/day rows', dashboard.totals.videoDailyRows],
      ['Channel/day rows', dashboard.totals.channelDailyRows],
      ['Breakdowns', dashboard.totals.breakdownRows],
      ['Comments', dashboard.totals.commentRows],
      ['Users in sample', dashboard.totals.storedUsers],
    ];
  }, [dashboard]);

  if (loading && !dashboard) {
    return (
      <Card>
        <Header>
          <div>
            <Kicker>Owner research</Kicker>
            <Title>YouTube analytics lab</Title>
            <Sub>Loading stored channel research signals.</Sub>
          </div>
        </Header>
        <Skeleton />
      </Card>
    );
  }

  return (
    <Card>
      <Header>
        <div>
          <Kicker>Owner research</Kicker>
          <Title>YouTube analytics lab</Title>
          <Sub>
            Private dashboard for stored opt-in YouTube analytics. It uses database history only, so opening this panel does not call YouTube.
          </Sub>
        </div>
        <Button variant="secondary" size="sm" onClick={() => refresh(true, minSubscribers)} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh'}
        </Button>
      </Header>

      {dashboard && (
        <>
          <FilterBar>
            <FilterCopy>
              <FilterLabel>Filter sample by subscriber count</FilterLabel>
              <FilterHelp>
                Showing {formatCount(dashboard.filter.includedChannels)} of {formatCount(dashboard.filter.totalChannels)} stored channels.
                {dashboard.filter.excludedChannels > 0 ? ` Filtered out ${formatCount(dashboard.filter.excludedChannels)} smaller channels.` : ''}
              </FilterHelp>
            </FilterCopy>
            <FilterSelect value={minSubscribers} onChange={onMinSubscribersChange} aria-label="Minimum subscriber count">
              {SUBSCRIBER_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </FilterSelect>
          </FilterBar>

          <MetaGrid>
            {metaTiles.map(([label, value]) => (
              <MetaTile key={label}>
                <MetaValue>{formatCount(value as number)}</MetaValue>
                <MetaLabel>{label}</MetaLabel>
              </MetaTile>
            ))}
          </MetaGrid>

          <CoverageRow>
            <CoverageTile $tone="live">
              <MetaValue>{formatCount(dashboard.coverage.live)}</MetaValue>
              <MetaLabel>Live / proxy answers</MetaLabel>
            </CoverageTile>
            <CoverageTile $tone="building">
              <MetaValue>{formatCount(dashboard.coverage.building)}</MetaValue>
              <MetaLabel>Building with more history</MetaLabel>
            </CoverageTile>
            <CoverageTile $tone="collector">
              <MetaValue>{formatCount(dashboard.coverage.needsCollector)}</MetaValue>
              <MetaLabel>Needs future collector</MetaLabel>
            </CoverageTile>
          </CoverageRow>

          <Sub style={{ marginBottom: '1rem' }}>
            Last stored sync: {formatUpdated(dashboard.totals.latestSync)} · Dashboard generated {formatUpdated(dashboard.generatedAt)}
          </Sub>

          {dashboard.filter.truncatedTables.length > 0 && (
            <Notice>
              Some very large tables hit the admin read cap: {dashboard.filter.truncatedTables.join(', ')}. The current 15-channel scale should stay below this, but this notice will show if the sample ever needs deeper pagination.
            </Notice>
          )}

          <SectionList>
            {dashboard.sections.map((section, index) => (
              <Section key={section.title} open={index < 2}>
                <SectionSummary>{section.title} · {section.items.length} signals</SectionSummary>
                <ItemList>
                  {section.items.map((item) => (
                    <ItemRow key={`${section.title}-${item.label}`}>
                      <ItemLabel>{item.label}</ItemLabel>
                      <ItemAnswer>{item.answer}</ItemAnswer>
                      <Badge $status={item.status}>{item.status}</Badge>
                    </ItemRow>
                  ))}
                </ItemList>
              </Section>
            ))}
          </SectionList>
        </>
      )}

      {error && <ErrorText>{error}</ErrorText>}
    </Card>
  );
};

export default AdminYouTubeResearchDashboard;
