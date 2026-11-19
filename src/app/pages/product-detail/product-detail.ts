import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { ReviewService } from '../../services/review.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [DecimalPipe, DatePipe, FormsModule, RouterLink, ProductCard],
  template: `
  @if (loading()) { <div class="spinner"></div> }
  @else if (product(); as p) {
    <section class="section detail">
      <a routerLink="/products" class="hint">‹ Quay lại sản phẩm</a>
      <img [src]="p.image" [alt]="p.name" />
      <div class="detail-badges">
        @if (p.hot) { <span class="tag">HOT</span> }
        @if (avgRating() > 0) { <span class="tag">⭐ {{ avgRating() }} ({{ reviews().length }} đánh giá)</span> }
      </div>
      <h2>{{ p.name }}</h2>
      <p class="price">{{ p.price | number:'1.0-0' }}đ
        @if (p.oldPrice > p.price) { <del>{{ p.oldPrice | number:'1.0-0' }}đ</del> }
      </p>
      <p>Đã bán: {{ p.sold }} · {{ p.stock > 0 ? 'Còn ' + p.stock + ' sản phẩm' : 'Hết hàng' }}</p>
      <p>{{ p.description }}</p>

      <div class="detail-actions">
        <div class="qty">
          <button type="button" (click)="decQty()">−</button>
          <span>{{ qty() }}</span>
          <button type="button" (click)="incQty(p.stock)">+</button>
        </div>
        <button class="btn" [disabled]="p.stock === 0" (click)="cart.add(p, qty())">
          {{ p.stock > 0 ? '🛒 Thêm ' + qty() + ' vào giỏ' : 'Hết hàng' }}
        </button>
        <button type="button" class="btn-outline" (click)="wishlist.toggle(p.id)">
          {{ wishlist.has(p.id) ? '❤️ Đã thích' : '🤍 Yêu thích' }}
        </button>
      </div>
    </section>

    <section class="section card-box">
      <h2 class="section-title">⭐ Đánh giá sản phẩm ({{ reviews().length }})</h2>
      <form (ngSubmit)="submitReview(p.id)" class="form-stack">
        <div class="form-row-2">
          <input type="text" [(ngModel)]="reviewAuthor" name="author" placeholder="Tên của bạn" />
          <select [(ngModel)]="reviewRating" name="rating">
            <option [ngValue]="5">⭐⭐⭐⭐⭐ (5 sao)</option>
            <option [ngValue]="4">⭐⭐⭐⭐ (4 sao)</option>
            <option [ngValue]="3">⭐⭐⭐ (3 sao)</option>
            <option [ngValue]="2">⭐⭐ (2 sao)</option>
            <option [ngValue]="1">⭐ (1 sao)</option>
          </select>
        </div>
        <div class="voucher-row">
          <input type="text" [(ngModel)]="reviewComment" name="comment" placeholder="Chia sẻ cảm nhận về bó hoa..." required />
          <button type="submit" class="btn-primary">Gửi</button>
        </div>
      </form>

      <div class="review-list">
        @for (r of reviews(); track r.id) {
          <div class="review-item">
            <div class="order-head">
              <b>{{ r.author }}</b>
              <span>{{ '⭐'.repeat(r.rating) }}</span>
            </div>
            <p>{{ r.comment }}</p>
            <small class="hint">{{ r.createdAt | date:'dd/MM/yyyy' }}</small>
          </div>
        } @empty {
          <p class="hint">Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá!</p>
        }
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">Sản phẩm liên quan</h2>
      <div class="product-grid">
        @for (r of related(); track r.id) {
          <app-product-card [productId]="r.id" [name]="r.name" [price]="r.price" [image]="r.image" [slug]="r.slug"
            [oldPrice]="r.oldPrice" [hot]="r.hot" [stock]="r.stock" (add)="cart.add(r)" />
        }
      </div>
    </section>
  } @else {
    <p class="empty">Không tìm thấy sản phẩm. <a routerLink="/products">Xem sản phẩm khác</a></p>
  }`
})
export class ProductDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private reviewService = inject(ReviewService);
  private auth = inject(AuthService);
  cart = inject(CartService);
  wishlist = inject(WishlistService);

  loading = signal(true);
  product = signal<Product | undefined>(undefined);
  related = signal<Product[]>([]);
  qty = signal(1);

  reviewAuthor = this.auth.user()?.name || '';
  reviewRating = 5;
  reviewComment = '';

  reviews = computed(() => {
    const p = this.product();
    return p ? this.reviewService.getByProduct(p.id) : [];
  });

  avgRating = computed(() => {
    const p = this.product();
    return p ? this.reviewService.getAverage(p.id) : 0;
  });

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.loading.set(true);
      this.qty.set(1);
      this.productService.getBySlug(params.get('slug')!).subscribe(p => {
        this.product.set(p);
        this.loading.set(false);
        if (p) this.productService.getProducts().subscribe(all =>
          this.related.set(all.filter(x => x.categoryId === p.categoryId && x.id !== p.id).slice(0, 4)));
      });
    });
  }

  decQty() { this.qty.update(q => Math.max(1, q - 1)); }
  incQty(stock: number) { this.qty.update(q => Math.min(stock, q + 1)); }

  submitReview(productId: number) {
    if (!this.reviewComment.trim()) return;
    this.reviewService.add(productId, this.reviewAuthor, this.reviewRating, this.reviewComment);
    this.reviewComment = '';
  }
}
