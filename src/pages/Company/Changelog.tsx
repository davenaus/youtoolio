// src/pages/Company/Changelog.tsx
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

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
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
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const SubscribeNote = styled.div`
  background: ${({ theme }) => theme.colors.dark3};
  border: 1px solid ${({ theme }) => theme.colors.dark5};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 1rem;
  text-align: center;
  
  p {
    margin: 0 0 1rem 0;
    color: ${({ theme }) => theme.colors.text.secondary};
  }
`;

const SubscribeButton = styled.button`
  background: ${({ theme }) => theme.colors.red4};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.red5};
  }
`;

const Timeline = styled.div`
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    left: 2rem;
    top: 0;
    bottom: 0;
    width: 2px;
    background: ${({ theme }) => theme.colors.dark5};
    
    @media (max-width: 768px) {
      left: 1rem;
    }
  }
`;

const ChangelogEntry = styled.div`
  position: relative;
  margin-bottom: 3rem;
  padding-left: 5rem;
  
  @media (max-width: 768px) {
    padding-left: 3rem;
  }

  &::before {
    content: '';
    position: absolute;
    left: 1.5rem;
    top: 0.75rem;
    width: 12px;
    height: 12px;
    background: ${({ theme }) => theme.colors.red4};
    border-radius: 50%;
    border: 3px solid ${({ theme }) => theme.colors.dark2};
    
    @media (max-width: 768px) {
      left: 0.5rem;
    }
  }
`;

const EntryCard = styled.div`
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
`;

const EntryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const VersionTag = styled.div`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.red4}, ${({ theme }) => theme.colors.red5});
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    font-size: 1rem;
  }
`;

const EntryDate = styled.div`
  color: ${({ theme }) => theme.colors.text.muted};
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    font-size: 1rem;
  }
`;

const EntryTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;

const EntryDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

const ChangesList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ChangeCategory = styled.div<{ type: 'new' | 'improved' | 'fixed' }>`
  h4 {
    color: ${({ type, theme }) => 
      type === 'new' ? theme.colors.success :
      type === 'improved' ? theme.colors.red6 :
      theme.colors.red3
    };
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      font-size: 1rem;
    }
  }

  ul {
    color: ${({ theme }) => theme.colors.text.secondary};
    margin: 0;
    padding-left: 1.5rem;
    
    li {
      margin-bottom: 0.25rem;
      line-height: 1.5;
    }
  }
`;

export const Changelog: React.FC = () => {
  const navigate = useNavigate();

  const changelogEntries = [
    {
      version: "v1.1.0",
      title: "New Tools & Major UX Improvements",
      date: "December 27, 2025",
      description: "Major update featuring new AI-powered tools, enhanced UI consistency across all tools, and improved user experience with modern design patterns.",
      changes: {
        new: [
          "YouTool Playbooks - Pre-built AI prompt generators for viral content, growth strategy, and audience analysis with CRT terminal effect",
          "Color Picker From Image - Extract exact hex, RGB, and HSL values from any image with pixel-perfect precision",
          "Channel ID Finder - Find any YouTube channel's ID from URLs, names, or handles",
          "Content Moderation Checker - Analyze content for policy violations and safety before publishing"
        ],
        improved: [
          "Channel Consultant - Now features loading modal with 2.5 second generation animation, enhanced with top 5 video view counts in generated prompts for better AI context",
          "Channel Consultant - Streamlined UX with hidden prompt display, showing only copy button for cleaner interface",
          "Channel Consultant - Enhanced data collection including recent videos, popular videos, and engagement metrics for comprehensive AI training",
          "YouTube Calculator - Added dual input mode: paste video link for instant calculation OR manual input for custom scenarios",
          "YouTube Calculator - Auto-detection of video category from YouTube API with automatic earnings calculation",
          "YouTube Calculator - Simplified from 4 steps to 2 steps with 50% fewer inputs for faster results",
          "YouTube Calculator - Widened revenue estimate range to ±50% for more realistic projections",
          "YouTube Calculator - Removed yearly projection display, focusing on per-video earnings",
          "Enhanced header design with background images and glowing icons across all major tools",
          "Full-width upload zones in Color Picker tool for better visual consistency",
          "Faster typing animation in YouTool Playbooks (8ms interval for snappier experience)",
          "Improved mobile responsiveness with centered layouts on small screens",
          "Updated tool icons and descriptions for better discoverability",
          "Consistent styling patterns across Video Analyzer, Channel Analyzer, and new tools",
          "Professional gradient overlays and red theme accents throughout the platform"
        ],
        fixed: [
          "Channel Consultant - Fixed typing animation by replacing with smooth loading modal",
          "Channel Consultant - API key now properly uses environment variable instead of hardcoded value",
          "Channel Consultant - Now supports all channel URL formats (handles, IDs, custom URLs)",
          "YouTube Calculator - Fixed API connection issue for video link feature",
          "YouTube Calculator - Verified all YouTube category IDs (1-29, 43) for accurate CPM calculations",
          "Color Picker From Image now properly listed in tools directory",
          "Tool card styling inconsistencies resolved",
          "Mobile layout improvements for step indicators",
          "CRT terminal keyframe animation issues in styled-components v4+"
        ]
      }
    },
    {
      version: "v1.0.0",
      title: "Initial Launch - YouTool Goes Live!",
      date: "July 1, 2025",
      description: "We're excited to announce the official launch of YouTool! After months of development and testing, we're ready to help creators analyze and optimize their YouTube content.",
      changes: {
        new: [
          "Video Analyzer - Comprehensive video performance analysis",
          "Channel Analyzer - Complete channel insights and metrics",
          "Keyword Analyzer - YouTube SEO keyword research tool",
          "Tag Generator - Smart tag suggestions for better discoverability",
          "Thumbnail Tester - A/B test your thumbnail designs",
          "Comment Downloader - Export and analyze video comments",
          "Playlist Analyzer - Analyze playlist performance and optimization",
          "YouTube Calculator - Estimate earnings and engagement metrics",
          "QR Code Generator - Create QR codes for your videos and channels",
          "Color Palette Generator - Extract colors from thumbnails",
          "Outlier Finder - Discover viral content opportunities",
          "Channel Comparer - Compare multiple channels side-by-side",
          "Comment Picker - Randomly select comments from videos",
          "Subscribe Link Generator - Create custom subscribe links",
          "YouTube Transcript Downloader - Extract video transcripts and captions"
        ],
        improved: [
          "Mobile-responsive design for all tools",
          "Fast, real-time data fetching from YouTube API",
          "Clean, professional interface with dark theme",
          "Comprehensive analytics with actionable insights"
        ],
        fixed: [
          "Initial bugs and performance optimizations",
          "Cross-browser compatibility improvements",
          "Error handling for API rate limits"
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
          <Title>Changelog</Title>
          <Subtitle>
            Track all updates, new features, and improvements to YouTool. 
            We're constantly working to make our tools better for creators.
          </Subtitle>
          
  
        </Header>

        <Timeline>
          {changelogEntries.map((entry, index) => (
            <ChangelogEntry key={index}>
              <EntryCard>
                <EntryHeader>
                  <VersionTag>
                    <i className="bx bx-rocket"></i>
                    {entry.version}
                  </VersionTag>
                  <EntryDate>
                    <i className="bx bx-calendar"></i>
                    {entry.date}
                  </EntryDate>
                </EntryHeader>

                <EntryTitle>{entry.title}</EntryTitle>
                <EntryDescription>{entry.description}</EntryDescription>

                <ChangesList>
                  {entry.changes.new && entry.changes.new.length > 0 && (
                    <ChangeCategory type="new">
                      <h4>
                        <i className="bx bx-plus-circle"></i>
                        New Features
                      </h4>
                      <ul>
                        {entry.changes.new.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </ChangeCategory>
                  )}

                  {entry.changes.improved && entry.changes.improved.length > 0 && (
                    <ChangeCategory type="improved">
                      <h4>
                        <i className="bx bx-trending-up"></i>
                        Improvements
                      </h4>
                      <ul>
                        {entry.changes.improved.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </ChangeCategory>
                  )}

                  {entry.changes.fixed && entry.changes.fixed.length > 0 && (
                    <ChangeCategory type="fixed">
                      <h4>
                        <i className="bx bx-check-circle"></i>
                        Bug Fixes
                      </h4>
                      <ul>
                        {entry.changes.fixed.map((item, itemIndex) => (
                          <li key={itemIndex}>{item}</li>
                        ))}
                      </ul>
                    </ChangeCategory>
                  )}
                </ChangesList>
              </EntryCard>
            </ChangelogEntry>
          ))}
        </Timeline>

        <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', background: '#1A1A1D', borderRadius: '12px' }}>
          <h3 style={{ color: '#F3F4F6', marginBottom: '1rem' }}>What's Coming Next?</h3>
          <p style={{ color: '#9CA3AF', marginBottom: '1.5rem' }}>
            We're constantly working on new features based on creator feedback. Have an idea for a tool 
            or feature? Let us know!
          </p>
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
            onClick={() => window.open('mailto:youtool.io.business@gmail.com?subject=Feature Request')}
          >
            <i className="bx bx-bulb" style={{ marginRight: '0.5rem' }}></i>
            Suggest a Feature
          </button>
        </div>
      </ContentWrapper>
    </Container>
  );
};
