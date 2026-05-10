import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/Button/Button';

interface PlatformUser {
  id: string;
  email: string;
  displayName: string | null;
  createdAt: string | null;
  lastSignInAt: string | null;
  profileUpdatedAt: string | null;
}

interface PlatformStatsPayload {
  generatedAt: string;
  monthStart: string;
  totals: {
    totalUsers: number;
    profileRows: number;
    newUsersThisMonth: number;
    activeUsersThisMonth: number;
    totalExports: number | null;
    exportsThisMonth: number | null;
    exportTrackingAvailable: boolean;
    exportTrackingTable: string | null;
    connectedYouTubeUsers: number;
    connectedYouTubeChannels: number;
    extensionConnectedUsers: number;
  };
  users: PlatformUser[];
}

const CACHE_KEY = 'youtool.admin.platformStats.v1';
const CACHE_TTL_MS = 60 * 1000;

const shimmer = keyframes`
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
`;

const Card = styled.details`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid rgba(248, 113, 113, 0.22);
  border-radius: 16px;
  padding: 1.35rem;
  overflow: hidden;
`;

const CardSummary = styled.summary`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  @media (max-width: 560px) {
    align-items: flex-start;
  }
`;

const SummaryToggle = styled.span`
  border: 1px solid rgba(248, 113, 113, 0.24);
  border-radius: 999px;
  color: #fca5a5;
  flex-shrink: 0;
  font-size: 0.7rem;
  font-weight: 800;
  padding: 0.36rem 0.7rem;
`;

const PanelBody = styled.div`
  margin-top: 1rem;
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

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  margin: 1rem 0;

  @media (max-width: 680px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 440px) {
    grid-template-columns: 1fr;
  }
`;

const StatTile = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  padding: 0.85rem;
`;

const StatValue = styled.div`
  font-size: 1.28rem;
  font-weight: 850;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const StatLabel = styled.div`
  margin-top: 0.25rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.68rem;
  line-height: 1.35;
`;

const Note = styled.p`
  margin: 0.5rem 0 1rem;
  color: #fcd34d;
  font-size: 0.74rem;
  line-height: 1.5;
`;

const EmailPanel = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  overflow: hidden;
`;

const EmailHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};

  @media (max-width: 520px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;

const EmailTitle = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.8rem;
  font-weight: 800;
`;

const EmailList = styled.div`
  max-height: 12rem;
  overflow: auto;
`;

const EmailRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.8rem;
  padding: 0.72rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.055);

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

const Email = styled.div`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.78rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmailMeta = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.68rem;
  white-space: nowrap;
`;

const RawDetails = styled.details`
  margin-top: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.16);
`;

const RawSummary = styled.summary`
  cursor: pointer;
  padding: 0.82rem 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 0.76rem;
  font-weight: 800;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }
`;

const RawPre = styled.pre`
  margin: 0;
  padding: 1rem;
  max-height: 18rem;
  overflow: auto;
  border-top: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.68rem;
  line-height: 1.45;
  white-space: pre-wrap;
`;

const ErrorText = styled.p`
  margin: 0;
  color: #fca5a5;
  font-size: 0.78rem;
`;

const Skeleton = styled.div`
  height: 10rem;
  border-radius: 14px;
  background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09), rgba(255,255,255,0.04));
  background-size: 200% 100%;
  animation: ${shimmer} 1.25s infinite;
`;

function readCache(): PlatformStatsPayload | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.savedAt || Date.now() - parsed.savedAt > CACHE_TTL_MS) return null;
    return parsed.payload || null;
  } catch {
    return null;
  }
}

function writeCache(payload: PlatformStatsPayload) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), payload }));
  } catch {
    // Best-effort owner dashboard cache only.
  }
}

function formatCount(value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Never';
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export const AdminPlatformStats: React.FC = () => {
  const [stats, setStats] = useState<PlatformStatsPayload | null>(() => readCache());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const refresh = useCallback(async (force = false) => {
    if (!force) {
      const cached = readCache();
      if (cached) {
        setStats(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Sign in again to load platform stats.');

      const response = await fetch('/api/youtube/account-dashboard?admin=platform', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const payload = await response.json();
      if (!response.ok || payload.error) {
        throw new Error(payload.message || payload.error || 'Could not load platform stats.');
      }

      setStats(payload);
      writeCache(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load platform stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refresh(false);
  }, [isOpen, refresh]);

  const emails = useMemo(() => stats?.users.map((user) => user.email).filter(Boolean) || [], [stats]);
  const rawJson = useMemo(() => stats ? JSON.stringify(stats, null, 2) : '', [stats]);

  const copyText = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1400);
    } catch {
      setCopied('');
    }
  };

  const statTiles: Array<{ label: string; value: number | null; note: string }> = stats ? [
    { label: 'Total Users', value: stats.totals.totalUsers, note: 'All Supabase auth users' },
    { label: 'New Users This Month', value: stats.totals.newUsersThisMonth, note: `Since ${formatDate(stats.monthStart)}` },
    { label: 'Active Users This Month', value: stats.totals.activeUsersThisMonth, note: 'Sign-in, extension, or analytics activity' },
    { label: 'Total Exports', value: stats.totals.totalExports, note: stats.totals.exportTrackingAvailable ? `From ${stats.totals.exportTrackingTable}` : 'Not tracked yet' },
    { label: 'Exports This Month', value: stats.totals.exportsThisMonth, note: stats.totals.exportTrackingAvailable ? `Since ${formatDate(stats.monthStart)}` : 'Not tracked yet' },
    { label: 'YouTube Channels', value: stats.totals.connectedYouTubeChannels, note: `${formatCount(stats.totals.connectedYouTubeUsers)} connected users` },
    { label: 'Extension Users', value: stats.totals.extensionConnectedUsers, note: 'Active extension sessions' },
  ] : [];

  return (
    <Card open={isOpen} onToggle={(event) => setIsOpen(event.currentTarget.open)}>
      <CardSummary>
        <div>
          <Kicker>Admin</Kicker>
          <Title>Platform stats</Title>
          <Sub>{isOpen ? 'Private owner snapshot for users, active accounts, connected channels, and copyable emails.' : 'Collapsed private owner snapshot.'}</Sub>
        </div>
        <SummaryToggle>{isOpen ? 'Collapse' : 'Open'}</SummaryToggle>
      </CardSummary>

      {isOpen && (
        <PanelBody>
          <Actions>
            {stats && (
              <Button variant="secondary" size="sm" onClick={() => copyText('json', rawJson)}>
                {copied === 'json' ? 'Copied JSON' : 'Copy JSON'}
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={() => refresh(true)} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </Actions>

          {loading && !stats && <Skeleton />}

          {stats && (
            <>
              <StatGrid>
                {statTiles.map(({ label, value, note }) => (
                  <StatTile key={label}>
                    <StatValue>{formatCount(value)}</StatValue>
                    <StatLabel>{label}</StatLabel>
                    <StatLabel>{note}</StatLabel>
                  </StatTile>
                ))}
              </StatGrid>

              {!stats.totals.exportTrackingAvailable && (
                <Note>
                  Export totals are ready to display, but this site does not currently store export events in Supabase.
                </Note>
              )}

              <EmailPanel>
                <EmailHeader>
                  <div>
                    <EmailTitle>User emails</EmailTitle>
                    <Sub>{formatCount(emails.length)} email{emails.length === 1 ? '' : 's'} available to copy.</Sub>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => copyText('emails', emails.join('\n'))} disabled={!emails.length}>
                    {copied === 'emails' ? 'Copied emails' : 'Copy emails'}
                  </Button>
                </EmailHeader>
                <EmailList>
                  {stats.users.map((user) => (
                    <EmailRow key={user.id}>
                      <div>
                        <Email>{user.email}</Email>
                        {user.displayName && <EmailMeta>{user.displayName}</EmailMeta>}
                      </div>
                      <EmailMeta>Joined {formatDate(user.createdAt)} · Last sign-in {formatDate(user.lastSignInAt)}</EmailMeta>
                    </EmailRow>
                  ))}
                </EmailList>
              </EmailPanel>

              <RawDetails>
                <RawSummary>Raw JSON →</RawSummary>
                <RawPre>{rawJson}</RawPre>
              </RawDetails>
            </>
          )}

          {error && <ErrorText>{error}</ErrorText>}
        </PanelBody>
      )}
    </Card>
  );
};

export default AdminPlatformStats;
