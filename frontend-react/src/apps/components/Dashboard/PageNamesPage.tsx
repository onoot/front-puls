import { useState, useEffect } from 'react';
import { pagesHttp } from '../../http/pages';
import { Preloader } from '../Common/Preloader';

const DEFAULT_PAGES = [
  { id: 'index', label: 'Главная' },
  { id: 'about', label: 'О компании' },
  { id: 'catalog', label: 'Каталог' },
  { id: 'projects', label: 'Проекты' },
  { id: 'delivery', label: 'Доставка' },
  { id: 'contact', label: 'Контакты' },
];

export function PageNamesPage() {
  const [names, setNames] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const res = await pagesHttp.getPageNames();
      setNames(res.data || {});
    } catch {}
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await pagesHttp.savePageNames(names);
      alert('Сохранено');
    } catch {}
    setSaving(false);
  };

  return (
    <div>
      <h1>Названия страниц в навигации</h1>
      <p style={{ color: '#888', marginBottom: 20 }}>Изменяйте названия страниц — они обновятся в меню сайта.</p>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <div className="entity-form">
        {DEFAULT_PAGES.map(p => (
          <label key={p.id}>
            {p.label}
            <input
              value={names[p.id] ?? p.label}
              onChange={e => setNames(prev => ({ ...prev, [p.id]: e.target.value }))}
              placeholder={p.label}
            />
          </label>
        ))}
        <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>}
    </div>
  );
}
