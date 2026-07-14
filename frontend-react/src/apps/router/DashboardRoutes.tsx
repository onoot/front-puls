import { DashboardLayout } from '../components/Dashboard/DashboardLayout';
import { BrandsPage } from '../components/Dashboard/BrandsPage';
import { BrandFormPage } from '../components/Dashboard/BrandFormPage';
import { ProductsPage } from '../components/Dashboard/ProductsPage';
import { ProductFormPage } from '../components/Dashboard/ProductFormPage';
import { CategoriesPage } from '../components/Dashboard/CategoriesPage';
import { CategoryFormPage } from '../components/Dashboard/CategoryFormPage';
import { ProjectsPage as DashboardProjects } from '../components/Dashboard/ProjectsPage';
import { ProjectFormPage } from '../components/Dashboard/ProjectFormPage';
import { ReviewsPage } from '../components/Dashboard/ReviewsPage';
import { ReviewFormPage } from '../components/Dashboard/ReviewFormPage';
import { SlidesPage } from '../components/Dashboard/SlidesPage';
import { SlideFormPage } from '../components/Dashboard/SlideFormPage';
import { LettersPage } from '../components/Dashboard/LettersPage';
import { LetterFormPage } from '../components/Dashboard/LetterFormPage';
import { CompanyInfoPage } from '../components/Dashboard/CompanyInfoPage';
import { PageContentPage } from '../components/Dashboard/PageContentPage';
import { SeoPage } from '../components/Dashboard/SeoPage';
import { PageNamesPage } from '../components/Dashboard/PageNamesPage';
import { LoginPage } from '../components/DashboardGuest/LoginPage';

export const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { path: 'brands', element: <BrandsPage /> },
      { path: 'brands/add', element: <BrandFormPage /> },
      { path: 'brands/edit/:id', element: <BrandFormPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/add', element: <ProductFormPage /> },
      { path: 'products/edit/:id', element: <ProductFormPage /> },
      { path: 'categories', element: <CategoriesPage /> },
      { path: 'categories/add', element: <CategoryFormPage /> },
      { path: 'categories/edit/:id', element: <CategoryFormPage /> },
      { path: 'projects', element: <DashboardProjects /> },
      { path: 'projects/add', element: <ProjectFormPage /> },
      { path: 'projects/edit/:id', element: <ProjectFormPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'reviews/add', element: <ReviewFormPage /> },
      { path: 'reviews/edit/:id', element: <ReviewFormPage /> },
      { path: 'slides', element: <SlidesPage /> },
      { path: 'slides/add', element: <SlideFormPage /> },
      { path: 'slides/edit/:id', element: <SlideFormPage /> },
      { path: 'letters', element: <LettersPage /> },
      { path: 'letters/add', element: <LetterFormPage /> },
      { path: 'letters/edit/:id', element: <LetterFormPage /> },
      { path: 'company-info', element: <CompanyInfoPage /> },
      { path: 'pages/about', element: <PageContentPage page="about" /> },
      { path: 'pages/delivery', element: <PageContentPage page="delivery" /> },
      { path: 'seo', element: <SeoPage /> },
      { path: 'page-names', element: <PageNamesPage /> },
    ],
  },
  { path: '/dashboard/login', element: <LoginPage /> },
];
