import React from 'react';
import { Playbook } from '../playbooks';
import {
  Card,
  CategoryBadge,
  IconBox,
  Title,
  Description,
  GenerateButton
} from './PlaybookCardStyles';

interface PlaybookCardProps {
  playbook: Playbook;
  onGenerate: (playbook: Playbook) => void;
}

const PlaybookCard: React.FC<PlaybookCardProps> = ({ playbook, onGenerate }) => {
  const getCategoryColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'Content Creation': '#3B82F6',
      'Strategy & Planning': '#10B981',
      'Competitive & Trend Analysis': '#F59E0B',
      'Audience & Community': '#8B5CF6',
      'Technical Optimization': '#EF4444',
      'Website Building': '#06B6D4'
    };
    return colorMap[category] || '#6B7280';
  };

  return (
    <Card>
      <CategoryBadge color={getCategoryColor(playbook.category)}>
        {playbook.category}
      </CategoryBadge>

      <IconBox color={getCategoryColor(playbook.category)}>
        <i className={`bx ${playbook.icon}`}></i>
      </IconBox>

      <Title>{playbook.title}</Title>
      <Description>{playbook.description}</Description>

      <GenerateButton onClick={() => onGenerate(playbook)}>
        Generate Prompt
      </GenerateButton>
    </Card>
  );
};

export default PlaybookCard;
