import { AdminUser, AdminStats, AdminArticle } from '../types/admin';

export const adminStats: AdminStats = {
  totalViews: 125430,
  totalUsers: 845,
  totalArticles: 142,
  activeSuppliers: 68,
  growth: {
    views: 12.5,
    users: 5.2,
    articles: 8.4,
    suppliers: 2.1
  }
};

export const adminUsers: AdminUser[] = [
  { id: '1', name: 'Carlos Silva', email: 'carlos@aluinfo.com', role: 'admin', status: 'active', lastLogin: '2 min atrás', avatar: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Ana Souza', email: 'ana@aluinfo.com', role: 'editor', status: 'active', lastLogin: '1 hora atrás', avatar: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Roberto Santos', email: 'roberto@partner.com', role: 'viewer', status: 'inactive', lastLogin: '3 dias atrás', avatar: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Fernanda Lima', email: 'fernanda@aluinfo.com', role: 'editor', status: 'active', lastLogin: '5 horas atrás', avatar: 'https://i.pravatar.cc/150?u=4' },
  { id: '5', name: 'Ricardo Oliveira', email: 'ricardo@tech.com', role: 'viewer', status: 'active', lastLogin: '1 dia atrás', avatar: 'https://i.pravatar.cc/150?u=5' },
];

export const adminArticles: AdminArticle[] = [
  { id: '1', title: 'Novas tecnologias de fundição 2026', category: 'Inovação', author: 'Carlos Silva', status: 'published', publishDate: '02 Dez 2025', views: 1250 },
  { id: '2', title: 'Exportações de alumínio crescem', category: 'Mercado', author: 'Ana Souza', status: 'published', publishDate: '01 Dez 2025', views: 980 },
  { id: '3', title: 'Guia de Manutenção de Fornos', category: 'Técnico', author: 'Carlos Silva', status: 'draft', publishDate: '-', views: 0 },
  { id: '4', title: 'Entrevista com CEO da Magma', category: 'Entrevista', author: 'Fernanda Lima', status: 'scheduled', publishDate: '10 Dez 2025', views: 0 },
  { id: '5', title: 'Sustentabilidade na Indústria', category: 'Sustentabilidade', author: 'Ana Souza', status: 'published', publishDate: '28 Nov 2025', views: 3400 },
];

export const activityData = [
  { name: 'Seg', views: 4000, visitors: 2400 },
  { name: 'Ter', views: 3000, visitors: 1398 },
  { name: 'Qua', views: 2000, visitors: 9800 },
  { name: 'Qui', views: 2780, visitors: 3908 },
  { name: 'Sex', views: 1890, visitors: 4800 },
  { name: 'Sáb', views: 2390, visitors: 3800 },
  { name: 'Dom', views: 3490, visitors: 4300 },
];
