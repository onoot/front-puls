import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Brand } from '../../types';
import { brandsHttp } from '../../http/brands';
import { Paginator } from './Paginator';
import { Preloader } from '../Common/Preloader';

export function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(() => {
    setLoading(true);
    brandsHttp.list(page, 20).then(r => {
      setBrands(r.data.items);
      setTotalPages(r.data.totalPages);
    }).finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const toggleVisible = async (id: number, visible: boolean) => {
    await brandsHttp.setVisible(id, !visible);
    setBrands(prev => prev.map(b => b.id === id ? { ...b, visible: !visible } : b));
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Удалить?')) return;
    await brandsHttp.delete(id);
    load();
  };

  const handleSort = async (ids: number[]) => {
    await brandsHttp.sort(ids);
    load();
  };

  return (
    <div>
      <div className="page-header">
        <h1>Бренды</h1>
        <Link to="/dashboard/brands/add" className="btn btn-primary">Добавить</Link>
      </div>
      {loading && <div className="page-loading"><Preloader /></div>}
      {!loading && <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Фото</th>
            <th>Сортировка</th>
            <th>Видимость</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {brands.map(brand => (
            <tr key={brand.id}>
              <td>{brand.id}</td>
              <td>{brand.name}</td>
              <td>{brand.photo && <img src={`/uploads/${brand.photo}`} alt="" width="50" />}</td>
              <td>{brand.sort}</td>
              <td>
                <input type="checkbox" checked={brand.visible} onChange={() => toggleVisible(brand.id, brand.visible)} />
              </td>
              <td className="table-action">
                <Link to={`/dashboard/brands/edit/${brand.id}`} className="btn btn-sm btn-success">Редактировать</Link>
                <button onClick={() => handleDelete(brand.id)} className="btn btn-sm btn-danger">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>}
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
