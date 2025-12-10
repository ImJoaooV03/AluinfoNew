import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { supabase } from '../../lib/supabaseClient';
import { Edit, Trash2, Plus, Loader2, Calendar, MapPin, Image as ImageIcon, Tag, User, Users } from 'lucide-react';
import { useRegion } from '../../contexts/RegionContext';
import { useToast } from '../../contexts/ToastContext';

const AdminEvents = () => {
  const navigate = useNavigate();
  const { region } = useRegion();
  const { addToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('events')
            .select('*')
            .eq('region', region)
            .order('event_date', { ascending: true });
        if (data) setEvents(data);
        setLoading(false);
    };
    fetchEvents();
  }, [region]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este evento?')) return;
    try {
        await supabase.from('events').delete().eq('id', id);
        setEvents(events.filter(e => e.id !== id));
        addToast('success', 'Evento excluído.');
    } catch (err) {
        addToast('error', 'Erro ao excluir.');
    }
  };

  const formatDateRange = (start: string, end?: string) => {
    const startDate = new Date(start);
    const startStr = startDate.toLocaleDateString();
    
    if (!end) return startStr;
    
    const endDate = new Date(end);
    if (startDate.toDateString() === endDate.toDateString()) {
        return startStr; // Mesmo dia
    }
    
    return `${startStr} - ${endDate.toLocaleDateString()}`;
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-8">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">Eventos ({region.toUpperCase()})</h1>
            <p className="text-gray-500">Agenda de feiras e congressos.</p>
        </div>
        <button onClick={() => navigate(`/${region}/admin/events/new`)} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md font-bold flex items-center gap-2 shadow-sm transition-colors">
            <Plus size={18} /> Novo Evento
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
            <div className="p-8 text-center text-gray-500"><Loader2 className="animate-spin inline mr-2" /> Carregando...</div>
        ) : events.length === 0 ? (
            <div className="p-12 text-center text-gray-500">Nenhum evento cadastrado.</div>
        ) : (
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                    <tr>
                        <th className="p-4 font-semibold uppercase text-xs">Evento</th>
                        <th className="p-4 font-semibold uppercase text-xs">Categoria</th>
                        <th className="p-4 font-semibold uppercase text-xs">Data</th>
                        <th className="p-4 font-semibold uppercase text-xs">Local</th>
                        <th className="p-4 font-semibold uppercase text-xs">Status</th>
                        <th className="p-4 text-right font-semibold uppercase text-xs">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {events.map(event => (
                        <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded bg-gray-100 flex-shrink-0 overflow-hidden border border-gray-200">
                                        {event.image_url ? (
                                            <img src={event.image_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400"><ImageIcon size={20} /></div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{event.title}</div>
                                        {event.organizer && (
                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <User size={10} /> {event.organizer}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                {event.category ? (
                                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200 flex items-center w-fit gap-1">
                                        <Tag size={10} /> {event.category}
                                    </span>
                                ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                )}
                            </td>
                            <td className="p-4 text-gray-600">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} /> 
                                    {formatDateRange(event.event_date, event.end_date)}
                                </div>
                            </td>
                            <td className="p-4 text-gray-600">
                                <div className="flex items-center gap-1.5"><MapPin size={14} /> {event.location || '-'}</div>
                                {event.capacity && (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                                        <Users size={12} /> {event.capacity}
                                    </div>
                                )}
                            </td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {event.status === 'active' ? 'Ativo' : 'Inativo'}
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <button onClick={() => navigate(`/${region}/admin/events/edit/${event.id}`)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded mr-1 transition-colors"><Edit size={16} /></button>
                                <button onClick={() => handleDelete(event.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded transition-colors"><Trash2 size={16} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminEvents;
