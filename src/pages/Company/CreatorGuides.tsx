// src/pages/Company/CreatorGuides.tsx
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

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
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

  i {
    font-size: 1.2rem;
  }
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
  max-width: 600px;
  margin: 0 auto;
`;

const CategoriesNav = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  justify-content: center;
  flex-wrap: wrap;
`;

const CategoryButton = styled.button<{ active: boolean }>`
  background: ${({ active, theme }) => active ? theme.colors.red4 : theme.colors.dark3};
  color: ${({ active, theme }) => active ? 'white' : theme.colors.text.secondary};
  border: 1px solid ${({ active, theme }) => active ? theme.colors.red4 : theme.colors.dark5};
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;

  &:hover {
    background: ${({ active, theme }) => active ? theme.colors.red5 : theme.colors.dark4};
    color: ${({ active, theme }) => active ? 'white' : theme.colors.text.primary};
  }
`;

const GuidesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
`;

const GuideCard = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }
`;

const GuideIcon = styled.div`
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

const GuideTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const GuideDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const GuideSteps = styled.ol`
  color: ${({ theme }) => theme.colors.text.secondary};
  padding-left: 1.5rem;
  
  li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }
`;

const TipBox = styled.div`
  background: ${({ theme }) => theme.colors.red1};
  border: 1px solid ${({ theme }) => theme.colors.red3};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  margin-top: 1rem;

  strong {
    color: ${({ theme }) => theme.colors.text.primary};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
    font-size: 0.9rem;
  }
`;

export const CreatorGuides: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('getting-started');

  const categories = [
    { id: 'getting-started', name: 'Getting Started' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'seo', name: 'SEO & Growth' },
    { id: 'optimization', name: 'Optimization' }
  ];

  const guides = {
    'getting-started': [
      {
        icon: 'bx-play-circle',
        title: 'Your First Video Analysis',
        description: 'Learn how to use YouTool to analyze your first video and understand the key metrics that matter.',
        steps: [
          'Copy your YouTube video URL',
          'Paste it into the Video Analyzer tool',
          'Review the performance metrics and insights',
          'Identify areas for improvement',
          'Apply learnings to your next video'
        ],
        tip: 'Start with your best-performing video to understand what works well for your channel.'
      },
      {
        icon: 'bx-trending-up',
        title: 'Understanding Your Channel Analytics',
        description: 'Get insights into your overall channel performance and growth patterns.',
        steps: [
          'Use the Channel Analyzer tool',
          'Review subscriber growth trends',
          'Analyze your top-performing content',
          'Identify your most engaged audience segments',
          'Set realistic growth goals based on data'
        ],
        tip: 'Focus on consistency rather than viral moments for sustainable growth.'
      }
    ],
    'analytics': [
      {
        icon: 'bx-chart',
        title: 'Key Metrics That Matter',
        description: 'Learn which YouTube metrics you should focus on to grow your channel effectively.',
        steps: [
          'Watch Time - Your most important metric',
          'Average View Duration - How engaging is your content?',
          'Click-Through Rate (CTR) - Are your thumbnails working?',
          'Subscriber Growth Rate - Building your community',
          'Engagement Rate - How active is your audience?'
        ],
        tip: 'Prioritize watch time over view count for better YouTube algorithm performance.'
      },
      {
        icon: 'bx-time',
        title: 'Optimizing Watch Time',
        description: 'Strategies to keep viewers watching longer and improve your content retention.',
        steps: [
          'Hook viewers in the first 15 seconds',
          'Use pattern interrupts to maintain attention',
          'Create compelling story arcs throughout your video',
          'End with a strong call-to-action',
          'Analyze drop-off points to identify weak spots'
        ],
        tip: 'The first 15 seconds are crucial - make them count with a strong hook.'
      }
    ],
    'seo': [
      {
        icon: 'bx-search-alt',
        title: 'YouTube SEO Fundamentals',
        description: 'Master the basics of YouTube SEO to get your videos discovered by more viewers.',
        steps: [
          'Research keywords using the Keyword Analyzer',
          'Craft compelling, keyword-rich titles',
          'Write detailed, optimized descriptions',
          'Use relevant tags strategically',
          'Create eye-catching thumbnails'
        ],
        tip: 'Include your target keyword in the first 125 characters of your description.'
      },
      {
        icon: 'bx-target-lock',
        title: 'Finding Your Niche',
        description: 'Discover and develop your unique content niche for better audience targeting.',
        steps: [
          'Analyze your most successful content themes',
          'Research competitor gaps in your space',
          'Survey your audience about their interests',
          'Test different content types and measure response',
          'Double down on what resonates most'
        ],
        tip: 'A well-defined niche helps YouTube understand who to recommend your content to.'
      }
    ],
    'optimization': [
      {
        icon: 'bx-image',
        title: 'Thumbnail Optimization',
        description: 'Create thumbnails that get clicks and improve your video performance.',
        steps: [
          'Use high contrast colors and clear imagery',
          'Include faces with emotional expressions',
          'Add text overlays for context (but keep it minimal)',
          'Test different thumbnail styles',
          'Maintain consistency with your brand'
        ],
        tip: 'Your thumbnail should be readable even at small sizes on mobile devices.'
      },
      {
        icon: 'bx-edit',
        title: 'Title and Description Best Practices',
        description: 'Write titles and descriptions that both viewers and YouTube\'s algorithm will love.',
        steps: [
          'Front-load your most important keywords',
          'Keep titles under 60 characters for full visibility',
          'Write descriptions like blog posts (200+ words)',
          'Include relevant links and timestamps',
          'Use calls-to-action throughout'
        ],
        tip: 'Your title should create curiosity while clearly conveying value to the viewer.'
      }
    ]
  };

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>Creator Guides</Title>
          <Subtitle>
            Step-by-step guides to help you master YouTube analytics and grow your channel with data-driven strategies.
          </Subtitle>
        </Header>

        <CategoriesNav>
          {categories.map((category) => (
            <CategoryButton
              key={category.id}
              active={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </CategoryButton>
          ))}
        </CategoriesNav>

        <GuidesGrid>
          {guides[activeCategory as keyof typeof guides]?.map((guide, index) => (
            <GuideCard key={index}>
              <GuideIcon>
                <i className={`bx ${guide.icon}`}></i>
              </GuideIcon>
              
              <GuideTitle>{guide.title}</GuideTitle>
              <GuideDescription>{guide.description}</GuideDescription>
              
              <GuideSteps>
                {guide.steps.map((step, stepIndex) => (
                  <li key={stepIndex}>{step}</li>
                ))}
              </GuideSteps>

              <TipBox>
                <strong>Pro Tip:</strong>
                <p>{guide.tip}</p>
              </TipBox>
            </GuideCard>
          ))}
        </GuidesGrid>
      </ContentWrapper>
    </Container>
  );
};