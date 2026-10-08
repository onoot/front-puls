import { useState, useEffect } from 'react';
import { companyHttp } from '../../http/company';
import { ImagePickerField } from '../Common/ImagePickerField';
import { Preloader } from '../Common/Preloader';

interface FieldDef {
  key: string;
  label: string;
  area: 'input' | 'textarea' | 'image' | 'radio' | 'checkbox';
  options?: { value: string; label: string }[];
}

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
      { key: 'logo', label: 'Логотип (светлая версия)', area: 'image' },
      { key: 'logoDark', label: 'Логотип (тёмная версия)', area: 'image' },
      { key: 'headerPhoto', label: 'Фото шапки', area: 'image' },
      {
        key: 'headerVariant',
        label: 'Тип шапки',
        area: 'radio',
        options: [
          { value: 'light', label: 'Светлая версия' },
          { value: 'dark', label: 'Тёмная версия' },
        ],
      },
      { key: 'headerSwitchOnScroll', label: 'Менять на противоположную версию при прокрутке страницы', area: 'checkbox' },
    ],
  },
  {
    icon: 'fa-house',
    title: 'Главная страница',
    fields: [
      { key: 'heroEyebrow', label: 'Надзаголовок главного экрана', area: 'input' },
      { key: 'heroTitle', label: 'Заголовок главного экрана', area: 'input' },
      { key: 'heroTitleAccent', label: 'Акцентная часть заголовка', area: 'input' },
      { key: 'heroLead', label: 'Подзаголовок главного экрана', area: 'textarea' },
      { key: 'heroButtonPrimary', label: 'Текст главной кнопки', area: 'input' },
      { key: 'heroButtonSecondary', label: 'Текст второй кнопки', area: 'input' },
    ],
  },
  {
    icon: 'fa-layer-group',
    title: 'Заголовки секций главной',
    fields: [
      { key: 'statsEyebrow', label: 'Надзаголовок «В цифрах»', area: 'input' },
      { key: 'statsTitle', label: 'Заголовок «В цифрах»', area: 'input' },
      { key: 'brandsEyebrow', label: 'Надзаголовок «Бренды»', area: 'input' },
      { key: 'brandsTitle', label: 'Заголовок «Бренды»', area: 'input' },
      { key: 'projectsTitle', label: 'Заголовок «Наши проекты»', area: 'input' },
      { key: 'recommendEyebrow', label: 'Надзаголовок «Рекомендуем»', area: 'input' },
      { key: 'recommendTitle', label: 'Заголовок «Рекомендуем»', area: 'input' },
      { key: 'reviewsEyebrow', label: 'Надзаголовок «Отзывы»', area: 'input' },
      { key: 'reviewsTitle', label: 'Заголовок «Отзывы»', area: 'input' },
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
    icon: 'fa-diagram-project',
    title: 'Страница «Проекты»',
    fields: [
      { key: 'projectsEyebrow', label: 'Надзаголовок страницы проектов', area: 'input' },
      { key: 'projectsSubtitle', label: 'Подзаголовок страницы проектов', area: 'input' },
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
  {
    icon: 'fa-bullhorn',
    title: 'Финальный блок (CTA)',
    fields: [
      { key: 'ctaTitle', label: 'Заголовок финального блока', area: 'input' },
      { key: 'ctaText', label: 'Текст финального блока', area: 'textarea' },
      { key: 'ctaButton', label: 'Текст кнопки финального блока', area: 'input' },
    ],
  },
  {
    icon: 'fa-shoe-prints',
    title: 'Футер',
    fields: [
      { key: 'footerAbout', label: 'Описание в футере', area: 'textarea' },
      { key: 'footerBottom', label: 'Текст в нижней строке футера', area: 'input' },
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
                  ) : field.area === 'radio' ? (
                    <div className="form-field-options">
                      {(field.options || []).map(opt => (
                        <label key={opt.value} className="form-field-option">
                          <input
                            type="radio"
                            name={`company-${field.key}`}
                            checked={(info[field.key] || 'light') === opt.value}
                            onChange={() => setInfo(p => ({ ...p, [field.key]: opt.value }))}
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : field.area === 'checkbox' ? (
                    <label className="form-field-option form-field-option--check">
                      <input
                        type="checkbox"
                        checked={info[field.key] === '1'}
                        onChange={e => setInfo(p => ({ ...p, [field.key]: e.target.checked ? '1' : '0' }))}
                      />
                      <span>{field.label}</span>
                    </label>
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
