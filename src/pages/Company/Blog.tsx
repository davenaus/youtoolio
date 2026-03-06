// src/pages/Company/Blog.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { SEO } from '../../components/SEO/SEO';

// ─── Category colours (red/rose family) ───────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  Analytics:    '#dc2626',
  SEO:          '#b91c1c',
  Algorithm:    '#991b1b',
  Design:       '#e11d48',
  Monetization: '#ef4444',
  Strategy:     '#be123c',
  Growth:       '#f43f5e',
  Community:    '#9f1239',
  Branding:     '#fb7185',
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const blogPosts = [
  {
    id: 3,
    title: "Understanding the YouTube Algorithm in 2025: A Creator's Complete Guide",
    excerpt: "Dive deep into how YouTube's algorithm actually works and learn proven strategies to optimise your content for better reach, engagement, and sustainable growth.",
    category: 'Algorithm',
    date: 'March 3, 2026',
    readTime: '12 min',
    icon: 'bx-brain',
    slug: 'youtube-algorithm-2025',
    featured: true,
  },
  {
    id: 7,
    title: '15 Proven YouTube Growth Hacks That Actually Work in 2025',
    excerpt: 'Specific tactics top creators use to accelerate growth, improve discoverability, and build highly engaged communities fast.',
    category: 'Growth',
    date: 'February 17, 2026',
    readTime: '11 min',
    icon: 'bx-trending-up',
    slug: 'youtube-growth-hacks',
    featured: false,
  },
  {
    id: 6,
    title: 'Building a YouTube Content Strategy That Drives Long-Term Growth',
    excerpt: 'A comprehensive framework for planning content that builds loyal audiences and drives channel success without burning out.',
    category: 'Strategy',
    date: 'February 3, 2026',
    readTime: '12 min',
    icon: 'bx-target-lock',
    slug: 'youtube-content-strategy',
    featured: false,
  },
  {
    id: 17,
    title: 'How to Find Your YouTube Niche: A Data-Driven Research Framework',
    excerpt: 'Stop guessing what to make — discover how to use keyword data, competitor gaps, and outlier analysis to identify a profitable YouTube niche with real demand.',
    category: 'Strategy',
    date: 'January 20, 2026',
    readTime: '13 min',
    icon: 'bx-search-alt-2',
    slug: 'youtube-niche-research',
    featured: false,
  },
  {
    id: 16,
    title: 'YouTube Competitor Analysis: How to Study Your Competition and Win',
    excerpt: 'A systematic approach to analysing competitor channels — find their content gaps, reverse-engineer their outlier videos, and outperform them where it matters most.',
    category: 'Analytics',
    date: 'January 6, 2026',
    readTime: '11 min',
    icon: 'bx-git-compare',
    slug: 'youtube-competitor-analysis',
    featured: false,
  },
  {
    id: 15,
    title: 'How to Run a YouTube Giveaway That Grows Your Channel',
    excerpt: 'Everything you need to run a fair, effective YouTube giveaway — from entry mechanics and legal basics to picking a verifiably random winner your audience will trust.',
    category: 'Community',
    date: 'December 23, 2025',
    readTime: '9 min',
    icon: 'bx-gift',
    slug: 'youtube-giveaway-guide',
    featured: false,
  },
  {
    id: 14,
    title: '7 Underused Tactics to Grow YouTube Subscribers Faster',
    excerpt: 'Beyond "post consistently" — specific, actionable subscriber growth tactics that most creators overlook, including subscribe link optimisation, QR codes, and conversion hooks.',
    category: 'Growth',
    date: 'December 9, 2025',
    readTime: '10 min',
    icon: 'bx-user-plus',
    slug: 'youtube-subscriber-tactics',
    featured: false,
  },
  {
    id: 13,
    title: "YouTube Playlists: The Underrated Growth Strategy Most Creators Ignore",
    excerpt: "Playlists rank independently in search, extend session time, and increase subscriber retention — yet most creators treat them as an afterthought. Here's how to use them strategically.",
    category: 'Strategy',
    date: 'November 25, 2025',
    readTime: '10 min',
    icon: 'bx-list-ul',
    slug: 'youtube-playlist-strategy',
    featured: false,
  },
  {
    id: 5,
    title: 'Complete Guide to YouTube Monetization in 2025',
    excerpt: 'Every monetisation method available to creators — from the Partner Program to layered revenue streams that survive algorithm changes.',
    category: 'Monetization',
    date: 'November 11, 2025',
    readTime: '14 min',
    icon: 'bx-dollar-circle',
    slug: 'youtube-monetization-2025',
    featured: false,
  },
  {
    id: 4,
    title: 'The Complete Guide to YouTube Thumbnails That Get Clicks',
    excerpt: 'Master the art and science of thumbnails — design principles, psychology, A/B testing strategies, and the mistakes that kill CTR.',
    category: 'Design',
    date: 'October 28, 2025',
    readTime: '15 min',
    icon: 'bx-image',
    slug: 'youtube-thumbnail-guide',
    featured: false,
  },
  {
    id: 12,
    title: 'YouTube Comment Strategy: Build Community and Boost Engagement',
    excerpt: "Comments are one of YouTube's strongest engagement signals — and most creators manage them reactively. Learn how to use comments proactively to build community and accelerate growth.",
    category: 'Community',
    date: 'October 14, 2025',
    readTime: '9 min',
    icon: 'bx-chat',
    slug: 'youtube-comment-strategy',
    featured: false,
  },
  {
    id: 11,
    title: 'YouTube Channel Art Guide: Banner, Profile Picture & Visual Brand Identity',
    excerpt: 'Your banner and profile picture make an instant first impression. Learn the right sizes, design principles, and how to build a consistent brand that converts visitors into subscribers.',
    category: 'Branding',
    date: 'September 30, 2025',
    readTime: '10 min',
    icon: 'bx-palette',
    slug: 'youtube-channel-art-guide',
    featured: false,
  },
  {
    id: 1,
    title: '10 YouTube Analytics Metrics Every Creator Should Track in 2025',
    excerpt: 'From watch time to audience retention — the metrics that actually move the needle and how to read them correctly.',
    category: 'Analytics',
    date: 'September 16, 2025',
    readTime: '10 min',
    icon: 'bx-chart',
    slug: 'youtube-analytics-metrics-2025',
    featured: false,
  },
  {
    id: 2,
    title: 'How to Optimise Your YouTube Videos for Discoverability',
    excerpt: 'Master YouTube SEO: keyword research, title crafting, description optimisation, and tag strategies that compound over time.',
    category: 'SEO',
    date: 'September 2, 2025',
    readTime: '13 min',
    icon: 'bx-search-alt',
    slug: 'youtube-seo-optimization-guide',
    featured: false,
  },
];

const ALL_CATEGORIES = ['All', ...Array.from(new Set(blogPosts.map((p) => p.category)))];

// ─── Styled components ─────────────────────────────────────────────────────────
const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0 5rem;
`;

const ContentWrapper = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const BackButton = styled.button`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  color: ${({ theme }) => theme.colors.text.secondary};
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
  transition: all 0.2s ease;
  font-size: 0.9rem;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;

  @media (max-width: 768px) { font-size: 2rem; }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  max-width: 560px;
  margin: 0 auto;
  line-height: 1.6;
`;

// ─── Category filters ─────────────────────────────────────────────────────────
const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 2.5rem;
  justify-content: center;
`;

const FilterChip = styled.button<{ active: boolean; color?: string }>`
  padding: 0.45rem 1rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid ${({ active, color }) => active ? (color || '#b91c1c') : 'rgba(255,255,255,0.08)'};
  background: ${({ active, color }) => active ? (color || '#b91c1c') + '22' : 'transparent'};
  color: ${({ active, color, theme }) => active ? (color || theme.colors.red4) : theme.colors.text.muted};

  &:hover {
    border-color: ${({ color }) => color || '#b91c1c'};
    color: ${({ color }) => color || '#ef4444'};
  }
`;

// ─── Featured post ─────────────────────────────────────────────────────────────
const FeaturedCard = styled.article<{ categoryColor: string }>`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  display: grid;
  grid-template-columns: 1fr 2fr;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ categoryColor }) => categoryColor};
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  }
`;

const FeaturedVisual = styled.div<{ color: string }>`
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, ${({ color }) => color}35 100%);
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  position: relative;
  min-height: 260px;

  @media (max-width: 700px) {
    min-height: 160px;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  i {
    font-size: 5rem;
    color: ${({ color }) => color};
    opacity: 0.8;
  }
`;

const FeaturedBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.3rem 0.75rem;
  border-radius: 12px;
`;

const FeaturedBody = styled.div`
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 700px) { padding: 1.5rem; }
`;

const CategoryTag = styled.span<{ color: string }>`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: ${({ color }) => color};
  background: ${({ color }) => color}18;
  border: 1px solid ${({ color }) => color}35;
  padding: 0.3rem 0.75rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  width: fit-content;
`;

const FeaturedTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.75rem;
  line-height: 1.25;

  @media (max-width: 768px) { font-size: 1.4rem; }
`;

const PostExcerpt = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text.muted};
  margin-bottom: 1.25rem;

  span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;

const ReadMoreBtn = styled.div<{ color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: ${({ color }) => color};
  font-weight: 700;
  font-size: 0.9rem;
  transition: gap 0.2s ease;

  i { transition: transform 0.2s ease; }

  article:hover & i { transform: translateX(4px); }
`;

// ─── Regular grid ─────────────────────────────────────────────────────────────
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 560px) { grid-template-columns: 1fr; }
`;

const Card = styled.article<{ categoryColor: string }>`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-3px);
    border-color: ${({ categoryColor }) => categoryColor};
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.25);
  }
`;

const CardVisual = styled.div<{ color: string }>`
  height: 110px;
  background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, ${({ color }) => color}28 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;

  i {
    font-size: 2.75rem;
    color: ${({ color }) => color};
    opacity: 0.75;
  }
`;

const CardBody = styled.div`
  padding: 1.25rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.6rem;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const CardExcerpt = styled.p`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.85rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
  margin-bottom: 1rem;
`;

const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
`;

const ReadLink = styled.span<{ color: string }>`
  color: ${({ color }) => color};
  font-size: 0.8rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.3rem;

  i { transition: transform 0.2s ease; }
  article:hover & i { transform: translateX(3px); }
`;

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${({ theme }) => theme.colors.text.muted};

  i { font-size: 3rem; opacity: 0.3; display: block; margin-bottom: 1rem; }
`;

// ─── Component ────────────────────────────────────────────────────────────────
export const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter((p) => p.category === activeCategory);

  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);

  return (
    <Container>
      <SEO
        title="YouTube Creator Blog — Tips, Strategy & Growth Guides | YouTool.io"
        description="Free guides and strategies for YouTube creators. Learn YouTube SEO, thumbnail optimisation, channel growth tactics, monetisation tips, and algorithm insights."
        canonical="https://youtool.io/blog"
      />
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>YouTool Blog</Title>
          <Subtitle>
            Insights, tips, and strategies to help you grow your YouTube channel faster.
          </Subtitle>
        </Header>

        {/* Category filters */}
        <FilterRow>
          {ALL_CATEGORIES.map((cat) => (
            <FilterChip
              key={cat}
              active={activeCategory === cat}
              color={CATEGORY_COLORS[cat]}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </FilterChip>
          ))}
        </FilterRow>

        {filtered.length === 0 ? (
          <EmptyState>
            <i className="bx bx-file-blank"></i>
            <p>No posts in this category yet — check back soon!</p>
          </EmptyState>
        ) : (
          <>
            {/* Featured post */}
            {featured && (
              <FeaturedCard
                categoryColor={CATEGORY_COLORS[featured.category]}
                onClick={() => navigate(`/blog/${featured.slug}`)}
              >
                <FeaturedVisual color={CATEGORY_COLORS[featured.category]}>
                  <FeaturedBadge>⭐ Featured</FeaturedBadge>
                  <i className={`bx ${featured.icon}`}></i>
                </FeaturedVisual>
                <FeaturedBody>
                  <CategoryTag color={CATEGORY_COLORS[featured.category]}>
                    {featured.category}
                  </CategoryTag>
                  <FeaturedTitle>{featured.title}</FeaturedTitle>
                  <PostExcerpt>{featured.excerpt}</PostExcerpt>
                  <PostMeta>
                    <span><i className="bx bx-calendar"></i>{featured.date}</span>
                    <span><i className="bx bx-time"></i>{featured.readTime} read</span>
                  </PostMeta>
                  <ReadMoreBtn color={CATEGORY_COLORS[featured.category]}>
                    Read Full Article <i className="bx bx-right-arrow-alt"></i>
                  </ReadMoreBtn>
                </FeaturedBody>
              </FeaturedCard>
            )}

            {/* Grid for remaining posts */}
            {rest.length > 0 && (
              <Grid>
                {rest.map((post) => {
                  const color = CATEGORY_COLORS[post.category];
                  return (
                    <Card
                      key={post.id}
                      categoryColor={color}
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <CardVisual color={color}>
                        <i className={`bx ${post.icon}`}></i>
                      </CardVisual>
                      <CardBody>
                        <CategoryTag color={color}>{post.category}</CategoryTag>
                        <CardTitle>{post.title}</CardTitle>
                        <CardExcerpt>{post.excerpt}</CardExcerpt>
                        <CardFooter>
                          <PostMeta style={{ margin: 0 }}>
                            <span><i className="bx bx-time"></i>{post.readTime}</span>
                          </PostMeta>
                          <ReadLink color={color}>
                            Read <i className="bx bx-right-arrow-alt"></i>
                          </ReadLink>
                        </CardFooter>
                      </CardBody>
                    </Card>
                  );
                })}
              </Grid>
            )}
          </>
        )}
      </ContentWrapper>
    </Container>
  );
};
