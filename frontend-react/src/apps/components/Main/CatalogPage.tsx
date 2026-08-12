import { useState, useEffect, useCallback, useMemo, JSX } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { ProductCategory, Product } from '../../types';
import { catalogHttp } from '../../http/catalog';
import { Breadcrumb } from '../Common/Breadcrumb';
import { Preloader } from '../Common/Preloader';
import { ProgressiveImage } from '../Common/ProgressiveImage';
import { CatalogFilters, SelectedFilters, matchesFilters } from './CatalogFilters';

const PAGE_SIZE = 12;

export function CatalogPage() {
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<SelectedFilters>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    catalogHttp.getCategoryTree().then(r => setCategories(r.data));
  }, []);

  useEffect(() => { setPage(1); setFilters({}); }, [categoryId, search]);

  const loadProducts = useCallback(() => {
    setLoading(true);
    const catId = categoryId !== undefined ? Number(categoryId) : undefined;
    catalogHttp.getPublicProducts(catId, 1, search || undefined, 500)
      .then(r => setProducts(r.data.items))
      .finally(() => setLoading(false));
  }, [categoryId, search]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const filtered = useMemo(() => products.filter(p => matchesFilters(p, filters)), [products, filters]);

  useEffect(() => { setPage(1); }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleExpand = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const findCategory = (cats: ProductCategory[], id: number): ProductCategory | undefined => {
    for (const c of cats) {
      if (c.id === id) return c;
      if (c.children) { const f = findCategory(c.children, id); if (f) return f; }
    }
    return undefined;
  };
  const currentCategory = findCategory(categories, Number(categoryId));

  return (
    <div className="" id="catalog-page">
      {search && (
        <Breadcrumb title={`Результаты поиска: «${search}»`} items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: `Поиск: ${search}` },
        ]} />
      )}
      {!search && categoryId && currentCategory && (
        <Breadcrumb title={currentCategory.name} items={[
          { label: 'Главная', href: '/' },
          { label: 'Каталог', href: '/catalog' },
          { label: currentCategory.name },
        ]} />
      )}
      <div className="container">
        <div className="row">
          <aside className="col-lg-3">
            <div className="sidebar-area">
              <div className="widget widget_categories">
                <h3 className="widget_title">Категории</h3>
                <ul className="catalog-menu">
                  <li><Link to="/catalog" className={!categoryId ? 'active' : ''}><i className="fa-regular fa-th-list" /> Все категории</Link></li>
                  {renderCategoryTree(categories, expanded, toggleExpand, Number(categoryId))}
                </ul>
              </div>
              <CatalogFilters products={products} selected={filters} onFilterChange={setFilters} />
            </div>
          </aside>
          <div className="col-lg-9">
            {loading && <div className="section-loading"><Preloader /></div>}
            {!loading && <>
              <div className="catalog-results-info">
                <span className="catalog-results-count">Найдено: <b>{filtered.length}</b></span>
                {Object.values(filters).some(a => a.length > 0) && (
                  <button type="button" className="catalog-filters-clear" onClick={() => setFilters({})}>
                    <i className="fa-regular fa-xmark" />
                    Сбросить фильтры
                  </button>
                )}
              </div>
              <div className="row gy-30">
              {paged.length === 0 && <div className="col-12 text-center" style={{ padding: 60, color: '#999' }}>Товары не найдены</div>}
              {paged.map(p => {
                const photos = p.ownPhotos && p.ownPhotos.length > 0 ? p.ownPhotos : (p.mainPhoto ? [p.mainPhoto] : []);
                const main = p.mainPhoto || p.categoryPhoto || null;
                return (
                  <div key={p.id} className="col-xl-4 col-md-6">
                    <Link to={`/product/${p.id}`} className="dns-card">
                      <div className="dns-card-main">
                        {main ? (
                          <ProgressiveImage src={`/uploads/${main}`} alt={p.displayName || p.sku} loading="lazy" sizes="360px" />
                        ) : (
                          <div className="dns-card-placeholder"><i className="fa-regular fa-image" /></div>
                        )}
                      </div>
                      {photos.length > 1 && (
                        <div className="dns-card-thumbs">
                          {photos.map((ph, i) => (
                            <ProgressiveImage key={i} src={`/uploads/${ph}`} alt="" className={i === 0 ? 'active' : ''} sizes="80px" />
                          ))}
                        </div>
                      )}
                      <div className="dns-card-title">{p.displayName || p.sku}</div>
                    </Link>
                  </div>
                );
              })}
            </div>
            {totalPages > 1 && (
              <CatalogPaginator page={currentPage} totalPages={totalPages} onPageChange={setPage} />
            )}
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

function renderCategoryTree(
  categories: ProductCategory[],
  expanded: Set<number>,
  toggleExpand: (id: number, e: React.MouseEvent) => void,
  activeId: number,
): JSX.Element[] {
  const seen = new Set<number>();
  return categories
    .filter(c => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    })
    .map(c => {
      const hasChildren = c.children && c.children.length > 0;
      const isExpanded = expanded.has(c.id);
      const isActive = c.id === activeId;
      return (
        <li key={c.id}>
          <div className={`catalog-menu-item${isActive ? ' active' : ''}`}>
            {hasChildren && (
              <button type="button" className="catalog-expand-btn" onClick={(e) => toggleExpand(c.id, e)}>
                <i className={`fa-regular ${isExpanded ? 'fa-angle-down' : 'fa-angle-right'}`} />
              </button>
            )}
            <Link to={`/catalog/${c.id}`}>{c.name}</Link>
          </div>
          {hasChildren && isExpanded && (
            <ul>
              {renderCategoryTree(c.children!, expanded, toggleExpand, activeId)}
            </ul>
          )}
        </li>
      );
    });
}

function CatalogPaginator({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  const pages: (number | '...')[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  if (start > 1) { pages.push(1); if (start > 2) pages.push('...'); }
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages) { if (end < totalPages - 1) pages.push('...'); pages.push(totalPages); }

  return (
    <nav className="catalog-paginator">
      <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        <i className="fa-regular fa-chevron-left" />
      </button>
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="catalog-paginator-dots">...</span>
        ) : (
          <button key={p} className={p === page ? 'active' : ''} onClick={() => onPageChange(p)}>{p}</button>
        )
      )}
      <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
        <i className="fa-regular fa-chevron-right" />
      </button>
    </nav>
  );
}
