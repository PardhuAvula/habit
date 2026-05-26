import { useEffect } from 'react';

function upsertMeta(attr, key, content) {
  if (!content) return null;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  const previous = el?.getAttribute('content') ?? '';
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  return { el, previous };
}

/**
 * Updates document title, description, and social meta tags for SEO.
 */
export function usePageMeta({ title, description, path = '/' }) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const descMeta = upsertMeta('name', 'description', description);
    const ogTitle = upsertMeta('property', 'og:title', title);
    const ogDesc = upsertMeta('property', 'og:description', description);
    const twTitle = upsertMeta('name', 'twitter:title', title);
    const twDesc = upsertMeta('name', 'twitter:description', description);

    const origin = window.location.origin;
    const url = `${origin}${path}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    const previousCanonical = canonical?.getAttribute('href') ?? '';
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
    upsertMeta('property', 'og:url', url);

    return () => {
      document.title = previousTitle;
      if (descMeta?.el) descMeta.el.setAttribute('content', descMeta.previous);
      if (ogTitle?.el) ogTitle.el.setAttribute('content', ogTitle.previous);
      if (ogDesc?.el) ogDesc.el.setAttribute('content', ogDesc.previous);
      if (twTitle?.el) twTitle.el.setAttribute('content', twTitle.previous);
      if (twDesc?.el) twDesc.el.setAttribute('content', twDesc.previous);
      if (canonical) canonical.setAttribute('href', previousCanonical);
    };
  }, [title, description, path]);
}
