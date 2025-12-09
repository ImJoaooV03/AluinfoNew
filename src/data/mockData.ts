import { NewsItem, AdBanner, Article, Supplier, Foundry, Product, SupplierDocument, OrderHistory } from '../types';

export const sidebarAds: AdBanner[] = [
  { id: '1', imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/360x150/333/FFF?text=NIIT+Plasma', alt: 'NIIT Plasma' },
  { id: '2', imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/360x150/444/FFF?text=DJ+Fornos', alt: 'DJ Fornos' },
  { id: '3', imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/360x150/555/FFF?text=AluInfo+Ads', alt: 'AluInfo Ads' },
  { id: '4', imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/360x150/666/FFF?text=Parceiro+Global', alt: 'Parceiro Global' },
];

export const mainNews: NewsItem[] = [
  {
    id: '1',
    title: 'Novas tecnologias de fundição prometem reduzir custos em 2026',
    summary: 'Especialistas apontam que a automação e o uso de IA na fundição de alumínio podem gerar economia de até 15% nos próximos anos.',
    category: 'INOVAÇÃO',
    date: '02 Dez 2025',
    author: 'João Silva',
    imageUrl: 'https://images.unsplash.com/photo-1565514020176-db7936162608?q=80&w=1000&auto=format&fit=crop',
    isHighlight: true,
    type: 'news'
  },
  {
    id: '2',
    title: 'Exportações de alumínio brasileiro crescem 12% no último trimestre',
    summary: 'O mercado internacional mostra forte demanda pelo metal brasileiro, impulsionado pelo setor automotivo elétrico.',
    category: 'MERCADO',
    date: '01 Dez 2025',
    author: 'Maria Garcia',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop',
    isHighlight: true,
    type: 'news'
  },
  {
    id: '3',
    title: 'Sustentabilidade: A corrida pelo alumínio verde',
    summary: 'Grandes players do setor investem pesado em energias renováveis para reduzir a pegada de carbono.',
    category: 'SUSTENTABILIDADE',
    date: '30 Nov 2025',
    author: 'Carlos Santos',
    imageUrl: 'https://images.unsplash.com/photo-1496247749665-49cf5bf8756c?q=80&w=1000&auto=format&fit=crop',
    type: 'news'
  },
  {
    id: '4',
    title: 'Preço da energia impacta produção nacional',
    summary: 'Altos custos energéticos continuam sendo o principal desafio para as fundições no Brasil.',
    category: 'ECONOMIA',
    date: '29 Nov 2025',
    author: 'Ana Costa',
    imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?q=80&w=1000&auto=format&fit=crop',
    type: 'news'
  },
  {
    id: '5',
    title: 'Novo processo de reciclagem atinge 95% de eficiência',
    summary: 'Startup desenvolve método que recupera ligas complexas com perda mínima de material.',
    category: 'TECNOLOGIA',
    date: '28 Nov 2025',
    author: 'Roberto Almeida',
    imageUrl: 'https://images.unsplash.com/photo-1531297461136-82lwDe83a9?q=80&w=1000&auto=format&fit=crop',
    type: 'news'
  },
  {
    id: '6',
    title: 'Indústria 4.0: O futuro das fundições conectadas',
    summary: 'Como a internet das coisas está transformando o chão de fábrica das metalúrgicas.',
    category: 'INDÚSTRIA 4.0',
    date: '27 Nov 2025',
    author: 'Fernanda Lima',
    imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1000&auto=format&fit=crop',
    type: 'news'
  }
];

export const technicalMaterials: NewsItem[] = [
  { id: 'tm1', title: 'Guia de Ligas de Alumínio 2025', summary: 'Catálogo completo de especificações.', category: 'Manual', date: '2025', downloads: 120, imageUrl: '', type: 'technical' },
  { id: 'tm2', title: 'Normas ABNT para Fundição', summary: 'Atualizações recentes nas normas.', category: 'Normas', date: '2025', downloads: 85, imageUrl: '', type: 'technical' },
  { id: 'tm3', title: 'Tabela de Tratamento Térmico', summary: 'Parâmetros para T6 e T7.', category: 'Técnico', date: '2025', downloads: 200, imageUrl: '', type: 'technical' },
  { id: 'tm4', title: 'Manutenção de Fornos', summary: 'Checklist preventivo.', category: 'Manutenção', date: '2025', downloads: 150, imageUrl: '', type: 'technical' },
  { id: 'tm5', title: 'Segurança em Fundições', summary: 'Protocolos essenciais.', category: 'Segurança', date: '2025', downloads: 300, imageUrl: '', type: 'technical' },
  { id: 'tm6', title: 'Controle de Qualidade', summary: 'Metodologias de inspeção.', category: 'Qualidade', date: '2025', downloads: 180, imageUrl: '', type: 'technical' },
];

export const ebooks: NewsItem[] = [
  { id: 'eb1', title: 'Fundição sob Pressão: O Guia Definitivo', summary: 'Aprenda tudo sobre o processo HPDC.', category: 'E-book', date: '2025', author: 'Eng. M. Souza', pages: 45, downloads: 500, imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x400/e5e5e5/333?text=Cover+1', type: 'ebook' },
  { id: 'eb2', title: 'Defeitos em Peças de Alumínio', summary: 'Atlas de defeitos e soluções.', category: 'E-book', date: '2025', author: 'Dr. P. Ferreira', pages: 120, downloads: 850, imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x400/e5e5e5/333?text=Cover+2', type: 'ebook' },
  { id: 'eb3', title: 'Metalurgia do Alumínio', summary: 'Conceitos fundamentais.', category: 'E-book', date: '2025', author: 'Prof. A. Lima', pages: 80, downloads: 320, imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x400/e5e5e5/333?text=Cover+3', type: 'ebook' },
];

export const events: NewsItem[] = [
  { id: 'ev1', title: 'ExpoAlumínio 2025', summary: 'O maior evento do setor na América Latina.', category: 'Feira', date: '15-18 Ago 2025', location: 'São Paulo, SP', imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/png?text=Expo', type: 'event' },
  { id: 'ev2', title: 'Congresso Internacional de Fundição', summary: 'Palestras com especialistas mundiais.', category: 'Congresso', date: '22 Set 2025', location: 'Online', imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/png?text=Conf', type: 'event' },
  { id: 'ev3', title: 'Workshop: Eficiência Energética', summary: 'Treinamento prático para gestores.', category: 'Workshop', date: '10 Out 2025', location: 'Joinville, SC', imageUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/100x100/png?text=Work', type: 'event' },
];

export const currentArticle: Article = {
  id: '1',
  title: 'Novas tecnologias de fundição prometem reduzir custos em 2026',
  subtitle: 'A automação avançada e a inteligência artificial estão redefinindo os padrões de eficiência na indústria do alumínio.',
  summary: 'Especialistas apontam que a automação e o uso de IA na fundição de alumínio podem gerar economia de até 15% nos próximos anos.',
  category: 'INOVAÇÃO',
  date: '02 de Dezembro, 2025',
  author: 'João Silva',
  authorRole: 'Editor Chefe',
  authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
  readTime: '5 min de leitura',
  imageUrl: 'https://images.unsplash.com/photo-1565514020176-db7936162608?q=80&w=1200&auto=format&fit=crop',
  content: `
    <p>A indústria de fundição de alumínio está à beira de uma revolução tecnológica. Com a pressão crescente por redução de custos e aumento da sustentabilidade, novas tecnologias estão surgindo para otimizar cada etapa do processo produtivo.</p>
    <p>Segundo um relatório recente da Associação Global de Alumínio, a implementação de sistemas de monitoramento em tempo real baseados em IoT (Internet das Coisas) já demonstrou reduzir o desperdício de material em até 8% em plantas piloto na Europa.</p>
    <h3>O Papel da Inteligência Artificial</h3>
    <p>A IA não está apenas automatizando tarefas repetitivas, mas também tomando decisões complexas sobre a mistura de ligas e o controle de temperatura dos fornos. Algoritmos preditivos podem antecipar falhas em equipamentos antes que elas ocorram, evitando paradas não programadas custosas.</p>
    <blockquote>
      "A fundição do futuro não é apenas automatizada, ela é inteligente e adaptável." - Dra. Elena Costa, Pesquisadora de Materiais.
    </blockquote>
    <p>Além disso, a robótica colaborativa (cobots) está permitindo que humanos e máquinas trabalhem lado a lado com segurança, combinando a precisão das máquinas com a flexibilidade humana.</p>
    <h3>Perspectivas para 2026</h3>
    <p>Espera-se que até 2026, 40% das fundições de médio e grande porte tenham adotado pelo menos uma solução de IA em seus processos. O investimento inicial é alto, mas o retorno sobre o investimento (ROI) é estimado em menos de 24 meses.</p>
  `,
  tags: ['Tecnologia', 'Indústria 4.0', 'Eficiência', 'Alumínio'],
  type: 'news'
};

export const technicalArticlesList: Article[] = [
  {
    id: 'ta-1',
    title: 'Análise Avançada de Porosidade em Fundição de Alumínio sob Pressão',
    summary: 'Um estudo aprofundado sobre as causas raízes da porosidade gasosa e de contração em peças complexas, apresentando novas metodologias de detecção via raio-X digital.',
    category: 'Metalurgia',
    date: '5 de Dezembro, 2025',
    author: 'Dr. Roberto Campos',
    authorRole: 'Engenheiro Metalurgista',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop',
    readTime: '12 min',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1000&auto=format&fit=crop',
    type: 'technical',
    content: ''
  },
  {
    id: 'ta-2',
    title: 'Otimização Térmica de Moldes: O Papel dos Canais de Refrigeração Conformados',
    summary: 'Como a manufatura aditiva está revolucionando o design de moldes, permitindo canais de refrigeração que acompanham a geometria da peça e reduzem o tempo de ciclo em até 30%.',
    category: 'Inovação',
    date: '28 de Novembro, 2025',
    author: 'Eng. Sofia Martinez',
    authorRole: 'Especialista em Moldes',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop',
    readTime: '8 min',
    imageUrl: 'https://images.unsplash.com/photo-1622466023389-1055823122f3?q=80&w=1000&auto=format&fit=crop',
    type: 'technical',
    content: ''
  },
  {
    id: 'ta-3',
    title: 'Ligas de Alumínio-Lítio: Propriedades e Aplicações Aeroespaciais',
    summary: 'Explorando a terceira geração de ligas Al-Li, focando em sua relação resistência-peso superior e resistência à fadiga para componentes estruturais de aeronaves.',
    category: 'Materiais',
    date: '15 de Novembro, 2025',
    author: 'Prof. André Viana',
    authorRole: 'Pesquisador Sênior',
    authorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop',
    readTime: '15 min',
    imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1000&auto=format&fit=crop',
    type: 'technical',
    content: ''
  },
  {
    id: 'ta-4',
    title: 'Sustentabilidade na Refusão: Tecnologias para Redução de Perda por Oxidação',
    summary: 'Análise comparativa de fluxos e tecnologias de forno rotativo basculante para maximizar a recuperação metálica na reciclagem de sucatas de alumínio.',
    category: 'Sustentabilidade',
    date: '10 de Novembro, 2025',
    author: 'Carlos Mendes',
    authorRole: 'Consultor Ambiental',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
    readTime: '10 min',
    imageUrl: 'https://images.unsplash.com/photo-1565514020176-db7936162608?q=80&w=1000&auto=format&fit=crop',
    type: 'technical',
    content: ''
  },
  {
    id: 'ta-5',
    title: 'Tratamento Térmico T6 vs T7: Impacto na Corrosão sob Tensão',
    summary: 'Um guia prático para engenheiros de materiais sobre a seleção do tratamento térmico adequado para ligas da série 7xxx em ambientes marinhos.',
    category: 'Tratamento Térmico',
    date: '02 de Novembro, 2025',
    author: 'Dra. Elena Costa',
    authorRole: 'Engenheira de Materiais',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop',
    readTime: '6 min',
    imageUrl: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1000&auto=format&fit=crop',
    type: 'technical',
    content: ''
  },
  {
    id: 'ta-6',
    title: 'Indústria 4.0: Monitoramento em Tempo Real de Células de Fundição',
    summary: 'Implementação de sensores IoT e Big Data para prever falhas em injetoras e robôs, garantindo OEE superior a 85% em linhas automatizadas.',
    category: 'Indústria 4.0',
    date: '25 de Outubro, 2025',
    author: 'Lucas Silva',
    authorRole: 'Engenheiro de Automação',
    authorAvatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop',
    readTime: '9 min',
    imageUrl: 'https://images.unsplash.com/photo-1531297461136-82lwDe83a9?q=80&w=1000&auto=format&fit=crop',
    type: 'technical',
    content: ''
  }
];

export const suppliers: Supplier[] = [
  {
    id: 'sup1',
    name: 'Magma Engineering',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/333/FFF?text=MAGMA',
    category: 'Software',
    description: 'Soluções líderes em simulação de fundição para otimização de processos e qualidade.',
    phone: '+55 11 3000-0000',
    email: 'contato@magma.com.br',
    location: 'São Paulo, SP',
    isVerified: true,
    rating: 4.8,
    status: 'active',
    joinedDate: 'Jan 2023'
  },
  {
    id: 'sup2',
    name: 'DJ Fornos Industriais',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/444/FFF?text=DJ+Fornos',
    category: 'Equipamentos',
    description: 'Fabricante de fornos de fusão e manutenção para alumínio com alta eficiência energética.',
    phone: '+55 47 3333-3333',
    email: 'vendas@djfornos.com.br',
    location: 'Joinville, SC',
    isVerified: true,
    rating: 4.5,
    status: 'active',
    joinedDate: 'Mar 2023'
  },
  {
    id: 'sup3',
    name: 'Alumínio Brasil',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/555/FFF?text=AluBrasil',
    category: 'Matéria Prima',
    description: 'Distribuição de lingotes de alumínio primário e ligas especiais para fundição.',
    phone: '+55 11 4000-0000',
    email: 'comercial@alubrasil.com.br',
    location: 'São Paulo, SP',
    rating: 4.0,
    status: 'active',
    joinedDate: 'Jun 2023'
  },
  {
    id: 'sup4',
    name: 'TechCast Automação',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/666/FFF?text=TechCast',
    category: 'Automação',
    description: 'Robótica e sistemas automatizados para células de injeção sob pressão.',
    phone: '+55 19 3200-0000',
    email: 'info@techcast.com.br',
    location: 'Campinas, SP',
    isVerified: true,
    rating: 4.9,
    status: 'active',
    joinedDate: 'Ago 2023'
  },
  {
    id: 'sup5',
    name: 'Global Fluxos',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/777/FFF?text=GlobalFlux',
    category: 'Insumos',
    description: 'Fluxos, desoxidantes e refinadores de grão para tratamento de alumínio líquido.',
    phone: '+55 31 3500-0000',
    email: 'vendas@globalfluxos.com.br',
    location: 'Betim, MG',
    rating: 3.8,
    status: 'active',
    joinedDate: 'Set 2023'
  },
  {
    id: 'sup6',
    name: 'QualiLab Análises',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/888/FFF?text=QualiLab',
    category: 'Serviços',
    description: 'Laboratório metalúrgico especializado em ensaios mecânicos e análise de falhas.',
    phone: '+55 11 5000-0000',
    email: 'lab@qualilab.com.br',
    location: 'São Bernardo, SP',
    rating: 4.2,
    status: 'active',
    joinedDate: 'Out 2023'
  },
  {
    id: 'sup7',
    name: 'EcoRecycle Metais',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/999/FFF?text=EcoRecycle',
    category: 'Reciclagem',
    description: 'Soluções sustentáveis para reciclagem de sucatas e dross de alumínio.',
    phone: '+55 41 3600-0000',
    email: 'contato@ecorecycle.com.br',
    location: 'Curitiba, PR',
    isVerified: true,
    rating: 4.7,
    status: 'active',
    joinedDate: 'Nov 2023'
  },
  {
    id: 'sup8',
    name: 'Moldes Precision',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/aaa/FFF?text=Precision',
    category: 'Ferramentaria',
    description: 'Design e fabricação de moldes de alta performance para injeção de alumínio.',
    phone: '+55 54 3200-0000',
    email: 'projetos@precision.com.br',
    location: 'Caxias do Sul, RS',
    rating: 4.4,
    status: 'active',
    joinedDate: 'Dez 2023'
  }
];

export const foundries: Foundry[] = [
  {
    id: 'fnd1',
    name: 'Fundição Alumax',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/333/FFF?text=Alumax',
    category: 'Injeção sob Pressão',
    description: 'Especializada em peças automotivas de alta precisão com injeção sob pressão.',
    phone: '+55 11 4444-4444',
    email: 'comercial@alumax.com.br',
    location: 'Guarulhos, SP',
    isVerified: true,
    rating: 4.9,
    status: 'active',
    joinedDate: 'Jan 2024'
  },
  {
    id: 'fnd2',
    name: 'Metalúrgica São Jorge',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/444/FFF?text=Sao+Jorge',
    category: 'Coquilha',
    description: 'Fundição por gravidade em coquilha para peças de médio porte e acabamento superior.',
    phone: '+55 31 3333-3333',
    email: 'vendas@saojorge.com.br',
    location: 'Contagem, MG',
    isVerified: true,
    rating: 4.6,
    status: 'active',
    joinedDate: 'Fev 2024'
  },
  {
    id: 'fnd3',
    name: 'Fundição Precisa',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/555/FFF?text=Precisa',
    category: 'Microfusão',
    description: 'Processo de cera perdida para componentes complexos e detalhados.',
    phone: '+55 51 3200-0000',
    email: 'contato@precisa.com.br',
    location: 'Porto Alegre, RS',
    rating: 4.3,
    status: 'active',
    joinedDate: 'Mar 2024'
  },
  {
    id: 'fnd4',
    name: 'Alumínio do Norte',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/666/FFF?text=AluNorte',
    category: 'Areia',
    description: 'Fundição em areia para peças de grande porte e protótipos industriais.',
    phone: '+55 92 3600-0000',
    email: 'comercial@alunorte.com.br',
    location: 'Manaus, AM',
    rating: 4.0,
    status: 'active',
    joinedDate: 'Abr 2024'
  },
  {
    id: 'fnd5',
    name: 'Injetec Componentes',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/777/FFF?text=Injetec',
    category: 'Injeção sob Pressão',
    description: 'Produção em larga escala de componentes para linha branca e eletroeletrônicos.',
    phone: '+55 47 3400-0000',
    email: 'vendas@injetec.com.br',
    location: 'Joinville, SC',
    isVerified: true,
    rating: 4.7,
    status: 'active',
    joinedDate: 'Mai 2024'
  },
  {
    id: 'fnd6',
    name: 'Fundição Artística Real',
    logoUrl: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/200x100/888/FFF?text=Real',
    category: 'Artística',
    description: 'Peças decorativas e arquitetônicas em alumínio e bronze.',
    phone: '+55 21 2200-0000',
    email: 'arte@real.com.br',
    location: 'Rio de Janeiro, RJ',
    rating: 4.5,
    status: 'active',
    joinedDate: 'Jun 2024'
  }
];

export const supplierProducts: Product[] = [
  { id: 'p1', name: 'Forno de Fusão a Gás', category: 'Equipamentos', price: 'Sob Consulta', description: 'Alta eficiência energética, capacidade de 1000kg.', image: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x200/eee/333?text=Forno+Gas', type: 'product' },
  { id: 'p2', name: 'Injetora Câmara Fria 800T', category: 'Máquinas', price: 'Sob Consulta', description: 'Tecnologia de ponta para peças complexas.', image: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x200/eee/333?text=Injetora', type: 'product' },
  { id: 'p3', name: 'Lingote Alumínio A356', category: 'Matéria Prima', price: 'R$ 15,00/kg', description: 'Liga primária com baixo teor de ferro.', image: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x200/eee/333?text=Lingote', type: 'product' },
  { id: 'p4', name: 'Software de Simulação Magmasoft', category: 'Software', price: 'Licença Anual', description: 'Simulação completa de enchimento e solidificação.', image: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x200/eee/333?text=Software', type: 'service' },
  { id: 'p5', name: 'Manutenção Preventiva', category: 'Serviços', price: 'Sob Consulta', description: 'Serviço especializado para fornos e injetoras.', image: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x200/eee/333?text=Manutencao', type: 'service' },
  { id: 'p6', name: 'Consultoria Metalúrgica', category: 'Consultoria', price: 'Por Hora', description: 'Análise de processos e otimização de ligas.', image: 'https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://img-wrapper.vercel.app/image?url=https://placehold.co/300x200/eee/333?text=Consultoria', type: 'service' },
];

export const supplierDocs: SupplierDocument[] = [
  { id: 'd1', name: 'Certificado ISO 9001', type: 'PDF', date: '10/01/2024', size: '2.5 MB' },
  { id: 'd2', name: 'Catálogo Geral 2025', type: 'PDF', date: '05/02/2025', size: '15 MB' },
  { id: 'd3', name: 'Política de Sustentabilidade', type: 'DOC', date: '20/12/2024', size: '500 KB' },
];

export const supplierOrders: OrderHistory[] = [
  { id: 'ORD-001', date: '01 Dez 2025', items: '2x Forno de Fusão', total: 'R$ 450.000,00', status: 'Completed' },
  { id: 'ORD-002', date: '15 Nov 2025', items: '500kg Lingote A356', total: 'R$ 7.500,00', status: 'Processing' },
  { id: 'ORD-003', date: '20 Out 2025', items: 'Manutenção Preventiva', total: 'R$ 3.200,00', status: 'Completed' },
];
