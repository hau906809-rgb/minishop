import { Injectable, computed, effect, signal } from '@angular/core';

const WISHLIST_KEY = 'minishop_wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  ids = signal<number[]>(this.load());
  count = computed(() => this.ids().length);

  constructor() {
    effect(() => localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.ids())));
  }

  private load(): number[] {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]');
    } catch {
      return [];
    }
  }

  has(productId: number): boolean {
    return this.ids().includes(productId);
  }

  toggle(productId: number) {
    this.ids.update(list => (list.includes(productId) ? list.filter(id => id !== productId) : [...list, productId]));
  }
}
