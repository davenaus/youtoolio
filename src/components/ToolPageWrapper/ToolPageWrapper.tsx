// src/components/ToolPageWrapper/ToolPageWrapper.tsx
import React from 'react';
import { SEOHead } from '../SEO';
import { toolsSEOConfig } from '../../config/toolsSEO';

interface ToolPageWrapperProps {
  toolKey: string;
  children: React.ReactNode;
  videoId?: string;
  customTitle?: string;
  customDescription?: string;
}

export const ToolPageWrapper: React.FC<ToolPageWrapperProps> = ({
  toolKey,
  children,
  videoId,
  customTitle,
  customDescription
}) => {
  const seoConfig = toolsSEOConfig[toolKey];
  
  if (!seoConfig) {
    console.warn(`SEO config not found for tool: ${toolKey}`);
    return <>{children}</>;
  }

  // Dynamic title and description based on context
  let finalTitle = customTitle || seoConfig.title;
  let finalDescription = customDescription || seoConfig.description;
  
  if (videoId && !customTitle) {
    finalTitle = `${seoConfig.title.split(' - ')[0]} - Video ${videoId}`;
  }
  
  if (videoId && !customDescription) {
    finalDescription = `${seoConfig.description} Get insights for video: ${videoId}`;
  }

  return (
    <>
      <SEOHead 
        title={finalTitle}
        description={finalDescription}
        keywords={seoConfig.keywords}
        url={`/tools/${toolKey}${videoId ? `/${videoId}` : ''}`}
        structuredData={seoConfig.structuredData}
      />
      {children}
    </>
  );
};
