import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAd } from '../../../../components/GoogleAd';
import { playbooks, Playbook } from './playbooks';
import PlaybookCard from './components/PlaybookCard';
import PlaybookModal from './components/PlaybookModal';
import {
  Container,
  BackButton,
  EnhancedHeader,
  HeaderContent,
  ToolIconBox,
  HeaderTextContent,
  ToolTitle,
  ToolDescription,
  FeaturesList,
  Feature,
  FiltersContainer,
  FilterButton,
  PlaybooksGrid,
  EmptyState,
  EmptyIcon,
  EmptyTitle,
  EmptyDescription,
  EducationalSection,
  EducationalContent,
  SectionSubTitle,
  EducationalText,
  EduFeatureList,
  EduFeatureListItem,
  EduStepByStep,
  EduStepItem,
  EduStepNumberCircle,
  EduStepContent,
  EduStepTitle
} from './styles';

const YouToolPlaybooks: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Get unique categories with counts
  const categories = useMemo(() => {
    const categoryCounts: Record<string, number> = {};
    playbooks.forEach((playbook) => {
      categoryCounts[playbook.category] = (categoryCounts[playbook.category] || 0) + 1;
    });

    return [
      { name: 'All', count: playbooks.length },
      ...Object.entries(categoryCounts).map(([name, count]) => ({ name, count }))
    ];
  }, []);

  // Filter playbooks
  const filteredPlaybooks = useMemo(() => {
    return playbooks.filter((playbook) => {
      // Category filter
      const matchesCategory =
        activeCategory === 'All' || playbook.category === activeCategory;

      return matchesCategory;
    });
  }, [activeCategory]);

  const handleCategoryClick = (categoryName: string) => {
    setActiveCategory(categoryName);
  };

  return (
    <Container>
      {/* Back Button */}
      <BackButton onClick={() => navigate('/tools')}>
        <i className="bx bx-arrow-back"></i> Back to Tools
      </BackButton>

      {/* Enhanced Header */}
      <EnhancedHeader backgroundImage="/images/tools/youtool-playbooks.jpg">
        <HeaderContent>
          <ToolIconBox>
            <i className="bx bx-book-content"></i>
          </ToolIconBox>

          <HeaderTextContent>
            <ToolTitle>YouTool Playbooks</ToolTitle>
            <ToolDescription>
              Expert-designed AI playbooks that generate custom prompts for viral content,
              growth strategy, and audience analysis.
            </ToolDescription>

            <FeaturesList>
              <Feature>
                <i className="bx bx-check-circle"></i>
                <span>15+ pre-built playbooks</span>
              </Feature>
              <Feature>
                <i className="bx bx-check-circle"></i>
                <span>Zero prompt writing required</span>
              </Feature>
              <Feature>
                <i className="bx bx-check-circle"></i>
                <span>Copy or open in ChatGPT/Gemini</span>
              </Feature>
            </FeaturesList>
          </HeaderTextContent>
        </HeaderContent>
      </EnhancedHeader>

      {/* Google Ad Spot */}
      <GoogleAd adSlot="1234567890" />

      {/* Educational Content */}
      <EducationalSection>

        <EducationalContent>
          <SectionSubTitle>What Are YouTool Playbooks?</SectionSubTitle>
          <EducationalText>
            YouTool Playbooks are step-by-step strategy guides written for YouTube creators at every stage of their journey. Each playbook covers a specific challenge or opportunity — from launching a new channel and optimizing for search, to growing from 1K to 10K subscribers and building a sustainable upload schedule. Every guide is practical and action-oriented, with concrete steps you can execute immediately.
          </EducationalText>
          <EducationalText>
            Unlike generic YouTube advice, these playbooks are built around the tools available on this platform. Each strategy connects to the specific tools you need to execute it — so you're not just reading theory, you have the actual tools to implement each step alongside the guide.
          </EducationalText>
        </EducationalContent>

        <EducationalContent>
          <SectionSubTitle>How to Use the Playbooks</SectionSubTitle>
          <EduStepByStep>
            <EduStepItem>
              <EduStepNumberCircle>1</EduStepNumberCircle>
              <EduStepContent>
                <EduStepTitle>Browse by Category</EduStepTitle>
                <EducationalText>
                  Use the category filters to find playbooks relevant to your current challenge. Categories include channel growth, content strategy, SEO and discoverability, monetization, and thumbnail and branding. If you're not sure where to start, browse the "Getting Started" category for foundational strategies.
                </EducationalText>
              </EduStepContent>
            </EduStepItem>
            <EduStepItem>
              <EduStepNumberCircle>2</EduStepNumberCircle>
              <EduStepContent>
                <EduStepTitle>Open a Playbook and Follow the Steps</EduStepTitle>
                <EducationalText>
                  Each playbook opens in a modal with numbered steps. Work through the steps in order — each one builds on the previous. Many steps link directly to tools on this site so you can complete the action immediately without leaving the page.
                </EducationalText>
              </EduStepContent>
            </EduStepItem>
            <EduStepItem>
              <EduStepNumberCircle>3</EduStepNumberCircle>
              <EduStepContent>
                <EduStepTitle>Revisit as Your Channel Grows</EduStepTitle>
                <EducationalText>
                  The right playbook depends on your current channel stage. A strategy that's perfect at 500 subscribers may not apply at 50,000. Bookmark this page and return to different playbooks as your channel evolves — growth introduces new challenges and opportunities that earlier-stage playbooks don't address.
                </EducationalText>
              </EduStepContent>
            </EduStepItem>
          </EduStepByStep>
        </EducationalContent>

        <EducationalContent>
          <SectionSubTitle>What Topics Do the Playbooks Cover?</SectionSubTitle>
          <EduFeatureList>
            <EduFeatureListItem>
              <i className="bx bx-check-circle"></i>
              <span><strong>Channel Launch and Setup:</strong> Everything you need to configure a new channel for discoverability from day one — channel keywords, description optimization, branding assets, and the first 10 videos strategy that establishes your niche positioning.</span>
            </EduFeatureListItem>
            <EduFeatureListItem>
              <i className="bx bx-check-circle"></i>
              <span><strong>SEO and Keyword Research:</strong> How to research what your audience is already searching for, how to structure titles and descriptions to rank in YouTube search, and how to build a keyword strategy that compounds over time rather than chasing trending topics.</span>
            </EduFeatureListItem>
            <EduFeatureListItem>
              <i className="bx bx-check-circle"></i>
              <span><strong>Thumbnail and Packaging Strategy:</strong> The psychology of click-through rates, how to design thumbnails that stand out in competitive feeds, how to A/B test thumbnail concepts before publishing, and how to build a consistent visual brand that viewers recognize instantly.</span>
            </EduFeatureListItem>
            <EduFeatureListItem>
              <i className="bx bx-check-circle"></i>
              <span><strong>Monetization and Revenue Growth:</strong> How to qualify for the YouTube Partner Program faster, how to optimize for advertiser-friendly content, how to layer multiple revenue streams beyond AdSense, and how to read your YouTube Studio analytics to identify your highest-value content.</span>
            </EduFeatureListItem>
          </EduFeatureList>
        </EducationalContent>

      </EducationalSection>

      {/* Category Filters */}
      <FiltersContainer>
        {categories.map((category) => (
          <FilterButton
            key={category.name}
            active={activeCategory === category.name}
            onClick={() => handleCategoryClick(category.name)}
          >
            {category.name} ({category.count})
          </FilterButton>
        ))}
      </FiltersContainer>

      {/* Playbooks Grid or Empty State */}
      {filteredPlaybooks.length > 0 ? (
        <PlaybooksGrid>
          {filteredPlaybooks.map((playbook) => (
            <PlaybookCard
              key={playbook.id}
              playbook={playbook}
              onGenerate={setSelectedPlaybook}
            />
          ))}
        </PlaybooksGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <i className="bx bx-book-content"></i>
          </EmptyIcon>
          <EmptyTitle>No playbooks in this category</EmptyTitle>
          <EmptyDescription>Try browsing a different category or view all playbooks.</EmptyDescription>
          <FilterButton active={false} onClick={() => handleCategoryClick('All')}>
            View All Playbooks
          </FilterButton>
        </EmptyState>
      )}

      {/* Modal */}
      {selectedPlaybook && (
        <PlaybookModal
          playbook={selectedPlaybook}
          onClose={() => setSelectedPlaybook(null)}
        />
      )}
    </Container>
  );
};

export default YouToolPlaybooks;
