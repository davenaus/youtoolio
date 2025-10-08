// src/components/ToolPageWrapper/ToolPageWrapper.tsx
import React from 'react';
import { SEO } from '../SEO';
import { toolsSEO, generateToolSchema } from '../../config/toolsSEO';

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
  const seoConfig = toolsSEO[toolKey];

  if (!seoConfig) {
    console.warn(`SEO config not found for tool: ${toolKey}`);
    return <>{children}</>;
  }

  // Build structured data (JSON-LD)
  const schemaData = generateToolSchema(toolKey, seoConfig);

  // Dynamic title and description
  let finalTitle = customTitle || seoConfig.title;
  let finalDescription = customDescription || seoConfig.description;

  if (videoId && !customTitle) {
    finalTitle = `${seoConfig.title.split(' - ')[0]} - Video ${videoId}`;
  }

  if (videoId && !customDescription) {
    finalDescription = `${seoConfig.description} Get insights for video: ${videoId}`;
  }

  // Canonical URL
  const canonicalUrl = `https://youtool.io/tools/${toolKey}${videoId ? `/${videoId}` : ''}`;

  return (
    <>
      <SEO
        title={finalTitle}
        description={finalDescription}
        keywords={seoConfig.keywords}
        canonical={canonicalUrl}
        schemaData={schemaData}
      />
      {children}
    </>
  );
};

export default ToolPageWrapper;
