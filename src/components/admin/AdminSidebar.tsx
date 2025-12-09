import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Newspaper, Settings, LogOut, Package, Megaphone, Factory, BookOpen, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import clsx from 'clsx';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/admin' },
    { icon: <Users size={20} />, label: 'Usuários', path: '/admin/users' },
    { icon: <Newspaper size={20} />, label: 'Notícias', path: '/admin/content' },
    { icon: <BookOpen size={20} />, label: 'Materiais Técnicos', path: '/admin/materials' },
    { icon: <Package size={20} />, label: 'Fornecedores', path: '/admin/suppliers' },
    { icon: <Factory size={20} />, label: 'Fundições', path: '/admin/foundries' },
    { icon: <Megaphone size={20} />, label: 'Publicidade', path: '/admin/ads' },
    { icon: <Mail size={20} />, label: 'Leads', path: '/admin/leads' }, // Movido para cá
    { icon: <Settings size={20} />, label: 'Configurações', path: '/admin/settings' },
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
        // Mobile: fixed inset-y-0 (ocupa altura total da tela)
        // Desktop: static (ocupa altura do pai flex container, que é h-screen)
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col h-full",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo Area - Altura fixa */}
        <div className="h-16 flex items-center px-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                A
            </div>
            <span className="text-xl font-bold text-gray-800 tracking-tight">ALUINFO<span className="text-primary">.ADMIN</span></span>
          </div>
        </div>

        {/* Navigation - Ocupa o espaço restante (flex-1) e rola internamente se necessário */}
        <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1 scrollbar-thin scrollbar-thumb-gray-200">
          {menuItems.map((item) => {
            const isActive = item.path === '/admin' 
              ? location.pathname === '/admin'
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

        {/* Footer Actions - Fixo no fundo (flex-shrink-0) */}
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
