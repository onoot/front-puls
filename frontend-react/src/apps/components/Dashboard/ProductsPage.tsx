import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { catalogHttp } from '../../http/catalog';
import { Paginator } from './Paginator';
import { Preloader } from '../Common/Preloader';

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    catalogHttp.listProducts(undefined, page, 20).then(r => {
      setProducts(r.data.items);
      setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleVisible = async (id: number, visible: boolean) => {
    await catalogHttp.setProductVisible(id, !visible);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, visible: !visible } : p));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить?')) return;
    await catalogHttp.deleteProduct(id);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Товары</h1>
        <Link to="/dashboard/products/add" className="btn btn-primary">Добавить</Link>
      </div>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <table className="data-table">
        <thead>
          <tr><th>ID</th><th>Название</th><th>Артикул</th><th>Фото</th><th>Категория</th><th>Видимость</th><th>Действия</th></tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.displayName || p.sku}</td>
              <td>{p.sku}</td>
              <td>
                {(() => {
                  const src = p.ownPhoto || p.categoryPhoto || p.photo;
                  const isInherited = !p.ownPhoto && !p.photo && !!p.categoryPhoto;
                  return src ? (
                    <div className={`photo-cell${isInherited ? ' inherited-photo' : ''}`} title={isInherited ? 'Унаследовано от категории' : ''}>
                      <img src={`/uploads/${src}`} alt="" width="50" height="50" style={{ objectFit: 'cover' }} />
                      {isInherited && <span className="inherited-badge">&#9432;</span>}
                    </div>
                  ) : (
                    <span style={{ color: '#ccc' }}>-</span>
                  );
                })()}
              </td>
              <td>{p.categoryName || 'Без категории'}</td>
              <td><input type="checkbox" checked={p.visible} onChange={() => toggleVisible(p.id, p.visible)} /></td>
              <td className="table-action">
                <Link to={`/dashboard/products/edit/${p.id}`} className="btn btn-sm btn-success">Редактировать</Link>
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
