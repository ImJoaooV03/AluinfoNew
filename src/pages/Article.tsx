import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, AlertTriangle, Loader2, User } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import RelatedNewsCarousel from '../components/RelatedNewsCarousel';
import AdSpot from '../components/AdSpot';
import SidebarAds from '../components/SidebarAds';
import SocialShare from '../components/SocialShare';
import { supabase } from '../lib/supabaseClient';
import { Article as ArticleType, NewsItem } from '../types';
import { useRegion } from '../contexts/RegionContext'; // Importar contexto de região

const Article = () => {
  const { id } = useParams();
  const { region } = useRegion(); // Usar a região atual
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      fetchArticle(id);
    }
  }, [id, region]); // Recarregar se a região mudar

  const fetchArticle = async (articleId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch article - Note: We don't filter by region here because if I have a direct link to an article ID, I should see it regardless, OR we can enforce region.
      // For strict isolation, we should enforce region.
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', articleId)
        .eq('region', region) // STRICT ISOLATION: Only show if matches region
        .single();

      if (error) throw error;

      if (data) {
        const mappedArticle: ArticleType = {
          id: data.id,
          title: data.title,
          subtitle: data.subtitle,
          summary: data.summary,
          content: data.content,
          category: data.category,
          date: new Date(data.publish_date).toLocaleDateString(region === 'pt' ? 'pt-BR' : region === 'mx' ? 'es-MX' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' }),
          author: data.author,
          authorRole: 'Colaborador',
          authorAvatar: '',
          readTime: '5 min',
          imageUrl: data.image_url || 'https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x600?text=Sem+Imagem',
          tags: [data.category],
          type: 'news'
        };
        setArticle(mappedArticle);

        // Fetch related news with STRICT REGION FILTER
        fetchRelatedNews(data.category, data.id);
      }
    } catch (err: any) {
      console.error('Erro ao buscar notícia:', err);
      setError('Não foi possível carregar a notícia. Verifique se você está na região correta.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async (category: string, currentId: string) => {
    try {
      const { data } = await supabase
        .from('news')
        .select('*')
        .eq('category', category)
        .eq('status', 'published')
        .eq('region', region) // STRICT ISOLATION
        .neq('id', currentId)
        .limit(6);

      if (data) {
        const mappedRelated = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          category: item.category,
          date: new Date(item.publish_date).toLocaleDateString(region === 'pt' ? 'pt-BR' : 'en-US'),
          author: item.author,
          imageUrl: item.image_url || 'https://img-wrapper.vercel.app/image?url=https://placehold.co/600x400',
          isHighlight: false,
          type: 'news'
        }));
        setRelatedNews(mappedRelated);
      }
    } catch (err) {
      console.error('Erro ao buscar relacionadas:', err);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa]"><Loader2 className="animate-spin text-primary" size={32} /></div>;

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fa] p-4">
        <AlertTriangle className="text-yellow-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops! Algo deu errado.</h1>
        <p className="text-gray-600 mb-6">{error || 'Notícia não encontrada.'}</p>
        <Link to={`/${region}/noticias`} className="bg-primary text-white px-6 py-2 rounded-md font-bold hover:bg-primary-hover transition-colors">
          Voltar para Notícias
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
                <Link to={`/${region}`} className="hover:text-primary transition-colors">Início</Link>
                <ChevronRight size={12} />
                <Link to={`/${region}/noticias`} className="hover:text-primary transition-colors uppercase">Notícias</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium truncate">{article.title}</span>
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="w-full mb-8">
            <div className="hidden md:block"><AdSpot position="top_large" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150?text=Banner" /></div>
            <div className="block md:hidden"><AdSpot position="top_large_mobile" className="w-full bg-gray-200" fallbackImage="https://img-wrapper.vercel.app/image?url=https://placehold.co/400x150?text=Banner" /></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <article className="lg:col-span-9 bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <header className="p-6 md:p-10 pb-0">
                    <div className="flex gap-2 mb-4"><span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded uppercase">{article.category}</span></div>
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>
                    {article.subtitle && <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed border-l-4 border-primary pl-4">{article.subtitle}</p>}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-t border-gray-100 mt-6">
                        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold border border-gray-300"><User size={20} /></div><div><div className="text-sm font-bold text-gray-900">{article.author}</div><div className="text-xs text-gray-500">{article.authorRole}</div></div></div>
                        <div className="flex items-center gap-4 text-xs text-gray-500"><div className="flex items-center gap-1.5"><Calendar size={14} /><span>{article.date}</span></div><div className="flex items-center gap-1.5"><Clock size={14} /><span>{article.readTime}</span></div></div>
                    </div>
                </header>
                <div className="w-full h-auto relative"><img src={article.imageUrl} alt={article.title} className="w-full h-auto object-cover max-h-[600px]" /></div>
                <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8">
                    <div className="hidden md:block sticky top-24 h-fit"><SocialShare url={window.location.href} title={article.title} orientation="vertical" /></div>
                    <div className="flex-1 max-w-none prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary hover:prose-a:text-primary-hover prose-img:rounded-lg"><div dangerouslySetInnerHTML={{ __html: article.content }} /></div>
                </div>
                <div className="md:hidden p-6 border-t border-gray-100 flex flex-col items-center"><h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wide">Compartilhar</h3><SocialShare url={window.location.href} title={article.title} orientation="horizontal" /></div>
                {relatedNews.length > 0 && <div className="bg-gray-50 border-t border-gray-200 p-6 md:p-10"><SectionHeader title="Notícias Relacionadas" /><div className="mt-4"><RelatedNewsCarousel items={relatedNews} /></div></div>}
            </article>
            <SidebarAds mostReadNews={relatedNews.slice(0, 4)} />
        </div>
      </main>
    </div>
  );
};

export default Article;
