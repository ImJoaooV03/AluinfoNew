import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Article from './pages/Article';
import News from './pages/News';
import TechnicalArticles from './pages/TechnicalArticles';
import Ebooks from './pages/Ebooks';
import Suppliers from './pages/Suppliers';
import SupplierDetails from './pages/SupplierDetails';
import Foundries from './pages/Foundries';
import FoundryDetails from './pages/FoundryDetails';
import Advertise from './pages/Advertise';

// Admin Pages
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContent from './pages/admin/AdminContent';

// Wrapper to conditionally render Header/Footer based on route
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      {!isAdminRoute && <Header />}
      
      <div className={isAdminRoute ? "" : "flex-grow"}>
        {children}
      </div>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <LayoutWrapper>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/noticias" element={<News />} />
          <Route path="/artigos-tecnicos" element={<TechnicalArticles />} />
          <Route path="/ebooks" element={<Ebooks />} />
          <Route path="/fornecedores" element={<Suppliers />} />
          <Route path="/fundicoes" element={<Foundries />} />
          <Route path="/fundicao/:id" element={<FoundryDetails />} />
          <Route path="/fornecedor/:id" element={<SupplierDetails />} />
          <Route path="/noticia/:id" element={<Article />} />
          <Route path="/anuncie" element={<Advertise />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/content" element={<AdminContent />} />
        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
