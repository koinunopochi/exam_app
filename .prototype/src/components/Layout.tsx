import React from 'react';
import Header from 'src/components/atoms/Header';
import Footer from 'src/components/atoms/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div className="min-h-screen flex flex-col">
    <Header />
    <main className="flex-1">
      {children}
    </main>
    <Footer />
  </div>
);

export default Layout;
