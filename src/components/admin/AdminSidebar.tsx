import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Newspaper, Settings, LogOut, Package, Megaphone, Factory, BookOpen, Mail, Book, Calendar, FileText, MonitorPlay, Tag, Globe } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useRegion } from '../../contexts/RegionContext';
import clsx from 'clsx';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { region } = useRegion();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate(`/${region}/admin/login`);
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: `/${region}/admin` },
    { icon: <Users size={20} />, label: 'Usuários', path: `/${region}/admin/users` },
    { icon: <Newspaper size={20} />, label: 'Notícias', path: `/${region}/admin/content` },
    { icon: <BookOpen size={20} />, label: 'Materiais Técnicos', path: `/${region}/admin/materials` },
    { icon: <Book size={20} />, label: 'E-books', path: `/${region}/admin/ebooks` },
    { icon: <Calendar size={20} />, label: 'Eventos', path: `/${region}/admin/events` },
    { icon: <Package size={20} />, label: 'Fornecedores', path: `/${region}/admin/suppliers` },
    { icon: <Factory size={20} />, label: 'Fundições', path: `/${region}/admin/foundries` },
    { icon: <Megaphone size={20} />, label: 'Publicidade', path: `/${region}/admin/ads` },
    { icon: <FileText size={20} />, label: 'Mídia Kit', path: `/${region}/admin/media-kit` },
    { icon: <Mail size={20} />, label: 'Leads', path: `/${region}/admin/leads` },
    { icon: <MonitorPlay size={20} />, label: 'Carrossel Home', path: `/${region}/admin/hero` },
    { icon: <Tag size={20} />, label: 'Categorias', path: `/${region}/admin/categories` },
    { icon: <Settings size={20} />, label: 'Configurações', path: `/${region}/admin/settings` },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside className={clsx(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col h-full",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                A
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">ALUINFO<span className="text-primary">.ADMIN</span></span>
          </div>
        </div>

        {/* Region Indicator */}
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
            <Globe size={16} className="text-gray-500" />
            <span className="text-xs font-bold text-gray-600 uppercase">
                Gerenciando: <span className="text-primary">{region === 'pt' ? 'Brasil' : region === 'mx' ? 'México' : 'Global'}</span>
            </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
          {menuItems.map((item) => {
            const isActive = item.path === `/${region}/admin`
              ? location.pathname === `/${region}/admin`
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onClose()}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-orange-50 text-primary" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex-shrink-0 bg-white">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut size={20} />
            Sair do Sistema
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
