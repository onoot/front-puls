import { HomePage } from '../components/Main/HomePage';
import { AboutPage } from '../components/Main/AboutPage';
import { DeliveryPage } from '../components/Main/DeliveryPage';
import { ProjectsPage } from '../components/Main/ProjectsPage';
import { ContactPage } from '../components/Main/ContactPage';
import { CatalogPage } from '../components/Main/CatalogPage';
import { ProductPage } from '../components/Main/ProductPage';

export const mainRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/about', element: <AboutPage /> },
  { path: '/delivery', element: <DeliveryPage /> },
  { path: '/projects', element: <ProjectsPage /> },
  { path: '/contact', element: <ContactPage /> },
  { path: '/catalog', element: <CatalogPage /> },
  { path: '/catalog/:categoryId', element: <CatalogPage /> },
  { path: '/product/:id', element: <ProductPage /> },
];
