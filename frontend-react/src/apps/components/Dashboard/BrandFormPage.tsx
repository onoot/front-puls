import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { brandsHttp } from '../../http/brands';
import { ImagePickerField } from '../Common/ImagePickerField';

export function BrandFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', photo: '', sort: 0, visible: true });

  useEffect(() => {
    if (id) {
      brandsHttp.list().then(r => {
        const brand = r.data.find((b: any) => b.id === Number(id));
        if (brand) setForm({ name: brand.name, photo: brand.photo || '', sort: brand.sort, visible: brand.visible });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await brandsHttp.save({ id: Number(id), ...form } as any);
    } else {
      await brandsHttp.create(form as any);
    }
    navigate('/dashboard/brands');
  };

  return (
    <div>
      <div className="form-header">
        <h1>{isEdit ? 'Редактировать бренд' : 'Добавить бренд'}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/brands')}>Назад</button>
      </div>
      <form onSubmit={handleSubmit} className="entity-form">
        <label>Название <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></label>
        <ImagePickerField label="Фото" value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} />
        <label>Сортировка <input type="number" value={form.sort} onChange={e => setForm(p => ({ ...p, sort: Number(e.target.value) }))} /></label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))} />
          Видимый
        </label>
        <button type="submit" className="btn btn-primary">Сохранить</button>
      </form>
    </div>
  );
}
