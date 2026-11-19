import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService, VoucherInfo } from '../../services/order.service';
import { PaymentMethod } from '../../models/product.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule, RouterLink],
  template: `
  <section class="section">
    <h2 class="section-title">🧾 Thanh toán đơn hàng</h2>

    @if (!cart.items().length) {
      <p class="empty">Giỏ hàng đang trống. <a routerLink="/products">Chọn hoa ngay</a></p>
    } @else {
      <form [formGroup]="form" (ngSubmit)="submit()" class="form-stack card-box">
        <label>
          <span>Họ và tên người nhận *</span>
          <input type="text" formControlName="customerName" placeholder="Nguyễn Văn A" />
          @if (form.controls.customerName.touched && form.controls.customerName.invalid) {
            <small class="err">Vui lòng nhập họ tên người nhận.</small>
          }
        </label>

        <label>
          <span>Số điện thoại *</span>
          <input type="tel" formControlName="phone" placeholder="0901234567" />
          @if (form.controls.phone.touched && form.controls.phone.invalid) {
            <small class="err">Số điện thoại hợp lệ gồm 9–11 chữ số.</small>
          }
        </label>

        <label>
          <span>Địa chỉ giao hàng *</span>
          <input type="text" formControlName="address" placeholder="Số nhà, đường, phường/xã, quận/huyện..." />
          @if (form.controls.address.touched && form.controls.address.invalid) {
            <small class="err">Vui lòng nhập địa chỉ giao hàng đầy đủ.</small>
          }
        </label>

        <label>
          <span>Ghi chú (thiệp chúc mừng, giờ giao...)</span>
          <input type="text" formControlName="note" placeholder="Ví dụ: Giao trước 17h, ghi thiệp Chúc Mừng" />
        </label>

        <label>
          <span>Phương thức thanh toán</span>
          <select formControlName="paymentMethod">
            <option value="cod">💵 Thanh toán khi nhận hàng (COD)</option>
            <option value="bank">🏦 Chuyển khoản ngân hàng</option>
            <option value="momo">📱 Ví MoMo</option>
          </select>
        </label>

        <div class="voucher-row">
          <input type="text" formControlName="voucherCode" placeholder="Mã giảm giá (ORANGE10, BLOOM50K, FREESHIP)" />
          <button type="button" class="btn-outline" (click)="applyVoucher()">Áp dụng</button>
        </div>
        @if (voucherMsg()) {
          <p [class]="appliedVoucher() ? 'hint-ok' : 'err'">{{ voucherMsg() }}</p>
        }

        <div class="summary-box">
          <div class="summary-row"><span>Tạm tính ({{ cart.count() }} sản phẩm)</span><span>{{ cart.total() | number:'1.0-0' }}đ</span></div>
          <div class="summary-row"><span>Phí vận chuyển</span><span>{{ shippingFee() === 0 ? 'Miễn phí' : (shippingFee() | number:'1.0-0') + 'đ' }}</span></div>
          @if (discount() > 0) {
            <div class="summary-row discount"><span>Giảm giá ({{ appliedVoucher()?.code }})</span><span>-{{ discount() | number:'1.0-0' }}đ</span></div>
          }
          <div class="summary-row total"><strong>Tổng thanh toán</strong><strong>{{ finalTotal() | number:'1.0-0' }}đ</strong></div>
        </div>

        <button type="submit" class="btn-primary">Đặt hàng ngay</button>
      </form>
    }
  </section>`
})
export class Checkout {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  cart = inject(CartService);

  appliedVoucher = signal<VoucherInfo | undefined>(undefined);
  voucherMsg = signal('');

  form = this.fb.nonNullable.group({
    customerName: [this.auth.user()?.name || '', [Validators.required, Validators.minLength(2)]],
    phone: [this.auth.user()?.phone || '', [Validators.required, Validators.pattern(/^0\d{8,10}$/)]],
    address: [this.auth.user()?.address || '', [Validators.required, Validators.minLength(8)]],
    note: [''],
    paymentMethod: ['cod' as PaymentMethod],
    voucherCode: ['']
  });

  shippingFee = computed(() => {
    if (this.appliedVoucher()?.freeShip) return 0;
    return this.cart.total() >= 500000 ? 0 : 30000;
  });

  discount = computed(() => this.appliedVoucher()?.discount || 0);
  finalTotal = computed(() => Math.max(0, this.cart.total() - this.discount() + this.shippingFee()));

  applyVoucher() {
    const code = this.form.controls.voucherCode.value;
    const res = this.orderService.evaluateVoucher(code, this.cart.total());
    this.appliedVoucher.set(res.valid ? res.voucher : undefined);
    this.voucherMsg.set(res.message);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.orderService.placeOrder({
      userId: this.auth.user()!.id,
      customerName: v.customerName,
      phone: v.phone,
      address: v.address,
      note: v.note,
      paymentMethod: v.paymentMethod,
      items: this.cart.items(),
      voucherCode: this.appliedVoucher()?.code
    });
    this.cart.clear();
    this.router.navigate(['/orders']);
  }
}
