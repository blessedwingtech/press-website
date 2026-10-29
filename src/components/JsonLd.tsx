import React from 'react';

interface NewsArticleJsonLdProps {
  url: string;
  title: string;
  description: string;
  images: string[];
  datePublished: string;
  dateModified?: string;
  authorName: string;
  authorUrl?: string;
  publisherName?: string;
  publisherLogo?: string;
  sectionName?: string;
  isVip?: boolean;
}

export function NewsArticleJsonLd({
  url,
  title,
  description,
  images,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  publisherName = 'PressTonik',
  publisherLogo = 'https://press.bittonik.com/icon.svg',
  sectionName,
  isVip = false,
}: NewsArticleJsonLdProps) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title,
    description: description,
    image: images,
    datePublished: datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
      ...(authorUrl ? { url: authorUrl } : {}),
    },
    publisher: {
      '@type': 'NewsMediaOrganization',
      name: publisherName,
      url: 'https://press.bittonik.com',
      logo: {
        '@type': 'ImageObject',
        url: publisherLogo,
      },
    },
    inLanguage: 'fr-FR',
    isAccessibleForFree: !isVip,
  };

  if (sectionName) {
    schema.articleSection = sectionName;
  }

  // Déclaration explicite du paywall pour Google (évite pénalité cloaking)
  if (isVip) {
    schema.hasPart = {
      '@type': 'WebPageElement',
      isAccessibleForFree: false,
      cssSelector: '#article-paywall',
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteAndOrgJsonLd({ baseUrl = 'https://press.bittonik.com' }: { baseUrl?: string }) {
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'PressTonik',
    alternateName: 'PressTonik Ayiti',
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    description: 'Média numérique d\'actualités et de presse d\'investigation indépendante.',
    foundingDate: '2024',
    sameAs: [
      'https://twitter.com/presstonik',
      'https://facebook.com/presstonik',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'editorial',
      email: 'contact@bittonik.com',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'PressTonik',
    url: baseUrl,
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
