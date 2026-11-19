import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BlogService } from '../../services/api.service';
import { Blog } from '../../models/product.model';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section class="section">
    <h2 class="section-title">📰 Bài viết</h2>
    @for (b of blogs(); track b.id) {
      <a class="blog-item" [routerLink]="['/bai_viet', b.slug]">
        <img [src]="b.image" [alt]="b.title" />
        <h3>{{ b.title }}</h3><p>{{ b.summary }}</p>
      </a>
    } @empty { <div class="spinner"></div> }
  </section>`
})
export class BlogList implements OnInit {
  private blogService = inject(BlogService);
  blogs = signal<Blog[]>([]);
  ngOnInit() { this.blogService.getBlogs().subscribe(b => this.blogs.set(b)); }
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
  <section class="section">
    <a routerLink="/bai_viet" class="hint">‹ Tất cả bài viết</a>
    @if (blog(); as b) {
      <img [src]="b.image" [alt]="b.title" class="full" />
      <h2>{{ b.title }}</h2><p><i>{{ b.summary }}</i></p><p>{{ b.content }}</p>
    } @else { <p class="empty">Không tìm thấy bài viết.</p> }
  </section>`
})
export class BlogDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private blogService = inject(BlogService);
  blog = signal<Blog | undefined>(undefined);
  ngOnInit() {
    this.route.paramMap.subscribe(p => this.blogService.getBySlug(p.get('slug')!).subscribe(b => this.blog.set(b)));
  }
}
