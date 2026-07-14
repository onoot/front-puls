import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './apps/router';
import './styles/app.css';
import './styles/admin/app-dash.css';
import './styles/admin/dashboard.css';
import './styles/admin/custom.css';
import './styles/site.css';

function hidePreloader() {
  const el = document.getElementById('preloader');
  if (el) el.classList.add('done');
}

function App() {
  useEffect(() => { hidePreloader(); }, []);
  return <RouterProvider router={router} />;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
