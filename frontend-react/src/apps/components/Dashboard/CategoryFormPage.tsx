import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { catalogHttp } from '../../http/catalog';
import { ImagePickerField } from '../Common/ImagePickerField';
import { PropertiesEditor } from '../Common/PropertiesEditor';
import { PropertyField } from '../../types';

export function CategoryFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', photo: '', parentId: '', sort: 0, visible: true });
  const [properties, setProperties] = useState<PropertyField[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    catalogHttp.listCategories().then(r => setCategories(r.data.items || r.data));
    if (id) {
      catalogHttp.listCategories().then(r => {
        const items = r.data.items || r.data;
        const c = items.find((x: any) => x.id === Number(id));
        if (c) {
          setForm({
            name: c.name, photo: c.photo || '', parentId: (c as any).parent_id?.toString() || '',
            sort: c.sort, visible: c.visible,
          });
          if (c.properties && Array.isArray(c.properties)) {
            setProperties(c.properties);
          }
        }
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = {
      ...form,
      parentId: form.parentId ? Number(form.parentId) : null,
      properties: properties.length > 0 ? properties : null,
    };
    if (isEdit) {
      await catalogHttp.saveCategory({ id: Number(id), ...data });
    } else {
      await catalogHttp.createCategory(data);
    }
    navigate('/dashboard/categories');
  };

  return (
    <div>
      <div className="form-header">
        <h1>{isEdit ? 'Редактировать категорию' : 'Добавить категорию'}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/categories')}>Назад</button>
      </div>
      <form onSubmit={handleSubmit} className="entity-form">
        <label>Название <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></label>
        <ImagePickerField label="Фото" value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} />
        <label>
          Родительская категория
          <select value={form.parentId} onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}>
            <option value="">— Нет (корневая) —</option>
            {categories.filter((c: any) => !id || c.id !== Number(id)).map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label>Сортировка <input type="number" value={form.sort} onChange={e => setForm(p => ({ ...p, sort: Number(e.target.value) }))} /></label>
        <label>
          <input type="checkbox" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))} />
          Видимый
        </label>

        <PropertiesEditor value={properties} onChange={setProperties} />

        <button type="submit" className="btn btn-primary">Сохранить</button>
      </form>
    </div>
  );
}
