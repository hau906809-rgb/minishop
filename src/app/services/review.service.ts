import { Injectable, signal } from '@angular/core';
import { Review } from '../models/product.model';

const REVIEWS_KEY = 'minishop_reviews';

const SEED_REVIEWS: Review[] = [
  { id: 1, productId: 1, author: 'Thu Hà', rating: 5, comment: 'Hoa tươi, gói giấy rất sang và giao đúng giờ hẹn!', createdAt: '2026-11-10T09:30:00.000Z' },
  { id: 2, productId: 1, author: 'Minh Khoa', rating: 4, comment: 'Bó hoa đẹp giống hình, người nhận rất thích.', createdAt: '2026-11-12T14:15:00.000Z' },
  { id: 3, productId: 2, author: 'Lan Phương', rating: 5, comment: 'Màu hoa rực rỡ, giữ được gần 1 tuần vẫn tươi.', createdAt: '2026-11-14T16:00:00.000Z' }
];

@Injectable({ providedIn: 'root' })
export class ReviewService {
  reviews = signal<Review[]>(this.load());

  private load(): Review[] {
    try {
      const raw = localStorage.getItem(REVIEWS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(SEED_REVIEWS));
    return [...SEED_REVIEWS];
  }

  getByProduct(productId: number): Review[] {
    return this.reviews().filter(r => r.productId === productId);
  }

  getAverage(productId: number): number {
    const list = this.getByProduct(productId);
    if (!list.length) return 0;
    return Number((list.reduce((s, r) => s + r.rating, 0) / list.length).toFixed(1));
  }

  add(productId: number, author: string, rating: number, comment: string) {
    const item: Review = {
      id: Date.now(),
      productId,
      author: author.trim() || 'Khách hàng',
      rating,
      comment: comment.trim(),
      createdAt: new Date().toISOString()
    };
    const next = [item, ...this.reviews()];
    this.reviews.set(next);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(next));
  }
}
