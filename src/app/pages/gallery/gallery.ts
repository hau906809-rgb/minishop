import { Component, inject } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { VIDEOS } from '../../data/products.data';

@Component({
  selector: 'app-gallery',
  standalone: true,
  template: `
  <section class="section">
    <h2 class="section-title">🎬 Gallery video</h2>
    @for (v of videos; track v.id) {
      <div class="video">
        <iframe [src]="v.url" [title]="v.title" allowfullscreen loading="lazy"></iframe>
        <p>{{ v.title }}</p>
      </div>
    }
  </section>`,
  styles: `.video iframe { width:100%; aspect-ratio:16/9; border:0; border-radius:10px; } .video p { margin:6px 0 16px; font-weight:bold; }`
})
export class Gallery {
  private sanitizer = inject(DomSanitizer);
  videos = VIDEOS.map(v => ({
    ...v,
    url: this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + v.youtubeId) as SafeResourceUrl
  }));
}
