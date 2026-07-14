import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsHttp } from '../../http/projects';
import { ImagePickerField } from '../Common/ImagePickerField';

export function ProjectFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', description: '', photo: '', categoryId: '', sort: 0, visible: true });

  useEffect(() => {
    if (id) {
      projectsHttp.list().then(r => {
        const p = r.data.find((x: any) => x.id === Number(id));
        if (p) setForm({
          name: p.name, description: p.description || '', photo: p.photo || '',
          categoryId: p.categoryId?.toString() || '', sort: p.sort, visible: p.visible,
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: any = { ...form, categoryId: form.categoryId ? Number(form.categoryId) : null };
    if (isEdit) {
      await projectsHttp.save({ id: Number(id), ...data });
    } else {
      await projectsHttp.create(data);
    }
    navigate('/dashboard/projects');
  };

  return (
    <div>
      <div className="form-header">
        <h1>{isEdit ? 'Редактировать проект' : 'Добавить проект'}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/projects')}>Назад</button>
      </div>
      <form onSubmit={handleSubmit} className="entity-form">
        <label>Название <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></label>
        <label>Описание <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></label>
        <ImagePickerField label="Фото" value={form.photo} onChange={v => setForm(p => ({ ...p, photo: v }))} />
        <label>ID категории <input value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))} /></label>
        <label>Сортировка <input type="number" value={form.sort} onChange={e => setForm(p => ({ ...p, sort: Number(e.target.value) }))} /></label>
        <label>
          <input type="checkbox" checked={form.visible} onChange={e => setForm(p => ({ ...p, visible: e.target.checked }))} />
          Видимый
        </label>
        <button type="submit" className="btn btn-primary">Сохранить</button>
      </form>
    </div>
  );
}
