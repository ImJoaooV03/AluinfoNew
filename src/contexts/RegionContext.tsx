import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Region } from '../types';

// Dicionário de Traduções Completo
const translations = {
  pt: {
    // Nav & General
    home: 'Início',
    news: 'Notícias',
    technical: 'Artigos Técnicos',
    ebooks: 'E-books',
    events: 'Eventos',
    suppliers: 'Fornecedores',
    foundries: 'Fundições',
    advertise: 'Anuncie',
    search: 'Buscar',
    admin: 'Painel Admin',
    logout: 'Sair',
    loading: 'Carregando...',
    error: 'Erro',
    success: 'Sucesso',
    
    // Actions
    viewAll: 'Ver tudo',
    download: 'Baixar',
    readMore: 'Ler Mais',
    subscribe: 'Inscrever-se',
    subscribed: 'Inscrito',
    send: 'Enviar',
    cancel: 'Cancelar',
    save: 'Salvar',
    
    // Sections
    latestNews: 'Últimas Notícias',
    featuredSuppliers: 'Fornecedores em Destaque',
    featuredFoundries: 'Fundições em Destaque',
    
    // Sidebar
    lmeIndicators: 'Indicadores LME',
    aluminum: 'ALUMÍNIO',
    mostRead: 'Mais Lidas',
    advertiseHere: 'Anuncie Aqui',
    newsletterTitle: 'Newsletter',
    newsletterDesc: 'Receba as últimas notícias do mercado de alumínio diretamente no seu e-mail.',
    emailPlaceholder: 'Seu melhor e-mail',
    privacyPolicy: 'Política de privacidade garantida.',
    invalidEmail: 'E-mail inválido.',
    subscriptionSuccess: 'Inscrição realizada!',
    subscriptionError: 'Erro ao inscrever.',
    
    // Footer
    quickLinks: 'Links Rápidos',
    services: 'Serviços',
    education: 'Educação',
    contact: 'Contato',
    termsOfUse: 'Termos de Uso',
    allRightsReserved: 'Todos os direitos reservados.',
    portalDescription: 'Portal especializado em notícias e informações do mercado de alumínio global.',
    courses: 'Cursos (Em breve)',
    market: 'Mercado',
    analysis: 'Análises',
    quotes: 'Cotações',
    reports: 'Relatórios',
    
    // Advertise Page
    advertiseTitle: 'Anuncie no Portal Aluinfo',
    advertiseSubtitle: 'Oportunidades de Publicidade',
    talkToExpert: 'Fale com um Especialista',
    downloadMediaKit: 'Baixe o Mídia Kit',
    
    // Admin
    manage: 'Gerenciar',
    new: 'Novo',
    edit: 'Editar',
    delete: 'Excluir',
    active: 'Ativo',
    inactive: 'Inativo',
    draft: 'Rascunho',
    published: 'Publicado'
  },
  mx: {
    // Nav & General
    home: 'Inicio',
    news: 'Noticias',
    technical: 'Artículos Técnicos',
    ebooks: 'Libros Electrónicos',
    events: 'Eventos',
    suppliers: 'Proveedores',
    foundries: 'Fundiciones',
    advertise: 'Anúnciate',
    search: 'Buscar',
    admin: 'Panel Admin',
    logout: 'Salir',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    
    // Actions
    viewAll: 'Ver todo',
    download: 'Descargar',
    readMore: 'Leer Más',
    subscribe: 'Suscribirse',
    subscribed: 'Suscrito',
    send: 'Enviar',
    cancel: 'Cancelar',
    save: 'Guardar',
    
    // Sections
    latestNews: 'Últimas Noticias',
    featuredSuppliers: 'Proveedores Destacados',
    featuredFoundries: 'Fundiciones Destacadas',
    
    // Sidebar
    lmeIndicators: 'Indicadores LME',
    aluminum: 'ALUMINIO',
    mostRead: 'Más Leídas',
    advertiseHere: 'Anúnciate Aquí',
    newsletterTitle: 'Boletín',
    newsletterDesc: 'Reciba las últimas noticias del mercado del aluminio directamente en su correo.',
    emailPlaceholder: 'Su mejor correo',
    privacyPolicy: 'Política de privacidad garantizada.',
    invalidEmail: 'Correo inválido.',
    subscriptionSuccess: '¡Suscripción exitosa!',
    subscriptionError: 'Error al suscribirse.',
    
    // Footer
    quickLinks: 'Enlaces Rápidos',
    services: 'Servicios',
    education: 'Educación',
    contact: 'Contacto',
    termsOfUse: 'Términos de Uso',
    allRightsReserved: 'Todos los derechos reservados.',
    portalDescription: 'Portal especializado en noticias e información del mercado global del aluminio.',
    courses: 'Cursos (Próximamente)',
    market: 'Mercado',
    analysis: 'Análisis',
    quotes: 'Cotizaciones',
    reports: 'Informes',
    
    // Advertise Page
    advertiseTitle: 'Anúnciate en Aluinfo',
    advertiseSubtitle: 'Oportunidades de Publicidad',
    talkToExpert: 'Habla con un Experto',
    downloadMediaKit: 'Descargar Media Kit',
    
    // Admin
    manage: 'Administrar',
    new: 'Nuevo',
    edit: 'Editar',
    delete: 'Eliminar',
    active: 'Activo',
    inactive: 'Inactivo',
    draft: 'Borrador',
    published: 'Publicado'
  },
  en: {
    // Nav & General
    home: 'Home',
    news: 'News',
    technical: 'Technical Articles',
    ebooks: 'E-books',
    events: 'Events',
    suppliers: 'Suppliers',
    foundries: 'Foundries',
    advertise: 'Advertise',
    search: 'Search',
    admin: 'Admin Panel',
    logout: 'Logout',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Actions
    viewAll: 'View all',
    download: 'Download',
    readMore: 'Read More',
    subscribe: 'Subscribe',
    subscribed: 'Subscribed',
    send: 'Send',
    cancel: 'Cancel',
    save: 'Save',
    
    // Sections
    latestNews: 'Latest News',
    featuredSuppliers: 'Featured Suppliers',
    featuredFoundries: 'Featured Foundries',
    
    // Sidebar
    lmeIndicators: 'LME Indicators',
    aluminum: 'ALUMINUM',
    mostRead: 'Most Read',
    advertiseHere: 'Advertise Here',
    newsletterTitle: 'Newsletter',
    newsletterDesc: 'Get the latest aluminum market news directly in your inbox.',
    emailPlaceholder: 'Your best email',
    privacyPolicy: 'Privacy policy guaranteed.',
    invalidEmail: 'Invalid email.',
    subscriptionSuccess: 'Subscription successful!',
    subscriptionError: 'Error subscribing.',
    
    // Footer
    quickLinks: 'Quick Links',
    services: 'Services',
    education: 'Education',
    contact: 'Contact',
    termsOfUse: 'Terms of Use',
    allRightsReserved: 'All rights reserved.',
    portalDescription: 'Portal specialized in news and information on the global aluminum market.',
    courses: 'Courses (Coming Soon)',
    market: 'Market',
    analysis: 'Analysis',
    quotes: 'Quotes',
    reports: 'Reports',
    
    // Advertise Page
    advertiseTitle: 'Advertise on Aluinfo',
    advertiseSubtitle: 'Advertising Opportunities',
    talkToExpert: 'Talk to an Expert',
    downloadMediaKit: 'Download Media Kit',
    
    // Admin
    manage: 'Manage',
    new: 'New',
    edit: 'Edit',
    delete: 'Delete',
    active: 'Active',
    inactive: 'Inactive',
    draft: 'Draft',
    published: 'Published'
  }
};

interface RegionContextType {
  region: Region;
  t: (key: keyof typeof translations['pt']) => string;
  changeRegion: (newRegion: Region) => void;
}

const RegionContext = createContext<RegionContextType | undefined>(undefined);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Inicialização Lazy
  const [region, setRegion] = useState<Region>(() => {
    const pathSegments = window.location.pathname.split('/');
    const firstSegment = pathSegments[1] as Region;
    if (['pt', 'mx', 'en'].includes(firstSegment)) {
      return firstSegment;
    }
    return 'pt';
  });

  // Mantém a sincronia se a URL mudar externamente
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const firstSegment = pathSegments[1] as Region;

    if (['pt', 'mx', 'en'].includes(firstSegment) && firstSegment !== region) {
      setRegion(firstSegment);
    }
  }, [location.pathname]);

  const changeRegion = (newRegion: Region) => {
    const currentPath = location.pathname;
    const pathSegments = currentPath.split('/');
    
    // Substitui ou insere a região na URL
    if (['pt', 'mx', 'en'].includes(pathSegments[1])) {
      pathSegments[1] = newRegion;
    } else {
      pathSegments.splice(1, 0, newRegion);
    }
    
    const newPath = pathSegments.join('/');
    setRegion(newRegion); // Atualiza estado imediatamente
    navigate(newPath);
  };

  const t = (key: keyof typeof translations['pt']) => {
    return translations[region][key] || key;
  };

  return (
    <RegionContext.Provider value={{ region, t, changeRegion }}>
      {children}
    </RegionContext.Provider>
  );
};

export const useRegion = () => {
  const context = useContext(RegionContext);
  if (context === undefined) {
    throw new Error('useRegion must be used within a RegionProvider');
  }
  return context;
};
