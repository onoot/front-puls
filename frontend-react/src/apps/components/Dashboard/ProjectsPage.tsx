import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Project } from '../../types';
import { projectsHttp } from '../../http/projects';
import { Paginator } from './Paginator';
import { Preloader } from '../Common/Preloader';

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    projectsHttp.list(undefined, page, 20).then(r => {
      setProjects(r.data.items);
      setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleVisible = async (id: number, visible: boolean) => {
    await projectsHttp.setVisible(id, !visible);
    setProjects(prev => prev.map(p => p.id === id ? { ...p, visible: !visible } : p));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить?')) return;
    await projectsHttp.delete(id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Проекты</h1>
        <Link to="/dashboard/projects/add" className="btn btn-primary">Добавить</Link>
      </div>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Название</th><th>Фото</th><th>Видимость</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {projects.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.name}</td>
              <td>{p.photo && <img src={`/uploads/${p.photo}`} alt="" width="50" />}</td>
              <td><input type="checkbox" checked={p.visible} onChange={() => toggleVisible(p.id, p.visible)} /></td>
              <td className="table-action">
                <Link to={`/dashboard/projects/edit/${p.id}`} className="btn btn-sm btn-success">Редактировать</Link>
                <button onClick={() => handleDelete(p.id)} className="btn btn-sm btn-danger">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
