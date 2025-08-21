// src/pages/Company/CaseStudies.tsx
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

const CaseStudyGrid = styled.div`
  display: grid;
  gap: 3rem;
  margin-bottom: 3rem;
`;

const CaseStudyCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  overflow: hidden;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }
`;

const CaseStudyHeader = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  padding: 2rem;
  color: white;

  .category {
    background: rgba(255, 255, 255, 0.2);
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
    display: inline-block;
    margin-bottom: 1rem;
  }

  h2 {
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin: 0;
  }
`;

const CaseStudyContent = styled.div`
  padding: 2.5rem;

  h3 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.4rem;
    font-weight: 600;
    margin: 2rem 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:first-child {
      margin-top: 0;
    }
  }

  h4 {
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 1.2rem;
    font-weight: 600;
    margin: 1.5rem 0 0.75rem 0;
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

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin: 2rem 0;
`;

const MetricCard = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;

  .metric-number {
    font-size: 2rem;
    font-weight: 700;
    color: ${({ theme }) => theme.colors.red4};
    margin-bottom: 0.5rem;
  }

  .metric-label {
    color: ${({ theme }) => theme.colors.text.muted};
    font-size: 0.9rem;
  }

  .metric-change {
    color: ${({ theme }) => theme.colors.success};
    font-size: 0.8rem;
    font-weight: 600;
    margin-top: 0.25rem;
  }
`;

const KeyInsightBox = styled.div`
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

const ToolsUsedSection = styled.div`
  background: ${({ theme }) => theme.colors.dark4};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
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

  .tools-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tool-tag {
    background: ${({ theme }) => theme.colors.red4};
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }
`;

export const CaseStudies: React.FC = () => {
  const navigate = useNavigate();

  const caseStudies = [
    {
      category: "Educational Channel",
      title: "How a Tech Tutorial Channel Grew from 500 to 50,000 Subscribers in 6 Months",
      subtitle: "Strategic content optimization and SEO implementation",
      challenge: "A tech tutorial channel was struggling with low views and slow subscriber growth despite creating high-quality content. Videos were getting lost in search results and failing to reach the target audience of beginner programmers.",
      solution: "Using YouTool's comprehensive analytics suite, we identified several optimization opportunities. The channel's content was excellent but wasn't optimized for discovery. We implemented a systematic approach to keyword research, thumbnail optimization, and content structure that aligned with both search intent and algorithmic preferences.",
      results: {
        subscribers: "+9,900%",
        views: "+1,247%", 
        watchTime: "+856%",
        engagement: "+234%"
      },
      keyInsights: "The biggest breakthrough came from understanding search intent. Instead of creating generic tutorials, the creator began targeting specific problems that beginners actually search for on YouTube.",
      toolsUsed: ["Keyword Analyzer", "Video Analyzer", "Channel Analyzer", "Tag Generator"],
      details: {
        timeframe: "6 months",
        startingMetrics: "500 subscribers, 2,000 monthly views",
        endingMetrics: "50,000 subscribers, 850,000 monthly views",
        strategies: [
          "Keyword-optimized video titles targeting specific programming problems",
          "Thumbnail redesign using high-contrast colors and clear problem/solution messaging", 
          "Series-based content that encouraged binge-watching and playlist consumption",
          "Strategic upload timing based on audience analytics",
          "Community engagement strategies that built loyal viewer relationships"
        ]
      }
    },
    {
      category: "Lifestyle Channel",
      title: "Fitness Creator Achieves 300% Revenue Increase Through Analytics-Driven Strategy",
      subtitle: "Monetization optimization and audience development",
      challenge: "A fitness creator with 25,000 subscribers was struggling to monetize effectively. Despite decent view counts, ad revenue was low, and attempts at affiliate marketing weren't converting. The creator needed to understand their audience better and optimize their monetization strategy.",
      solution: "We used YouTool's analytics to dive deep into audience behavior, traffic sources, and engagement patterns. The analysis revealed that viewers were highly engaged but the content wasn't optimized for revenue generation. We developed a comprehensive strategy focusing on audience value and strategic monetization.",
      results: {
        revenue: "+300%",
        engagement: "+167%",
        retention: "+89%",
        ctr: "+145%"
      },
      keyInsights: "The creator's audience was primarily interested in home workouts and nutrition guidance. By creating targeted content for these specific interests and optimizing for higher-value keywords, both engagement and revenue improved dramatically.",
      toolsUsed: ["Channel Analyzer", "Keyword Analyzer"],
      details: {
        timeframe: "4 months",
        startingMetrics: "25,000 subscribers, $800 monthly revenue",
        endingMetrics: "34,000 subscribers, $3,200 monthly revenue",
        strategies: [
          "Audience segmentation based on viewing behavior and interests",
          "Content calendar optimization for seasonal fitness trends",
          "Affiliate marketing integration with products the creator actually used",
          "Email list building through valuable free resources",
          "Live streaming schedule that maximized Super Chat revenue"
        ]
      }
    },
    {
      category: "Business Channel", 
      title: "B2B Marketing Channel Doubles Leads Through Strategic Content Optimization",
      subtitle: "Lead generation and authority building",
      challenge: "A business marketing consultancy was using YouTube to generate leads for their services but wasn't seeing significant results. Their content was informative but wasn't attracting the right audience or converting viewers into potential clients.",
      solution: "Through comprehensive channel analysis, we identified that the content was too generic and wasn't addressing the specific pain points of their ideal clients. We developed a targeted content strategy that positioned the creator as an authority while providing genuine value to potential customers.",
      results: {
        leads: "+203%",
        views: "+89%",
        subscribers: "+156%",
        engagement: "+234%"
      },
      keyInsights: "Success came from creating content that solved specific, expensive problems that businesses face. When you help people save or make money, they're much more likely to consider you for paid services.",
      toolsUsed: ["Keyword Analyzer", "Competitor Analysis", "Content Strategy Tools", "SEO Optimizer"],
      details: {
        timeframe: "5 months",
        startingMetrics: "8,000 subscribers, 12 monthly leads",
        endingMetrics: "20,500 subscribers, 36 monthly leads",
        strategies: [
          "Problem-focused content targeting expensive business challenges",
          "Case study videos demonstrating real client results",
          "SEO optimization for business-specific long-tail keywords",
          "Strategic calls-to-action that provided free value before pitching services",
          "LinkedIn integration that extended reach to business professionals"
        ]
      }
    }
  ];

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Creator Success Case Studies</Title>
          <Subtitle>
            Real stories of creators who used YouTool's analytics and optimization strategies to achieve 
            significant growth, increased revenue, and sustainable success on YouTube. Learn from their 
            strategies and apply similar approaches to your own channel.
          </Subtitle>
        </Header>

        <CaseStudyGrid>
          {caseStudies.map((study, index) => (
            <CaseStudyCard key={index}>
              <CaseStudyHeader>
                <div className="category">{study.category}</div>
                <h2>{study.title}</h2>
                <p className="subtitle">{study.subtitle}</p>
              </CaseStudyHeader>

              <CaseStudyContent>
                <h3><i className="bx bx-target"></i>The Challenge</h3>
                <p>{study.challenge}</p>

                <h3><i className="bx bx-bulb"></i>Our Solution</h3>
                <p>{study.solution}</p>

                <h3><i className="bx bx-chart-line"></i>The Results</h3>
                <MetricsGrid>
                  {Object.entries(study.results).map(([key, value]) => (
                    <MetricCard key={key}>
                      <div className="metric-number">{value}</div>
                      <div className="metric-label">{key.charAt(0).toUpperCase() + key.slice(1)}</div>
                      <div className="metric-change">Growth</div>
                    </MetricCard>
                  ))}
                </MetricsGrid>

                <KeyInsightBox>
                  <h4><i className="bx bx-key"></i> Key Insight</h4>
                  <p>{study.keyInsights}</p>
                </KeyInsightBox>

                <ToolsUsedSection>
                  <h4><i className="bx bx-wrench"></i> YouTool Features Used</h4>
                  <div className="tools-list">
                    {study.toolsUsed.map((tool, toolIndex) => (
                      <span key={toolIndex} className="tool-tag">{tool}</span>
                    ))}
                  </div>
                </ToolsUsedSection>

                <h3><i className="bx bx-detail"></i>Implementation Details</h3>
                <h4>Timeline: {study.details.timeframe}</h4>
                <p><strong>Starting Point:</strong> {study.details.startingMetrics}</p>
                <p><strong>End Result:</strong> {study.details.endingMetrics}</p>

                <h4>Strategies Implemented:</h4>
                <ul>
                  {study.details.strategies.map((strategy, strategyIndex) => (
                    <li key={strategyIndex}>{strategy}</li>
                  ))}
                </ul>
              </CaseStudyContent>
            </CaseStudyCard>
          ))}
        </CaseStudyGrid>

        <div style={{ 
          background: '#1A1A1D', 
          borderRadius: '12px', 
          padding: '3rem', 
          textAlign: 'center',
          border: '1px solid #393939ff'
        }}>
          <h3 style={{ color: '#F3F4F6', marginBottom: '1rem' }}>Ready to Write Your Success Story?</h3>
          <p style={{ 
            color: '#9CA3AF', 
            marginBottom: '2rem',
            fontSize: '1.1rem',
            lineHeight: '1.6',
            maxWidth: '600px',
            margin: '0 auto 2rem auto'
          }}>
            These creators achieved remarkable results by combining YouTool's analytics with strategic 
            implementation and consistent effort. Your channel has unique opportunities waiting to be 
            discovered through proper analysis and optimization.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              style={{
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
              onClick={() => navigate('/tools')}
            >
              <i className="bx bx-chart" style={{ marginRight: '0.5rem' }}></i>
              Analyze Your Channel
            </button>
            <button 
              style={{
                background: '#29292bff',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '1.1rem'
              }}
              onClick={() => navigate('/education')}
            >
              <i className="bx bx-book" style={{ marginRight: '0.5rem' }}></i>
              Learn the Strategies
            </button>
          </div>
        </div>
      </ContentWrapper>
    </Container>
  );
};
