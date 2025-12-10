import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import StatCard from '../../components/admin/StatCard';
import { Eye, Users, FileText, Factory, TrendingUp, Megaphone, FilePlus, CheckSquare, Layout, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabaseClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalUsers: 0,
    totalArticles: 0,
    activeCompanies: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // --- 1. KPIs (Cards do Topo) ---
      
      // Contagem de Usuários
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Notícias e Visualizações
      const { data: newsData } = await supabase
        .from('news')
        .select('views');
      
      const articlesCount = newsData?.length || 0;
      const viewsSum = newsData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

      // Fornecedores Ativos
      const { count: suppliersCount } = await supabase
        .from('suppliers')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fundições Ativas
      const { count: foundriesCount } = await supabase
        .from('foundries')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      setStats({
        totalViews: viewsSum,
        totalUsers: usersCount || 0,
        totalArticles: articlesCount,
        activeCompanies: (suppliersCount || 0) + (foundriesCount || 0)
      });

      // --- 2. Dados do Gráfico (Últimos 7 Dias) ---
      
      // Gerar array com os últimos 7 dias
      const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d;
      });

      const startDate = dates[0].toISOString(); // Data de 7 dias atrás

      // Buscar Leads criados no período
      const { data: leadsData } = await supabase
        .from('leads')
        .select('created_at')
        .gte('created_at', startDate);

      // Buscar Usuários criados no período
      const { data: usersData } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', startDate);

      // Agrupar dados por dia
      const realChartData = dates.map(date => {
        // Formatar data para exibição (ex: "Seg", "Ter")
        const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD para comparação

        // Contar ocorrências neste dia (usando slice para pegar YYYY-MM-DD da string ISO)
        const leadsCount = leadsData?.filter(l => l.created_at.startsWith(dateStr)).length || 0;
        const usersCount = usersData?.filter(u => u.created_at?.startsWith(dateStr)).length || 0;
        
        return {
          name: dayName.charAt(0).toUpperCase() + dayName.slice(1), // Capitalizar
          leads: leadsCount,
          users: usersCount
        };
      });

      setChartData(realChartData);

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

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
          value={loading ? "..." : stats.totalViews.toLocaleString()} 
          icon={<Eye size={24} />} 
          color="blue"
          trendLabel="Em notícias"
        />
        <StatCard 
          title="Usuários Cadastrados" 
          value={loading ? "..." : stats.totalUsers} 
          icon={<Users size={24} />} 
          color="purple"
          trendLabel="Total na base"
        />
        <StatCard 
          title="Artigos Publicados" 
          value={loading ? "..." : stats.totalArticles} 
          icon={<FileText size={24} />} 
          color="primary"
          trendLabel="Conteúdo total"
        />
        <StatCard 
          title="Empresas Ativas" 
          value={loading ? "..." : stats.activeCompanies} 
          icon={<Factory size={24} />} 
          color="green"
          trendLabel="Fornecedores + Fundições"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp size={20} className="text-primary" />
              Crescimento da Semana
            </h2>
            <select className="text-sm border-gray-200 rounded-md text-gray-500 focus:ring-primary focus:border-primary">
              <option>Últimos 7 dias</option>
            </select>
          </div>
          
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-300" size={32} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F37021" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#F37021" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(value: number, name: string) => [value, name === 'leads' ? 'Novos Leads' : 'Novos Usuários']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="leads" 
                    stroke="#F37021" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorLeads)" 
                    name="leads"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#94a3b8" 
                    strokeWidth={2} 
                    fillOpacity={0} 
                    fill="transparent" 
                    strokeDasharray="5 5" 
                    name="users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4 text-xs font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary"></span>
              <span className="text-gray-600">Novos Leads</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-gray-400"></span>
              <span className="text-gray-600">Novos Usuários</span>
            </div>
          </div>
        </div>

        {/* Recent Activity / Quick Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="space-y-3">
            <button 
              onClick={() => navigate('/admin/content/new')}
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left flex items-center gap-3 transition-colors group"
            >
              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FilePlus size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Escrever Nova Notícia</span>
            </button>
            <button 
              onClick={() => navigate('/admin/suppliers')}
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left flex items-center gap-3 transition-colors group"
            >
              <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors">
                <CheckSquare size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Gerenciar Fornecedores</span>
            </button>
            <button 
              onClick={() => navigate('/admin/ads')}
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left flex items-center gap-3 transition-colors group"
            >
              <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Megaphone size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Gerenciar Anúncios</span>
            </button>
            <button 
              onClick={() => navigate('/admin/hero')}
              className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 text-left flex items-center gap-3 transition-colors group"
            >
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Layout size={16} />
              </div>
              <span className="text-sm font-medium text-gray-700">Editar Carrossel Home</span>
            </button>
          </div>

          <h2 className="text-lg font-bold text-gray-800 mt-8 mb-4">Status do Sistema</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Banco de Dados</span>
                <span className="font-bold text-green-600">Online</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Armazenamento</span>
                <span className="font-bold text-gray-700">Disponível</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '25%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
