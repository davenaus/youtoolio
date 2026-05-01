import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const Page = styled.div`
  min-height: 100vh;
  padding: 3rem 2rem 6rem;
  background: linear-gradient(135deg,
    ${({ theme }) => theme.colors.dark1} 0%,
    ${({ theme }) => theme.colors.dark2} 50%,
    ${({ theme }) => theme.colors.dark3} 100%);
`;

const Inner = styled.div`
  max-width: 760px;
  margin: 0 auto;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: ${({ theme }) => theme.colors.text.muted};
  text-decoration: none;
  margin-bottom: 2.5rem;
  transition: color 0.2s;
  &:hover { color: ${({ theme }) => theme.colors.text.primary}; }
`;

const PageHeader = styled.div`
  margin-bottom: 3rem;
`;

const PageTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem;
`;

const PageSub = styled.p`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 0;
`;

const SectionLabel = styled.div`
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ theme }) => theme.colors.text.muted};
  margin: 2.5rem 0 1.25rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
`;

const Entry = styled.div`
  display: flex;
  gap: 1.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};
  &:last-child { border-bottom: none; }

  @media (max-width: 560px) { flex-direction: column; gap: 0.75rem; }
`;

const EntryMeta = styled.div`
  flex-shrink: 0;
  width: 110px;
  padding-top: 2px;
`;

const EntryDate = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.muted};
  white-space: nowrap;
`;

const EntryVersion = styled.div`
  font-size: 0.72rem;
  color: ${({ theme }) => theme.colors.text.muted};
  opacity: 0.6;
  margin-top: 0.2rem;
  font-family: monospace;
`;

const EntryBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const EntryTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0 0 0.5rem;
`;

const EntryItems = styled.ul`
  margin: 0;
  padding: 0 0 0 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
`;

const EntryItem = styled.li`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

const TagRow = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
`;

const Tag = styled.span<{ $color?: 'green' | 'blue' | 'purple' | 'default' }>`
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  ${({ $color }) => {
    switch ($color) {
      case 'green':  return 'background: rgba(74,222,128,0.1); color: #4ade80; border: 1px solid rgba(74,222,128,0.2);';
      case 'blue':   return 'background: rgba(96,165,250,0.1); color: #60a5fa; border: 1px solid rgba(96,165,250,0.2);';
      case 'purple': return 'background: rgba(192,132,252,0.1); color: #c084fc; border: 1px solid rgba(192,132,252,0.2);';
      default:       return 'background: rgba(255,255,255,0.06); color: #9ca3af; border: 1px solid rgba(255,255,255,0.1);';
    }
  }}
`;

export const Changelog: React.FC = () => {
  return (
    <Page>
      <Inner>
        <BackLink to="/"><i className="bx bx-arrow-back" /> Back to home</BackLink>

        <PageHeader>
          <PageTitle>Changelog</PageTitle>
          <PageSub>Updates to the YouTool website and Chrome extension.</PageSub>
        </PageHeader>

        {/* ── Website ────────────────────────────────────────────── */}
        <SectionLabel>Website — youtool.io</SectionLabel>

        <Entry>
          <EntryMeta>
            <EntryDate>Apr 2025</EntryDate>
          </EntryMeta>
          <EntryBody>
            <EntryTitle>YouTube account connection &amp; channel analytics</EntryTitle>
            <EntryItems>
              <EntryItem>Connect your YouTube channel directly from your account page via Google OAuth</EntryItem>
              <EntryItem>Disconnect at any time from the same page</EntryItem>
              <EntryItem>Connected channel details (name, thumbnail) displayed on your account</EntryItem>
            </EntryItems>
            <TagRow>
              <Tag $color="green">New</Tag>
              <Tag $color="blue">Account</Tag>
            </TagRow>
          </EntryBody>
        </Entry>

        <Entry>
          <EntryMeta>
            <EntryDate>Apr 2025</EntryDate>
          </EntryMeta>
          <EntryBody>
            <EntryTitle>Account page redesign</EntryTitle>
            <EntryItems>
              <EntryItem>New account page showing extension connection status and YouTube channel status</EntryItem>
              <EntryItem>Extension connection instructions shown only when the extension isn't linked</EntryItem>
              <EntryItem>Last-used date shown for connected extension sessions</EntryItem>
            </EntryItems>
            <TagRow>
              <Tag $color="blue">Account</Tag>
            </TagRow>
          </EntryBody>
        </Entry>

        <Entry>
          <EntryMeta>
            <EntryDate>Mar 2025</EntryDate>
          </EntryMeta>
          <EntryBody>
            <EntryTitle>Tools expansion</EntryTitle>
            <EntryItems>
              <EntryItem>Added Banner Downloader and Profile Picture Downloader</EntryItem>
              <EntryItem>Added Moderation Checker and Channel ID Finder</EntryItem>
              <EntryItem>Added YouTool Playbooks — guided strategy resources for creators</EntryItem>
              <EntryItem>Keyword Analyzer improvements and deep-link support</EntryItem>
            </EntryItems>
            <TagRow>
              <Tag $color="green">New</Tag>
              <Tag>Tools</Tag>
            </TagRow>
          </EntryBody>
        </Entry>

        <Entry>
          <EntryMeta>
            <EntryDate>Feb 2025</EntryDate>
          </EntryMeta>
          <EntryBody>
            <EntryTitle>Performance &amp; infrastructure</EntryTitle>
            <EntryItems>
              <EntryItem>All tool pages lazy-loaded for significantly faster initial page load</EntryItem>
              <EntryItem>Serverless API layer migrated to Vercel with Node.js 22</EntryItem>
              <EntryItem>Google sign-in and extension auth flow stabilized</EntryItem>
            </EntryItems>
            <TagRow>
              <Tag $color="purple">Infra</Tag>
            </TagRow>
          </EntryBody>
        </Entry>

        {/* ── Chrome Extension ───────────────────────────────────── */}
        <SectionLabel>Chrome Extension</SectionLabel>

        <Entry>
          <EntryMeta>
            <EntryDate>Apr 2025</EntryDate>
            <EntryVersion>v1.0.0</EntryVersion>
          </EntryMeta>
          <EntryBody>
            <EntryTitle>Channel analytics in the popup</EntryTitle>
            <EntryItems>
              <EntryItem>7-day subscriber gain and view count shown in a pill next to the account icon</EntryItem>
              <EntryItem>Channel profile picture replaces the default account icon when YouTube is connected</EntryItem>
              <EntryItem>Stats bar only appears when a YouTube channel is connected</EntryItem>
              <EntryItem>Account menu now includes an Account link alongside Sign out</EntryItem>
            </EntryItems>
            <TagRow>
              <Tag $color="green">New</Tag>
              <Tag $color="blue">Analytics</Tag>
            </TagRow>
          </EntryBody>
        </Entry>

        <Entry>
          <EntryMeta>
            <EntryDate>Mar 2025</EntryDate>
            <EntryVersion>v0.1.0</EntryVersion>
          </EntryMeta>
          <EntryBody>
            <EntryTitle>Initial release</EntryTitle>
            <EntryItems>
              <EntryItem>In-player screenshot capture with one click</EntryItem>
              <EntryItem>Copy Transcript button on watch pages</EntryItem>
              <EntryItem>Show estimated dislike counts via Return YouTube Dislike</EntryItem>
              <EntryItem>Monetization checker on videos, Shorts, and channels</EntryItem>
              <EntryItem>YouTube Studio enhancements: more analytics timelines, additional content page columns, real-time engaged view swapper</EntryItem>
              <EntryItem>Streamer Mode — redact Studio stats, revenue, and channel identity during screen shares</EntryItem>
              <EntryItem>Playback speed controls including forced speed and unlock-any-speed buttons</EntryItem>
              <EntryItem>Deep Dark theme engine with presets and full custom color support</EntryItem>
              <EntryItem>Watch page tweaks: theater mode, loop button, hide Shorts/ads/chat/end cards, URL cleaner</EntryItem>
              <EntryItem>Sign in with YouTool.io account to sync settings and unlock creator features</EntryItem>
            </EntryItems>
            <TagRow>
              <Tag $color="green">Launch</Tag>
            </TagRow>
          </EntryBody>
        </Entry>

      </Inner>
    </Page>
  );
};

export default Changelog;
