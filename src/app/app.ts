import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './shared/components/header/header';
import { BottomNav } from './shared/components/bottom-nav/bottom-nav';
import { Footer } from './shared/components/footer/footer';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Header, BottomNav, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  cart = inject(CartService);
}
