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
import Login from './pages/admin/Login';
import Dashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminContent from './pages/admin/AdminContent';
import NewsEditor from './pages/admin/NewsEditor';
import AdminSuppliers from './pages/admin/AdminSuppliers';
import SupplierEditor from './pages/admin/SupplierEditor';
import AdminFoundries from './pages/admin/AdminFoundries';
import FoundryEditor from './pages/admin/FoundryEditor';
import AdminAds from './pages/admin/AdminAds'; // Import AdminAds
import AdEditor from './pages/admin/AdEditor'; // Import AdEditor
import ProtectedRoute from './components/ProtectedRoute';

// Wrapper to conditionally render Header/Footer based on route
const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  // Hide public header/footer on admin routes, including login
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
          <Route path="/admin/login" element={<Login />} />
          
          <Route path="/admin" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/users" element={
            <ProtectedRoute>
              <AdminUsers />
            </ProtectedRoute>
          } />
          
          <Route path="/admin/content" element={
            <ProtectedRoute>
              <AdminContent />
            </ProtectedRoute>
          } />

          <Route path="/admin/content/new" element={
            <ProtectedRoute>
              <NewsEditor />
            </ProtectedRoute>
          } />

          <Route path="/admin/content/edit/:id" element={
            <ProtectedRoute>
              <NewsEditor />
            </ProtectedRoute>
          } />

          {/* Admin Suppliers Routes */}
          <Route path="/admin/suppliers" element={
            <ProtectedRoute>
              <AdminSuppliers />
            </ProtectedRoute>
          } />

          <Route path="/admin/suppliers/new" element={
            <ProtectedRoute>
              <SupplierEditor />
            </ProtectedRoute>
          } />

          <Route path="/admin/suppliers/edit/:id" element={
            <ProtectedRoute>
              <SupplierEditor />
            </ProtectedRoute>
          } />

          {/* Admin Foundries Routes */}
          <Route path="/admin/foundries" element={
            <ProtectedRoute>
              <AdminFoundries />
            </ProtectedRoute>
          } />

          <Route path="/admin/foundries/new" element={
            <ProtectedRoute>
              <FoundryEditor />
            </ProtectedRoute>
          } />

          <Route path="/admin/foundries/edit/:id" element={
            <ProtectedRoute>
              <FoundryEditor />
            </ProtectedRoute>
          } />

          {/* Admin Ads Routes */}
          <Route path="/admin/ads" element={
            <ProtectedRoute>
              <AdminAds />
            </ProtectedRoute>
          } />

          <Route path="/admin/ads/new" element={
            <ProtectedRoute>
              <AdEditor />
            </ProtectedRoute>
          } />

          <Route path="/admin/ads/edit/:id" element={
            <ProtectedRoute>
              <AdEditor />
            </ProtectedRoute>
          } />

        </Routes>
      </LayoutWrapper>
    </Router>
  );
}

export default App;
