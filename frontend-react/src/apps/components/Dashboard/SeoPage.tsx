import { useState, useEffect, useRef } from 'react';
import { seoHttp } from '../../http/seo';
import { Seo } from '../../types';
import { Preloader } from '../Common/Preloader';

const TITLE_MAX = 60;
const DESC_MAX = 160;

const PAGE_NAMES: Record<string, string> = {
  '/': 'Главная страница',
  '/about': 'О нас',
  '/contacts': 'Контакты',
  '/catalog': 'Каталог',
  '/news': 'Новости',
  '/articles': 'Статьи',
  '/projects': 'Проекты',
  '/reviews': 'Отзывы',
  '/search': 'Поиск',
};

function pageName(page: string): string {
  const clean = page.length > 1 && page.endsWith('/') ? page.slice(0, -1) : page;
  if (PAGE_NAMES[clean]) return PAGE_NAMES[clean];
  const last = clean.split('/').filter(Boolean).pop();
  if (!last) return 'Главная страница';
  return last.charAt(0).toUpperCase() + last.slice(1).replace(/[-_]/g, ' ');
}

function sliceText(text: string, max: number): string {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

export function SeoPage() {
  const [pages, setPages] = useState<Seo[]>([]);
  const [loading, setLoading] = useState(true);
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [saveState, setSaveState] = useState<Record<string, 'idle' | 'saving' | 'saved'>>({});
  const timers = useRef<Record<string, number>>({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await seoHttp.list();
      const data = Array.isArray(res.data) ? res.data : res.data.items;
      setPages(data);
    } catch {}
    setLoading(false);
  };

  const handleChange = (page: string, field: 'title' | 'description' | 'keywords', value: string) => {
    setPages(prev => prev.map(p => p.page === page ? { ...p, [field]: value } : p));
    setDirty(prev => ({ ...prev, [page]: true }));
    setSaveState(prev => ({ ...prev, [page]: 'idle' }));
  };

  const handleSave = async (seo: Seo) => {
    setSaveState(prev => ({ ...prev, [seo.page]: 'saving' }));
    try {
      await seoHttp.save({
        page: seo.page,
        title: seo.title,
        description: seo.description ?? undefined,
        keywords: seo.keywords ?? undefined,
      });
      setDirty(prev => ({ ...prev, [seo.page]: false }));
      setSaveState(prev => ({ ...prev, [seo.page]: 'saved' }));
      if (timers.current[seo.page]) window.clearTimeout(timers.current[seo.page]);
      timers.current[seo.page] = window.setTimeout(() => {
        setSaveState(prev => ({ ...prev, [seo.page]: 'idle' }));
      }, 2200);
    } catch {
      setSaveState(prev => ({ ...prev, [seo.page]: 'idle' }));
    }
  };

  if (loading) return <div className="page-loading"><Preloader /></div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>SEO</h1>
          <p className="seo-page-subtitle">Заголовки, описания и ключевые слова для страниц сайта</p>
        </div>
      </div>
      <div className="seo-list">
        {pages.map(seo => {
          const titleLen = (seo.title || '').length;
          const descLen = (seo.description || '').length;
          const state = saveState[seo.page] || 'idle';
          const isDirty = dirty[seo.page];
          const previewUrl = `${window.location.protocol}//${window.location.host}${seo.page}`;
          return (
            <div key={seo.page} className="seo-card">
              <div className="seo-card-header">
                <div className="seo-card-title">
                  <span className="seo-card-icon"><i className="fa-solid fa-magnifying-glass" /></span>
                  <div>
                    <div className="seo-card-name">{pageName(seo.page)}</div>
                    <span className="seo-card-path">{seo.page}</span>
                  </div>
                </div>
                <button
                  className={`seo-save-btn${state === 'saved' && !isDirty ? ' saved' : ''}`}
                  onClick={() => handleSave(seo)}
                  disabled={state === 'saving'}
                >
                  {state === 'saving' ? (
                    <span className="seo-btn-spinner" aria-hidden="true" />
                  ) : state === 'saved' && !isDirty ? (
                    <i className="fa-solid fa-check" aria-hidden="true" />
                  ) : null}
                  {state === 'saving' ? 'Сохранение…' : state === 'saved' && !isDirty ? 'Сохранено' : 'Сохранить'}
                </button>
              </div>
              <div className="seo-card-body">
                <div className="seo-fields">
                  <div className="seo-field">
                    <label className="seo-field-label" htmlFor={`seo-title-${seo.page}`}>
                      <span>Заголовок <span className="seo-field-tag">title</span></span>
                      <span className={`seo-field-count${titleLen > TITLE_MAX ? ' over' : ''}`}>{titleLen} / {TITLE_MAX}</span>
                    </label>
                    <input
                      id={`seo-title-${seo.page}`}
                      value={seo.title || ''}
                      onChange={e => handleChange(seo.page, 'title', e.target.value)}
                    />
                  </div>
                  <div className="seo-field">
                    <label className="seo-field-label" htmlFor={`seo-desc-${seo.page}`}>
                      <span>Описание <span className="seo-field-tag">description</span></span>
                      <span className={`seo-field-count${descLen > DESC_MAX ? ' over' : ''}`}>{descLen} / {DESC_MAX}</span>
                    </label>
                    <textarea
                      id={`seo-desc-${seo.page}`}
                      value={seo.description || ''}
                      onChange={e => handleChange(seo.page, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="seo-field">
                    <label className="seo-field-label" htmlFor={`seo-keywords-${seo.page}`}>
                      <span>Ключевые слова <span className="seo-field-tag">keywords</span></span>
                    </label>
                    <input
                      id={`seo-keywords-${seo.page}`}
                      value={seo.keywords || ''}
                      onChange={e => handleChange(seo.page, 'keywords', e.target.value)}
                      placeholder="через запятую"
                    />
                  </div>
                </div>
                <div className="seo-preview">
                  <div className="seo-preview-title">Превью в поиске</div>
                  <div className="google-preview">
                    <div className="google-preview-domain">
                      <span className="google-preview-favicon"><i className="fa-solid fa-magnifying-glass" /></span>
                      {window.location.host}
                    </div>
                    <div className="google-preview-title">
                      {sliceText(seo.title || '', TITLE_MAX) || <span className="google-preview-empty">Заголовок не задан</span>}
                    </div>
                    <div className="google-preview-url">{previewUrl}</div>
                    <div className="google-preview-desc">
                      {sliceText(seo.description || '', DESC_MAX) || <span className="google-preview-empty">Описание не задано</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
