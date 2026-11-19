import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="footer">
      <h3>🌼 Orange Bloom</h3>
      <p>Gửi trao yêu thương qua từng đóa hoa tươi đẹp.</p>
      <p>📍 TP. Hồ Chí Minh · ☎ Hotline: 0900 000 000</p>
      <p><a routerLink="/products">Sản phẩm</a> · <a routerLink="/bai_viet">Bài viết</a> · <a routerLink="/gallery">Gallery</a></p>
      <small>© 2026 Orange Bloom – Angular Standalone + Mobile First</small>
    </footer>`,
  styles: `.footer { background:#292524; color:#ddd; padding:20px 16px; text-align:center; font-size:14px; }
           .footer h3 { color:#f37021; margin:0 0 8px; } .footer a { color:#ffb37f; }`
})
export class Footer {}
