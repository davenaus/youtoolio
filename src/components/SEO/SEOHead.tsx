// src/components/SEO/SEOHead.tsx
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  structuredData?: object;
  canonical?: string;
  noindex?: boolean;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  url,
  type = 'website',
  structuredData,
  canonical,
  noindex = false
}) => {
  const fullTitle = title.includes('YouTool.io') ? title : `${title} | YouTool.io`;
  const fullUrl = url ? `https://youtool.io${url}` : 'https://youtool.io';
  const fullImage = image.startsWith('http') ? image : `https://youtool.io${image}`;
  const keywordsString = keywords.join(', ');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && <meta name="keywords" content={keywordsString} />}
      
      {/* Robots */}
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      {!canonical && <link rel="canonical" href={fullUrl} />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:site_name" content="YouTool.io" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />
      <meta name="twitter:url" content={fullUrl} />
      
      {/* Additional Meta */}
      <meta name="author" content="YouTool.io" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Structured Data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};
