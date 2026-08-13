import { useState, useEffect } from 'react';
import { companyHttp } from '../../http/company';
import { ImagePickerField } from '../Common/ImagePickerField';
import { Preloader } from '../Common/Preloader';

interface FieldDef { key: string; label: string; area: 'input' | 'textarea' | 'image' }

const GROUPS: { icon: string; title: string; fields: FieldDef[] }[] = [
  {
    icon: 'fa-phone',
    title: 'Контакты',
    fields: [
      { key: 'phone', label: 'Телефон', area: 'input' },
      { key: 'email', label: 'Email', area: 'input' },
      { key: 'feedbackEmail', label: 'Email для обратной связи', area: 'input' },
      { key: 'address', label: 'Адрес', area: 'input' },
      { key: 'schedule', label: 'График работы', area: 'input' },
    ],
  },
  {
    icon: 'fa-image',
    title: 'Логотип и шапка',
    fields: [
      { key: 'logo', label: 'Логотип', area: 'image' },
      { key: 'logoLight', label: 'Логотип для тёмной темы', area: 'image' },
      { key: 'logoDark', label: 'Логотип для светлой темы', area: 'image' },
      { key: 'headerPhoto', label: 'Фото шапки', area: 'image' },
    ],
  },
  {
    icon: 'fa-pen',
    title: 'О компании',
    fields: [
      { key: 'slogan', label: 'Слоган', area: 'input' },
      { key: 'aboutEyebrow', label: 'Надзаголовок «О компании»', area: 'input' },
      { key: 'aboutTitle', label: 'Заголовок «О компании»', area: 'input' },
      { key: 'aboutSubtitle', label: 'Подзаголовок «О компании»', area: 'input' },
      { key: 'map', label: 'Карта (HTML)', area: 'textarea' },
    ],
  },
  {
    icon: 'fa-book-open',
    title: 'Страница «Каталог»',
    fields: [
      { key: 'catalogEyebrow', label: 'Надзаголовок каталога', area: 'input' },
      { key: 'catalogTitle', label: 'Заголовок каталога', area: 'input' },
      { key: 'catalogSubtitle', label: 'Подзаголовок каталога', area: 'input' },
    ],
  },
  {
    icon: 'fa-truck',
    title: 'Страница «Доставка и оплата»',
    fields: [
      { key: 'deliveryEyebrow', label: 'Надзаголовок доставки', area: 'input' },
      { key: 'deliveryTitle', label: 'Заголовок доставки', area: 'input' },
    ],
  },
  {
    icon: 'fa-envelope',
    title: 'Форма обратной связи',
    fields: [
      { key: 'contactsEyebrow', label: 'Надзаголовок «Контакты»', area: 'input' },
      { key: 'contactsTitle', label: 'Заголовок «Контакты»', area: 'input' },
      { key: 'contactsSubtitle', label: 'Подзаголовок «Контакты»', area: 'input' },
      { key: 'contactsHeader', label: 'Заголовок блока контактов', area: 'input' },
      { key: 'feedbackSubjects', label: 'Темы для обратной связи', area: 'textarea' },
    ],
  },
];

export function CompanyInfoPage() {
  const [info, setInfo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    companyHttp.getInfo().then(r => setInfo(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><Preloader /></div>;

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await companyHttp.saveInfo(info);
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
          <h1>Информация о компании</h1>
          <p className="page-subtitle">Контакты, логотип и содержимое формы обратной связи</p>
        </div>
      </div>
      <div className="content-form">
        {GROUPS.map(group => (
          <div key={group.title} className="form-section">
            <div className="form-section-header">
              <span className="form-section-icon"><i className={`fa-solid ${group.icon}`} /></span>
              <span className="form-section-title">{group.title}</span>
            </div>
            <div className="form-section-body">
              {group.fields.map(field => (
                <div key={field.key} className="form-field">
                  <label className="form-field-label" htmlFor={`company-${field.key}`}>
                    <span>{field.label}</span>
                    <span className="form-field-tag">{field.key}</span>
                  </label>
                  {field.area === 'image' ? (
                    <ImagePickerField
                      value={info[field.key] || ''}
                      onChange={v => setInfo(p => ({ ...p, [field.key]: v }))}
                    />
                  ) : field.area === 'textarea' ? (
                    <textarea
                      id={`company-${field.key}`}
                      value={info[field.key] || ''}
                      onChange={e => setInfo(p => ({ ...p, [field.key]: e.target.value }))}
                      rows={4}
                    />
                  ) : (
                    <input
                      id={`company-${field.key}`}
                      value={info[field.key] || ''}
                      onChange={e => setInfo(p => ({ ...p, [field.key]: e.target.value }))}
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
      </div>
    </div>
  );
}
