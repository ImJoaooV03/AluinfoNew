import React, { useState } from 'react';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // Container principal com altura fixa da tela (h-screen) e sem rolagem global (overflow-hidden)
    <div className="h-screen bg-[#f8f9fa] flex font-sans overflow-hidden">
      
      {/* Sidebar: Fixa no mobile, estática (mas altura total) no desktop */}
      <AdminSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      
      {/* Coluna da direita: Header + Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Header fixo no topo da coluna */}
        <AdminHeader onMenuClick={() => setIsSidebarOpen(true)} />
        
        {/* Área de conteúdo com rolagem independente */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
