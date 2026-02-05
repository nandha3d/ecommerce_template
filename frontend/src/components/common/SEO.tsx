import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useConfig } from '../../core/config/ConfigContext';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
    noindex?: boolean;
    children?: React.ReactNode;
}

/**
 * SEO Component for managing meta tags in React SPA pages
 * Uses react-helmet-async for SSR-safe head management
 */
export const SEO: React.FC<SEOProps> = ({
    title,
    description,
    image,
    url,
    type = 'website',
    noindex = false,
    children,
}) => {
    const { config } = useConfig();
    const siteName = config['site.name'] || 'ShopKart';

    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const metaDescription = description || config['site.description'] || 'Your trusted online store';
    const ogImage = image || '/images/og-default.jpg';
    const canonicalUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={metaDescription} />
            {noindex && <meta name="robots" content="noindex, nofollow" />}

            {/* Canonical URL */}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={siteName} />
            {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={metaDescription} />
            <meta name="twitter:image" content={ogImage} />

            {children}
        </Helmet>
    );
};

export default SEO;
