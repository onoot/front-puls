import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ProductCategory } from '../../types';
import { catalogHttp } from '../../http/catalog';
import { Paginator } from './Paginator';
import { Preloader } from '../Common/Preloader';

export function CategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    catalogHttp.listCategories(page, 20).then(r => {
      setCategories(r.data.items);
      setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleVisible = async (id: number, visible: boolean) => {
    await catalogHttp.setCategoryVisible(id, !visible);
    setCategories(prev => prev.map(c => c.id === id ? { ...c, visible: !visible } : c));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить?')) return;
    await catalogHttp.deleteCategory(id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Категории</h1>
        <Link to="/dashboard/categories/add" className="btn btn-primary">Добавить</Link>
      </div>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Название</th><th>Родитель</th><th>Фото</th><th>Сортировка</th><th>Видимость</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {categories.map(c => (
            <tr key={c.id}>
              <td>{c.id}</td>
              <td>{c.name}</td>
              <td>{categories.find(p => p.id === (c as any).parent_id)?.name || '-'}</td>
              <td>
                {(() => {
                  const isInherited = !c.photo && (c as any).parent_photo;
                  const src = (c as any).parent_photo || c.photo;
                  return src ? (
                    <div className={`photo-cell${isInherited ? ' inherited-photo' : ''}`} title={isInherited ? 'Унаследовано от родительской категории' : ''}>
                      <img src={`/uploads/${src}`} alt="" width="50" />
                      {isInherited && <span className="inherited-badge" title="Унаследовано от родительской категории">&#9432;</span>}
                    </div>
                  ) : '-';
                })()}
              </td>
              <td>{c.sort}</td>
              <td><input type="checkbox" checked={c.visible} onChange={() => toggleVisible(c.id, c.visible)} /></td>
              <td className="table-action">
                <Link to={`/dashboard/categories/edit/${c.id}`} className="btn btn-sm btn-success">Редактировать</Link>
                <button onClick={() => handleDelete(c.id)} className="btn btn-sm btn-danger">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
