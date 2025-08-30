// src/hooks/useDocumentMeta.ts
import { useEffect } from 'react';

export interface DocumentMetaOptions {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
}

/**
 * Custom hook to manage document meta tags using React 19's native support
 * For future use when dynamic meta tags are needed
 */
export const useDocumentMeta = (options: DocumentMetaOptions) => {
  useEffect(() => {
    // Update document title if provided
    if (options.title) {
      document.title = options.title;
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };

    // Update canonical link
    const updateCanonical = (href: string) => {
      let canonical = document.querySelector('link[rel="canonical"]');
      
      if (canonical) {
        canonical.setAttribute('href', href);
      } else {
        canonical = document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        canonical.setAttribute('href', href);
        document.head.appendChild(canonical);
      }
    };

    // Update meta tags based on provided options
    if (options.description) updateMetaTag('description', options.description);
    if (options.keywords) updateMetaTag('keywords', options.keywords);
    if (options.author) updateMetaTag('author', options.author);
    
    // Open Graph tags
    if (options.ogTitle) updateMetaTag('og:title', options.ogTitle, true);
    if (options.ogDescription) updateMetaTag('og:description', options.ogDescription, true);
    if (options.ogImage) updateMetaTag('og:image', options.ogImage, true);
    
    // Twitter tags
    if (options.twitterTitle) updateMetaTag('twitter:title', options.twitterTitle, true);
    if (options.twitterDescription) updateMetaTag('twitter:description', options.twitterDescription, true);
    if (options.twitterImage) updateMetaTag('twitter:image', options.twitterImage, true);
    
    // Canonical URL
    if (options.canonical) updateCanonical(options.canonical);
  }, [options]);
};

// Alternative: DocumentMeta component for React 19 native metadata support
export interface DocumentMetaProps extends DocumentMetaOptions {
  children?: React.ReactNode;
}

/**
 * DocumentMeta component using React 19's native metadata support
 * This leverages React 19's ability to automatically hoist meta tags to <head>
 */
export const DocumentMeta: React.FC<DocumentMetaProps> = ({ 
  title, 
  description, 
  keywords, 
  author,
  ogTitle,
  ogDescription,
  ogImage,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonical,
  children 
}) => {
  return (
    <>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      
      {/* Open Graph tags */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter tags */}
      {twitterTitle && <meta property="twitter:title" content={twitterTitle} />}
      {twitterDescription && <meta property="twitter:description" content={twitterDescription} />}
      {twitterImage && <meta property="twitter:image" content={twitterImage} />}
      
      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {children}
    </>
  );
};