import React, { Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import ExamAdminPage from './components/pages/ExamAdminPage';
import ExamIndexPage from './components/pages/ExamIndexPage';
import ExamTakingPage from './components/pages/ExamTakingPage';
import NotFoundPage from './components/pages/NotFoundPage';
const ExamEditorPage = React.lazy(
  () => import('./components/pages/ExamEditorPage')
);
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
    element: <ExamTakingPage />,
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
  {
    path: '*',
    element: (
      <Layout>
        <NotFoundPage />
      </Layout>
    ),
  },
]);

export default router;
