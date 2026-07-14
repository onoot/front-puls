import { useState, useEffect } from 'react';
import { seoHttp } from '../../http/seo';
import { Seo } from '../../types';
import { Preloader } from '../Common/Preloader';

export function SeoPage() {
  const [pages, setPages] = useState<Seo[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await seoHttp.list();
      setPages(res.data);
    } catch {}
    setLoading(false);
  };

  const handleSave = async (page: Seo) => {
    setSaving(page.page);
    try {
      await seoHttp.save(page);
    } catch {}
    setSaving(null);
  };

  const handleChange = (page: string, field: 'title' | 'description' | 'keywords', value: string) => {
    setPages(prev => prev.map(p => p.page === page ? { ...p, [field]: value } : p));
  };

  if (loading) return <div className="page-loading"><Preloader /></div>;

  return (
    <div>
      <h1>SEO / Названия страниц</h1>
      {pages.map(seo => (
        <div key={seo.page} className="seo-card">
          <div className="seo-card-header">
            <h3>{seo.page}</h3>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleSave(seo)}
              disabled={saving === seo.page}
            >
              {saving === seo.page ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
          <div className="seo-card-body">
            <label>
              Заголовок (title)
              <input value={seo.title || ''} onChange={e => handleChange(seo.page, 'title', e.target.value)} />
            </label>
            <label>
              Описание (description)
              <textarea value={seo.description || ''} onChange={e => handleChange(seo.page, 'description', e.target.value)} rows={2} />
            </label>
            <label>
              Ключевые слова (keywords)
              <input value={seo.keywords || ''} onChange={e => handleChange(seo.page, 'keywords', e.target.value)} />
            </label>
          </div>
        </div>
      ))}
    </div>
  );
}
