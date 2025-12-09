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
  fileUrl?: string; // Novo campo para o link do arquivo (PDF/Doc)
}

export interface AdBanner {
  id: string;
  imageUrl: string;
  alt: string;
}

export interface Article extends NewsItem {
  content: string; // HTML or Markdown content
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
  category: string; // e.g., "Injeção sob Pressão", "Coquilha", "Areia"
  description: string;
  phone: string;
  email: string;
  location: string;
  website?: string;
  isVerified?: boolean;
  rating?: number;
  status?: 'active' | 'inactive';
  joinedDate?: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  price?: string;
  category: string;
  description: string;
  type?: 'product' | 'service'; // Added type to distinguish
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
