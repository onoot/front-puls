import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Review } from '../../types';
import { reviewsHttp } from '../../http/reviews';
import { Paginator } from './Paginator';
import { Preloader } from '../Common/Preloader';

export function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    reviewsHttp.list(page, 20).then(r => {
      setReviews(r.data.items);
      setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleVisible = async (id: number, visible: boolean) => {
    await reviewsHttp.setVisible(id, !visible);
    setReviews(prev => prev.map(r => r.id === id ? { ...r, visible: !visible } : r));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить?')) return;
    await reviewsHttp.delete(id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Отзывы</h1>
        <Link to="/dashboard/reviews/add" className="btn btn-primary">Добавить</Link>
      </div>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Название</th><th>Текст</th><th>Фото</th><th>Сортировка</th><th>Видимость</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {reviews.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.name}{r.company ? <div className="table-sub">{r.company}</div> : null}</td>
              <td>{r.message && r.message.length > 60 ? `${r.message.slice(0, 60)}…` : r.message}</td>
              <td>{r.photo && <img src={`/uploads/${r.photo}`} alt="" width="50" />}</td>
              <td>{r.sort}</td>
              <td>
                {r.visible
                  ? <button onClick={() => toggleVisible(r.id, r.visible)} className="btn btn-sm btn-warning">Скрыть</button>
                  : <button onClick={() => toggleVisible(r.id, r.visible)} className="btn btn-sm btn-success">Показать</button>}
              </td>
              <td className="table-action">
                <Link to={`/dashboard/reviews/edit/${r.id}`} className="btn btn-sm btn-success">Ред.</Link>
                <button onClick={() => handleDelete(r.id)} className="btn btn-sm btn-danger">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
