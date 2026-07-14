import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../components/Common/MainLayout';
import { mainRoutes } from './MainRoutes';
import { dashboardRoutes } from './DashboardRoutes';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: mainRoutes,
  },
  ...dashboardRoutes,
]);
