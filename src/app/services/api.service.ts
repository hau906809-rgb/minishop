import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { Banner, Blog, Category, HomeData, Product, ProductQuery } from '../models/product.model';
import { BANNERS, BLOGS, CATEGORIES, PRODUCTS } from '../data/products.data';

const LOCAL_PRODUCTS_KEY = 'minishop_products_override';

function getLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(LOCAL_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [...PRODUCTS];
}

function saveLocalProducts(list: Product[]) {
  localStorage.setItem(LOCAL_PRODUCTS_KEY, JSON.stringify(list));
}

/** Lọc/sắp xếp mảng tĩnh – dùng khi backend không phản hồi (giống logic API). */
export function queryLocal(q: ProductQuery = {}): Product[] {
  let r = [...getLocalProducts()];
  if (q.search) r = r.filter(p => p.name.toLowerCase().includes(q.search!.toLowerCase()));
  if (q.categorySlug && q.categorySlug !== 'tat-ca') {
    const cat = CATEGORIES.find(c => c.slug === q.categorySlug);
    r = r.filter(p => p.categoryId === cat?.id);
  }
  if (q.hot) r = r.filter(p => p.hot);
  if (q.sale) r = r.filter(p => p.oldPrice > p.price);
  const sorts: Record<string, (a: Product, b: Product) => number> = {
    'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price,
    newest: (a, b) => b.id - a.id, 'best-seller': (a, b) => b.sold - a.sold
  };
  if (q.sort && sorts[q.sort]) r.sort(sorts[q.sort]);
  return q.limit ? r.slice(0, q.limit) : r;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/products';

  getProducts(q: ProductQuery = {}): Observable<Product[]> {
    let params = new HttpParams();
    Object.entries(q).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== false) params = params.set(k, String(v)); });
    return this.http.get<Product[]>(this.url, { params }).pipe(catchError(() => of(queryLocal(q))));
  }

  getBySlug(slug: string): Observable<Product | undefined> {
    return this.http.get<Product>(`${this.url}/${slug}`)
      .pipe(catchError(() => of(getLocalProducts().find(p => p.slug === slug))));
  }

  createProduct(data: Omit<Product, 'id'>): Observable<Product> {
    const localList = getLocalProducts();
    const newItem: Product = { ...data, id: Date.now() };
    return this.http.post<Product>(this.url, data).pipe(
      catchError(() => {
        saveLocalProducts([newItem, ...localList]);
        return of(newItem);
      })
    );
  }

  updateProduct(id: number, data: Partial<Product>): Observable<Product> {
    const localList = getLocalProducts();
    const updated = localList.map(p => (p.id === id ? { ...p, ...data } : p));
    const item = updated.find(p => p.id === id) as Product;
    return this.http.put<Product>(`${this.url}/${id}`, data).pipe(
      catchError(() => {
        saveLocalProducts(updated);
        return of(item);
      })
    );
  }

  deleteProduct(id: number): Observable<unknown> {
    const localList = getLocalProducts();
    return this.http.delete(`${this.url}/${id}`).pipe(
      catchError(() => {
        saveLocalProducts(localList.filter(p => p.id !== id));
        return of({ deleted: true });
      })
    );
  }
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(environment.apiUrl + '/categories').pipe(catchError(() => of(CATEGORIES)));
  }
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);
  private url = environment.apiUrl + '/blogs';
  getBlogs(): Observable<Blog[]> {
    return this.http.get<Blog[]>(this.url).pipe(catchError(() => of(BLOGS)));
  }
  getBySlug(slug: string): Observable<Blog | undefined> {
    return this.http.get<Blog>(`${this.url}/${slug}`).pipe(catchError(() => of(BLOGS.find(b => b.slug === slug))));
  }
}

@Injectable({ providedIn: 'root' })
export class HomeService {
  private http = inject(HttpClient);
  getHome(): Observable<HomeData> {
    return this.http.get<HomeData>(environment.apiUrl + '/home').pipe(catchError(() => of<HomeData>({
      banners: BANNERS as Banner[], categories: CATEGORIES,
      newProducts: queryLocal({ sort: 'newest', limit: 4 }),
      bestSellers: queryLocal({ sort: 'best-seller', limit: 4 }),
      saleProducts: queryLocal({ sale: true, sort: 'newest', limit: 4 })
    })), map(d => d));
  }
}
