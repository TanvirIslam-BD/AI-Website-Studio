import { PageView, ThemeScope, exportHrefResolver } from '@/components/website/renderer';
import { cssVarsToText, googleFontsHref, themeToCssVars } from '@/lib/website/theme';
import type { Page, WebsiteDocument } from '@/lib/website/document';
import { WEBSITE_CSS } from './website-css';

/**
 * Production code generation.
 *
 * `react-dom/server` is imported dynamically: Next.js rejects a static import
 * of it anywhere in the app graph, and this module is only ever reached from a
 * Node route handler at request time.
 *
 * Turns a website document into a set of static files. Two properties matter:
 *
 *  1. It renders through the exact same React components as the editor canvas
 *     and the preview route, so the deployed site matches what the user saw.
 *  2. The output is plain HTML and CSS - no server code is generated, and
 *     nothing the AI produced is ever evaluated. Content is escaped by React,
 *     and the only script emitted is the fixed contact-form helper below.
 */

export type GeneratedFile = { file: string; data: string };

export type SiteMeta = {
  name: string;
  description?: string | null;
  /** Absolute production URL, when known, for canonical tags and the sitemap. */
  baseUrl?: string | null;
};

/**
 * The single script the export ships: turns the contact form into a mailto:
 * compose action so a deployed site has a working enquiry path with no backend.
 */
const CONTACT_SCRIPT = `
document.querySelectorAll('form[data-ws-contact]').forEach(function (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    var to = form.getAttribute('data-ws-email');
    if (!to) return;
    var data = new FormData(form);
    var name = String(data.get('name') || '');
    var email = String(data.get('email') || '');
    var body = String(data.get('message') || '') + '\n\n-- \n' + name + ' <' + email + '>';
    window.location.href =
      'mailto:' + to + '?subject=' + encodeURIComponent('Website enquiry from ' + name) +
      '&body=' + encodeURIComponent(body);
  });
});
`.trim();

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function pageFileName(page: Page): string {
  return page.isHome || page.slug === '' ? 'index.html' : `${page.slug}.html`;
}

export async function renderPageHtml(document: WebsiteDocument, page: Page, meta: SiteMeta): Promise<string> {
  const { renderToStaticMarkup } = await import('react-dom/server');

  const markup = renderToStaticMarkup(
    <ThemeScope theme={document.theme}>
      <PageView page={page} theme={document.theme} hrefFor={exportHrefResolver} />
    </ThemeScope>,
  );

  const title = page.seoTitle?.trim() || (page.isHome ? meta.name : `${page.name} | ${meta.name}`);
  const description = page.seoDesc?.trim() || meta.description?.trim() || '';
  const fonts = googleFontsHref(document.theme);
  const canonical = meta.baseUrl ? `${meta.baseUrl.replace(/\/$/, '')}${page.slug ? `/${page.slug}` : '/'}` : '';

  return `<!DOCTYPE html>
<html lang="en" data-ws-mode="${document.theme.mode}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
${description ? `<meta name="description" content="${escapeHtml(description)}">` : ''}
<meta property="og:title" content="${escapeHtml(title)}">
${description ? `<meta property="og:description" content="${escapeHtml(description)}">` : ''}
<meta property="og:type" content="website">
${canonical ? `<link rel="canonical" href="${escapeHtml(canonical)}">` : ''}
${fonts ? `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="${escapeHtml(fonts)}">` : ''}
<link rel="stylesheet" href="/_site.css">
<style>
:root {
${cssVarsToText(themeToCssVars(document.theme))}
}
</style>
</head>
<body>
${markup}
<script>${CONTACT_SCRIPT}</script>
</body>
</html>
`;
}

export async function generateProductionFiles(document: WebsiteDocument, meta: SiteMeta): Promise<GeneratedFile[]> {
  const files: GeneratedFile[] = await Promise.all(
    document.pages.map(async (page) => ({
      file: pageFileName(page),
      data: await renderPageHtml(document, page, meta),
    })),
  );

  files.push({ file: '_site.css', data: WEBSITE_CSS });

  // cleanUrls lets /about resolve to about.html, matching the internal links
  // the renderer emits.
  files.push({
    file: 'vercel.json',
    data: `${JSON.stringify({ cleanUrls: true, trailingSlash: false }, null, 2)}\n`,
  });

  const base = meta.baseUrl?.replace(/\/$/, '');
  files.push({
    file: 'robots.txt',
    data: `User-agent: *\nAllow: /\n${base ? `Sitemap: ${base}/sitemap.xml\n` : ''}`,
  });

  if (base) {
    const urls = document.pages
      .map((page) => `  <url><loc>${escapeHtml(`${base}${page.slug ? `/${page.slug}` : '/'}`)}</loc></url>`)
      .join('\n');
    files.push({
      file: 'sitemap.xml',
      data: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    });
  }

  return files;
}

export function totalBytes(files: GeneratedFile[]): number {
  return files.reduce((sum, file) => sum + Buffer.byteLength(file.data, 'utf8'), 0);
}
