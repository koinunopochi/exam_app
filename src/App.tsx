import React, { Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Button } from './components/ui/button';
import ExamApp from './components/ExamApp';
import ExamAdminViewer from './components/ExamAdminViewer';
const ExamEditorPage = React.lazy(() => import('./components/pages/ExamEditorPage'));
import ManualPage from './components/pages/ManualPage';
import HelpSupportPage from './components/pages/HelpSupportPage';
import Footer from './components/atoms/Footer';

const Navigation = () => (
  <nav className="bg-gray-100 p-4 mb-4">
    <div className="container mx-auto flex gap-4">
      <Button variant="outline" onClick={() => (window.location.href = '/')}>
        受験する
      </Button>
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/viewer')}
      >
        結果確認
      </Button>
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/editor')}
      >
        問題作成
      </Button>
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/manual')}
      >
        操作マニュアル
      </Button>
      <Button
        variant="outline"
        onClick={() => (window.location.href = '/help-support')}
      >
        ヘルプ・サポート
      </Button>
    </div>
  </nav>
);

const Layout = ({ children }: { children: React.ReactNode }) => (
  <div>
    <Navigation />
    {children}
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <>
        <ExamApp />
      </>
    ),
  },
  {
    path: '/viewer',
    element: (
      <Layout>
        <ExamAdminViewer />
        <Footer />
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
        <Footer />
      </Layout>
    ),
  },
  {
    path: '/manual',
    element: (
      <Layout>
        <ManualPage />
        <Footer />
      </Layout>
    ),
  },
  {
    path: '/help-support',
    element: (
      <Layout>
        <HelpSupportPage />
        <Footer />
      </Layout>
    ),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
