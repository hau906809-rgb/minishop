import { Injectable, computed, signal } from '@angular/core';
import { User } from '../models/product.model';

interface StoredUser extends User {
  password: string;
}

const SESSION_KEY = 'minishop_user';
const USERS_KEY = 'minishop_users';

const DEFAULT_USERS: StoredUser[] = [
  { id: 1, name: 'Admin OrangeBloom', email: 'admin@orangebloom.vn', phone: '0901234567', address: '123 Nguyễn Huệ, Q.1, TP.HCM', role: 'admin', password: '123456' },
  { id: 2, name: 'Nguyễn Minh Anh', email: 'khach@orangebloom.vn', phone: '0987654321', address: '45 Lê Lợi, Q.1, TP.HCM', role: 'user', password: '123456' }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null>(this.loadSession());
  isLoggedIn = computed(() => !!this.user());
  isAdmin = computed(() => this.user()?.role === 'admin');

  private loadSession(): User | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  private loadUsers(): StoredUser[] {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    return [...DEFAULT_USERS];
  }

  private saveSession(user: User | null) {
    this.user.set(user);
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  }

  login(email: string, password: string): { ok: boolean; message?: string } {
    const users = this.loadUsers();
    const found = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!found) return { ok: false, message: 'Email hoặc mật khẩu không đúng.' };
    const { password: _, ...safeUser } = found;
    this.saveSession(safeUser);
    return { ok: true };
  }

  register(data: { name: string; email: string; password: string; phone?: string; address?: string }): { ok: boolean; message?: string } {
    const users = this.loadUsers();
    const exists = users.some(u => u.email.toLowerCase() === data.email.trim().toLowerCase());
    if (exists) return { ok: false, message: 'Email này đã được đăng ký.' };

    const newUser: StoredUser = {
      id: Date.now(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone?.trim(),
      address: data.address?.trim(),
      role: 'user',
      password: data.password
    };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const { password: _, ...safeUser } = newUser;
    this.saveSession(safeUser);
    return { ok: true };
  }

  logout() {
    this.saveSession(null);
  }
}
