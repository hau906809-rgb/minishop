import { Component, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../../services/wishlist.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [DecimalPipe, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css'
})
export class ProductCard {
  wishlist = inject(WishlistService);

  productId = input<number>(0);
  name = input.required<string>();
  price = input.required<number>();
  image = input.required<string>();
  slug = input<string>('');
  oldPrice = input<number>(0);
  hot = input<boolean>(false);
  stock = input<number>(0);
  add = output<void>();

  addToCart() { if (this.stock() > 0) this.add.emit(); }
  toggleWish(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    if (this.productId()) this.wishlist.toggle(this.productId());
  }
}
