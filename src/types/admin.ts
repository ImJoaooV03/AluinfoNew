export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'active' | 'inactive';
  lastLogin: string;
  avatar: string;
}

export interface AdminStats {
  totalViews: number;
  totalUsers: number;
  totalArticles: number;
  activeSuppliers: number;
  growth: {
    views: number;
    users: number;
    articles: number;
    suppliers: number;
  }
}

export interface AdminArticle {
  id: string;
  title: string;
  category: string;
  author: string;
  status: 'published' | 'draft' | 'scheduled';
  publishDate: string;
  views: number;
}
