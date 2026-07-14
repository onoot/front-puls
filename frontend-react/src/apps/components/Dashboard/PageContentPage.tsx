import { useState, useEffect } from 'react';
import { pagesHttp } from '../../http/pages';
import { ImagePickerField } from '../Common/ImagePickerField';
import { Preloader } from '../Common/Preloader';

interface Props { page: 'about' | 'delivery' }

const PAGE_LABELS: Record<string, string> = { about: 'О компании', delivery: 'Доставка и оплата' };

const ABOUT_FIELDS = ['companyCaption', 'companyDescription', 'leftBlockCaption', 'leftBlockDescription'];
const DELIVERY_FIELDS = ['caption', 'deliveryDescription', 'methods', 'methodsCaption', 'leftBlockCaption', 'leftBlockText'];

const IMAGE_FIELDS: Record<string, string[]> = {
  about: ['photo', 'leftBlockImage'],
  delivery: ['photo'],
};

export function PageContentPage({ page }: Props) {
  const [content, setContent] = useState<Record<string, string>>({});
  const [pageNames, setPageNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

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

  const fields = page === 'about' ? ABOUT_FIELDS : DELIVERY_FIELDS;
  const imageFields = IMAGE_FIELDS[page] || [];

  const handleSave = async () => {
    await pagesHttp.savePage(page, content);
    if (pageNames[page]) {
      await pagesHttp.savePageNames({ [page]: pageNames[page] });
    }
    alert('Сохранено');
  };

  return (
    <div>
      <h1>{PAGE_LABELS[page]}</h1>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <div className="entity-form">
        <label>
          Название страницы в меню
          <input
            value={pageNames[page] ?? PAGE_LABELS[page]}
            onChange={e => setPageNames(p => ({ ...p, [page]: e.target.value }))}
          />
        </label>

        {imageFields.map(key => (
          <ImagePickerField key={key} label={key} value={content[key] || ''} onChange={v => setContent(p => ({ ...p, [key]: v }))} />
        ))}

        {fields.map(key => (
          <label key={key}>
            {key}
            <textarea value={content[key] || ''} onChange={e => setContent(p => ({ ...p, [key]: e.target.value }))} rows={4} />
          </label>
        ))}
        <button onClick={handleSave} className="btn btn-primary">Сохранить</button>
      </div>}
    </div>
  );
}
