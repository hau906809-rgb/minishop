import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { combineLatest } from 'rxjs';
import { CategoryService, ProductService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { Category, Product } from '../../models/product.model';
import { ProductCard } from '../../shared/components/product-card/product-card';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [RouterLink, ProductCard],
  templateUrl: './products.html'
})
export class Products implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  cart = inject(CartService);

  /** saleOnly = true khi dùng cho route /khuyen-mai */
  saleOnly = !!this.route.snapshot.data['sale'];

  loading = signal(true);
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  slug = signal('tat-ca');
  search = signal('');          // từ khóa gửi lên API (?search=)
  keyword = signal('');         // lọc nhanh phía client
  sortBy = signal('default');
  priceRange = signal('all');
  onlyHot = signal(false);
  inStock = signal(false);

  currentCategory = computed(() => this.categories().find(c => c.slug === this.slug()));

  filteredProducts = computed(() => {
    let result = [...this.products()];
    const kw = this.keyword().trim().toLowerCase();
    if (kw) result = result.filter(p => p.name.toLowerCase().includes(kw));
    if (this.onlyHot()) result = result.filter(p => p.hot);
    if (this.inStock()) result = result.filter(p => p.stock > 0);
    if (this.priceRange() === 'under-300') result = result.filter(p => p.price < 300000);
    if (this.priceRange() === '300-600') result = result.filter(p => p.price >= 300000 && p.price <= 600000);
    if (this.priceRange() === 'over-600') result = result.filter(p => p.price > 600000);
    if (this.sortBy() === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (this.sortBy() === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (this.sortBy() === 'newest') result.sort((a, b) => b.id - a.id);
    if (this.sortBy() === 'best-seller') result.sort((a, b) => b.sold - a.sold);
    return result;
  });

  ngOnInit() {
    this.categoryService.getCategories().subscribe(c => this.categories.set(c));
    // Dùng subscribe (không dùng snapshot) để cập nhật khi đổi slug/search trên cùng component
    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(([params, query]) => {
      this.slug.set(params.get('slug') || 'tat-ca');
      this.search.set(query.get('search') || '');
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.productService.getProducts({ categorySlug: this.slug(), search: this.search(), sale: this.saleOnly })
      .subscribe(list => { this.products.set(list); this.loading.set(false); });
  }

  clearFilters() {
    this.keyword.set(''); this.sortBy.set('default'); this.priceRange.set('all'); this.onlyHot.set(false); this.inStock.set(false);
    if (this.search()) this.router.navigate([], { queryParams: {} });
  }
}
