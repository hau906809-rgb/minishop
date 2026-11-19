import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Banner, Category, Feedback, Product } from '../../models/product.model';
import { FEEDBACKS } from '../../data/products.data';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private homeService = inject(HomeService);
  cart = inject(CartService);

  loading = signal(true);
  banners = signal<Banner[]>([]);
  categories = signal<Category[]>([]);
  newProducts = signal<Product[]>([]);
  bestSellers = signal<Product[]>([]);
  saleProducts = signal<Product[]>([]);

  // DỮ LIỆU MẢNG: Feedback từ khách hàng (Bài test Lab 1, 2, 3)
  feedbacks = signal<Feedback[]>(FEEDBACKS);

  // FORM NEWSLETTER
  newsletterEmail = signal('');
  subscribed = signal(false);

  ngOnInit() {
    this.homeService.getHome().subscribe(d => {
      this.banners.set(d.banners);
      this.categories.set(d.categories);
      this.newProducts.set(d.newProducts);
      this.bestSellers.set(d.bestSellers);
      this.saleProducts.set(d.saleProducts);
      this.loading.set(false);
    });
  }

  handleSubscribe(event: Event) {
    event.preventDefault();
    if (this.newsletterEmail().trim()) {
      this.subscribed.set(true);
      this.newsletterEmail.set('');
    }
  }
}
