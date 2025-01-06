import React from 'react';
import Header from 'src/components/atoms/Header';
import Footer from 'src/components/atoms/Footer';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => (
  <div>
    <Header />
    {children}
    <Footer />
  </div>
);

export default Layout;
