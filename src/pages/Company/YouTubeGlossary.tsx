// src/pages/Company/YouTubeGlossary.tsx
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
  max-width: 600px;
  margin: 0 auto 2rem auto;
  line-height: 1.6;
`;

const SearchBox = styled.div`
  position: relative;
  max-width: 500px;
  margin: 0 auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.muted};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red4};
  }
`;

const SearchIcon = styled.i`
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 1.2rem;
`;

const FilterSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 3rem;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const FilterLabel = styled.span`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
`;

const Select = styled.select`
  background: ${({ theme }) => theme.colors.dark3};
  color: ${({ theme }) => theme.colors.text.primary};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  min-width: 120px;

  &:hover {
    background: ${({ theme }) => theme.colors.dark4};
    border-color: ${({ theme }) => theme.colors.red4};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.red4};
  }

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ClearButton = styled.button`
  background: transparent;
  color: ${({ theme }) => theme.colors.text.muted};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: ${({ theme }) => theme.colors.dark3};
    color: ${({ theme }) => theme.colors.text.primary};
    border-color: ${({ theme }) => theme.colors.red4};
  }

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

const GlossaryGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const GlossaryItem = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 2rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: ${({ theme }) => theme.colors.red4};
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .term {
    color: ${({ theme }) => theme.colors.red4};
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .category {
    background: ${({ theme }) => theme.colors.red1};
    color: ${({ theme }) => theme.colors.text.primary};
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
    margin-left: auto;
  }

  .definition {
    color: ${({ theme }) => theme.colors.text.secondary};
    line-height: 1.7;
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }

  .example {
    background: ${({ theme }) => theme.colors.dark4};
    border: 1px solid ${({ theme }) => theme.colors.dark5};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    padding: 1rem;
    color: ${({ theme }) => theme.colors.text.muted};
    font-style: italic;
    font-size: 0.95rem;
  }
`;


export const YouTubeGlossary: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const glossaryTerms = [
    {
      term: "Algorithm",
      category: "Platform",
      definition: "The complex system of rules and machine learning models that YouTube uses to determine which videos to recommend to which viewers. The algorithm considers factors like watch time, engagement, relevance, and user behavior to make recommendations.",
      example: "The algorithm promoted your video because viewers watched it completely and then watched more of your content."
    },
    {
      term: "Analytics",
      category: "Metrics",
      definition: "Detailed performance data about your videos and channel, including views, watch time, subscriber growth, traffic sources, and audience demographics. Analytics help creators understand what content works and why.",
      example: "Your analytics show that viewers from search traffic watch 30% longer than those from suggested videos."
    },
    {
      term: "Average View Duration",
      category: "Metrics",
      definition: "The average amount of time viewers spend watching your videos, calculated as total watch time divided by total views. This metric indicates how engaging your content is to your audience.",
      example: "An average view duration of 60% means viewers watch 60% of your video length on average."
    },
    {
      term: "Click-Through Rate (CTR)",
      category: "Metrics",
      definition: "The percentage of people who click on your video after seeing your thumbnail and title. CTR measures how compelling your video presentation is to potential viewers.",
      example: "A 5% CTR means 5 out of every 100 people who see your thumbnail click to watch your video."
    },
    {
      term: "Content ID",
      category: "Copyright",
      definition: "YouTube's automated system that scans uploaded videos against a database of copyrighted content. Content ID can place claims on videos that use copyrighted material, affecting monetization.",
      example: "Content ID detected copyrighted music in your video and placed a claim, directing ad revenue to the music publisher."
    },
    {
      term: "CPM (Cost Per Mille)",
      category: "Monetization",
      definition: "The amount advertisers pay per 1,000 ad impressions on your content. CPM varies based on content category, audience demographics, and seasonal advertising demand.",
      example: "A $5 CPM means advertisers pay $5 for every 1,000 times ads are shown on your videos."
    },
    {
      term: "Creator Studio",
      category: "Platform",
      definition: "YouTube's comprehensive dashboard where creators manage their channels, access analytics, customize settings, upload videos, and monitor performance metrics.",
      example: "Use Creator Studio to schedule uploads, respond to comments, and track your channel's growth over time."
    },
    {
      term: "End Screen",
      category: "Features",
      definition: "Interactive elements that appear in the last 5-20 seconds of your videos, allowing you to promote other videos, playlists, subscriptions, or external websites.",
      example: "Add an end screen promoting your most popular video to increase overall channel watch time."
    },
    {
      term: "Engagement Rate",
      category: "Metrics",
      definition: "The percentage of viewers who interact with your content through likes, comments, shares, or subscriptions. Higher engagement rates indicate stronger audience connection and content quality.",
      example: "An engagement rate of 8% means 8 out of every 100 viewers interact with your video in some way."
    },
    {
      term: "Impressions",
      category: "Metrics",
      definition: "The number of times your video thumbnail was shown to potential viewers on YouTube. Impressions indicate your content's reach and discovery potential.",
      example: "Your video received 10,000 impressions but only 500 views, indicating a 5% click-through rate."
    },
    {
      term: "Monetization",
      category: "Monetization",
      definition: "The process of earning revenue from your YouTube content through various methods including ad revenue, memberships, Super Chat, sponsorships, and merchandise sales.",
      example: "Channel monetization includes YouTube ad revenue, brand sponsorships, and affiliate marketing commissions."
    },
    {
      term: "RPM (Revenue Per Mille)",
      category: "Monetization",
      definition: "Your actual earnings per 1,000 video views after YouTube's revenue share and all deductions. RPM represents your true earning rate from YouTube monetization.",
      example: "An RPM of $3 means you earn $3 for every 1,000 views on your monetized content."
    },
    {
      term: "Search Engine Optimization (SEO)",
      category: "Strategy",
      definition: "The practice of optimizing your videos to rank higher in YouTube and Google search results through strategic keyword usage, compelling titles, and comprehensive descriptions.",
      example: "Good YouTube SEO helped your tutorial video rank #1 for 'how to edit videos for beginners.'"
    },
    {
      term: "Subscriber",
      category: "Audience",
      definition: "Viewers who have chosen to follow your channel and receive notifications about new uploads. Subscribers represent your core audience and are more likely to watch and engage with your content.",
      example: "Loyal subscribers often watch your videos within hours of upload, helping boost early engagement signals."
    },
    {
      term: "Tags",
      category: "SEO",
      definition: "Keywords and phrases that help YouTube understand your video's content and context. Tags assist in content categorization and can influence discovery through search and recommendations.",
      example: "Using tags like 'YouTube tutorial' and 'content creation' helps your video appear in relevant searches."
    },
    {
      term: "Thumbnail",
      category: "Design",
      definition: "The preview image that represents your video across YouTube's platform. Thumbnails are crucial for attracting clicks and should be visually appealing while accurately representing content.",
      example: "A compelling thumbnail with clear text and expressive faces can double your video's click-through rate."
    },
    {
      term: "View",
      category: "Metrics",
      definition: "A single instance of someone watching your video for at least 30 seconds (or the video's entire length if shorter). Views indicate your content's reach and popularity.",
      example: "Your video gained 1,000 views in the first 24 hours, indicating strong early performance."
    },
    {
      term: "Watch Time",
      category: "Metrics",
      definition: "The total amount of time viewers have spent watching your videos. Watch time is YouTube's most important ranking factor and directly influences algorithmic promotion.",
      example: "Increasing your average watch time from 2 to 4 minutes per video can significantly improve your rankings."
    },
    {
      term: "YouTube Partner Program (YPP)",
      category: "Monetization",
      definition: "YouTube's official program that allows creators to earn money from their content through ads, memberships, Super Chat, and other monetization features. Requires meeting specific eligibility criteria.",
      example: "Joining YPP at 1,000 subscribers and 4,000 watch hours unlocks ad revenue and other monetization tools."
    },
    {
      term: "YouTube Premium",
      category: "Platform",
      definition: "YouTube's paid subscription service that removes ads, enables background play, and provides access to YouTube Music. Premium subscribers generate higher revenue for creators than ad-supported viewers.",
      example: "YouTube Premium subscribers contribute more revenue per view since their subscription fees are shared with creators."
    }
  ];

  const categories = ['ALL', ...Array.from(new Set(glossaryTerms.map(term => term.category)))];
  const alphabet = ['ALL', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedLetter('ALL');
    setSelectedCategory('ALL');
  };

  const filteredTerms = glossaryTerms.filter(term => {
    const matchesSearch = searchQuery === '' || 
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.definition.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'ALL' || term.category === selectedCategory;
    
    const matchesLetter = selectedLetter === 'ALL' || 
      term.term.charAt(0).toUpperCase() === selectedLetter;

    return matchesSearch && matchesCategory && matchesLetter;
  }).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <Container>
      <ContentWrapper>
        <BackButton onClick={() => navigate('/')}>
          <i className="bx bx-arrow-back"></i>
          Back to Home
        </BackButton>

        <Header>
          <Title>YouTube Glossary</Title>
          <Subtitle>
            Complete definitions of YouTube terms, metrics, and concepts every creator should understand. 
            Master the language of YouTube to better optimize your content and grow your channel.
          </Subtitle>
          
          <SearchBox>
            <SearchIcon className="bx bx-search" />
            <SearchInput
              type="text"
              placeholder="Search terms and definitions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </SearchBox>
        </Header>

        <FilterSection>
          <FilterGroup>
            <FilterLabel>Letter:</FilterLabel>
            <Select
              value={selectedLetter}
              onChange={(e) => setSelectedLetter(e.target.value)}
            >
              {alphabet.map((letter) => (
                <option key={letter} value={letter}>
                  {letter === 'ALL' ? 'All Letters' : letter}
                </option>
              ))}
            </Select>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>Category:</FilterLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'ALL' ? 'All Categories' : category}
                </option>
              ))}
            </Select>
          </FilterGroup>

          {(selectedLetter !== 'ALL' || selectedCategory !== 'ALL' || searchQuery !== '') && (
            <ClearButton onClick={handleClearFilters}>
              <i className="bx bx-x"></i>
              Clear Filters
            </ClearButton>
          )}
        </FilterSection>

        <GlossaryGrid>
          {filteredTerms.map((item, index) => (
            <GlossaryItem key={index}>
              <div className="term">
                {item.term}
                <div className="category">{item.category}</div>
              </div>
              <div className="definition">{item.definition}</div>
              {item.example && (
                <div className="example">
                  <strong>Example:</strong> {item.example}
                </div>
              )}
            </GlossaryItem>
          ))}
        </GlossaryGrid>

        {filteredTerms.length === 0 && (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem', 
            color: '#9CA3AF' 
          }}>
            <i className="bx bx-search" style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></i>
            <h3>No terms found</h3>
            <p>Try adjusting your search or filter criteria.</p>
          </div>
        )}

        <div style={{ 
          background: '#374151', 
          borderRadius: '12px', 
          padding: '2rem', 
          textAlign: 'center', 
          marginTop: '3rem',
          border: '1px solid #4B5563'
        }}>
          <h3 style={{ color: '#F3F4F6', marginBottom: '1rem' }}>Need More Help?</h3>
          <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
            Explore our comprehensive guides and tutorials in the Education Center, or check out 
            our blog for detailed explanations of YouTube strategies and best practices.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button 
              style={{
                background: 'linear-gradient(135deg, #DC2626, #B91C1C)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
              onClick={() => navigate('/education')}
            >
              <i className="bx bx-book" style={{ marginRight: '0.5rem' }}></i>
              Education Center
            </button>
            <button 
              style={{
                background: '#6B7280',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
              onClick={() => navigate('/blog')}
            >
              <i className="bx bx-edit" style={{ marginRight: '0.5rem' }}></i>
              Read Our Blog
            </button>
          </div>
        </div>
      </ContentWrapper>
    </Container>
  );
};
