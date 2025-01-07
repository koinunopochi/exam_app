import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import ExamApp from './components/ExamApp';
import ExamAdminPage from './components/pages/ExamAdminPage';
import ExamIndexPage from './components/pages/ExamIndexPage';
const ExamEditorPage = React.lazy(() => import('./components/pages/ExamEditorPage'));
import ManualPage from './components/pages/ManualPage';
import HelpSupportPage from './components/pages/HelpSupportPage';
const AboutPage = React.lazy(() => import('./components/pages/AboutPage'));

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <ExamIndexPage />
      </Layout>
    ),
  },
  {
    path: '/exam',
    element: <ExamApp />,
  },
  {
    path: '/viewer',
    element: (
      <Layout>
        <ExamAdminPage />
      </Layout>
    ),
  },
  {
    path: '/editor',
    element: (
      <Layout>
        <Suspense fallback={<div>Loading...</div>}>
          <ExamEditorPage />
        </Suspense>
      </Layout>
    ),
  },
  {
    path: '/manual',
    element: (
      <Layout>
        <ManualPage />
      </Layout>
    ),
  },
  {
    path: '/help-support',
    element: (
      <Layout>
        <HelpSupportPage />
      </Layout>
    ),
  },
  {
    path: '/about',
    element: (
      <Layout>
        <Suspense fallback={<div>Loading...</div>}>
          <AboutPage />
        </Suspense>
      </Layout>
    ),
  },
]);

export default router;
