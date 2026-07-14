import { useState, useEffect } from 'react';
import { companyHttp } from '../../http/company';
import { ImagePickerField } from '../Common/ImagePickerField';
import { Preloader } from '../Common/Preloader';

const TEXT_FIELDS = [
  { key: 'phone', label: 'Телефон' },
  { key: 'email', label: 'Email' },
  { key: 'feedbackEmail', label: 'Email для обратной связи' },
  { key: 'address', label: 'Адрес' },
  { key: 'schedule', label: 'График работы' },
  { key: 'slogan', label: 'Слоган' },
];

const TEXTAREA_FIELDS = [
  { key: 'feedbackSubjects', label: 'Темы для обратной связи' },
  { key: 'map', label: 'Карта (HTML)' },
];

const IMAGE_FIELDS = [
  { key: 'logo', label: 'Логотип' },
  { key: 'headerPhoto', label: 'Фото шапки' },
];

export function CompanyInfoPage() {
  const [info, setInfo] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    companyHttp.getInfo().then(r => setInfo(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><Preloader /></div>;

  const handleSave = async () => {
    await companyHttp.saveInfo(info);
    alert('Сохранено');
  };

  return (
    <div>
      <h1>Информация о компании</h1>
      <div className="entity-form">
        {TEXT_FIELDS.map(f => (
          <label key={f.key}>
            {f.label}
            <input value={info[f.key] || ''} onChange={e => setInfo(p => ({ ...p, [f.key]: e.target.value }))} />
          </label>
        ))}
        {IMAGE_FIELDS.map(f => (
          <ImagePickerField key={f.key} label={f.label} value={info[f.key] || ''} onChange={v => setInfo(p => ({ ...p, [f.key]: v }))} />
        ))}
        {TEXTAREA_FIELDS.map(f => (
          <label key={f.key}>
            {f.label}
            <textarea value={info[f.key] || ''} onChange={e => setInfo(p => ({ ...p, [f.key]: e.target.value }))} rows={4} />
          </label>
        ))}
        <button onClick={handleSave} className="btn btn-primary">Сохранить</button>
      </div>
    </div>
  );
}
