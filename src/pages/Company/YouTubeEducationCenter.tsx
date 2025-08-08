// src/pages/Company/YouTubeEducationCenter.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  padding: 2rem 0;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
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
  margin-bottom: 2rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text.muted};
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const TabNav = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: ${({ active, theme }) => active ? theme.colors.red4 : theme.colors.dark3};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.red4 : theme.colors.dark5};
  padding: 1rem 2rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.red5 : theme.colors.dark4};
    color: ${({ active, theme }) => active ? 'white' : theme.colors.text.primary};
  }
`;

const ContentSection = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 3rem;
  margin-bottom: 3rem;

  h2 {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 2rem;
    margin-bottom: 2rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.5rem;
    margin: 2rem 0 1rem 0;
    font-weight: 600;
  }

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.2rem;
    margin: 1.5rem 0 0.75rem 0;
    font-weight: 600;
  }

  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.7;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  ul, ol {
    margin-bottom: 1.5rem;
    padding-left: 2rem;
    color: ${({ theme }) => theme.colors.text.secondary};

    li {
      margin-bottom: 0.75rem;
      line-height: 1.6;
    }
  }

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const DefinitionBox = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin: 1.5rem 0;

  .term {
    color: ${({ theme }) => theme.colors.red4};
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  .definition {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.6;
    margin: 0;
  }
`;

const ToolCallout = styled.div`
  background: ${({ theme }) => theme.colors.red1};
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  margin: 2rem 0;

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text.primary};
    margin: 0;
  }
`;

export const YouTubeEducationCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basics');

  const tabs = [
    { id: 'basics', name: 'YouTube Basics', icon: 'bx-play-circle' },
    { id: 'analytics', name: 'Analytics Guide', icon: 'bx-chart' },
    { id: 'optimization', name: 'Optimization', icon: 'bx-trending-up' },
    { id: 'monetization', name: 'Monetization', icon: 'bx-dollar-circle' },
    { id: 'advanced', name: 'Advanced Strategies', icon: 'bx-brain' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'basics':
        return (
          <ContentSection>
            <h2><i className="bx bx-play-circle"></i>YouTube Platform Fundamentals</h2>
            
            <p>
              Understanding YouTube as a platform is essential for creator success. YouTube is not just a video 
              hosting service—it's a sophisticated recommendation engine, search platform, social network, and 
              entertainment destination all rolled into one. Success requires understanding how these different 
              aspects work together to serve both creators and viewers.
            </p>

            <h3>How YouTube's Ecosystem Works</h3>
            <p>
              YouTube operates as a three-sided marketplace connecting viewers seeking content, creators providing 
              content, and advertisers seeking audience attention. The platform's business model depends on keeping 
              viewers engaged as long as possible, which directly influences how the algorithm promotes content.
            </p>

            <p>
              The platform generates revenue primarily through advertising, with creators receiving a portion of 
              ad revenue through the YouTube Partner Program. This alignment means that content that keeps viewers 
              engaged and on the platform longer is naturally favored by YouTube's systems.
            </p>

            <h3>Understanding YouTube's Content Categories</h3>
            <p>
              YouTube recognizes different content categories that affect how videos are promoted, monetized, and 
              discovered. Understanding these categories helps creators position their content appropriately:
            </p>

            <ul>
              <li><strong>Educational Content:</strong> Tutorials, how-to guides, explanatory content that teaches specific skills or knowledge</li>
              <li><strong>Entertainment Content:</strong> Comedy, gaming, music, vlogs, and content designed primarily for entertainment value</li>
              <li><strong>News and Information:</strong> Current events, analysis, and timely information content</li>
              <li><strong>Lifestyle Content:</strong> Fashion, beauty, fitness, cooking, and personal lifestyle topics</li>
              <li><strong>Technology and Reviews:</strong> Product reviews, tech explanations, and consumer guidance content</li>
              <li><strong>Business and Professional:</strong> Entrepreneurship, career advice, industry insights, and professional development</li>
            </ul>

            <DefinitionBox>
              <div className="term">YouTube Creator Studio</div>
              <div className="definition">
                The comprehensive dashboard where creators manage their channels, access analytics, 
                customize settings, and monitor performance. Creator Studio provides essential tools 
                for channel optimization and business management.
              </div>
            </DefinitionBox>

            <h3>Creator Rights and Responsibilities</h3>
            <p>
              YouTube creators have specific rights and responsibilities outlined in the platform's Terms of Service 
              and Creator Responsibility guidelines. Understanding these requirements helps creators build sustainable 
              channels while avoiding policy violations that could harm their growth or monetization eligibility.
            </p>

            <h4>Creator Rights Include:</h4>
            <ul>
              <li>Ownership of original content uploaded to the platform</li>
              <li>Revenue sharing through the YouTube Partner Program</li>
              <li>Access to analytics and audience insights</li>
              <li>Fair treatment under YouTube's policies and appeal processes</li>
              <li>Protection from copyright infringement by others</li>
            </ul>

            <h4>Creator Responsibilities Include:</h4>
            <ul>
              <li>Following YouTube's Community Guidelines and Terms of Service</li>
              <li>Respecting copyright and intellectual property laws</li>
              <li>Providing accurate information and avoiding misleading content</li>
              <li>Maintaining appropriate content for chosen audience categories</li>
              <li>Disclosing sponsorships and paid promotions according to legal requirements</li>
            </ul>

            <h3>Channel Setup Best Practices</h3>
            <p>
              Proper channel setup provides the foundation for long-term success. This includes choosing appropriate 
              channel names, creating compelling channel art, writing effective channel descriptions, and organizing 
              content through playlists and channel sections.
            </p>

            <p>
              Your channel serves as your brand's home base on YouTube. Invest time in creating professional, 
              consistent branding that clearly communicates your value proposition and helps viewers understand 
              what to expect from your content.
            </p>

            <ToolCallout>
              <h4><i className="bx bx-chart"></i> Get Started with Analytics</h4>
              <p>
                Use YouTool's Channel Analyzer to get comprehensive insights into any YouTube channel's 
                performance, growth patterns, and optimization opportunities.
              </p>
            </ToolCallout>
          </ContentSection>
        );

      case 'analytics':
        return (
          <ContentSection>
            <h2><i className="bx bx-chart"></i>Complete YouTube Analytics Guide</h2>
            
            <p>
              YouTube analytics provide creators with detailed insights into their content performance, audience 
              behavior, and channel growth patterns. Understanding and effectively using these analytics is crucial 
              for making data-driven decisions that improve content quality and channel success.
            </p>

            <h3>Essential Metrics Every Creator Should Track</h3>
            
            <h4>Watch Time and Average View Duration</h4>
            <p>
              Watch time represents the total minutes viewers spend watching your content and is YouTube's most 
              important ranking factor. Average view duration shows how engaging your content is by measuring 
              what percentage of each video viewers typically watch.
            </p>

            <p>
              Industry benchmarks vary by content type, but generally, maintaining 50-60% average view duration 
              indicates highly engaging content. Educational content often sees higher retention rates than 
              entertainment content due to viewer intent and engagement patterns.
            </p>

            <DefinitionBox>
              <div className="term">Audience Retention Graph</div>
              <div className="definition">
                A visual representation showing exactly when viewers typically stop watching your videos. 
                This graph helps identify content sections that lose viewer interest and opportunities 
                for improvement in future videos.
              </div>
            </DefinitionBox>

            <h4>Click-Through Rate (CTR) Analysis</h4>
            <p>
              Click-through rate measures what percentage of people click on your video when they see your 
              thumbnail and title. CTR varies significantly based on content type, audience, and where your 
              video appears (search results vs. suggested videos vs. home feed).
            </p>

            <p>
              Typical CTR ranges from 2-10%, with newer channels often seeing lower rates due to less 
              algorithmic promotion. Focus on improving CTR through better thumbnails and titles rather 
              than worrying about absolute percentages compared to established creators.
            </p>

            <h4>Subscriber Growth and Retention</h4>
            <p>
              Monitor not just subscriber count but subscriber growth rate and retention patterns. Healthy 
              channels maintain consistent growth rates with minimal subscriber loss. Sudden spikes followed 
              by significant drops may indicate content that attracts viewers but doesn't deliver on promises.
            </p>

            <h3>Traffic Source Analysis</h3>
            <p>
              Understanding where your views come from helps optimize your content strategy for different 
              discovery methods. YouTube provides detailed traffic source data that reveals how viewers 
              find your content:
            </p>

            <ul>
              <li><strong>YouTube Search:</strong> Viewers finding your content through search queries</li>
              <li><strong>Browse Features:</strong> Home feed, trending, and subscription feed traffic</li>
              <li><strong>Suggested Videos:</strong> Recommendations after watching other content</li>
              <li><strong>External Sources:</strong> Social media, websites, and direct links</li>
              <li><strong>Playlists:</strong> Views from playlist consumption</li>
              <li><strong>Channel Pages:</strong> Views from people browsing your channel directly</li>
            </ul>

            <h3>Audience Demographics and Behavior</h3>
            <p>
              YouTube provides detailed demographic information about your audience, including age, gender, 
              geographic location, and device usage patterns. This data helps tailor content to your actual 
              audience rather than assumed demographics.
            </p>

            <p>
              Behavioral data shows when your audience is most active, what other content they watch, and 
              how they interact with your videos. Use this information to optimize upload timing, content 
              topics, and collaboration opportunities with creators who share audience overlap.
            </p>

            <h3>Revenue Analytics and Monetization Tracking</h3>
            <p>
              For monetized channels, YouTube provides detailed revenue analytics including earnings by 
              video, traffic source, and geographic region. Understanding revenue patterns helps optimize 
              content strategy for both audience satisfaction and financial sustainability.
            </p>

            <p>
              Track revenue per view, revenue per subscriber, and monetization efficiency across different 
              content types. This data reveals which content provides the best return on creation investment 
              and helps guide future content planning decisions.
            </p>

            <ToolCallout>
              <h4><i className="bx bx-chart-line"></i> Advanced Analytics</h4>
              <p>
                Use YouTool's Video Analyzer to get deeper insights into individual video performance, 
                including competitor comparisons and optimization recommendations based on data analysis.
              </p>
            </ToolCallout>
          </ContentSection>
        );

      case 'optimization':
        return (
          <ContentSection>
            <h2><i className="bx bx-trending-up"></i>YouTube Optimization Strategies</h2>
            
            <p>
              YouTube optimization involves systematically improving every element of your channel and content 
              to maximize discovery, engagement, and growth. Effective optimization requires understanding 
              both YouTube's technical requirements and audience psychology.
            </p>

            <h3>Search Engine Optimization for YouTube</h3>
            <p>
              YouTube SEO involves optimizing your content to rank well both within YouTube's search system 
              and in Google search results. YouTube is the world's second-largest search engine, and many 
              YouTube videos also appear prominently in Google search results.
            </p>

            <h4>Keyword Research and Implementation</h4>
            <p>
              Effective keyword research identifies terms your target audience actually searches for while 
              assessing competition levels and search volume. Focus on keywords that balance search volume 
              with realistic ranking possibilities for your channel's current authority level.
            </p>

            <ul>
              <li><strong>Primary Keywords:</strong> Main terms that describe your video's core topic</li>
              <li><strong>Long-tail Keywords:</strong> Specific phrases with lower competition but high intent</li>
              <li><strong>Related Keywords:</strong> Terms that provide context and support your main keywords</li>
              <li><strong>Trending Keywords:</strong> Emerging terms with growing search volume</li>
            </ul>

            <DefinitionBox>
              <div className="term">Search Intent Optimization</div>
              <div className="definition">
                Aligning your content with the specific intent behind search queries. Educational intent 
                seeks learning, entertainment intent seeks enjoyment, and commercial intent seeks purchasing 
                guidance. Match your content format and approach to viewer search intent.
              </div>
            </DefinitionBox>

            <h4>Title Optimization Strategies</h4>
            <p>
              Video titles serve multiple purposes: they communicate content value to viewers, provide keyword 
              signals to search algorithms, and create curiosity that drives clicks. Effective titles balance 
              SEO optimization with compelling copy that encourages clicks.
            </p>

            <p>
              Front-load important keywords in your titles while maintaining readability and appeal. Keep 
              titles under 60 characters when possible to ensure full visibility across all devices and 
              platforms where your content might appear.
            </p>

            <h4>Description Optimization Best Practices</h4>
            <p>
              Video descriptions provide crucial context for both viewers and search algorithms. Write 
              descriptions like comprehensive blog posts that fully explain your video's content, provide 
              additional value, and include relevant keywords naturally throughout the text.
            </p>

            <p>
              Include timestamps for longer videos, relevant links to resources mentioned in your content, 
              calls-to-action for subscriptions and engagement, and links to related videos or playlists 
              that encourage additional viewing.
            </p>

            <h3>Thumbnail Optimization Science</h3>
            <p>
              Thumbnail optimization combines design principles with psychological triggers that encourage 
              clicks. Effective thumbnails must work at various sizes, stand out among competing content, 
              and accurately represent your video's value while creating curiosity.
            </p>

            <h4>Design Elements That Drive Clicks</h4>
            <ul>
              <li><strong>High Contrast Colors:</strong> Bold colors that stand out against YouTube's interface</li>
              <li><strong>Clear Facial Expressions:</strong> Emotions that convey the video's tone and energy</li>
              <li><strong>Readable Text:</strong> Large, clear text that works at small thumbnail sizes</li>
              <li><strong>Visual Hierarchy:</strong> Clear focal points that guide viewer attention</li>
              <li><strong>Brand Consistency:</strong> Recognizable elements that build channel recognition</li>
            </ul>

            <h3>Content Structure Optimization</h3>
            <p>
              How you structure your video content significantly impacts viewer retention and algorithmic 
              performance. Successful content follows proven patterns that maintain viewer interest while 
              delivering promised value efficiently and engagingly.
            </p>

            <h4>The Hook-Deliver-Retain Formula</h4>
            <ol>
              <li><strong>Hook (0-15 seconds):</strong> Immediately grab attention and clearly state the video's value</li>
              <li><strong>Deliver (Main Content):</strong> Provide the promised value in an organized, engaging manner</li>
              <li><strong>Retain (Throughout):</strong> Use techniques to maintain attention and encourage continued watching</li>
            </ol>

            <p>
              This formula works across all content types because it aligns with both viewer expectations 
              and algorithmic preferences for content that keeps people watching.
            </p>

            <ToolCallout>
              <h4><i className="bx bx-search-alt"></i> Keyword Research Tool</h4>
              <p>
                Use YouTool's Keyword Analyzer to discover high-opportunity keywords in your niche, 
                analyze search volume trends, and identify content gaps you can fill with optimized videos.
              </p>
            </ToolCallout>
          </ContentSection>
        );

      case 'monetization':
        return (
          <ContentSection>
            <h2><i className="bx bx-dollar-circle"></i>Complete YouTube Monetization Guide</h2>
            
            <p>
              YouTube monetization encompasses multiple revenue streams that creators can develop to build 
              sustainable, profitable businesses around their content. Understanding each monetization method's 
              requirements, potential earnings, and optimization strategies helps creators build diversified 
              income streams that provide financial stability and growth opportunities.
            </p>

            <h3>YouTube Partner Program Deep Dive</h3>
            <p>
              The YouTube Partner Program provides the foundation for most creator monetization strategies. 
              Beyond basic ad revenue, YPP membership unlocks multiple monetization features that can 
              significantly increase creator earnings when properly implemented and optimized.
            </p>

            <h4>Ad Revenue Optimization</h4>
            <p>
              Ad revenue depends on multiple factors including content category, audience demographics, 
              video length, and seasonal advertising cycles. Educational and business content typically 
              commands higher CPM rates than entertainment content, while audiences in developed countries 
              generate higher ad revenue than those in developing markets.
            </p>

            <DefinitionBox>
              <div className="term">RPM (Revenue Per Mille)</div>
              <div className="definition">
                Your actual earnings per 1,000 video views after YouTube's revenue share. RPM includes 
                all revenue sources (ads, memberships, Super Chat) and represents your true earning rate 
                per thousand views.
              </div>
            </DefinitionBox>

            <h4>Channel Membership Strategy</h4>
            <p>
              Channel memberships provide recurring revenue while building deeper community connections. 
              Successful membership programs offer genuine value that justifies monthly payments while 
              enhancing rather than replacing your free content.
            </p>

            <ul>
              <li><strong>Exclusive Content:</strong> Members-only videos, behind-the-scenes content, early access</li>
              <li><strong>Community Features:</strong> Private Discord servers, member-only live streams, Q&A sessions</li>
              <li><strong>Recognition Benefits:</strong> Custom badges, emoji, shout-outs, and special recognition</li>
              <li><strong>Educational Resources:</strong> Extended tutorials, resource libraries, templates</li>
            </ul>

            <h3>Alternative Monetization Strategies</h3>
            
            <h4>Affiliate Marketing for YouTube</h4>
            <p>
              Affiliate marketing allows creators to earn commissions by promoting products and services 
              relevant to their audience. Success requires authentic recommendations, proper disclosure, 
              and strategic integration that enhances rather than detracts from content value.
            </p>

            <p>
              Choose affiliate products that you genuinely use and believe provide value to your audience. 
              Authentic recommendations convert better and maintain audience trust, leading to higher 
              long-term earnings than aggressive promotional approaches.
            </p>

            <h4>Product and Service Development</h4>
            <p>
              Many successful creators develop their own products or services, leveraging their expertise 
              and audience relationships. This approach provides the highest profit margins and creates 
              business value independent of platform dependency.
            </p>

            <ul>
              <li><strong>Digital Products:</strong> Online courses, templates, presets, software tools</li>
              <li><strong>Physical Products:</strong> Books, merchandise, branded items, equipment</li>
              <li><strong>Services:</strong> Consulting, coaching, done-for-you services, speaking engagements</li>
              <li><strong>Membership Communities:</strong> Paid communities, mastermind groups, exclusive access</li>
            </ul>

            <h3>Sponsorship and Brand Partnership Guidelines</h3>
            <p>
              Brand partnerships often provide the highest per-video revenue for established creators. 
              Successful partnerships require authentic integration, clear value delivery for sponsors, 
              and maintaining audience trust through selective partnership choices.
            </p>

            <h4>Partnership Rate Calculations</h4>
            <p>
              Sponsorship rates typically range from $100-1,000 per 10,000 views, depending on niche, 
              audience engagement, and specific partnership terms. Creators with highly engaged, targeted 
              audiences can command premium rates even with smaller subscriber counts.
            </p>

            <p>
              When negotiating partnerships, consider factors beyond view counts: audience demographics, 
              engagement rates, conversion potential, and the specific value you provide to brand partners. 
              Document your partnership success to justify higher rates in future negotiations.
            </p>

            <ToolCallout>
              <h4><i className="bx bx-calculator"></i> Revenue Planning</h4>
              <p>
                Use YouTool's YouTube Calculator to estimate potential earnings across different monetization 
                methods based on your current performance metrics and growth projections.
              </p>
            </ToolCallout>
          </ContentSection>
        );

      case 'advanced':
        return (
          <ContentSection>
            <h2><i className="bx bx-brain"></i>Advanced YouTube Strategies</h2>
            
            <p>
              Advanced YouTube strategies go beyond basic content creation to encompass sophisticated 
              approaches to audience development, competitive positioning, and systematic growth optimization. 
              These strategies require deeper platform understanding but can significantly accelerate success 
              for creators ready to implement them systematically.
            </p>

            <h3>Algorithmic Psychology and Behavior</h3>
            <p>
              Understanding the psychological principles behind YouTube's recommendation algorithm helps 
              creators align their content strategy with platform mechanics. The algorithm optimizes for 
              user satisfaction and platform engagement, which creators can leverage through strategic content design.
            </p>

            <h4>Session Optimization Strategies</h4>
            <p>
              YouTube measures not just how long people watch your videos, but how your videos affect overall 
              platform usage. Videos that lead to longer YouTube sessions (even on other creators' content) 
              receive algorithmic favor because they support YouTube's core business objectives.
            </p>

            <ul>
              <li><strong>Strategic End Screens:</strong> Recommend videos that naturally follow your content</li>
              <li><strong>Playlist Integration:</strong> Create viewing sequences that encourage binge-watching</li>
              <li><strong>Series Development:</strong> Multi-part content that builds anticipation and return visits</li>
              <li><strong>Community Building:</strong> Content that encourages discussion and repeat engagement</li>
            </ul>

            <h3>Competitive Intelligence and Market Positioning</h3>
            <p>
              Advanced creators systematically study their competitive landscape to identify opportunities, 
              understand audience preferences, and position their content strategically within their niche. 
              This intelligence informs content planning, collaboration opportunities, and differentiation strategies.
            </p>

            <h4>Gap Analysis Methodology</h4>
            <p>
              Identify content gaps by analyzing successful channels in your niche and adjacent categories. 
              Look for topics with high audience interest but limited high-quality content, questions that 
              aren't being answered comprehensively, or presentation styles that could better serve specific 
              audience segments.
            </p>

            <DefinitionBox>
              <div className="term">Blue Ocean Content Strategy</div>
              <div className="definition">
                Creating content in underserved niches or approaching popular topics from unique angles 
                that face less direct competition. This strategy helps creators build authority in 
                specific areas while avoiding oversaturated content categories.
              </div>
            </DefinitionBox>

            <h3>Cross-Platform Audience Development</h3>
            <p>
              Advanced creators develop audiences across multiple platforms while using YouTube as their 
              primary content hub. This approach provides audience diversification, multiple traffic sources, 
              and increased opportunities for monetization and brand development.
            </p>

            <h4>Platform-Specific Content Adaptation</h4>
            <ul>
              <li><strong>Twitter:</strong> Real-time updates, industry commentary, community engagement</li>
              <li><strong>LinkedIn:</strong> Professional insights, industry analysis, business-focused content</li>
              <li><strong>Instagram:</strong> Visual content, behind-the-scenes, lifestyle integration</li>
              <li><strong>TikTok:</strong> Short-form viral content, trending topic participation</li>
              <li><strong>Email Lists:</strong> Direct communication, exclusive content, traffic generation</li>
            </ul>

            <h3>Data-Driven Content Strategy Development</h3>
            <p>
              Advanced creators use comprehensive data analysis to guide content decisions rather than 
              relying on intuition alone. This approach involves systematic testing, performance tracking, 
              and continuous optimization based on measurable results.
            </p>

            <h4>A/B Testing Framework</h4>
            <p>
              Implement systematic testing of content elements including titles, thumbnails, content 
              structure, upload timing, and calls-to-action. Document test results to build a knowledge 
              base of what works specifically for your audience and content type.
            </p>

            <p>
              Test one variable at a time to isolate performance factors. This might involve creating 
              similar content with different thumbnail styles, testing various title approaches for 
              similar topics, or experimenting with different video lengths for comparable subject matter.
            </p>

            <h3>Business Development Through YouTube</h3>
            <p>
              Advanced creators view YouTube as a platform for building broader business opportunities 
              rather than just ad revenue generation. This perspective opens doors to speaking engagements, 
              consulting opportunities, product development, and strategic partnerships that extend far 
              beyond traditional creator monetization.
            </p>

            <h4>Authority Building and Thought Leadership</h4>
            <p>
              Establish yourself as a recognized authority within your niche through consistent, high-quality 
              content that provides unique insights, analysis, and perspectives. Authority building is a 
              long-term strategy that compounds over time, leading to increased opportunities and higher 
              earning potential across all monetization methods.
            </p>

            <ToolCallout>
              <h4><i className="bx bx-target"></i> Competitive Analysis</h4>
              <p>
                Use YouTool's Channel Comparer to analyze successful channels in your niche, identify 
                content opportunities, and understand what strategies work best for your target audience.
              </p>
            </ToolCallout>
          </ContentSection>
        );

      default:
        return null;
    }
  };

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>YouTube Education Center</Title>
          <Subtitle>
            Comprehensive guides, tutorials, and resources to help you master YouTube creation, 
            analytics, optimization, and monetization. Everything you need to build a successful channel.
          </Subtitle>
        </Header>

        <TabNav>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={`bx ${tab.icon}`}></i>
              {tab.name}
            </TabButton>
          ))}
        </TabNav>

        {renderContent()}
      </ContentWrapper>
    </Container>
  );
};
