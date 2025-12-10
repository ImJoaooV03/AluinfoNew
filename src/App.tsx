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
    <ToastProvider>
      <Router>
        <LayoutWrapper>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/noticias" element={<News />} />
            <Route path="/artigos-tecnicos" element={<TechnicalArticles />} />
            <Route path="/ebooks" element={<Ebooks />} />
            <Route path="/eventos" element={<Events />} />
            <Route path="/fornecedores" element={<Suppliers />} />
            <Route path="/fundicoes" element={<Foundries />} />
            <Route path="/fundicao/:id" element={<FoundryDetails />} />
            <Route path="/fornecedor/:id" element={<SupplierDetails />} />
            <Route path="/noticia/:id" element={<Article />} />
            <Route path="/anuncie" element={<Advertise />} />
            <Route path="/busca" element={<SearchResults />} />

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

            {/* Admin Hero Carousel Routes */}
            <Route path="/admin/hero" element={
              <ProtectedRoute>
                <AdminHeroCarousel />
              </ProtectedRoute>
            } />

            <Route path="/admin/hero/new" element={
              <ProtectedRoute>
                <HeroSlideEditor />
              </ProtectedRoute>
            } />

            <Route path="/admin/hero/edit/:id" element={
              <ProtectedRoute>
                <HeroSlideEditor />
              </ProtectedRoute>
            } />

            {/* Admin Technical Materials Routes */}
            <Route path="/admin/materials" element={
              <ProtectedRoute>
                <AdminTechnicalMaterials />
              </ProtectedRoute>
            } />

            <Route path="/admin/materials/new" element={
              <ProtectedRoute>
                <TechnicalMaterialEditor />
              </ProtectedRoute>
            } />

            <Route path="/admin/materials/edit/:id" element={
              <ProtectedRoute>
                <TechnicalMaterialEditor />
              </ProtectedRoute>
            } />

            {/* Admin Ebooks Routes */}
            <Route path="/admin/ebooks" element={
              <ProtectedRoute>
                <AdminEbooks />
              </ProtectedRoute>
            } />

            <Route path="/admin/ebooks/new" element={
              <ProtectedRoute>
                <EbookEditor />
              </ProtectedRoute>
            } />

            <Route path="/admin/ebooks/edit/:id" element={
              <ProtectedRoute>
                <EbookEditor />
              </ProtectedRoute>
            } />

            {/* Admin Events Routes */}
            <Route path="/admin/events" element={
              <ProtectedRoute>
                <AdminEvents />
              </ProtectedRoute>
            } />

            <Route path="/admin/events/new" element={
              <ProtectedRoute>
                <EventEditor />
              </ProtectedRoute>
            } />

            <Route path="/admin/events/edit/:id" element={
              <ProtectedRoute>
                <EventEditor />
              </ProtectedRoute>
            } />

            {/* Admin Leads Route */}
            <Route path="/admin/leads" element={
              <ProtectedRoute>
                <AdminLeads />
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

            {/* Admin Media Kit Route */}
            <Route path="/admin/media-kit" element={
              <ProtectedRoute>
                <AdminMediaKit />
              </ProtectedRoute>
            } />

            {/* Admin Categories Route */}
            <Route path="/admin/categories" element={
              <ProtectedRoute>
                <AdminCategories />
              </ProtectedRoute>
            } />

            {/* Admin Settings Route */}
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            } />

          </Routes>
        </LayoutWrapper>
      </Router>
    </ToastProvider>
  );
}

export default App;
