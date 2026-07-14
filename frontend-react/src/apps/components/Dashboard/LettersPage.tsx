import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Letter } from '../../types';
import { lettersHttp } from '../../http/letters';
import { Paginator } from './Paginator';
import { Preloader } from '../Common/Preloader';

export function LettersPage() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    lettersHttp.list(page, 20).then(r => {
      setLetters(r.data.items);
      setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleVisible = async (id: number, visible: boolean) => {
    await lettersHttp.setVisible(id, !visible);
    setLetters(prev => prev.map(l => l.id === id ? { ...l, visible: !visible } : l));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить?')) return;
    await lettersHttp.delete(id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Письма</h1>
        <Link to="/dashboard/letters/add" className="btn btn-primary">Добавить</Link>
      </div>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Название</th><th>Фото</th><th>Сортировка</th><th>Видимость</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {letters.map(l => (
            <tr key={l.id}>
              <td>{l.id}</td>
              <td>{l.name}</td>
              <td>{l.photo && <img src={`/uploads/${l.photo}`} alt="" width="50" />}</td>
              <td>{l.sort}</td>
              <td><input type="checkbox" checked={l.visible} onChange={() => toggleVisible(l.id, l.visible)} /></td>
              <td className="table-action">
                <Link to={`/dashboard/letters/edit/${l.id}`} className="btn btn-sm btn-success">Ред.</Link>
                <button onClick={() => handleDelete(l.id)} className="btn btn-sm btn-danger">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
