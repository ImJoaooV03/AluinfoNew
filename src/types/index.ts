export interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  category: string;
  date: string;
  author?: string;
  imageUrl: string;
  isHighlight?: boolean;
  downloads?: number;
  pages?: number;
  location?: string;
  type?: 'news' | 'technical' | 'ebook' | 'event';
  fileUrl?: string;
  linkUrl?: string; // Novo campo para links externos (Eventos, etc)
}

export interface AdBanner {
  id: string;
  imageUrl: string;
  alt: string;
}

export interface Article extends NewsItem {
  content: string;
  subtitle?: string;
  readTime?: string;
  authorAvatar?: string;
  authorRole?: string;
  tags?: string[];
}

export interface Supplier {
  id: string;
  name: string;
  logoUrl: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  whatsapp?: string;
  location: string;
  website?: string;
  isVerified?: boolean;
  rating?: number;
  status?: 'active' | 'inactive';
  joinedDate?: string;
}

export interface Foundry {
  id: string;
  name: string;
  logoUrl: string;
  category: string;
  description: string;
  phone: string;
  email: string;
  whatsapp?: string;
  location: string;
  website?: string;
  isVerified?: boolean;
  rating?: number;
  status?: 'active' | 'inactive';
  joinedDate?: string;
  // Novos campos de métricas
  certification?: string;
  yearsExperience?: string;
  monthlyCapacity?: string;
  marketReach?: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price?: string;
  category: string;
  description: string;
  type?: 'product' | 'service';
  linkUrl?: string;
}

export interface SupplierDocument {
  id: string;
  name: string;
  type: 'PDF' | 'DOC' | 'XLS';
  date: string;
  size: string;
}

export interface OrderHistory {
  id: string;
  date: string;
  items: string;
  total: string;
  status: 'Completed' | 'Pending' | 'Processing';
}
