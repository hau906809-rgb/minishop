export interface Category { id: number; name: string; slug: string; order: number; icon: string; }

export interface Product {
  id: number; name: string; slug: string; categoryId: number; price: number;
  oldPrice: number; image: string; hot: boolean; stock: number; sold: number; description?: string;
}

export interface Blog { id: number; title: string; slug: string; summary: string; content: string; image: string; }

export interface Banner { id: number; title: string; slug: string; subtitle: string; image: string; link: string; }

export interface HomeData {
  banners: Banner[]; categories: Category[];
  newProducts: Product[]; bestSellers: Product[]; saleProducts: Product[];
}

export interface ProductQuery {
  search?: string; categorySlug?: string; sort?: string; limit?: number; hot?: boolean; sale?: boolean;
}

export interface CartItem { product: Product; quantity: number; }

export interface Video { id: number; title: string; youtubeId: string; }

export interface Feedback {
  id: number;
  name: string;
  avatar: string;
  stars: string;
  comment: string;
  date: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'user' | 'admin';
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';
export type PaymentMethod = 'cod' | 'bank' | 'momo';

export interface Order {
  id: number;
  code: string;
  userId: number;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  voucherCode?: string;
  status: OrderStatus;
  createdAt: string;
}

export interface Review {
  id: number;
  productId: number;
  author: string;
  rating: number;
  comment: string;
  createdAt: string;
}
