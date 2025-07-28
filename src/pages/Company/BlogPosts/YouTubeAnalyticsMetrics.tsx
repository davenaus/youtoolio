// src/pages/Company/BlogPosts/YouTubeAnalyticsMetrics.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
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
  margin-bottom: 3rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }

  i {
    font-size: 1.2rem;
  }
`;

const Header = styled.div`
  margin-bottom: 3rem;
  text-align: center;
`;

const Category = styled.span`
  background: ${({ theme }) => theme.colors.red4};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  display: inline-block;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Meta = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
`;

const Content = styled.div`
  line-height: 1.8;
  font-size: 1.1rem;

  h2 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.8rem;
    margin: 2.5rem 0 1rem 0;
    font-weight: 600;
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.4rem;
    margin: 2rem 0 1rem 0;
    font-weight: 600;
  }

  p {
    margin-bottom: 1.5rem;
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
    
    li {
      margin-bottom: 0.5rem;
      color: ${({ theme }) => theme.colors.text.secondary};
    }
  }

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 600;
  }

  em {
    color: ${({ theme }) => theme.colors.red4};
    font-style: normal;
    font-weight: 500;
  }
`;

const HighlightBox = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.red4};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin: 2rem 0;

  h4 {
    color: ${({ theme }) => theme.colors.red4};
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
`;

export const YouTubeAnalyticsMetrics: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/blog')}>
          <i className="bx bx-arrow-back"></i>
          Back to Blog
        </BackButton>

        <Header>
          <Category>Analytics</Category>
          <Title>10 YouTube Analytics Metrics Every Creator Should Track in 2025</Title>
          <Meta>
            <span>
              <i className="bx bx-calendar"></i>
              January 15, 2025
            </span>
            <span>•</span>
            <span>
              <i className="bx bx-time"></i>
              8 min read
            </span>
          </Meta>
        </Header>

        <Content>
          <p>
            As we enter 2025, YouTube's algorithm continues to evolve, making it more crucial than ever for creators to understand and track the right metrics. While it's tempting to focus solely on subscriber count and total views, the most successful YouTubers know that deeper analytics hold the key to sustainable growth.
          </p>

          <p>
            In this comprehensive guide, we'll explore the 10 most important YouTube analytics metrics that every creator should monitor in 2025. These metrics will help you understand your audience, optimize your content strategy, and make data-driven decisions that accelerate your channel's growth.
          </p>

          <h2>1. Watch Time (Total Watch Hours)</h2>
          <p>
            <strong>Watch time</strong> remains the most critical metric for YouTube success. It measures the total amount of time viewers spend watching your videos, and it's the primary factor YouTube's algorithm uses to determine which videos to promote.
          </p>

          <HighlightBox>
            <h4>Why it matters:</h4>
            <p>YouTube's goal is to keep viewers on the platform as long as possible. Videos with higher watch time are seen as more valuable and are more likely to be recommended to other users.</p>
          </HighlightBox>

          <p>
            <em>Pro tip:</em> Focus on creating longer-form content that maintains viewer interest throughout. Use YouTool's Video Analyzer to identify which parts of your videos have the highest retention rates.
          </p>

          <h2>2. Average View Duration</h2>
          <p>
            While total watch time shows overall performance, <strong>average view duration</strong> reveals how engaging your content is on a per-video basis. This metric shows how long viewers typically watch before clicking away.
          </p>

          <ul>
            <li>Good: 40-60% of total video length</li>
            <li>Excellent: 60%+ of total video length</li>
            <li>Needs improvement: Less than 30% of total video length</li>
          </ul>

          <h2>3. Audience Retention Rate</h2>
          <p>
            The audience retention graph shows you exactly when viewers drop off during your videos. This invaluable data helps you identify what content keeps viewers engaged and what causes them to leave.
          </p>

          <h3>Key retention points to analyze:</h3>
          <ul>
            <li><strong>Introduction (0-15 seconds):</strong> Critical hook period</li>
            <li><strong>Middle segments:</strong> Content delivery effectiveness</li>
            <li><strong>Ending (last 30 seconds):</strong> Call-to-action performance</li>
          </ul>

          <h2>4. Click-Through Rate (CTR)</h2>
          <p>
            Your <strong>CTR</strong> measures how often viewers click on your video after seeing the thumbnail and title. A higher CTR indicates that your packaging (thumbnail + title) is compelling and relevant to your target audience.
          </p>

          <HighlightBox>
            <h4>CTR Benchmarks for 2025:</h4>
            <ul>
              <li>2-4%: Average for most channels</li>
              <li>4-6%: Good performance</li>
              <li>6%+: Excellent performance</li>
            </ul>
          </HighlightBox>

          <h2>5. Subscriber Growth Rate</h2>
          <p>
            While total subscribers matter, <strong>subscriber growth rate</strong> gives you a better picture of your channel's momentum. Track both net subscriber gain and the rate of growth over time.
          </p>

          <h2>6. Revenue Metrics (RPM & CPM)</h2>
          <p>
            For monetized channels, understanding your <strong>Revenue Per Mille (RPM)</strong> and <strong>Cost Per Mille (CPM)</strong> is crucial for optimizing your income strategy.
          </p>

          <ul>
            <li><strong>RPM:</strong> Your actual earnings per 1,000 views</li>
            <li><strong>CPM:</strong> What advertisers pay per 1,000 ad impressions</li>
          </ul>

          <h2>7. Traffic Sources</h2>
          <p>
            Understanding where your viewers come from helps you optimize your promotion strategy. Key traffic sources include:
          </p>

          <ul>
            <li>YouTube search</li>
            <li>Suggested videos</li>
            <li>Browse features</li>
            <li>External sources</li>
            <li>Direct traffic</li>
          </ul>

          <h2>8. Engagement Rate</h2>
          <p>
            <strong>Engagement rate</strong> combines likes, comments, shares, and other interactions relative to your view count. High engagement signals to YouTube that your content resonates with viewers.
          </p>

          <h2>9. Top-Performing Content</h2>
          <p>
            Regularly analyze your best-performing videos to identify patterns in topics, formats, and presentation styles that your audience prefers.
          </p>

          <h2>10. Audience Demographics</h2>
          <p>
            Understanding your audience's age, gender, geography, and viewing habits helps you create more targeted content and optimize your upload schedule.
          </p>

          <HighlightBox>
            <h4>Take Action Today:</h4>
            <p>Use YouTool's comprehensive analytics suite to track all these metrics in one dashboard. Our Channel Analyzer provides deep insights into your performance and actionable recommendations for growth.</p>
          </HighlightBox>

          <h2>Conclusion</h2>
          <p>
            Success on YouTube in 2025 requires more than just creating good content – it demands a data-driven approach to understanding your audience and optimizing your strategy. By tracking these 10 essential metrics, you'll have the insights needed to make informed decisions that drive real growth.
          </p>

          <p>
            Remember, these metrics work together to paint a complete picture of your channel's performance. Focus on improving one or two metrics at a time, and you'll see compound improvements across your entire channel.
          </p>
        </Content>
      </ContentWrapper>
    </Container>
  );
};
