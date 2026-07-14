import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { Breadcrumb } from './Breadcrumb';

const titleMap: Record<string, string> = {
  '/': 'Пульсар',
  '/about': 'О компании | Пульсар',
  '/catalog': 'Каталог | Пульсар',
  '/delivery': 'Доставка и оплата | Пульсар',
  '/projects': 'Наши проекты | Пульсар',
  '/contact': 'Контакты | Пульсар',
};

const breadcrumbMap: Record<string, { title: string; items: { label: string; href?: string }[] }> = {
  '/about': { title: 'О компании', items: [{ label: 'Главная', href: '/' }, { label: 'О компании' }] },
  '/catalog': { title: 'Каталог', items: [{ label: 'Главная', href: '/' }, { label: 'Каталог' }] },
  '/delivery': { title: 'Доставка и оплата', items: [{ label: 'Главная', href: '/' }, { label: 'Доставка и оплата' }] },
  '/projects': { title: 'Наши проекты', items: [{ label: 'Главная', href: '/' }, { label: 'Проекты' }] },
  '/contact': { title: 'Контакты', items: [{ label: 'Главная', href: '/' }, { label: 'Контакты' }] },
};

export function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const bc = breadcrumbMap[location.pathname];

  useEffect(() => {
    document.title = titleMap[location.pathname] || 'Пульсар';
  }, [location.pathname]);

  return (
    <div className="main-layout">
      <Header />
      {!isHome && bc && <Breadcrumb title={bc.title} items={bc.items} />}
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
