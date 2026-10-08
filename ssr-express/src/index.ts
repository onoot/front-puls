import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const API_BASE = process.env.API_BASE || 'http://backend:3000';
const INDEX_HTML_PATH = process.env.INDEX_HTML_PATH || '/usr/share/nginx/html/index.html';

let cachedIndexHtml: string | null = null;

function getIndexHtml(): string {
  if (cachedIndexHtml) return cachedIndexHtml;
  try {
    cachedIndexHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
  } catch {
    cachedIndexHtml = '<!DOCTYPE html><html><body><div id="root"></div></body></html>';
  }
  return cachedIndexHtml;
}

function injectDataIntoHtml(html: string, data: Record<string, any>): string {
  const script = `<script>window.__SSR_DATA__=${JSON.stringify(data)}</script>`;
  if (html.includes('</head>')) {
    return html.replace('</head>', `${script}\n</head>`);
  }
  return script + html;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface SeoData {
  id: number;
  page: string;
  title: string;
  description: string | null;
  keywords: string | null;
}

async function fetchApi<T>(path: string): Promise<ApiResponse<T> | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return await res.json() as ApiResponse<T>;
  } catch {
    return null;
  }
}

function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Escape a value that may be newline separated, turning each line into a <p>. */
function paragraphs(value: string): string {
  return value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => `<p>${escapeHtml(line)}</p>`)
    .join('');
}

/** Escape a value that is a newline separated list, rendering it as <ul>. */
function list(value: string): string {
  const items = value
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  if (items.length === 0) return '';
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
}

function imageTag(filename: string, alt: string): string {
  if (!filename) return '';
  return `<img src="/uploads/${escapeHtml(filename)}" alt="${escapeHtml(alt)}" loading="lazy">`;
}

function buildPageHtml(opts: {
  title: string;
  description: string;
  bodyHtml: string;
  canonicalPath: string;
}): string {
  const { title, description, bodyHtml, canonicalPath } = opts;
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <link rel="canonical" href="${escapeHtml(canonicalPath)}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonicalPath)}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Roboto,system-ui,sans-serif;color:#1c1f24;background:#fff;line-height:1.6}
    .container{max-width:1220px;margin:0 auto;padding:0 15px}
    h1{font-size:34px;margin-bottom:24px}
    h2{font-size:22px;margin:28px 0 12px}
    p.lead{font-size:19px;margin-bottom:16px}
    ul{padding-left:22px;margin-bottom:16px}
    li{margin-bottom:6px}
    img{max-width:100%;height:auto;border-radius:8px;margin:16px 0}
    .items{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px;margin-bottom:16px}
    .item{border:1px solid #e0e0e0;padding:15px;border-radius:8px;background:#fff}
    .item h3{font-size:17px;margin-bottom:6px}
    .item p{font-size:15px;color:#4a4f57}
    dl{display:grid;grid-template-columns:max-content 1fr;gap:8px 24px;margin-bottom:16px}
    dt{font-weight:600}
    dd{color:#4a4f57}
    .footer{border-top:1px solid #e6e6e6;color:#6b7280;text-align:center;padding:22px 0;margin-top:40px}
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(title)}</h1>
    ${bodyHtml}
  </div>
  <div class="footer">
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} Пульсар. Все права защищены.</p>
    </div>
  </div>
</body>
</html>`;
}

function sendHtml(res: Response, html: string, status = 200): void {
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(status).send(html);
}

/**
 * Hero banners are served from the built bundle, not the CMS, so the crawler
 * view has to name them explicitly. Keep in sync with HERO_BANNERS in
 * frontend-react/src/apps/components/Main/HomePage.tsx.
 */
const HERO_BANNERS = ['/1-b.jpg', '/banery-_1_.jpg', '/1509kh629_-_1_.jpg'];

const CONTACT_LABELS: Record<string, string> = {
  phone: 'Телефон',
  email: 'Email',
  address: 'Адрес',
  schedule: 'Режим работы',
};

/**
 * How each CMS field of a content page becomes markup. Fields that are not
 * listed here are never printed - printing a raw column name is exactly what
 * made the old renderer useless to crawlers.
 */
const FIELD_META: Record<string, { label: string; role: 'lead' | 'text' | 'list' | 'image' }> = {
  caption: { label: '', role: 'lead' },
  subDescription: { label: '', role: 'lead' },
  companyCaption: { label: '', role: 'lead' },
  methodsCaption: { label: '', role: 'lead' },
  posterFilename: { label: '', role: 'image' },
  companyDescription: { label: 'О компании', role: 'text' },
  deliveryDescription: { label: 'Доставка и оплата', role: 'text' },
  keyPoints: { label: 'Ключевые преимущества', role: 'list' },
  assortment: { label: 'Ассортимент продукции', role: 'list' },
  methods: { label: 'Способы доставки и оплаты', role: 'list' },
};

/** left/right column pairs, each with its own visibility flag. */
const COLUMN_BLOCKS = [
  { caption: 'leftBlockCaption', bodies: ['leftBlockDescription', 'leftBlockText'], image: 'leftBlockImage', enabledBy: 'leftBlockVisible' },
  { caption: 'rightBlockCaption', bodies: ['rightBlockDescription', 'rightBlockText'], image: null, enabledBy: 'rightBlockVisible' },
];

const FALLBACK_TITLES: Record<string, string> = {
  about: 'О компании',
  delivery: 'Доставка и оплата',
  projects: 'Наши проекты',
  contact: 'Контакты',
  catalog: 'Каталог',
};

function renderContentPage(data: Record<string, string>): string {
  const parts: string[] = [];
  const leads: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string' || !value.trim()) continue;

    if (key.endsWith('Visible')) continue;

    const meta = FIELD_META[key];
    if (!meta) continue;

    if (meta.role === 'lead') {
      leads.push(paragraphs(value));
    } else if (meta.role === 'text') {
      parts.push(`<h2>${escapeHtml(meta.label)}</h2>${paragraphs(value)}`);
    } else if (meta.role === 'list') {
      parts.push(`<h2>${escapeHtml(meta.label)}</h2>${list(value)}`);
    } else if (meta.role === 'image') {
      parts.push(imageTag(value, ''));
    }
  }

  for (const block of COLUMN_BLOCKS) {
    if (data[block.enabledBy] === '0') continue;

    const caption = data[block.caption] || '';
    const bodyKey = block.bodies.find(k => (data[k] || '').trim());
    const body = bodyKey ? (data[bodyKey] as string) : '';
    const image = block.image ? (data[block.image] as string) : '';

    const inner = (body ? list(body) : '') + imageTag(image, caption);
    if (!caption && !inner) continue;
    parts.push((caption ? `<h2>${escapeHtml(caption)}</h2>` : '') + inner);
  }

  return leads.join('') + parts.join('');
}

function renderContacts(info: Record<string, string>): string {
  const rows = Object.keys(CONTACT_LABELS)
    .filter(key => (info[key] || '').trim())
    .map(key => `<dt>${CONTACT_LABELS[key]}</dt><dd>${escapeHtml(info[key])}</dd>`)
    .join('');
  return rows ? `<dl>${rows}</dl>` : '';
}

function renderItems(items: any[]): string {
  if (items.length === 0) return '<p>Пока нет данных.</p>';
  const cards = items.map(item =>
    `<div class="item"><h3>${escapeHtml(item.name || '')}</h3><p>${escapeHtml(item.description || '')}</p></div>`
  ).join('');
  return `<div class="items">${cards}</div>`;
}

app.get('/health', (_req: Request, res: Response) => res.json({ status: 'ok' }));

app.get('/', async (_req: Request, res: Response) => {
  try {
    const [slidesRes, statsRes, companyRes, brandsRes, lettersRes, projectsRes, aboutRes] = await Promise.all([
      fetchApi<any[]>('/api/slides'),
      fetchApi<any[]>('/api/statistics'),
      fetchApi<Record<string, string>>('/api/company/info'),
      fetchApi<any[]>('/api/brands'),
      fetchApi<any[]>('/api/letters'),
      fetchApi<any>('/api/projects'),
      fetchApi<Record<string, string>>('/api/page/about'),
    ]);

    const data = {
      slides: (slidesRes?.data as any[]) || [],
      stats: (statsRes?.data as any[]) || [],
      company: (companyRes?.data as Record<string, string>) || {},
      brands: (brandsRes?.data as any[]) || [],
      letters: (lettersRes?.data as any[]) || [],
      projects: ((projectsRes?.data as any)?.items) || [],
      about: (aboutRes?.data as Record<string, string>) || {},
    };

    sendHtml(res, injectDataIntoHtml(getIndexHtml(), data));
  } catch (err) {
    console.error('SSR home error:', err);
    sendHtml(res, getIndexHtml());
  }
});

// Concrete routes must be registered before /render/:page, otherwise the
// catch-all swallows them and every page renders as an empty shell.

app.get('/render/catalog/product/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  const result = await fetchApi<any>(`/api/catalog/product/${id}`);
  if (!result) {
    sendHtml(res, buildPageHtml({
      title: 'Товар не найден | Пульсар',
      description: '',
      bodyHtml: '<p>Товар не найден.</p>',
      canonicalPath: `${req.protocol}://${req.get('host')}/catalog/product/${id}`,
    }), 404);
    return;
  }

  const item: any = result.data;
  const photos: any[] = item.photos || [];
  const gallery = photos.length
    ? `<div class="items">${photos.map((p: any) => imageTag(p.name || '', item.name || '')).join('')}</div>`
    : '';
  const description = (item.description || '').trim();
  const price = item.price ? `<p>${escapeHtml(String(item.price))}</p>` : '';

  sendHtml(res, buildPageHtml({
    title: `${item.name || 'Товар'} | Пульсар`,
    description,
    bodyHtml: `${gallery}${price}${description ? `<h2>Описание</h2>${paragraphs(description)}` : ''}`,
    canonicalPath: `${req.protocol}://${req.get('host')}/catalog/product/${id}`,
  }));
});

app.get('/render/catalog', async (req: Request, res: Response) => {
  const [result, seoResult, namesResult] = await Promise.all([
    fetchApi<any>('/api/catalog/products?page=1'),
    fetchApi<SeoData>('/api/seo/catalog'),
    fetchApi<Record<string, string>>('/api/page-names'),
  ]);
  const pageNames = namesResult?.data || {};
  const items: any[] = (result?.data as any)?.items || [];
  sendHtml(res, buildPageHtml({
    title: `${pageNames['catalog'] || 'Каталог'} | Пульсар`,
    description: seoResult?.data?.description || '',
    bodyHtml: renderItems(items),
    canonicalPath: `${req.protocol}://${req.get('host')}/catalog`,
  }));
});

app.get('/render/projects', async (req: Request, res: Response) => {
  const catId = req.query.category;
  const url = catId ? `/api/projects/list?categoryId=${catId}` : '/api/projects/list';
  const [result, seoResult, namesResult] = await Promise.all([
    fetchApi<any>(url),
    fetchApi<SeoData>('/api/seo/projects'),
    fetchApi<Record<string, string>>('/api/page-names'),
  ]);
  const pageNames = namesResult?.data || {};
  const items: any[] = (result?.data as any)?.items || [];
  sendHtml(res, buildPageHtml({
    title: `${pageNames['projects'] || 'Наши проекты'} | Пульсар`,
    description: seoResult?.data?.description || '',
    bodyHtml: renderItems(items),
    canonicalPath: `${req.protocol}://${req.get('host')}/projects`,
  }));
});

app.get('/render/contact', async (req: Request, res: Response) => {
  const [infoResult, seoResult, namesResult] = await Promise.all([
    fetchApi<Record<string, string>>('/api/company/info'),
    fetchApi<SeoData>('/api/seo/contact'),
    fetchApi<Record<string, string>>('/api/page-names'),
  ]);
  const pageNames = namesResult?.data || {};
  const info = infoResult?.data || {};
  sendHtml(res, buildPageHtml({
    title: `${pageNames['contact'] || 'Контакты'} | Пульсар`,
    description: seoResult?.data?.description || '',
    bodyHtml: renderContacts(info),
    canonicalPath: `${req.protocol}://${req.get('host')}/contact`,
  }));
});

app.get('/render', async (req: Request, res: Response) => {
  const [statsRes, companyRes, projectsRes, aboutRes] = await Promise.all([
    fetchApi<any[]>('/api/statistics'),
    fetchApi<Record<string, string>>('/api/company/info'),
    fetchApi<any>('/api/projects/list'),
    fetchApi<Record<string, string>>('/api/page/about'),
  ]);

  const stats: any[] = (statsRes?.data as any[]) || [];
  const company = (companyRes?.data as Record<string, string>) || {};
  const projects: any[] = ((projectsRes?.data as any)?.items) || [];
  const about = (aboutRes?.data as Record<string, string>) || {};

  const host = req.get('host') || '';
  const origin = `${req.protocol}://${host}`;

  const banners = HERO_BANNERS.map(src => `<img src="${src}" alt="${escapeHtml(company.slogan || 'Пульсар')}" loading="lazy">`).join('');
  const statsList = stats.length
    ? `<ul>${stats.map(s => `<li><strong>${escapeHtml(String(s.value ?? ''))}</strong> — ${escapeHtml(s.label || '')}</li>`).join('')}</ul>`
    : '';
  const aboutText = (about.companyDescription || '').trim() ? paragraphs(about.companyDescription) : '';
  const keyPoints = (about.keyPoints || '').trim() ? `<h2>Ключевые преимущества</h2>${list(about.keyPoints)}` : '';
  const aboutH2 = (about.companyCaption || '').trim() ? `<h2>${escapeHtml(about.companyCaption)}</h2>` : '';
  const projectList = projects.length ? `<h2>Наши проекты</h2>${renderItems(projects)}` : '';

  sendHtml(res, buildPageHtml({
    title: company.slogan || 'Пульсар — оптовый поставщик сантехники',
    description: about.companyDescription ? about.companyDescription.split('\n')[0] : '',
    bodyHtml: banners + (company.slogan ? `<p class="lead">${escapeHtml(company.slogan)}</p>` : '')
      + (statsList ? `<h2>Проверено объёмами</h2>${statsList}` : '')
      + aboutH2 + aboutText + keyPoints + projectList
      + `<h2>Контакты</h2>${renderContacts(company)}`,
    canonicalPath: `${origin}/`,
  }));
});

// Catch-all for CMS content pages (about, delivery, ...) has to come last.
app.get('/render/:page', async (req: Request, res: Response) => {
  const pageKey = Array.isArray(req.params.page) ? req.params.page[0] : req.params.page;
  const [pageResult, seoResult, namesResult] = await Promise.all([
    fetchApi<Record<string, string>>(`/api/page/${pageKey}`),
    fetchApi<SeoData>(`/api/seo/${pageKey}`),
    fetchApi<Record<string, string>>(`/api/page-names`),
  ]);

  const host = req.get('host') || '';
  const origin = `${req.protocol}://${host}`;

  if (!pageResult || !pageResult.data) {
    sendHtml(res, buildPageHtml({
      title: 'Страница не найдена | Пульсар',
      description: '',
      bodyHtml: '<p>Страница не найдена.</p>',
      canonicalPath: `${origin}/${pageKey}`,
    }), 404);
    return;
  }

  const pageNames = namesResult?.data || {};
  const seo = seoResult?.data;
  const title = (pageNames[pageKey] || seo?.title || FALLBACK_TITLES[pageKey] || 'Пульсар') + ' | Пульсар';
  const description = seo?.description || '';

  sendHtml(res, buildPageHtml({
    title,
    description,
    bodyHtml: renderContentPage(pageResult.data || {}),
    canonicalPath: `${origin}/${pageKey}`,
  }));
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`SSR server running on port ${PORT}`);
});