import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sliderHttp } from '../../http/slider';
import { ImagePickerField } from '../Common/ImagePickerField';

export function SlideFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', description: '', photo: '', link: '', sort: 0, visible: true });

  useEffect(() => {
    if (id) {
      sliderHttp.list(1, 100).then(r => {
        const slide = r.data.items.find((s: any) => s.id === Number(id));
        if (slide) setForm({
          name: slide.name || '',
          description: slide.description || '',
          photo: slide.photo || '',
          link: slide.link || '',
          sort: slide.sort || 0,
          visible: slide.visible,
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await sliderHttp.save({ id: Number(id), ...form } as any);
    } else {
      await sliderHttp.create(form as any);
    }
    navigate('/dashboard/slides');
  };

  return (
    <div>
      <div className="form-header">
        <h1 className="title-text">{isEdit ? 'Редактировать слайд' : 'Добавить слайд'}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/slides')}>Назад</button>
      </div>
      <form onSubmit={handleSubmit} className="entity-form">
        <label>Название
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
        </label>
        <label>Описание
          <textarea rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        </label>
        <label>Ссылка (куда ведёт кнопка)
          <input value={form.link} onChange={e => setForm(p => ({ ...p, link: e.target.value }))} placeholder="/catalog" />
        </label>
        <ImagePickerField label="Фото" value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} />
        <label>Сортировка
          <input type="number" value={form.sort} onChange={e => setForm(p => ({ ...p, sort: Number(e.target.value) }))} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input type="checkbox" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))} />
          Видимый
        </label>
        <button type="submit" className="btn btn-primary">Сохранить</button>
      </form>
    </div>
  );
}
