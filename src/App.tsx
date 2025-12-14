import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom';
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
import Events from './pages/Events';
import SearchResults from './pages/SearchResults';

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
import AdminAds from './pages/admin/AdminAds'; 
import AdEditor from './pages/admin/AdEditor';
import AdminTechnicalMaterials from './pages/admin/AdminTechnicalMaterials';
import TechnicalMaterialEditor from './pages/admin/TechnicalMaterialEditor';
import AdminLeads from './pages/admin/AdminLeads';
import AdminEbooks from './pages/admin/AdminEbooks';
import EbookEditor from './pages/admin/EbookEditor';
import AdminEvents from './pages/admin/AdminEvents';
import EventEditor from './pages/admin/EventEditor';
import AdminSettings from './pages/admin/AdminSettings';
import AdminMediaKit from './pages/admin/AdminMediaKit';
import AdminHeroCarousel from './pages/admin/AdminHeroCarousel';
import HeroSlideEditor from './pages/admin/HeroSlideEditor';
import AdminCategories from './pages/admin/AdminCategories';
import ProtectedRoute from './components/ProtectedRoute';

// Contexts
import { ToastProvider } from './contexts/ToastContext';
import { RegionProvider } from './contexts/RegionContext';

// Wrapper to conditionally render Header/Footer based on route
const LayoutWrapper = () => {
  const location = useLocation();
  // Hide public header/footer on admin routes
  const isAdminRoute = location.pathname.includes('/admin');

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans flex flex-col">
      {!isAdminRoute && <Header />}
      
      <div className={isAdminRoute ? "" : "flex-grow"}>
        <Outlet />
      </div>

      {!isAdminRoute && <Footer />}
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <Router>
        <RegionProvider>
          <Routes>
            {/* Redirect root to default region (PT) */}
            <Route path="/" element={<Navigate to="/pt" replace />} />
            
            {/* Redirect generic admin to PT admin */}
            <Route path="/admin" element={<Navigate to="/pt/admin" replace />} />

            {/* Region Routes Wrapper */}
            <Route path="/:region" element={<LayoutWrapper />}>
              
              {/* Public Routes */}
              <Route index element={<Home />} />
              <Route path="noticias" element={<News />} />
              <Route path="artigos-tecnicos" element={<TechnicalArticles />} />
              <Route path="ebooks" element={<Ebooks />} />
              <Route path="eventos" element={<Events />} />
              <Route path="fornecedores" element={<Suppliers />} />
              <Route path="fundicoes" element={<Foundries />} />
              <Route path="fundicao/:id" element={<FoundryDetails />} />
              <Route path="fornecedor/:id" element={<SupplierDetails />} />
              <Route path="noticia/:id" element={<Article />} />
              <Route path="anuncie" element={<Advertise />} />
              <Route path="busca" element={<SearchResults />} />

              {/* Admin Routes (Nested under region) */}
              <Route path="admin">
                <Route path="login" element={<Login />} />
                
                <Route index element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="users" element={
                  <ProtectedRoute>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                
                <Route path="content" element={
                  <ProtectedRoute>
                    <AdminContent />
                  </ProtectedRoute>
                } />

                <Route path="content/new" element={
                  <ProtectedRoute>
                    <NewsEditor />
                  </ProtectedRoute>
                } />

                <Route path="content/edit/:id" element={
                  <ProtectedRoute>
                    <NewsEditor />
                  </ProtectedRoute>
                } />

                <Route path="hero" element={
                  <ProtectedRoute>
                    <AdminHeroCarousel />
                  </ProtectedRoute>
                } />

                <Route path="hero/new" element={
                  <ProtectedRoute>
                    <HeroSlideEditor />
                  </ProtectedRoute>
                } />

                <Route path="hero/edit/:id" element={
                  <ProtectedRoute>
                    <HeroSlideEditor />
                  </ProtectedRoute>
                } />

                <Route path="materials" element={
                  <ProtectedRoute>
                    <AdminTechnicalMaterials />
                  </ProtectedRoute>
                } />

                <Route path="materials/new" element={
                  <ProtectedRoute>
                    <TechnicalMaterialEditor />
                  </ProtectedRoute>
                } />

                <Route path="materials/edit/:id" element={
                  <ProtectedRoute>
                    <TechnicalMaterialEditor />
                  </ProtectedRoute>
                } />

                <Route path="ebooks" element={
                  <ProtectedRoute>
                    <AdminEbooks />
                  </ProtectedRoute>
                } />

                <Route path="ebooks/new" element={
                  <ProtectedRoute>
                    <EbookEditor />
                  </ProtectedRoute>
                } />

                <Route path="ebooks/edit/:id" element={
                  <ProtectedRoute>
                    <EbookEditor />
                  </ProtectedRoute>
                } />

                <Route path="events" element={
                  <ProtectedRoute>
                    <AdminEvents />
                  </ProtectedRoute>
                } />

                <Route path="events/new" element={
                  <ProtectedRoute>
                    <EventEditor />
                  </ProtectedRoute>
                } />

                <Route path="events/edit/:id" element={
                  <ProtectedRoute>
                    <EventEditor />
                  </ProtectedRoute>
                } />

                <Route path="leads" element={
                  <ProtectedRoute>
                    <AdminLeads />
                  </ProtectedRoute>
                } />

                <Route path="suppliers" element={
                  <ProtectedRoute>
                    <AdminSuppliers />
                  </ProtectedRoute>
                } />

                <Route path="suppliers/new" element={
                  <ProtectedRoute>
                    <SupplierEditor />
                  </ProtectedRoute>
                } />

                <Route path="suppliers/edit/:id" element={
                  <ProtectedRoute>
                    <SupplierEditor />
                  </ProtectedRoute>
                } />

                <Route path="foundries" element={
                  <ProtectedRoute>
                    <AdminFoundries />
                  </ProtectedRoute>
                } />

                <Route path="foundries/new" element={
                  <ProtectedRoute>
                    <FoundryEditor />
                  </ProtectedRoute>
                } />

                <Route path="foundries/edit/:id" element={
                  <ProtectedRoute>
                    <FoundryEditor />
                  </ProtectedRoute>
                } />

                <Route path="ads" element={
                  <ProtectedRoute>
                    <AdminAds />
                  </ProtectedRoute>
                } />

                <Route path="ads/new" element={
                  <ProtectedRoute>
                    <AdEditor />
                  </ProtectedRoute>
                } />

                <Route path="ads/edit/:id" element={
                  <ProtectedRoute>
                    <AdEditor />
                  </ProtectedRoute>
                } />

                <Route path="media-kit" element={
                  <ProtectedRoute>
                    <AdminMediaKit />
                  </ProtectedRoute>
                } />

                <Route path="categories" element={
                  <ProtectedRoute>
                    <AdminCategories />
                  </ProtectedRoute>
                } />

                <Route path="settings" element={
                  <ProtectedRoute>
                    <AdminSettings />
                  </ProtectedRoute>
                } />
              </Route>
            </Route>
          </Routes>
        </RegionProvider>
      </Router>
    </ToastProvider>
  );
}

export default App;
