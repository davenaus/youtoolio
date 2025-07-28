// src/pages/Home/Home.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { Button } from '../../components/Button/Button';


// Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.dark2};
  color: ${({ theme }) => theme.colors.text.primary};
  overflow-x: hidden;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark2} 0%, ${({ theme }) => theme.colors.dark3} 100%);
  padding-top: 2rem;
  
  @media (max-width: 768px) {
    padding-top: 3rem;
    min-height: calc(100vh - 1rem);
  }
`;

const HeroBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 50% 50%, rgba(125, 0, 0, 0.1) 0%, transparent 70%);
  z-index: 1;
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
    padding: 0 1.5rem;
  }
`;

const HeroContent = styled.div`
  animation: ${fadeInUp} 0.8s ease-out;
`;

const Logo = styled.div`
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const LogoImage = styled.img`
  height: 60px;
  width: auto;
  
  @media (max-width: 768px) {
    height: 50px;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.2rem;
    line-height: 1.2;
    margin-bottom: 1rem;
  }
`;

const Highlight = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    padding: 0 0.5rem;
  }
`;

const HeroButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2rem;
  }
`;

const HeroStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
    margin-top: 1rem;
  }
`;

const HeroStat = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.red4};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const HeroVisual = styled.div`
  animation: ${fadeInUp} 0.8s ease-out 0.2s both;
  position: relative;
`;

const AnalyticsPreview = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3}, ${({ theme }) => theme.colors.dark4});
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  position: relative;
  overflow: hidden;
  animation: ${float} 3s ease-in-out infinite;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  }
`;

const PreviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const PreviewIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
`;

const PreviewTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.1rem;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.dark5};

  &:last-child {
    border-bottom: none;
  }
`;

const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const MetricValue = styled.span`
  color: ${({ theme }) => theme.colors.success};
  font-weight: 600;
`;

const FeaturesSection = styled.section`
  padding: 6rem 0;
  background: ${({ theme }) => theme.colors.dark1};
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const SectionBadge = styled.span`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 1rem;
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.muted};
  line-height: 1.6;
`;

const FeaturesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const FeatureCard = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark3}, ${({ theme }) => theme.colors.dark4});
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.xl};
  padding: 2rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover::before {
    transform: scaleX(1);
  }
`;

const FeatureIcon = styled.div`
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;

  li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: ${({ theme }) => theme.colors.text.muted};
    margin-bottom: 0.5rem;
    font-size: 0.9rem;

    &::before {
      content: '✓';
      color: ${({ theme }) => theme.colors.success};
      font-weight: bold;
    }
  }
`;

const CTASection = styled.section`
  padding: 6rem 0;
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.dark2} 0%, ${({ theme }) => theme.colors.dark3} 100%);
  text-align: center;
  position: relative;
`;

const CTAContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const CTATitle = styled.h2`
  font-size: 3rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const CTASubtitle = styled.p`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const CTAButton = styled.button`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  border: none;
  padding: 1.25rem 3rem;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  animation: ${pulse} 2s ease-in-out infinite;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 auto;

  &:hover {
    box-shadow: 0 20px 40px rgba(185, 28, 28, 0.4);
    animation: none;
  }
`;

const VideoModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const VideoModalBackdrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
`;

const VideoModalContent = styled.div`
  position: relative;
  width: 90vw;
  max-width: 1000px;
  height: 56.25vw;
  max-height: 562px;
  background: ${({ theme }) => theme.colors.dark3};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  cursor: default;
  z-index: 1001;

  @media (max-width: 768px) {
    width: 95vw;
    height: 53.4vw;
  }
`;

const VideoModalClose = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  z-index: 1002;
  padding: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.red4};
  }

  @media (max-width: 768px) {
    top: -50px;
    right: -10px;
    font-size: 1.5rem;
  }
`;

const VideoPlayer = styled.div`
  width: 100%;
  height: 100%;
  
  iframe {
    border: none;
  }
`;

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentMetric, setCurrentMetric] = useState(0);
  const [showVideoModal, setShowVideoModal] = useState(false);

  const metrics = [
    { label: 'Channel Growth', value: '+127%', trend: 'up' },
    { label: 'Engagement Rate', value: '8.4%', trend: 'up' },
    { label: 'Video Performance', value: '94/100', trend: 'up' },
    { label: 'SEO Score', value: 'A+', trend: 'up' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMetric((prev) => (prev + 1) % metrics.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showVideoModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showVideoModal]);

  const features = [
    {
      icon: 'bx bx-line-chart',
      title: 'Deep Analytics',
      description: 'Understand your channel performance with comprehensive analytics that reveal what\'s working and what isn\'t.',
      features: ['Video performance tracking', 'Engagement analysis', 'Audience insights', 'Growth patterns']
    },
    {
      icon: 'bx bx-search-alt',
      title: 'SEO Optimization',
      description: 'Discover the keywords and strategies that will help your content get discovered by the right audience.',
      features: ['Keyword research', 'Tag optimization', 'Title analysis', 'Competitor insights']
    },
    {
      icon: 'bx bx-trophy',
      title: 'Success Patterns',
      description: 'Learn from viral videos and successful channels to replicate winning strategies in your own content.',
      features: ['Viral video analysis', 'Trend identification', 'Content gaps', 'Opportunity discovery']
    },

  ];

  return (
    <Container>
      {/* Hero Section */}
      <HeroSection>
        <HeroBackground />
        <ContentWrapper>
          <HeroContent>
            <Logo>
              <LogoImage
                src="https://64.media.tumblr.com/e000461398dfaa9247cc9db6eca187a2/0e01452f9f6dd974-6b/s2048x3072/0457337859cea0729cdfee1d7a9407e25f8f5cca.png"
                alt="YouTool Logo"
              />
            </Logo>

            <HeroTitle>
              Understand Your Channel. <Highlight>Accelerate Your Growth.</Highlight>
            </HeroTitle>

            <HeroSubtitle>
              Get deep insights into your YouTube performance with professional-grade analytics tools. 
              Discover what makes content successful, optimize for growth, and make data-driven decisions 
              that transform your channel.
            </HeroSubtitle>

            <HeroButtons>
              <Button
                variant="primary"
                size="lg"
                icon="bx bx-chart"
                onClick={() => navigate('/tools')}
              >
                Analyze My Channel
              </Button>
              <Button
                variant="secondary"
                size="lg"
                icon="bx bx-play"
                onClick={() => setShowVideoModal(true)}
              >
                See How It Works
              </Button>
            </HeroButtons>

            <HeroStats>
              <HeroStat>
                <StatNumber>15+</StatNumber>
                <StatLabel>Analytics Tools</StatLabel>
              </HeroStat>
              <HeroStat>
                <StatNumber>50K+</StatNumber>
                <StatLabel>Videos Analyzed</StatLabel>
              </HeroStat>
              <HeroStat>
                <StatNumber>100%</StatNumber>
                <StatLabel>Free Forever</StatLabel>
              </HeroStat>
            </HeroStats>
          </HeroContent>

          <HeroVisual>
            <AnalyticsPreview>
              <PreviewHeader>
                <PreviewIcon>
                  <i className="bx bx-chart"></i>
                </PreviewIcon>
                <PreviewTitle>Channel Analytics Dashboard</PreviewTitle>
              </PreviewHeader>
              
              {metrics.map((metric, index) => (
                <MetricRow key={index} style={{ opacity: index === currentMetric ? 1 : 0.6 }}>
                  <MetricLabel>{metric.label}</MetricLabel>
                  <MetricValue>{metric.value}</MetricValue>
                </MetricRow>
              ))}
            </AnalyticsPreview>
          </HeroVisual>
        </ContentWrapper>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <SectionHeader>
          <SectionBadge>Why Creators Choose YouTool</SectionBadge>
          <SectionTitle>Everything You Need to Succeed on YouTube</SectionTitle>
          <SectionSubtitle>
            Professional-grade analytics and optimization tools that help you understand your audience, 
            improve your content, and grow your channel faster.
          </SectionSubtitle>
        </SectionHeader>

        <FeaturesGrid>
          {features.map((feature, index) => (
            <FeatureCard key={index}>
              <FeatureIcon>
                <i className={feature.icon}></i>
              </FeatureIcon>
              <FeatureTitle>{feature.title}</FeatureTitle>
              <FeatureDescription>{feature.description}</FeatureDescription>
              <FeatureList>
                {feature.features.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </FeatureList>
            </FeatureCard>
          ))}
        </FeaturesGrid>
      </FeaturesSection>

      {/* CTA Section */}
      <CTASection>
        <CTAContent>
          <CTATitle>Ready to Grow Your Channel?</CTATitle>
          <CTASubtitle>
            Join thousands of successful creators who use YouTool to understand their performance, 
            optimize their content, and achieve their YouTube goals. Start analyzing your channel today.
          </CTASubtitle>
          <CTAButton onClick={() => navigate('/tools')}>
            <i className="bx bx-rocket"></i>
            Start Your Analysis Now
          </CTAButton>
        </CTAContent>
      </CTASection>

      {/* Video Modal */}
      {showVideoModal && (
        <VideoModal onClick={() => setShowVideoModal(false)}>
          <VideoModalBackdrop />
          <VideoModalContent onClick={(e) => e.stopPropagation()}>
            <VideoModalClose onClick={() => setShowVideoModal(false)}>
              <i className="bx bx-x"></i>
            </VideoModalClose>
            <VideoPlayer>
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/m02ZZL-EWg0?autoplay=1&rel=0&modestbranding=1&controls=1&showinfo=0&fs=1&iv_load_policy=3"
                title="YouTool Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </VideoPlayer>
          </VideoModalContent>
        </VideoModal>
      )}
    </Container>
  );
};