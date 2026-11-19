import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService, ProductService } from '../../services/api.service';
import { OrderService } from '../../services/order.service';
import { Category, OrderStatus, Product } from '../../models/product.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [DecimalPipe, DatePipe, ReactiveFormsModule],
  template: `
  <section class="section">
    <h2 class="section-title">🛠️ Trang quản trị OrangeBloom</h2>

    <div class="auth-tabs">
      <button type="button" [class.active]="tab() === 'overview'" (click)="tab.set('overview')">Tổng quan</button>
      <button type="button" [class.active]="tab() === 'products'" (click)="tab.set('products')">Sản phẩm ({{ products().length }})</button>
      <button type="button" [class.active]="tab() === 'orders'" (click)="tab.set('orders')">Đơn hàng ({{ orderService.orders().length }})</button>
    </div>

    @if (tab() === 'overview') {
      <div class="stats-grid">
        <div class="stat-card"><span>Sản phẩm</span><strong>{{ products().length }}</strong></div>
        <div class="stat-card"><span>Tổng đơn hàng</span><strong>{{ orderService.orders().length }}</strong></div>
        <div class="stat-card"><span>Chờ xác nhận</span><strong>{{ pendingCount() }}</strong></div>
        <div class="stat-card"><span>Doanh thu</span><strong>{{ revenue() | number:'1.0-0' }}đ</strong></div>
      </div>
    }

    @if (tab() === 'products') {
      <div class="card-box">
        <h3>{{ editingId() ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới' }}</h3>
        <form [formGroup]="form" (ngSubmit)="saveProduct()" class="form-stack">
          <label>
            <span>Tên sản phẩm *</span>
            <input type="text" formControlName="name" placeholder="Bó Hoa Hướng Dương Nắng Mai" />
          </label>
          <div class="form-row-2">
            <label>
              <span>Giá bán (đ) *</span>
              <input type="number" formControlName="price" />
            </label>
            <label>
              <span>Giá cũ (đ)</span>
              <input type="number" formControlName="oldPrice" />
            </label>
          </div>
          <div class="form-row-2">
            <label>
              <span>Danh mục</span>
              <select formControlName="categoryId">
                @for (c of categories(); track c.id) {
                  <option [ngValue]="c.id">{{ c.icon }} {{ c.name }}</option>
                }
              </select>
            </label>
            <label>
              <span>Tồn kho</span>
              <input type="number" formControlName="stock" />
            </label>
          </div>
          <label>
            <span>URL Hình ảnh *</span>
            <input type="text" formControlName="image" placeholder="https://..." />
          </label>
          <label>
            <span>Mô tả</span>
            <input type="text" formControlName="description" placeholder="Mô tả ngắn về bó hoa..." />
          </label>
          <label class="inline-check">
            <input type="checkbox" formControlName="hot" /> Sản phẩm HOT
          </label>
          <div class="demo-actions">
            <button type="submit" class="btn-primary">{{ editingId() ? 'Lưu thay đổi' : 'Thêm sản phẩm' }}</button>
            @if (editingId()) {
              <button type="button" class="btn-outline" (click)="resetForm()">Hủy sửa</button>
            }
          </div>
        </form>
      </div>

      <input class="search" type="search" placeholder="Tìm sản phẩm trong kho..."
        [value]="searchKw()" (input)="searchKw.set($any($event.target).value)" />

      <div class="admin-list">
        @for (p of filteredProducts(); track p.id) {
          <div class="admin-row">
            <img [src]="p.image" [alt]="p.name" />
            <div class="admin-info">
              <b>{{ p.name }}</b>
              <span>{{ p.price | number:'1.0-0' }}đ · Kho: {{ p.stock }}</span>
            </div>
            <div class="admin-actions">
              <button type="button" class="btn-outline" (click)="editProduct(p)">Sửa</button>
              <button type="button" class="del" (click)="deleteProduct(p.id)">Xóa</button>
            </div>
          </div>
        }
      </div>
    }

    @if (tab() === 'orders') {
      <div class="admin-list">
        @for (o of orderService.orders(); track o.id) {
          <div class="order-card">
            <div class="order-head">
              <strong>#{{ o.code }} - {{ o.customerName }}</strong>
              <select [value]="o.status" (change)="changeStatus(o.id, $any($event.target).value)">
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="shipping">Đang giao</option>
                <option value="completed">Hoàn thành</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>
            <p class="hint">{{ o.createdAt | date:'dd/MM/yyyy HH:mm' }} · {{ o.phone }} · {{ o.address }}</p>
            <p><strong>Tổng: {{ o.total | number:'1.0-0' }}đ</strong> ({{ o.items.length }} loại hoa)</p>
          </div>
        } @empty {
          <p class="empty">Chưa có đơn hàng nào.</p>
        }
      </div>
    }
  </section>`
})
export class Admin implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  orderService = inject(OrderService);

  tab = signal<'overview' | 'products' | 'orders'>('overview');
  products = signal<Product[]>([]);
  categories = signal<Category[]>([]);
  editingId = signal<number | null>(null);
  searchKw = signal('');

  pendingCount = computed(() => this.orderService.orders().filter(o => o.status === 'pending').length);
  revenue = computed(() =>
    this.orderService.orders()
      .filter(o => o.status !== 'cancelled')
      .reduce((s, o) => s + o.total, 0)
  );

  filteredProducts = computed(() => {
    const kw = this.searchKw().trim().toLowerCase();
    return kw ? this.products().filter(p => p.name.toLowerCase().includes(kw)) : this.products();
  });

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    price: [350000, [Validators.required, Validators.min(1000)]],
    oldPrice: [0],
    categoryId: [1],
    stock: [10, [Validators.min(0)]],
    image: ['https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600', [Validators.required]],
    description: [''],
    hot: [false]
  });

  ngOnInit() {
    this.loadProducts();
    this.categoryService.getCategories().subscribe(c => this.categories.set(c));
  }

  loadProducts() {
    this.productService.getProducts().subscribe(list => this.products.set(list));
  }

  private toSlug(name: string) {
    return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + String(Date.now()).slice(-4);
  }

  saveProduct() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    const id = this.editingId();
    if (id) {
      this.productService.updateProduct(id, v).subscribe(() => {
        this.resetForm();
        this.loadProducts();
      });
    } else {
      this.productService.createProduct({
        ...v,
        slug: this.toSlug(v.name),
        sold: 0
      }).subscribe(() => {
        this.resetForm();
        this.loadProducts();
      });
    }
  }

  editProduct(p: Product) {
    this.editingId.set(p.id);
    this.form.patchValue({
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice,
      categoryId: p.categoryId,
      stock: p.stock,
      image: p.image,
      description: p.description || '',
      hot: p.hot
    });
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe(() => this.loadProducts());
  }

  resetForm() {
    this.editingId.set(null);
    this.form.reset({
      name: '',
      price: 350000,
      oldPrice: 0,
      categoryId: 1,
      stock: 10,
      image: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600',
      description: '',
      hot: false
    });
  }

  changeStatus(orderId: number, status: OrderStatus) {
    this.orderService.updateStatus(orderId, status);
  }
}
