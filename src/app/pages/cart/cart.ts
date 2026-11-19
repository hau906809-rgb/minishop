import { Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  template: `
  <section class="section">
    <h2 class="section-title">🛒 Giỏ hàng</h2>
    @for (i of cart.items(); track i.product.id) {
      <div class="cart-item">
        <img [src]="i.product.image" [alt]="i.product.name" />
        <div class="info">
          <a [routerLink]="['/product', i.product.slug]"><b>{{ i.product.name }}</b></a>
          <span>{{ i.product.price | number:'1.0-0' }}đ</span>
          <div class="qty">
            <button (click)="cart.setQty(i.product.id, i.quantity - 1)">−</button>
            <span>{{ i.quantity }}</span>
            <button (click)="cart.setQty(i.product.id, i.quantity + 1)">+</button>
            <button class="del" (click)="cart.remove(i.product.id)">Xóa</button>
          </div>
        </div>
        <strong>{{ i.product.price * i.quantity | number:'1.0-0' }}đ</strong>
      </div>
    } @empty {
      <p class="empty">Giỏ hàng trống. <a routerLink="/products">Mua sắm ngay</a></p>
    }
    @if (cart.items().length) {
      <div class="cart-total">
        <span>Tổng ({{ cart.count() }} sản phẩm):</span>
        <strong>{{ cart.total() | number:'1.0-0' }}đ</strong>
      </div>
      <div class="cart-actions">
        <button class="btn-outline" (click)="cart.clear()">Xóa giỏ hàng</button>
        <a routerLink="/checkout" class="btn-primary">Tiến hành thanh toán →</a>
      </div>
    }
  </section>`
})
export class Cart {
  cart = inject(CartService);
}
