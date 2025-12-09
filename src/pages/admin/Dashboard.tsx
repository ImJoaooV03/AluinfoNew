import React from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { adminStats, activityData } from '../../data/adminMockData';
import { Eye, Users, FileText, Factory, TrendingUp, Megaphone } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do desempenho do portal.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total de Visualizações" 
          value={adminStats.totalViews.toLocaleString()} 
          icon={<Eye size={24} />} 
          trend={adminStats.growth.views}
          color="blue"
        />
        <StatCard 
          title="Usuários Cadastrados" 
          value={adminStats.totalUsers} 
          icon={<Users size={24} />} 
          trend={adminStats.growth.users}
          color="purple"
        />
        <StatCard 
          title="Artigos Publicados" 
          value={adminStats.totalArticles} 
          icon={<FileText size={24} />} 
          trend={adminStats.growth.articles}
          color="primary"
        />
        <StatCard 
          title="Fornecedores Ativos" 
          value={adminStats.activeSuppliers} 
          icon={<Factory size={24} />} 
          trend={adminStats.growth.suppliers}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Atividade da Semana
            </h2>
            <select className="text-sm border-gray-200 rounded-md text-gray-500 focus:ring-primary focus:border-primary">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F37021" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F37021" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#374151', fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="views" stroke="#F37021" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="visitors" stroke="#94a3b8" strokeWidth={2} fillOpacity={0} fill="transparent" strokeDasharray="5 5" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity / Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <button className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left flex items-center gap-3 transition-colors group">
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Escrever Nova Notícia</span>
            </button>
            <button className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left flex items-center gap-3 transition-colors group">
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                <Users size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Aprovar Fornecedor</span>
            </button>
            <button className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left flex items-center gap-3 transition-colors group">
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Megaphone size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Gerenciar Anúncios</span>
            </button>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4">Status do Sistema</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Armazenamento</span>
                <span className="font-bold text-gray-700">75%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">API Requests</span>
                <span className="font-bold text-gray-700">42%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
