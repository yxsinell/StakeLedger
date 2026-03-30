'use client';

import { useEffect, useRef } from 'react';

interface RedocViewerProps {
  specUrl: string
}

export function RedocViewer({ specUrl }: RedocViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    container.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js';
    script.async = true;

    script.onload = () => {
      if (window.Redoc) {
        window.Redoc.init(
          specUrl,
          {
            theme: {
              colors: {
                primary: { main: '#1fb6ff' },
              },
              typography: {
                fontFamily: 'Manrope, "Space Grotesk", sans-serif',
                headings: {
                  fontFamily: '"Space Grotesk", sans-serif',
                },
              },
            },
            hideDownloadButton: false,
            expandResponses: '200,201,204',
          },
          container,
        );
      }
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [specUrl]);

  return <div ref={containerRef} />;
}

declare global {
  interface Window {
    Redoc?: {
      init: (
        specUrl: string,
        options: Record<string, unknown>,
        element: HTMLElement,
      ) => void
    }
  }
}
