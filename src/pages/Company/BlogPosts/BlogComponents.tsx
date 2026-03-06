// src/pages/Company/BlogPosts/BlogComponents.tsx
// Shared components for all blog posts
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

// ─── Base layout (imported by every post) ────────────────────────────────────
export const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0 5rem;
`;

export const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

export const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 3rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

export const PostHeader = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

export const Category = styled.span<{ color?: string }>`
  background: ${({ color }) => color || 'var(--color-red4)'};
  color: white;
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1.25rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (max-width: 768px) { font-size: 1.9rem; }
`;

export const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.25rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.875rem;
  flex-wrap: wrap;

  span {
    display: flex;
    align-items: center;
    gap: 0.35rem;
  }
`;

export const Content = styled.div`
  line-height: 1.8;
  font-size: 1.05rem;

  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.75rem;
    margin: 2.5rem 0 1rem;
    font-weight: 700;
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.3rem;
    margin: 2rem 0 0.75rem;
    font-weight: 600;
  }

  p {
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    li { margin-bottom: 0.5rem; }
  }

  strong { color: ${({ theme }) => theme.colors.text.primary}; }

  blockquote {
    border-left: 4px solid ${({ theme }) => theme.colors.red4};
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export const TipBox = styled.div`
  background: ${({ theme }) => theme.colors.red1};
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin: 2rem 0;

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
  }

  p { color: ${({ theme }) => theme.colors.text.primary}; margin: 0; font-size: 0.95rem; }
`;

// ─── ToolCallout ─────────────────────────────────────────────────────────────
const ToolCalloutWrapper = styled.div`
  background: linear-gradient(135deg, rgba(185, 28, 28, 0.08), rgba(185, 28, 28, 0.03));
  border: 1px solid rgba(185, 28, 28, 0.28);
  border-radius: 16px;
  padding: 1.5rem 1.75rem;
  margin: 2.5rem 0;
  display: flex;
  align-items: center;
  gap: 1.25rem;

  @media (max-width: 600px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ToolCalloutIcon = styled.div`
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.4rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(185, 28, 28, 0.3);
`;

const ToolCalloutContent = styled.div`
  flex: 1;
  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1rem;
    margin: 0 0 0.25rem;
  }
  p {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.4;
  }
`;

const ToolCalloutBtn = styled(Link)`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(185, 28, 28, 0.4);
  }
`;

interface ToolCalloutProps {
  icon: string;
  toolName: string;
  description: string;
  href: string;
}

export const ToolCallout: React.FC<ToolCalloutProps> = ({ icon, toolName, description, href }) => (
  <ToolCalloutWrapper>
    <ToolCalloutIcon>
      <i className={`bx ${icon}`}></i>
    </ToolCalloutIcon>
    <ToolCalloutContent>
      <h4>{toolName}</h4>
      <p>{description}</p>
    </ToolCalloutContent>
    <ToolCalloutBtn to={href}>
      Try It Free <i className="bx bx-right-arrow-alt"></i>
    </ToolCalloutBtn>
  </ToolCalloutWrapper>
);

// ─── KeyTakeaway ─────────────────────────────────────────────────────────────
export const KeyTakeaway = styled.div`
  background: rgba(22, 163, 74, 0.08);
  border: 1px solid rgba(22, 163, 74, 0.3);
  border-radius: 12px;
  padding: 1.25rem 1.5rem;
  margin: 1.75rem 0;
  display: flex;
  gap: 0.75rem;

  i {
    color: #4ade80;
    font-size: 1.25rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  div {
    p {
      color: ${({ theme }) => theme.colors.text.secondary} !important;
      margin: 0 !important;
      font-size: 0.95rem;
    }
    strong { color: ${({ theme }) => theme.colors.text.primary}; }
  }
`;

// ─── StatBar ─────────────────────────────────────────────────────────────────
const StatBarWrapper = styled.div`
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StatBarItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const StatBarLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: 500;
`;

const StatBarTrack = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.colors.dark4};
  border-radius: 4px;
  overflow: hidden;
`;

const StatBarFill = styled.div<{ pct: number; color?: string }>`
  height: 100%;
  width: ${({ pct }) => pct}%;
  background: ${({ color }) => color || 'linear-gradient(90deg, #b91c1c, #ef4444)'};
  border-radius: 4px;
  transition: width 0.8s ease;
`;

interface StatBarEntry {
  label: string;
  value: string;
  pct: number;
  color?: string;
}

interface StatBarChartProps {
  title?: string;
  items: StatBarEntry[];
}

const StatBarTitle = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ theme }) => theme.colors.text.muted};
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

export const StatBarChart: React.FC<StatBarChartProps> = ({ title, items }) => (
  <div style={{ margin: '2rem 0', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '1.25rem 1.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
    {title && <StatBarTitle>{title}</StatBarTitle>}
    <StatBarWrapper>
      {items.map((item) => (
        <StatBarItem key={item.label}>
          <StatBarLabel>
            <span>{item.label}</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.value}</span>
          </StatBarLabel>
          <StatBarTrack>
            <StatBarFill pct={item.pct} color={item.color} />
          </StatBarTrack>
        </StatBarItem>
      ))}
    </StatBarWrapper>
  </div>
);

// ─── StatGrid (metric cards in a grid) ───────────────────────────────────────
export const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
`;

export const StatCard = styled.div<{ accent?: string }>`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-top: 3px solid ${({ accent }) => accent || '#b91c1c'};
  border-radius: 12px;
  padding: 1.25rem;

  .label {
    font-size: 0.78rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-bottom: 0.4rem;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 0.25rem;
  }

  .desc {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
    line-height: 1.4;
  }
`;

// ─── StepFlow ─────────────────────────────────────────────────────────────────
export const StepFlow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 2rem 0;
`;

export const StepItem = styled.div`
  display: flex;
  gap: 1.25rem;
  position: relative;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 19px;
    top: 40px;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.colors.dark5};
  }
`;

export const StepNum = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
  margin-top: 0.1rem;
  box-shadow: 0 2px 8px rgba(185, 28, 28, 0.3);
`;

export const StepContent = styled.div`
  padding-bottom: 1.75rem;
  flex: 1;

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.05rem;
    margin: 0.4rem 0 0.5rem;
    font-weight: 600;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.9rem;
    margin: 0;
    line-height: 1.6;
  }
`;

// ─── HackCard ─────────────────────────────────────────────────────────────────
export const HackGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin: 2rem 0;
`;

export const HackCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 14px;
  padding: 1.25rem 1.5rem;
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  transition: border-color 0.2s ease;

  &:hover { border-color: ${({ theme }) => theme.colors.red4}; }
`;

export const HackNumber = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.red1};
  border: 1px solid ${({ theme }) => theme.colors.red3};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.text.primary};
  flex-shrink: 0;
`;

export const HackBody = styled.div`
  flex: 1;

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1rem;
    margin: 0 0 0.35rem;
    font-weight: 600;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    font-size: 0.875rem;
    margin: 0;
    line-height: 1.5;
  }
`;

export const ImpactBadge = styled.span<{ level: 'high' | 'medium' | 'low' }>`
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  margin-top: 0.5rem;
  background: ${({ level }) =>
    level === 'high' ? 'rgba(22, 163, 74, 0.15)' :
    level === 'medium' ? 'rgba(234, 179, 8, 0.15)' :
    'rgba(107, 114, 128, 0.15)'};
  color: ${({ level }) =>
    level === 'high' ? '#4ade80' :
    level === 'medium' ? '#fbbf24' :
    '#9ca3af'};
  border: 1px solid ${({ level }) =>
    level === 'high' ? 'rgba(22, 163, 74, 0.3)' :
    level === 'medium' ? 'rgba(234, 179, 8, 0.3)' :
    'rgba(107, 114, 128, 0.3)'};
`;

// ─── Checklist ────────────────────────────────────────────────────────────────
export const Checklist = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 14px;
  padding: 1.5rem;
  margin: 2rem 0;
`;

export const ChecklistTitle = styled.div`
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;

  i { color: ${({ theme }) => theme.colors.red4}; }
`;

export const ChecklistItems = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
`;

export const ChecklistItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
  line-height: 1.5;

  i {
    color: #4ade80;
    font-size: 1rem;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }
`;

// ─── DataTable ────────────────────────────────────────────────────────────────
export const TableWrapper = styled.div`
  overflow-x: auto;
  margin: 2rem 0;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.dark5};
`;

export const DataTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;

  thead {
    background: ${({ theme }) => theme.colors.dark4};
    th {
      text-align: left;
      padding: 0.85rem 1rem;
      color: ${({ theme }) => theme.colors.text.muted};
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  tbody {
    tr {
      border-top: 1px solid ${({ theme }) => theme.colors.dark5};
      &:hover { background: rgba(255,255,255,0.02); }
    }
    td {
      padding: 0.85rem 1rem;
      color: ${({ theme }) => theme.colors.text.secondary};
      vertical-align: top;
    }
  }
`;
