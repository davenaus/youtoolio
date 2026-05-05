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
      'Content Creation': '#E54848',
      'Strategy & Planning': '#B91C1C',
      'Competitive & Trend Analysis': '#FF8A8A',
      'Audience & Community': '#D1D5DB',
      'Technical Optimization': '#7D0000',
      'Website Building': '#ADB5BD'
    };
    return colorMap[category] || '#E54848';
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
