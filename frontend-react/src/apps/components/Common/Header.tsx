import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { companyHttp } from '../../http/company';
import { catalogHttp } from '../../http/catalog';

interface CategoryNode {
  id: number;
  name: string;
  parent_id: number | null;
  children?: CategoryNode[];
}

export function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [company, setCompany] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [openSubmenus, setOpenSubmenus] = useState<Record<number, boolean>>({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    companyHttp.getInfo().then(r => setCompany(r.data)).catch(() => {});
    catalogHttp.getCategoryTree()
      .then(r => { if (r.data) setCategories(r.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [searchOpen]);

  const toggleSubmenu = (id: number) => {
    setOpenSubmenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchText.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchText.trim())}`);
      setSearchOpen(false);
      setSearchText('');
    }
  };

  const navLinks = [
    { to: '/catalog', label: 'Каталог' },
    { to: '/about', label: 'О компании' },
    { to: '/projects', label: 'Наши проекты' },
    { to: '/delivery', label: 'Доставка и оплата' },
    { to: '/contact', label: 'Контакты' },
  ];

  const renderMobileCategoryTree = (items: CategoryNode[]) => (
    <ul>
      {items.map(cat => (
        <li key={cat.id} className={cat.children?.length ? 'menu-item-has-children' : ''}>
          <Link to={`/catalog?category=${cat.id}`} onClick={() => setMenuOpen(false)}>
            {cat.name}
          </Link>
          {cat.children && cat.children.length > 0 && (
            <>
              <button className="submenu-toggle" onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleSubmenu(cat.id); }}>
                <i className={`fa-regular fa-chevron-${openSubmenus[cat.id] ? 'up' : 'down'}`} />
              </button>
              <div className={`submenu-wrapper ${openSubmenus[cat.id] ? 'open' : ''}`}>
                {renderMobileCategoryTree(cat.children)}
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <header className="themeholy-header header-layout2">
      <div className="header-top">
        <div className="container">
          <div className="row justify-content-center justify-content-lg-between align-items-center gy-2">
            <div className="col-auto d-none d-lg-block">
              <p className="header-notice">Качество никогда не выходит из моды</p>
            </div>
            <div className="col-auto">
              <div className="header-links">
                <ul>
                  {company.schedule && (
                    <li>
                      <i className="fa-regular fa-clock" />
                      {company.schedule}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky-wrapper">
        <div className="menu-area">
          <div className="container">
            <div className="row align-items-center justify-content-between">
              <div className="col-auto">
                <div className="header-logo">
                  <Link to="/">
                    {company.logo ? (
                      <img src={`/uploads/${company.logo}`} alt="Пульсар" />
                    ) : (
                      <span style={{ fontFamily: 'var(--title-font)', fontSize: 24, fontWeight: 700 }}>Пульсар</span>
                    )}
                  </Link>
                </div>
              </div>

              <div className="col">
                <div className="menu-top d-none d-xl-block">
                  <div className="row justify-content-between align-items-center mb-3">
                    <div className="col-auto d-none d-xxl-block" />
                    {company.phone && (
                      <div className="col-auto">
                        <div className="header-info">
                          <div className="icon-btn"><i className="fas fa-phone" /></div>
                          <div className="media-body">
                            <span className="header-info_label">Телефон:</span>
                            <a className="header-info_link" href={`tel:${company.phone.replace(/[^+\d]/g, '')}`}>{company.phone}</a>
                          </div>
                        </div>
                      </div>
                    )}
                    {company.email && (
                      <div className="col-auto">
                        <div className="header-info">
                          <div className="icon-btn"><i className="fas fa-envelope" /></div>
                          <div className="media-body">
                            <span className="header-info_label">E-mail:</span>
                            <a className="header-info_link" href={`mailto:${company.email}`}>{company.email}</a>
                          </div>
                        </div>
                      </div>
                    )}
                    {company.address && (
                      <div className="col-auto">
                        <div className="header-info">
                          <div className="icon-btn"><i className="fas fa-location-dot" /></div>
                          <div className="media-body">
                            <span className="header-info_label">Адрес:</span>
                            <Link className="header-info_link" to="/contact">{company.address}</Link>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="col-auto d-none d-xxl-block" />
                  </div>
                </div>

                <div className="menu-wrap">
                  <div className="row">
                    <div className="col col-md-2">
                      <nav className="main-menu d-none d-lg-inline-block">
                        <ul>
                          {navLinks.map(link => (
                            <li key={link.to}><Link to={link.to}>{link.label}</Link></li>
                          ))}
                        </ul>
                      </nav>
                      <button className="themeholy-menu-toggle d-block d-lg-none" type="button" onClick={() => setMenuOpen(true)}>
                        <i className="fa-regular fa-bars" />
                      </button>
                    </div>
                    <div className="col-auto d-block ms-auto">
                      <div className="header-button">
                        <button className="icon-btn searchBoxToggler" type="button" onClick={() => setSearchOpen(true)}>
                          <i className="fa-regular fa-search" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {searchOpen && (
        <div className="search-overlay" onClick={() => setSearchOpen(false)}>
          <div className="search-popup" onClick={e => e.stopPropagation()}>
            <button className="search-close-btn" type="button" onClick={() => setSearchOpen(false)}>
              <i className="fa-regular fa-xmark" />
            </button>
            <div className="search-popup-inner">
              <div className="search-popup-header">
                <i className="fa-regular fa-magnifying-glass" />
                <span>Поиск по сайту</span>
              </div>
              <form onSubmit={handleSearch}>
                <input
                  ref={searchInputRef}
                  placeholder="Что вы хотите найти?"
                  autoComplete="off"
                  type="text"
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  name="text"
                />
                <button type="submit">
                  <span>Найти</span>
                  <i className="fa-regular fa-arrow-right" />
                </button>
              </form>
              <div className="search-popup-hint">
                Введите название товара, артикул или категорию
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`mobile-sidebar-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
      <div className={`mobile-sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-sidebar-header">
          <div className="mobile-sidebar-logo">
            {company.logo ? (
              <Link to="/" onClick={() => setMenuOpen(false)}><img src={`/uploads/${company.logo}`} alt="Пульсар" /></Link>
            ) : (
              <Link to="/" onClick={() => setMenuOpen(false)} style={{ fontFamily: 'var(--title-font)', fontSize: 20, fontWeight: 700 }}>Пульсар</Link>
            )}
          </div>
          <button className="mobile-sidebar-close" onClick={() => setMenuOpen(false)}>
            <i className="fa-regular fa-xmark" />
          </button>
        </div>
        <nav className="mobile-sidebar-nav">
          {categories.length > 0 && (
            <div className="mobile-sidebar-catalog">
              <Link to="/catalog" className="mobile-sidebar-catalog-link" onClick={() => setMenuOpen(false)}>
                Каталог
              </Link>
              {renderMobileCategoryTree(categories)}
            </div>
          )}
          <ul className="mobile-sidebar-links">
            {navLinks.filter(l => l.to !== '/catalog').map(link => (
              <li key={link.to}>
                <Link to={link.to} onClick={() => setMenuOpen(false)}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
