import { Injectable, computed, effect, signal } from '@angular/core';
import { CartItem, Product } from '../models/product.model';

const KEY = 'minishop_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>(this.load());
  count = computed(() => this.items().reduce((s, i) => s + i.quantity, 0));
  total = computed(() => this.items().reduce((s, i) => s + i.quantity * i.product.price, 0));
  toast = signal('');
  private timer?: ReturnType<typeof setTimeout>;

  constructor() {
    effect(() => localStorage.setItem(KEY, JSON.stringify(this.items())));
  }

  private load(): CartItem[] {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  }

  add(product: Product, qty = 1) {
    if (product.stock <= 0) return;
    const addQty = Math.max(1, qty);
    this.items.update(list => {
      const found = list.find(i => i.product.id === product.id);
      return found
        ? list.map(i => i.product.id === product.id ? { ...i, quantity: Math.min(i.quantity + addQty, product.stock) } : i)
        : [...list, { product, quantity: Math.min(addQty, product.stock) }];
    });
    this.notify('Đã thêm ' + product.name + ' vào giỏ hàng!');
  }

  setQty(id: number, qty: number) {
    if (qty <= 0) return this.remove(id);
    this.items.update(list => list.map(i => i.product.id === id ? { ...i, quantity: Math.min(qty, i.product.stock) } : i));
  }

  remove(id: number) { this.items.update(list => list.filter(i => i.product.id !== id)); }
  clear() { this.items.set([]); }

  private notify(msg: string) {
    this.toast.set(msg);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.toast.set(''), 2000);
  }
}
