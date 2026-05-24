import { useEffect, useRef } from 'react';

/**
 * Custom hook for setting page title and meta description on a per-page basis.
 */
export function useSEO({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  const prevTitle = useRef(document.title);
  const prevDescription = useRef(
    document.querySelector('meta[name="description"]')?.getAttribute('content') ?? ''
  );

  useEffect(() => {
    document.title = `${title} | Farmket`;

    if (description) {
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    return () => {
      document.title = prevTitle.current;
      if (description) {
        document.querySelector('meta[name="description"]')
          ?.setAttribute('content', prevDescription.current);
      }
    };
  }, [title, description]);
}
