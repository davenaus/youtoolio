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
  EmptyList
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
