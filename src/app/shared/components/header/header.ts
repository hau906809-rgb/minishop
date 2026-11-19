import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { WishlistService } from '../../../services/wishlist.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  cart = inject(CartService);
  auth = inject(AuthService);
  wishlist = inject(WishlistService);
  private router = inject(Router);

  search(keyword: string) {
    const search = keyword.trim();
    this.router.navigate(['/products'], { queryParams: search ? { search } : {} });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
