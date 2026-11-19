import { Injectable, signal } from '@angular/core';
import { CartItem, Order, OrderStatus, PaymentMethod } from '../models/product.model';

const ORDERS_KEY = 'minishop_orders';

export interface VoucherInfo {
  code: string;
  label: string;
  discount: number;
  freeShip?: boolean;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  orders = signal<Order[]>(this.load());

  private load(): Order[] {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    } catch {
      return [];
    }
  }

  private save(list: Order[]) {
    this.orders.set(list);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(list));
  }

  evaluateVoucher(code: string, subtotal: number): { valid: boolean; message: string; voucher?: VoucherInfo } {
    const c = code.trim().toUpperCase();
    if (!c) return { valid: false, message: 'Vui lòng nhập mã giảm giá.' };
    if (c === 'ORANGE10') {
      const discount = Math.round(subtotal * 0.1);
      return { valid: true, message: 'Áp dụng giảm 10% thành công!', voucher: { code: c, label: 'Giảm 10%', discount } };
    }
    if (c === 'BLOOM50K') {
      if (subtotal < 300000) return { valid: false, message: 'Mã BLOOM50K áp dụng cho đơn từ 300.000đ.' };
      return { valid: true, message: 'Áp dụng giảm 50.000đ thành công!', voucher: { code: c, label: 'Giảm 50.000đ', discount: 50000 } };
    }
    if (c === 'FREESHIP') {
      return { valid: true, message: 'Miễn phí vận chuyển!', voucher: { code: c, label: 'Freeship', discount: 0, freeShip: true } };
    }
    return { valid: false, message: 'Mã giảm giá không hợp lệ. Thử: ORANGE10, BLOOM50K, FREESHIP' };
  }

  placeOrder(payload: {
    userId: number;
    customerName: string;
    phone: string;
    address: string;
    note?: string;
    paymentMethod: PaymentMethod;
    items: CartItem[];
    voucherCode?: string;
  }): Order {
    const subtotal = payload.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    let discount = 0;
    let shippingFee = subtotal >= 500000 ? 0 : 30000;

    if (payload.voucherCode) {
      const res = this.evaluateVoucher(payload.voucherCode, subtotal);
      if (res.valid && res.voucher) {
        discount = res.voucher.discount;
        if (res.voucher.freeShip) shippingFee = 0;
      }
    }

    const total = Math.max(0, subtotal - discount + shippingFee);
    const id = Date.now();
    const order: Order = {
      id,
      code: 'OB' + String(id).slice(-6),
      userId: payload.userId,
      customerName: payload.customerName,
      phone: payload.phone,
      address: payload.address,
      note: payload.note,
      paymentMethod: payload.paymentMethod,
      items: payload.items,
      subtotal,
      discount,
      shippingFee,
      total,
      voucherCode: payload.voucherCode?.trim().toUpperCase() || undefined,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.save([order, ...this.orders()]);
    return order;
  }

  getByUser(userId: number): Order[] {
    return this.orders().filter(o => o.userId === userId);
  }

  updateStatus(orderId: number, status: OrderStatus) {
    this.save(this.orders().map(o => (o.id === orderId ? { ...o, status } : o)));
  }
}
