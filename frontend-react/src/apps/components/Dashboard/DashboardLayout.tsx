import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const navItems = [
  {
    section: 'Управление контентом',
    items: [
      { path: '/dashboard/products', label: 'Товары', icon: 'fa-box' },
      { path: '/dashboard/categories', label: 'Категории', icon: 'fa-folder-tree' },
      { path: '/dashboard/projects', label: 'Проекты', icon: 'fa-building' },
      { path: '/dashboard/slides', label: 'Слайды', icon: 'fa-sliders' },
      { path: '/dashboard/reviews', label: 'Отзывы', icon: 'fa-star' },
      { path: '/dashboard/brands', label: 'Бренды', icon: 'fa-tag' },
    ],
  },
  {
    section: 'Управление информацией',
    items: [
      { path: '/dashboard/company-info', label: 'Информация', icon: 'fa-info-circle' },
      { path: '/dashboard/pages/about', label: 'О компании', icon: 'fa-file-lines' },
      { path: '/dashboard/pages/delivery', label: 'Доставка', icon: 'fa-truck' },
      { path: '/dashboard/letters', label: 'Письма', icon: 'fa-envelope' },
      { path: '/dashboard/seo', label: 'SEO', icon: 'fa-magnifying-glass' },
      { path: '/dashboard/page-names', label: 'Названия страниц', icon: 'fa-pen' },
    ],
  },
];

export function DashboardLayout() {
  const [token, setToken] = useState(localStorage.getItem('accessToken'));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) navigate('/dashboard/login');
  }, [token, navigate]);

  useEffect(() => {
    const saved = localStorage.getItem('sidebar-open');
    if (saved !== null) setSidebarOpen(saved === 'true');
  }, []);

  const toggleSidebar = () => {
    const next = !sidebarOpen;
    setSidebarOpen(next);
    localStorage.setItem('sidebar-open', String(next));
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setToken(null);
    navigate('/dashboard/login');
  };

  if (!token) return null;

  return (
    <div className="dashboard-layout">
      <button
        className={`sidebar-toggle ${sidebarOpen ? 'shifted' : ''}`}
        onClick={toggleSidebar}
        title={sidebarOpen ? 'Скрыть меню' : 'Показать меню'}
      >
        <i className={`fa-regular ${sidebarOpen ? 'fa-bars' : 'fa-bars'}`} />
      </button>

      <aside className={`dashboard-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <Link to="/dashboard/brands">Панель управления</Link>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(group => (
            <div key={group.section}>
              <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#64748b', padding: '15px 20px 5px', letterSpacing: 1, fontWeight: 600 }}>{group.section}</div>
              {group.items.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={location.pathname.startsWith(item.path) ? 'active' : ''}
                >
                  <i className={`fa-regular ${item.icon}`} style={{ width: 18, textAlign: 'center' }} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="btn-logout">Выйти</button>
        </div>
      </aside>

      <main className={`dashboard-content ${sidebarOpen ? '' : 'expanded'}`}>
        <Outlet />
      </main>
    </div>
  );
}
