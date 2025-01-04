import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ExamApp from './components/ExamApp';
import ExamAdminViewer from './components/ExamAdminViewer';
import ExamEditor from './components/ExamEditor';
import Footer from '@/components/atoms/Footer';

const Navigation = () => (
  <nav className="bg-gray-100 p-4 mb-4">
    <div className="container mx-auto flex gap-4">
      <Button variant="outline" onClick={() => (window.location.href = '/')}>
        試験アプリ
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
    </div>
  </nav>
);

const Layout = ({ children }) => (
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
        <ExamEditor />
        <Footer />
      </Layout>
    ),
  },
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
