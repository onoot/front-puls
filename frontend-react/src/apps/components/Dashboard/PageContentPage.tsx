import { useState, useEffect } from 'react';
import { pagesHttp } from '../../http/pages';
import { ImagePickerField } from '../Common/ImagePickerField';
import { Preloader } from '../Common/Preloader';

interface Props { page: 'about' | 'delivery' }

const PAGE_META: Record<string, { label: string; subtitle: string; icon: string }> = {
  about: { label: 'О компании', subtitle: 'Контент страницы «О компании»', icon: 'fa-file-lines' },
  delivery: { label: 'Доставка и оплата', subtitle: 'Контент страницы «Доставка и оплата»', icon: 'fa-truck' },
};

const FIELD_LABELS: Record<string, string> = {
  companyCaption: 'Заголовок',
  companyDescription: 'Описание',
  leftBlockCaption: 'Заголовок левого блока',
  leftBlockDescription: 'Описание левого блока',
  leftBlockText: 'Текст левого блока',
  caption: 'Заголовок страницы',
  deliveryDescription: 'Описание доставки',
  methods: 'Способы оплаты',
  methodsCaption: 'Заголовок способов оплаты',
  photo: 'Фото',
  leftBlockImage: 'Изображение левого блока',
};

const FIELD_GROUPS: Record<string, { icon: string; title: string; fields: { key: string; area: 'input' | 'textarea' | 'image' }[] }[]> = {
  about: [
    { icon: 'fa-image', title: 'Изображения', fields: [
      { key: 'photo', area: 'image' },
      { key: 'leftBlockImage', area: 'image' },
    ] },
    { icon: 'fa-file-lines', title: 'Основной блок', fields: [
      { key: 'companyCaption', area: 'input' },
      { key: 'companyDescription', area: 'textarea' },
    ] },
    { icon: 'fa-columns', title: 'Левый блок', fields: [
      { key: 'leftBlockCaption', area: 'input' },
      { key: 'leftBlockDescription', area: 'textarea' },
    ] },
  ],
  delivery: [
    { icon: 'fa-image', title: 'Изображения', fields: [
      { key: 'photo', area: 'image' },
    ] },
    { icon: 'fa-file-lines', title: 'Основной блок', fields: [
      { key: 'caption', area: 'input' },
      { key: 'deliveryDescription', area: 'textarea' },
    ] },
    { icon: 'fa-credit-card', title: 'Способы оплаты', fields: [
      { key: 'methodsCaption', area: 'input' },
      { key: 'methods', area: 'textarea' },
    ] },
    { icon: 'fa-columns', title: 'Левый блок', fields: [
      { key: 'leftBlockCaption', area: 'input' },
      { key: 'leftBlockText', area: 'textarea' },
    ] },
  ],
};

export function PageContentPage({ page }: Props) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [pageNames, setPageNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { load(); }, [page]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await pagesHttp.getPage(page);
      setContent(res.data);
    } catch {}
    try {
      const res = await pagesHttp.getPageNames();
      setPageNames(res.data || {});
    } catch {}
    setLoading(false);
  };

  const groups = FIELD_GROUPS[page];

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await pagesHttp.savePage(page, content);
      if (pageNames[page]) {
        await pagesHttp.savePageNames({ [page]: pageNames[page] });
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      setError('Не удалось сохранить. Попробуйте ещё раз.');
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{PAGE_META[page].label}</h1>
          <p className="page-subtitle">{PAGE_META[page].subtitle}</p>
        </div>
      </div>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <div className="content-form">
        <div className="form-section">
          <div className="form-section-header">
            <span className="form-section-icon"><i className={`fa-solid ${PAGE_META[page].icon}`} /></span>
            <span className="form-section-title">Название в меню</span>
          </div>
          <div className="form-section-body">
            <div className="form-field">
              <label className="form-field-label" htmlFor={`menu-name-${page}`}>
                Название страницы в меню
              </label>
              <input
                id={`menu-name-${page}`}
                value={pageNames[page] ?? PAGE_META[page].label}
                onChange={e => setPageNames(p => ({ ...p, [page]: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {groups.map(group => (
          <div key={group.title} className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon"><i className={`fa-solid ${group.icon}`} /></span>
              <span className="form-section-title">{group.title}</span>
            </div>
            <div className="form-section-body">
              {group.fields.map(field => (
                <div key={field.key} className="form-field">
                  <label className="form-field-label" htmlFor={`${page}-${field.key}`}>
                    <span>{FIELD_LABELS[field.key] || field.key}</span>
                    <span className="form-field-tag">{field.key}</span>
                  </label>
                  {field.area === 'image' ? (
                    <ImagePickerField
                      value={content[field.key] || ''}
                      onChange={v => setContent(p => ({ ...p, [field.key]: v }))}
                    />
                  ) : field.area === 'textarea' ? (
                    <textarea
                      id={`${page}-${field.key}`}
                      value={content[field.key] || ''}
                      onChange={e => setContent(p => ({ ...p, [field.key]: e.target.value }))}
                      rows={4}
                    />
                  ) : (
                    <input
                      id={`${page}-${field.key}`}
                      value={content[field.key] || ''}
                      onChange={e => setContent(p => ({ ...p, [field.key]: e.target.value }))}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="form-actions">
          {error && <span className="save-status error"><i className="fa-solid fa-triangle-exclamation" /> {error}</span>}
          {saved && !error && <span className="save-status"><i className="fa-solid fa-check" /> Сохранено</span>}
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
