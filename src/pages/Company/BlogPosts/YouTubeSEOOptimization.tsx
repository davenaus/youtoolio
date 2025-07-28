// src/pages/Company/BlogPosts/YouTubeSEOOptimization.tsx
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

const CodeBlock = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  margin: 1rem 0;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.success};
`;

export const YouTubeSEOOptimization: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/blog')}>
          <i className="bx bx-arrow-back"></i>
          Back to Blog
        </BackButton>

        <Header>
          <Category>SEO</Category>
          <Title>How to Optimize Your YouTube Videos for Maximum Discoverability</Title>
          <Meta>
            <span>
              <i className="bx bx-calendar"></i>
              January 8, 2025
            </span>
            <span>•</span>
            <span>
              <i className="bx bx-time"></i>
              12 min read
            </span>
          </Meta>
        </Header>

        <Content>
          <p>
            YouTube is the world's second-largest search engine, processing over 3 billion searches every month. Yet many creators still struggle to get their content discovered. The difference between a video that gets 100 views and one that gets 100,000 views often comes down to one thing: <strong>optimization</strong>.
          </p>

          <p>
            In this comprehensive guide, we'll walk you through the exact strategies and techniques successful YouTubers use to optimize their videos for maximum discoverability in 2025.
          </p>

          <h2>Understanding YouTube SEO in 2025</h2>
          <p>
            YouTube's algorithm has evolved significantly, but the core principle remains the same: the platform wants to show users content they'll watch and engage with. Your job is to make it crystal clear that your video is exactly what searchers are looking for.
          </p>

          <HighlightBox>
            <h4>The YouTube SEO Trinity:</h4>
            <ol>
              <li><strong>Relevance:</strong> How well your content matches search intent</li>
              <li><strong>Authority:</strong> Your channel's credibility in your niche</li>
              <li><strong>Performance:</strong> How well your video engages viewers</li>
            </ol>
          </HighlightBox>

          <h2>Step 1: Master Keyword Research</h2>
          <p>
            Everything starts with understanding what your audience is searching for. Effective keyword research is the foundation of YouTube SEO success.
          </p>

          <h3>Tools for YouTube Keyword Research:</h3>
          <ul>
            <li><strong>YouTube Search Suggest:</strong> Start typing your topic and see what autocompletes</li>
            <li><strong>YouTool's Keyword Analyzer:</strong> Get search volume and competition data</li>
            <li><strong>Google Trends:</strong> Understand seasonal trends and topic popularity</li>
            <li><strong>Competitor Analysis:</strong> See what keywords successful channels target</li>
          </ul>

          <h3>Keyword Research Process:</h3>
          <ol>
            <li>Start with broad topic ideas related to your niche</li>
            <li>Use YouTube's search suggestions to find long-tail keywords</li>
            <li>Analyze search volume vs. competition</li>
            <li>Identify keyword gaps your competitors haven't filled</li>
            <li>Prioritize keywords with medium volume, low competition</li>
          </ol>

          <h2>Step 2: Craft Compelling Titles</h2>
          <p>
            Your title is the first thing both YouTube's algorithm and potential viewers see. A great title should be both search-friendly and click-worthy.
          </p>

          <h3>Title Optimization Best Practices:</h3>
          <ul>
            <li>Include your primary keyword near the beginning</li>
            <li>Keep it under 60 characters to avoid truncation</li>
            <li>Use emotional triggers and power words</li>
            <li>Include numbers when possible (e.g., "10 Tips," "2025 Guide")</li>
            <li>Create curiosity gaps that make people want to click</li>
          </ul>

          <HighlightBox>
            <h4>Title Formula That Works:</h4>
            <CodeBlock>
              [Number] + [Powerful Adjective] + [Target Keyword] + [Benefit/Outcome] + [Year/Urgency]
            </CodeBlock>
            <p>Example: "7 Proven YouTube SEO Strategies That Doubled My Views in 2025"</p>
          </HighlightBox>

          <h2>Step 3: Write SEO-Optimized Descriptions</h2>
          <p>
            Your video description is prime real estate for SEO. YouTube reads the first 125 characters for search results, so make them count.
          </p>

          <h3>Description Structure:</h3>
          <ol>
            <li><strong>First 125 characters:</strong> Hook + primary keyword</li>
            <li><strong>Main description:</strong> Detailed explanation with keywords</li>
            <li><strong>Timestamps:</strong> Improve user experience and watch time</li>
            <li><strong>Links and CTAs:</strong> Drive traffic to your other content</li>
            <li><strong>Tags section:</strong> Include related keywords naturally</li>
          </ol>

          <h2>Step 4: Optimize Your Tags Strategically</h2>
          <p>
            While tags are less important than they once were, they still help YouTube understand your content and can improve discoverability for long-tail searches.
          </p>

          <h3>Tag Strategy:</h3>
          <ul>
            <li>Use your exact target keyword as the first tag</li>
            <li>Include variations and synonyms of your main keyword</li>
            <li>Add broader category tags (e.g., "digital marketing," "business tips")</li>
            <li>Include channel-specific tags</li>
            <li>Use 10-15 tags maximum for optimal performance</li>
          </ul>

          <h2>Step 5: Create Irresistible Thumbnails</h2>
          <p>
            Thumbnails significantly impact your click-through rate, which is a crucial ranking factor. Your thumbnail should work in harmony with your title to maximize clicks.
          </p>

          <h3>Thumbnail Design Principles:</h3>
          <ul>
            <li><strong>High contrast:</strong> Make it stand out in search results</li>
            <li><strong>Clear focal point:</strong> One main element that draws attention</li>
            <li><strong>Readable text:</strong> Large fonts that work on mobile devices</li>
            <li><strong>Faces and emotions:</strong> Human faces increase engagement</li>
            <li><strong>Brand consistency:</strong> Develop a recognizable style</li>
          </ul>

          <HighlightBox>
            <h4>Pro Tip:</h4>
            <p>Use YouTool's Thumbnail Tester to compare different thumbnail options and see which one is likely to perform better before you publish.</p>
          </HighlightBox>

          <h2>Step 6: Optimize for Watch Time and Engagement</h2>
          <p>
            YouTube prioritizes videos that keep viewers watching. Optimizing for engagement signals is crucial for long-term SEO success.
          </p>

          <h3>Engagement Optimization Tactics:</h3>
          <ul>
            <li><strong>Hook viewers in the first 15 seconds:</strong> Promise value immediately</li>
            <li><strong>Use pattern interrupts:</strong> Change visuals/audio to maintain attention</li>
            <li><strong>Include clear calls-to-action:</strong> Ask for likes, comments, and subscriptions</li>
            <li><strong>Encourage comments:</strong> Ask questions and respond to viewers</li>
            <li><strong>Create playlists:</strong> Group related videos to increase session time</li>
          </ul>

          <h2>Step 7: Leverage YouTube Features</h2>
          <p>
            YouTube offers several features that can boost your video's discoverability when used correctly.
          </p>

          <h3>Key Features to Utilize:</h3>
          <ul>
            <li><strong>End screens:</strong> Promote related videos and increase session time</li>
            <li><strong>Cards:</strong> Add interactive elements during the video</li>
            <li><strong>Chapters:</strong> Help viewers navigate your content</li>
            <li><strong>Community tab:</strong> Engage with subscribers between uploads</li>
            <li><strong>Shorts:</strong> Tap into YouTube's fastest-growing format</li>
          </ul>

          <h2>Step 8: Timing and Consistency</h2>
          <p>
            When and how often you publish can impact your SEO performance. YouTube rewards channels that publish consistently.
          </p>

          <h3>Publishing Strategy:</h3>
          <ul>
            <li>Analyze your audience's online behavior in YouTube Analytics</li>
            <li>Test different publishing times and days</li>
            <li>Maintain a consistent upload schedule</li>
            <li>Consider your audience's time zones</li>
            <li>Post when your audience is most active</li>
          </ul>

          <h2>Step 9: Monitor and Optimize Performance</h2>
          <p>
            SEO is an ongoing process. Regular monitoring and optimization based on performance data is essential for long-term success.
          </p>

          <h3>Key Metrics to Track:</h3>
          <ul>
            <li>Click-through rate (CTR)</li>
            <li>Average view duration</li>
            <li>Audience retention rate</li>
            <li>Search ranking positions</li>
            <li>Traffic source breakdown</li>
          </ul>

          <HighlightBox>
            <h4>Optimization Cycle:</h4>
            <ol>
              <li>Publish optimized content</li>
              <li>Monitor performance for 7-14 days</li>
              <li>Identify areas for improvement</li>
              <li>Test small changes (titles, thumbnails, descriptions)</li>
              <li>Apply learnings to future videos</li>
            </ol>
          </HighlightBox>

          <h2>Advanced SEO Strategies for 2025</h2>
          <p>
            As YouTube's algorithm becomes more sophisticated, these advanced strategies can give you a competitive edge:
          </p>

          <h3>1. Semantic Keyword Optimization</h3>
          <p>
            YouTube now understands context and related concepts. Include semantically related keywords throughout your content.
          </p>

          <h3>2. Cross-Platform Promotion</h3>
          <p>
            Drive traffic from other social platforms to boost your video's initial performance, which signals quality to YouTube.
          </p>

          <h3>3. Collaboration SEO</h3>
          <p>
            Partner with other creators in your niche to tap into their audience and improve your channel's authority.
          </p>

          <h2>Common SEO Mistakes to Avoid</h2>
          <ul>
            <li><strong>Keyword stuffing:</strong> Using too many keywords unnaturally</li>
            <li><strong>Clickbait without delivery:</strong> Titles that don't match content</li>
            <li><strong>Ignoring mobile optimization:</strong> Not checking how thumbnails look on phones</li>
            <li><strong>Neglecting older videos:</strong> Not updating titles and descriptions of existing content</li>
            <li><strong>Focusing only on views:</strong> Ignoring engagement and watch time metrics</li>
          </ul>

          <h2>Conclusion</h2>
          <p>
            YouTube SEO in 2025 is about creating genuinely valuable content that's properly optimized for both the algorithm and your audience. By following these strategies and consistently monitoring your performance, you'll see significant improvements in your video discoverability and channel growth.
          </p>

          <p>
            Remember, SEO is a marathon, not a sprint. Focus on creating the best possible content for your audience, optimize it properly, and be patient as your efforts compound over time.
          </p>

          <HighlightBox>
            <h4>Ready to Optimize Your Channel?</h4>
            <p>Use YouTool's comprehensive SEO suite to analyze your current performance, research profitable keywords, and optimize your content for maximum discoverability. Start your free analysis today!</p>
          </HighlightBox>
        </Content>
      </ContentWrapper>
    </Container>
  );
};
