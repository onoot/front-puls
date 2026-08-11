import { useState, useEffect } from 'react';
import { pagesHttp } from '../../http/pages';
import { Preloader } from '../Common/Preloader';

const DEFAULT_PAGES = [
  { id: 'index', label: 'Главная', icon: 'fa-house' },
  { id: 'about', label: 'О компании', icon: 'fa-file-lines' },
  { id: 'catalog', label: 'Каталог', icon: 'fa-box' },
  { id: 'projects', label: 'Проекты', icon: 'fa-building' },
  { id: 'delivery', label: 'Доставка', icon: 'fa-truck' },
  { id: 'contact', label: 'Контакты', icon: 'fa-address-book' },
];

export function PageNamesPage() {
  const [names, setNames] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {}
    setSaving(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Названия страниц в навигации</h1>
          <p className="page-subtitle">Изменяйте названия страниц — они обновятся в меню сайта</p>
        </div>
      </div>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <div className="content-form">
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-icon"><i className="fa-solid fa-pen" /></span>
            <span className="form-section-title">Пункты меню</span>
          </div>
          <div className="form-section-body">
            {DEFAULT_PAGES.map(p => (
              <div key={p.id} className="form-field">
                <label className="form-field-label" htmlFor={`pagename-${p.id}`}>
                  <span><i className={`fa-solid ${p.icon}`} style={{ marginRight: 6, color: '#3b82f6' }} /> {p.label}</span>
                  <span className="form-field-tag">{p.id}</span>
                </label>
                <input
                  id={`pagename-${p.id}`}
                  value={names[p.id] ?? p.label}
                  onChange={e => setNames(prev => ({ ...prev, [p.id]: e.target.value }))}
                  placeholder={p.label}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          {saved && <span className="save-status"><i className="fa-solid fa-check" /> Сохранено</span>}
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <span className="save-btn-spinner" aria-hidden="true" />
                Сохранение…
              </>
            ) : (
              <>
                <i className="fa-solid fa-floppy-disk" aria-hidden="true" />
                Сохранить
              </>
            )}
          </button>
        </div>
      </div>}
    </div>
  );
}
