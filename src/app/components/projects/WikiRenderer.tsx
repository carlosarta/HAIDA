/**
 * WikiRenderer Component
 * Componente optimizado para renderizar contenido wiki en formato markdown
 */

import { memo, useMemo } from 'react';
import { markdownToHtml } from '@/app/utils/markdown.utils';

interface WikiRendererProps {
  content: string;
  className?: string;
}

export const WikiRenderer = memo(({ content, className = '' }: WikiRendererProps) => {
  // Memoizar el HTML generado para evitar re-procesamiento
  const htmlContent = useMemo(() => markdownToHtml(content), [content]);

  return (
    <div
      className={`prose dark:prose-invert max-w-none prose-sm sm:prose-base ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
      role="article"
    />
  );
});

WikiRenderer.displayName = 'WikiRenderer';
