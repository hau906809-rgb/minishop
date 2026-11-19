import { Component, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { OrderStatus } from '../../models/product.model';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy'
};

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [DecimalPipe, DatePipe, RouterLink],
  template: `
  <section class="section">
    <h2 class="section-title">📦 Đơn hàng của tôi</h2>

    @for (o of myOrders(); track o.id) {
      <div class="order-card">
        <div class="order-head">
          <strong>Mã đơn #{{ o.code }}</strong>
          <span class="status-badge" [attr.data-status]="o.status">{{ statusLabel(o.status) }}</span>
        </div>
        <p class="hint">{{ o.createdAt | date:'dd/MM/yyyy HH:mm' }} · {{ o.customerName }} · {{ o.phone }}</p>
        <p class="hint">📍 {{ o.address }}</p>

        <div class="order-items">
          @for (item of o.items; track item.product.id) {
            <div class="order-item-row">
              <span>{{ item.product.name }} × {{ item.quantity }}</span>
              <span>{{ item.product.price * item.quantity | number:'1.0-0' }}đ</span>
            </div>
          }
        </div>

        <div class="order-foot">
          <strong>Tổng: {{ o.total | number:'1.0-0' }}đ</strong>
          @if (o.status === 'pending') {
            <button type="button" class="btn-outline" (click)="cancel(o.id)">Hủy đơn</button>
          }
        </div>
      </div>
    } @empty {
      <p class="empty">Bạn chưa có đơn hàng nào. <a routerLink="/products">Mua sắm ngay</a></p>
    }
  </section>`
})
export class Orders {
  private auth = inject(AuthService);
  private orderService = inject(OrderService);

  myOrders = computed(() => {
    const uid = this.auth.user()?.id;
    return uid ? this.orderService.getByUser(uid) : [];
  });

  statusLabel(s: OrderStatus) {
    return STATUS_LABEL[s];
  }

  cancel(orderId: number) {
    this.orderService.updateStatus(orderId, 'cancelled');
  }
}
