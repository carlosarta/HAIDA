/**
 * Markdown Utilities
 * Utilidades para parsear y renderizar markdown de forma segura
 */

import { ReactNode } from 'react';

/**
 * Sanitiza texto para prevenir XSS
 */
export function sanitizeText(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Parsea una línea de markdown y retorna el tipo y contenido
 */
export function parseMarkdownLine(line: string, index: number): {
  type: 'h1' | 'h2' | 'h3' | 'li' | 'ol' | 'p' | 'br';
  content: string;
  key: string;
} {
  const key = `md-line-${index}`;

  if (line === '') {
    return { type: 'br', content: '', key };
  }

  if (line.startsWith('# ')) {
    return { type: 'h1', content: line.replace('# ', ''), key };
  }

  if (line.startsWith('## ')) {
    return { type: 'h2', content: line.replace('## ', ''), key };
  }

  if (line.startsWith('### ')) {
    return { type: 'h3', content: line.replace('### ', ''), key };
  }

  if (line.startsWith('- ')) {
    return { type: 'li', content: line.replace('- ', ''), key };
  }

  if (line.match(/^\d+\. /)) {
    return { type: 'ol', content: line.replace(/^\d+\. /, ''), key };
  }

  return { type: 'p', content: line, key };
}

/**
 * Procesa texto inline con formato (negrita, cursiva, código)
 */
export function processInlineFormatting(text: string): string {
  let processed = sanitizeText(text);

  // **bold**
  processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // *italic*
  processed = processed.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // `code`
  processed = processed.replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>');

  // [link](url)
  processed = processed.replace(
    /\[(.+?)\]\((.+?)\)/g,
    '<a href="$2" class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return processed;
}

/**
 * Convierte markdown a HTML de forma segura
 */
export function markdownToHtml(markdown: string): string {
  const lines = markdown.split('\n');
  const html: string[] = [];
  let inList = false;
  let inOrderedList = false;

  lines.forEach((line, index) => {
    const { type, content } = parseMarkdownLine(line, index);

    switch (type) {
      case 'h1':
        html.push(`<h1 class="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">${processInlineFormatting(content)}</h1>`);
        break;
      case 'h2':
        html.push(`<h2 class="text-xl sm:text-2xl font-semibold mt-4 sm:mt-6 mb-2 sm:mb-3">${processInlineFormatting(content)}</h2>`);
        break;
      case 'h3':
        html.push(`<h3 class="text-lg sm:text-xl font-semibold mt-3 sm:mt-4 mb-2">${processInlineFormatting(content)}</h3>`);
        break;
      case 'li':
        if (!inList) {
          html.push('<ul class="list-disc ml-6 space-y-1">');
          inList = true;
        }
        html.push(`<li class="text-sm sm:text-base">${processInlineFormatting(content)}</li>`);
        break;
      case 'ol':
        if (!inOrderedList) {
          html.push('<ol class="list-decimal ml-6 space-y-1">');
          inOrderedList = true;
        }
        html.push(`<li class="text-sm sm:text-base">${processInlineFormatting(content)}</li>`);
        break;
      case 'br':
        if (inList) {
          html.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          html.push('</ol>');
          inOrderedList = false;
        }
        html.push('<br />');
        break;
      case 'p':
        if (inList) {
          html.push('</ul>');
          inList = false;
        }
        if (inOrderedList) {
          html.push('</ol>');
          inOrderedList = false;
        }
        html.push(`<p class="mb-2 leading-relaxed text-muted-foreground text-sm sm:text-base">${processInlineFormatting(content)}</p>`);
        break;
    }
  });

  // Cerrar listas abiertas
  if (inList) html.push('</ul>');
  if (inOrderedList) html.push('</ol>');

  return html.join('\n');
}

/**
 * Extrae el título del markdown (primer H1)
 */
export function extractMarkdownTitle(markdown: string): string | null {
  const lines = markdown.split('\n');
  for (const line of lines) {
    if (line.startsWith('# ')) {
      return line.replace('# ', '').trim();
    }
  }
  return null;
}

/**
 * Cuenta palabras en markdown
 */
export function countWords(markdown: string): number {
  const text = markdown.replace(/[#*`\[\]()]/g, '');
  return text.split(/\s+/).filter(word => word.length > 0).length;
}
