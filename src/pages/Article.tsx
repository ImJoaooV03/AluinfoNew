import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { currentArticle, sidebarAds, mainNews } from '../data/mockData';
import { Calendar, Clock, Share2, Facebook, Twitter, Linkedin, MessageCircle, ChevronRight, User } from 'lucide-react';
import SectionHeader from '../components/SectionHeader';
import NewsletterWidget from '../components/NewsletterWidget';
import RelatedNewsCarousel from '../components/RelatedNewsCarousel';

const Article = () => {
  const { id } = useParams();
  
  // Scroll to top on load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const article = currentArticle; // In a real app, fetch based on ID

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-12">
      
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
                <Link to="/" className="hover:text-primary transition-colors">Início</Link>
                <ChevronRight size={12} />
                <Link to="/" className="hover:text-primary transition-colors uppercase">{article.category}</Link>
                <ChevronRight size={12} />
                <span className="text-gray-800 font-medium truncate">{article.title}</span>
            </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        
        {/* Top Ad Banner - Matches Home & News Page */}
        <div className="w-full mb-8">
            <div className="bg-gray-200 h-[150px] rounded flex items-center justify-center overflow-hidden shadow-sm">
                <img 
                  src="https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/1200x150/333333/ffffff?text=MAGMA+Engineering" 
                  alt="MAGMA Engineering" 
                  className="w-full h-full object-cover" 
                />
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Article Content */}
            <article className="lg:col-span-9 bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                
                {/* Article Header */}
                <header className="p-6 md:p-10 pb-0">
                    <div className="flex gap-2 mb-4">
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded uppercase">
                            {article.category}
                        </span>
                        {article.tags?.map(tag => (
                            <span key={tag} className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded hover:bg-gray-200 transition-colors cursor-pointer">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                        {article.title}
                    </h1>
                    
                    {article.subtitle && (
                        <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed border-l-4 border-primary pl-4">
                            {article.subtitle}
                        </p>
                    )}

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-t border-gray-100 mt-6">
                        <div className="flex items-center gap-3">
                            {article.authorAvatar ? (
                                <img src={article.authorAvatar} alt={article.author} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    <User size={20} />
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-bold text-gray-900">{article.author}</div>
                                <div className="text-xs text-gray-500">{article.authorRole}</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                <span>{article.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock size={14} />
                                <span>{article.readTime}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="w-full h-64 md:h-[500px] relative">
                    <img 
                        src={article.imageUrl} 
                        alt={article.title} 
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Article Body */}
                <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8">
                    
                    {/* Sticky Share Buttons (Desktop) */}
                    <div className="hidden md:flex flex-col gap-3 sticky top-24 h-fit">
                        <span className="text-[10px] font-bold text-gray-400 text-center uppercase mb-1">Share</span>
                        <button className="w-10 h-10 rounded-full bg-[#3b5998] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Facebook">
                            <Facebook size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-[#0077b5] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="LinkedIn">
                            <Linkedin size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-[#1da1f2] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="Twitter">
                            <Twitter size={18} />
                        </button>
                        <button className="w-10 h-10 rounded-full bg-[#25d366] text-white flex items-center justify-center hover:opacity-90 transition-opacity" title="WhatsApp">
                            <MessageCircle size={18} />
                        </button>
                    </div>

                    {/* Text Content */}
                    <div className="flex-1 max-w-none prose prose-lg prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-primary hover:prose-a:text-primary-hover prose-img:rounded-lg">
                        <div dangerouslySetInnerHTML={{ __html: article.content }} />
                    </div>
                </div>

                {/* Mobile Share Buttons */}
                <div className="md:hidden p-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Share2 size={16} /> Compartilhar este artigo
                    </h3>
                    <div className="flex gap-3">
                         <button className="flex-1 py-2 rounded bg-[#3b5998] text-white flex items-center justify-center">
                            <Facebook size={18} />
                        </button>
                        <button className="flex-1 py-2 rounded bg-[#0077b5] text-white flex items-center justify-center">
                            <Linkedin size={18} />
                        </button>
                        <button className="flex-1 py-2 rounded bg-[#1da1f2] text-white flex items-center justify-center">
                            <Twitter size={18} />
                        </button>
                        <button className="flex-1 py-2 rounded bg-[#25d366] text-white flex items-center justify-center">
                            <MessageCircle size={18} />
                        </button>
                    </div>
                </div>

                {/* Related News Carousel */}
                <div className="bg-gray-50 border-t border-gray-200 p-6 md:p-10">
                    <SectionHeader title="Notícias Relacionadas" />
                    <div className="mt-4">
                        <RelatedNewsCarousel items={mainNews} />
                    </div>
                </div>

            </article>

            {/* Sidebar Column */}
            <aside className="lg:col-span-3 space-y-6">
                {/* Author Widget */}
                <div className="bg-white border border-gray-200 p-6 rounded-sm text-center w-full">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3">
                         <img src={article.authorAvatar} alt={article.author} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-gray-900">{article.author}</h3>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-4">{article.authorRole}</p>
                    <button className="text-xs font-bold text-primary border border-primary px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors w-full">
                        Ver Perfil
                    </button>
                </div>

                {sidebarAds.map((ad, index) => (
                    <React.Fragment key={ad.id}>
                        {/* Insert Newsletter before the 3rd ad (index 2) which is AluInfo Ads */}
                        {index === 2 && <NewsletterWidget />}
                        
                        <div className="bg-white border border-gray-200 p-1 rounded-sm shadow-sm">
                            <img 
                                src={ad.imageUrl} 
                                alt={ad.alt} 
                                className="w-full h-[150px] object-cover rounded-sm" 
                            />
                        </div>
                    </React.Fragment>
                ))}
                
                {/* Most Read Widget */}
                <div className="bg-white border border-gray-200 p-4 rounded-sm w-full">
                     <h3 className="font-bold text-gray-800 border-b pb-2 mb-3 text-sm">Mais Lidas</h3>
                     <ul className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                            <li key={i} className="flex gap-3 items-start group cursor-pointer">
                                <span className="text-2xl font-bold text-gray-200 leading-none group-hover:text-primary transition-colors">{i}</span>
                                <p className="text-xs text-gray-600 line-clamp-2 group-hover:text-gray-900">
                                    Tendências do mercado de alumínio para o próximo semestre mostram crescimento...
                                </p>
                            </li>
                        ))}
                     </ul>
                </div>
            </aside>

        </div>
      </main>
    </div>
  );
};

export default Article;
