import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lettersHttp } from '../../http/letters';
import { ImagePickerField } from '../Common/ImagePickerField';

export function LetterFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const [form, setForm] = useState({ name: '', photo: '', sort: 0, visible: true });

  useEffect(() => {
    if (id) {
      lettersHttp.list(1, 100).then(r => {
        const item = r.data.items.find((l: any) => l.id === Number(id));
        if (item) setForm({
          name: item.name || '',
          photo: item.photo || '',
          sort: item.sort || 0,
          visible: item.visible,
        });
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEdit) {
      await lettersHttp.save({ id: Number(id), ...form } as any);
    } else {
      await lettersHttp.create(form as any);
    }
    navigate('/dashboard/letters');
  };

  return (
    <div>
      <div className="form-header">
        <h1 className="title-text">{isEdit ? 'Редактировать письмо' : 'Добавить письмо'}</h1>
        <button type="button" className="btn btn-secondary" onClick={() => navigate('/dashboard/letters')}>Назад</button>
      </div>
      <form onSubmit={handleSubmit} className="entity-form">
        <label>Название
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
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
