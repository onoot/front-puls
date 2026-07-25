import express, { Request, Response } from 'express';

const app = express();
const API_BASE = process.env.API_BASE || 'http://backend:3000';

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
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function buildPageHtml(title: string, description: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index, follow">
  <link rel="icon" type="image/png" href="/favicon.png">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:Roboto,sans-serif;color:#333;background:#fff;line-height:1.6}
    .container{max-width:1220px;margin:0 auto;padding:0 15px}
    h1{font-family:Outfit,sans-serif;font-size:36px;margin-bottom:30px}
    h2{font-family:Outfit,sans-serif;font-size:24px;margin-bottom:15px}
    .block{background:#f7f7f7;padding:20px;margin-bottom:20px;border-radius:4px}
    .block p{white-space:pre-wrap}
    .items{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:20px}
    .item{border:1px solid #e0e0e0;padding:15px;border-radius:8px;background:#fff}
    .item img{width:100%;height:200px;object-fit:cover;border-radius:4px}
    .footer{background:#161921;color:#bdbdbd;text-align:center;padding:22px 0;margin-top:40px}
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

    const slides = (slidesRes?.data as any[]) || [];
    const stats = (statsRes?.data as any[]) || [];
    const company = (companyRes?.data as Record<string, string>) || {};
    const brands = (brandsRes?.data as any[]) || [];
    const letters = (lettersRes?.data as any[]) || [];
    const projects: any[] = (projectsRes?.data as any)?.items || [];
    const about = (aboutRes?.data as Record<string, string>) || {};

    const slidesHtml = slides.length > 0 ? `
      <section class="hero-section">
        ${slides.map(s => `
          <div class="hero-slide">
            ${s.photo ? `<img class="hero-slide-img" src="/uploads/${escapeHtml(s.photo)}" alt="${escapeHtml(s.name || '')}" loading="eager">` : '<div class="hero-slide-img hero-slide-img--fallback"></div>'}
            <div class="hero-slide-overlay"></div>
            <div class="hero-slide-content container">
              ${s.name ? `<h1 class="hero-slide-title">${escapeHtml(s.name)}</h1>` : ''}
              ${s.description ? `<p class="hero-slide-desc">${escapeHtml(s.description)}</p>` : ''}
            </div>
          </div>
        `).join('')}
      </section>` : '';

    const statsHtml = stats.length > 0 ? `
      <section class="space bg-smoke">
        <div class="container">
          <div class="row gy-30">
            ${stats.map(s => `
              <div class="col-xl-3 col-md-6 text-center">
                <h3 style="font-size:42px;font-weight:700;color:var(--theme-color)">${escapeHtml(s.value || '')}</h3>
                <p style="font-size:14px;color:var(--gray-color);margin:0">${escapeHtml(s.label || '')}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>` : '';

    const aboutHtml = `
      <section class="overflow-hidden space" id="home-about">
        <div class="container">
          <div class="row align-items-center">
            <div class="col-xl-6 mb-40">
              <div class="img-box2">
                ${company.logo ? `<div class="img1"><img src="/uploads/${escapeHtml(company.logo)}" alt="О компании" loading="lazy"></div>` : '<div class="block-skeleton" style="width:100%;height:300px"></div>'}
              </div>
            </div>
            <div class="col-xl-6">
              <div class="about-card">
                <div class="title-area mb-30">
                  <span class="sub-title">О компании</span>
                  <h2 class="sec-title">${escapeHtml(about.companyCaption || 'О компании «Пульсар»')}</h2>
                </div>
                <p class="about-card_text">${escapeHtml(about.companyDescription || 'Мы — надёжный поставщик сантехнического оборудования, труб и комплектующих для застройщиков, подрядчиков и оптовых покупателей.')}</p>
                <a href="/about" class="themeholy-btn" style="margin-top:20px;display:inline-block">Подробнее о компании</a>
              </div>
            </div>
          </div>
        </div>
      </section>`;

    const projectsHtml = projects.length > 0 ? `
      <section class="space bg-smoke" id="home-projects">
        <div class="container">
          <div class="title-area text-center">
            <span class="sub-title">Портфолио</span>
            <h2 class="sec-title">Наши проекты</h2>
          </div>
          <div class="row gy-30">
            ${projects.slice(0, 8).map(p => `
              <div class="col-xl-3 col-md-4 col-sm-6">
                <div class="themeholy-product">
                  <div class="product-img">
                    ${p.photo ? `<img src="/uploads/${escapeHtml(p.photo)}" alt="${escapeHtml(p.name || '')}" loading="lazy">` : ''}
                  </div>
                  <h3 class="product-title">${escapeHtml(p.name || '')}</h3>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>` : '';

    const brandsHtml = brands.length > 0 ? `
      <section class="brand-sec1">
        <div class="container">
          <div class="title-area text-center">
            <span class="sub-title">Партнёры</span>
            <h2 class="sec-title">Наши партнёры</h2>
          </div>
          <div class="row gy-30 justify-content-center">
            ${brands.map(b => `
              <div class="col-lg-3 col-md-4 col-sm-6 text-center">
                ${b.photo ? `<img src="/uploads/${escapeHtml(b.photo)}" alt="${escapeHtml(b.name || '')}" style="max-height:80px" loading="lazy">` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </section>` : '';

    const lettersHtml = letters.length > 0 ? `
      <section class="space bg-smoke">
        <div class="container">
          <div class="title-area text-center">
            <span class="sub-title">Отзывы</span>
            <h2 class="sec-title">Благодарственные письма</h2>
          </div>
          <div class="row gy-30 justify-content-center">
            ${letters.map(l => `
              <div class="col-lg-3 col-md-4 col-sm-6 text-center">
                ${l.photo ? `<img src="/uploads/${escapeHtml(l.photo)}" alt="${escapeHtml(l.name || '')}" class="letters-item" loading="lazy">` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </section>` : '';

    const seo = await fetchApi<SeoData>('/api/seo/home');

    const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Пульсар — Сантехническое оборудование, трубы, счётчики оптом</title>
  <meta name="description" content="${escapeHtml(seo?.data?.description || 'Поставщик сантехнического оборудования, труб и счётчиков для застройщиков. Оптовые цены, доставка по всей России.')}">
  <meta name="keywords" content="${escapeHtml(seo?.data?.keywords || '')}">
  <meta name="robots" content="index, follow">
  <link rel="icon" type="image/png" href="/favicon.png">
  <link rel="stylesheet" href="/assets/main.css">
  <link rel="preload" href="/api/slides" as="fetch" crossorigin>
  <link rel="preload" href="/api/statistics" as="fetch" crossorigin>
</head>
<body>
  <div class="home-page">
    ${slidesHtml}
    ${statsHtml}
    ${aboutHtml}
    ${projectsHtml}
    ${brandsHtml}
    ${lettersHtml}
  </div>
  <script src="/assets/main.js" defer></script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error('SSR home error:', err);
    res.status(500).send('Internal Server Error');
  }
});

const FALLBACK_TITLES: Record<string, string> = {
  about: 'О компании',
  delivery: 'Доставка и оплата',
  projects: 'Наши проекты',
  contact: 'Контакты',
};

app.get('/render/:page', async (req: Request, res: Response) => {
  try {
    const pageKey = Array.isArray(req.params.page) ? req.params.page[0] : req.params.page;
    const [pageResult, seoResult, namesResult] = await Promise.all([
      fetchApi<Record<string, string>>(`/api/page/${pageKey}`),
      fetchApi<SeoData>(`/api/seo/${pageKey}`),
      fetchApi<Record<string, string>>(`/api/page-names`),
    ]);

    if (!pageResult) {
      res.status(404).send(buildPageHtml('Страница не найдена', '', '<p>Страница не найдена</p>'));
      return;
    }

    const pageNames = namesResult?.data || {};
    const seo = seoResult?.data;
    const title = (pageNames[pageKey] || seo?.title || FALLBACK_TITLES[pageKey] || 'Пульсар') + ' | Пульсар';
    const description = seo?.description || '';
    const pageData = pageResult.data || {};

    const blocks = Object.entries(pageData)
      .filter(([, v]) => typeof v === 'string')
      .map(([key, val]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());
        return `<div class="block"><h2>${escapeHtml(label)}</h2><p>${(val as string).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p></div>`;
      })
      .join('');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(buildPageHtml(title, description, blocks));
  } catch (err) {
    console.error('SSR render error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/render/catalog', async (_req: Request, res: Response) => {
  try {
    const [result, seoResult, namesResult] = await Promise.all([
      fetchApi<any>('/api/catalog/products?page=1'),
      fetchApi<SeoData>('/api/seo/catalog'),
      fetchApi<Record<string, string>>('/api/page-names'),
    ]);
    const pageNames = namesResult?.data || {};
    const title = (pageNames['catalog'] || 'Каталог') + ' | Пульсар';
    const description = seoResult?.data?.description || '';
    const items: any[] = (result?.data as any)?.items || [];
    const itemsHtml = items.length > 0
      ? `<div class="items">${items.map((item: any) => `<div class="item"><h3>${escapeHtml(item.name || '')}</h3><p>${escapeHtml(item.description || '')}</p></div>`).join('')}</div>`
      : '<p>Товары не найдены</p>';
    res.send(buildPageHtml(title, description, itemsHtml));
  } catch (err) {
    console.error('SSR catalog error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/render/catalog/product/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const result = await fetchApi<any>(`/api/catalog/product/${id}`);
    if (!result) {
      res.status(404).send(buildPageHtml('Товар не найден', '', '<p>Товар не найден</p>'));
      return;
    }
    const item: any = result.data;
    const title = `${escapeHtml(item.name || 'Товар')} | Пульсар`;
    const description = item.description || '';
    const photos: any[] = item.photos || [];
    const photosHtml = photos.length > 0
      ? `<div class="items">${photos.map((p: any) => `<div class="item"><img src="/uploads/${escapeHtml(p.name || '')}" alt=""></div>`).join('')}</div>`
      : '';
    const bodyHtml = `
      ${photosHtml}
      <div class="block"><h2>Описание</h2><p>${escapeHtml(item.description || '')}</p></div>
    `;
    res.send(buildPageHtml(title, description, bodyHtml));
  } catch (err) {
    console.error('SSR product error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/render/projects', async (req: Request, res: Response) => {
  try {
    const catId = req.query.category;
    const url = catId ? `/api/projects/list?categoryId=${catId}` : '/api/projects/list';
    const [result, seoResult, namesResult] = await Promise.all([
      fetchApi<any>(url),
      fetchApi<SeoData>('/api/seo/projects'),
      fetchApi<Record<string, string>>('/api/page-names'),
    ]);
    const pageNames = namesResult?.data || {};
    const title = (pageNames['projects'] || 'Наши проекты') + ' | Пульсар';
    const description = seoResult?.data?.description || '';
    const items: any[] = (result?.data as any)?.items || [];
    const itemsHtml = items.length > 0
      ? `<div class="items">${items.map((item: any) => `<div class="item"><h3>${escapeHtml(item.name || '')}</h3><p>${escapeHtml(item.description || '')}</p></div>`).join('')}</div>`
      : '<p>Проекты не найдены</p>';
    res.send(buildPageHtml(title, description, itemsHtml));
  } catch (err) {
    console.error('SSR projects error:', err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/render/contact', async (_req: Request, res: Response) => {
  try {
    const [infoResult, seoResult, namesResult] = await Promise.all([
      fetchApi<Record<string, string>>('/api/company/info'),
      fetchApi<SeoData>('/api/seo/contact'),
      fetchApi<Record<string, string>>('/api/page-names'),
    ]);
    const pageNames = namesResult?.data || {};
    const title = (pageNames['contact'] || 'Контакты') + ' | Пульсар';
    const description = seoResult?.data?.description || '';
    const info = infoResult?.data || {};
    const infoHtml = Object.entries(info)
      .filter(([k]) => ['phone', 'email', 'address', 'schedule'].includes(k))
      .map(([k, v]) => `<div class="block"><h2>${escapeHtml(k)}</h2><p>${escapeHtml(v)}</p></div>`)
      .join('');
    res.send(buildPageHtml(title, description, infoHtml));
  } catch (err) {
    console.error('SSR contact error:', err);
    res.status(500).send('Internal Server Error');
  }
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`SSR server running on port ${PORT}`);
});
