import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Slide } from '../../types';
import { sliderHttp } from '../../http/slider';
import { Paginator } from './Paginator';
import { Preloader } from '../Common/Preloader';

export function SlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    sliderHttp.list(page, 20).then(r => {
      setSlides(r.data.items);
      setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleVisible = async (id: number, visible: boolean) => {
    await sliderHttp.setVisible(id, !visible);
    setSlides(prev => prev.map(s => s.id === id ? { ...s, visible: !visible } : s));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить слайд?')) return;
    await sliderHttp.delete(id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Слайды</h1>
        <Link to="/dashboard/slides/add" className="btn btn-primary">Добавить</Link>
      </div>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Фото</th>
            <th>Описание</th>
            <th>Ссылка</th>
            <th>Видимость</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {slides.map(s => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.name}</td>
              <td className="photo-cell">{s.photo && <img src={`/uploads/${s.photo}`} alt="" />}</td>
              <td style={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.description || '—'}</td>
              <td>{s.link || '—'}</td>
              <td>
                <label className="checkbox-wrap">
                  <input type="checkbox" checked={s.visible} onChange={() => toggleVisible(s.id, s.visible)} />
                  <span className="checkbox-mark" />
                </label>
              </td>
              <td className="table-action">
                <Link to={`/dashboard/slides/edit/${s.id}`} className="btn btn-sm btn-success">Ред.</Link>
                <button onClick={() => handleDelete(s.id)} className="btn btn-sm btn-danger">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
