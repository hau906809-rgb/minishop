import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { WishlistService } from '../../services/wishlist.service';
import { Product } from '../../models/product.model';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, ProductCard],
  template: `
  <section class="section">
    <h2 class="section-title">❤️ Sản phẩm yêu thích ({{ items().length }})</h2>
    @if (loading()) {
      <div class="spinner"></div>
    } @else {
      <div class="product-grid">
        @for (item of items(); track item.id) {
          <app-product-card [productId]="item.id" [name]="item.name" [price]="item.price" [image]="item.image"
            [slug]="item.slug" [oldPrice]="item.oldPrice" [hot]="item.hot" [stock]="item.stock"
            (add)="cart.add(item)" />
        } @empty {
          <p class="empty">Chưa có sản phẩm yêu thích nào. <a routerLink="/products">Khám phá ngay</a></p>
        }
      </div>
    }
  </section>`
})
export class Wishlist implements OnInit {
  private productService = inject(ProductService);
  wishlist = inject(WishlistService);
  cart = inject(CartService);

  loading = signal(true);
  allProducts = signal<Product[]>([]);

  items = computed(() => {
    const ids = this.wishlist.ids();
    return this.allProducts().filter(p => ids.includes(p.id));
  });

  ngOnInit() {
    this.productService.getProducts().subscribe(list => {
      this.allProducts.set(list);
      this.loading.set(false);
    });
  }
}
