import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Save, TrendingUp, Loader2, DollarSign, Percent, RefreshCw } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';

const AdminIndicators = () => {
  const { region } = useRegion();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [data, setData] = useState({
    aluminum_price: '',
    aluminum_change: '',
    updated_at: ''
  });

  useEffect(() => {
    fetchIndicators();
  }, [region]);

  const fetchIndicators = async () => {
    try {
      setLoading(true);
      const { data: indicator, error } = await supabase
        .from('market_indicators')
        .select('*')
        .eq('region', region)
        .maybeSingle();

      if (error) throw error;

      if (indicator) {
        setData({
          aluminum_price: indicator.aluminum_price || '',
          aluminum_change: indicator.aluminum_change || '',
          updated_at: indicator.updated_at
        });
      } else {
        // Default values if not found
        setData({
          aluminum_price: '$0.00',
          aluminum_change: '0.00%',
          updated_at: new Date().toISOString()
        });
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Erro ao carregar indicadores.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('market_indicators')
        .upsert({
          region: region,
          aluminum_price: data.aluminum_price,
          aluminum_change: data.aluminum_change,
          updated_at: new Date().toISOString()
        }, { onConflict: 'region' });

      if (error) throw error;

      addToast('success', 'Indicadores atualizados com sucesso!');
      fetchIndicators(); // Refresh timestamp
    } catch (err: any) {
      console.error(err);
      addToast('error', 'Erro ao salvar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Indicadores de Mercado ({region.toUpperCase()})</h1>
        <p className="text-gray-500">Gerencie as cotações exibidas na barra lateral do site.</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              LME - Alumínio
            </h3>
            {data.updated_at && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                    <RefreshCw size={10} />
                    Atualizado em: {new Date(data.updated_at).toLocaleDateString()} às {new Date(data.updated_at).toLocaleTimeString()}
                </span>
            )}
          </div>

          <div className="p-8 space-y-6">
            {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
                <>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Preço Atual (Texto Livre)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <DollarSign size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={data.aluminum_price}
                                onChange={(e) => setData({...data, aluminum_price: e.target.value})}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-lg"
                                placeholder="$2868.00"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Ex: $2868.00, R$ 15.400,00</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Variação (%)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                <Percent size={18} />
                            </div>
                            <input 
                                type="text" 
                                value={data.aluminum_change}
                                onChange={(e) => setData({...data, aluminum_change: e.target.value})}
                                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-lg font-bold ${data.aluminum_change.includes('-') ? 'text-red-600' : 'text-green-600'}`}
                                placeholder="+1.40%"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Use "+" para alta e "-" para baixa. Ex: +1.40%, -0.5%</p>
                    </div>

                    {/* Preview */}
                    <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-xs font-bold text-gray-400 uppercase mb-2 block">Pré-visualização</span>
                        <div className="bg-white border border-gray-200 p-4 rounded-sm w-full shadow-sm max-w-xs mx-auto">
                            <div className="flex justify-between items-center mb-2">
                                <div><h4 className="font-bold text-gray-800 text-sm">ALUMÍNIO</h4><span className="text-xs text-gray-500">AL</span></div>
                                <div className="text-right">
                                    <div className="font-bold text-gray-900 text-lg">{data.aluminum_price || '$0.00'}</div>
                                    <div className={`text-[11px] font-bold ${data.aluminum_change.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                                        {data.aluminum_change || '0.00%'}
                                    </div>
                                </div>
                            </div>
                            <div className="text-[10px] text-gray-400 mt-2 border-t border-gray-100 pt-2 capitalize">
                                {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </>
            )}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
            <button 
                type="submit" 
                disabled={saving || loading}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-70"
            >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AdminIndicators;
