// src/hooks/useToolSEO.tsx
import React from 'react';
import { SEOHead } from '../components/SEO';
import { toolsSEOConfig } from '../config/toolsSEO';

export const useToolSEO = (toolKey: string, videoId?: string) => {
  const seoConfig = toolsSEOConfig[toolKey];
  
  if (!seoConfig) {
    console.warn(`SEO config not found for tool: ${toolKey}`);
    return null;
  }

  // Dynamic title and description based on video data
  let dynamicTitle = seoConfig.title;
  let dynamicDescription = seoConfig.description;
  
  if (videoId) {
    dynamicTitle = `${seoConfig.title.split(' - ')[0]} - ${videoId}`;
    dynamicDescription = `${seoConfig.description} Analyzing video: ${videoId}`;
  }

  const SEOComponent = () => (
    <SEOHead 
      title={dynamicTitle}
      description={dynamicDescription}
      keywords={seoConfig.keywords}
      url={`/tools/${toolKey}`}
      structuredData={seoConfig.structuredData}
    />
  );

  return SEOComponent;
};

export default useToolSEO;
