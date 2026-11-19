import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
  <section class="section auth-box">
    <div class="auth-tabs">
      <button type="button" [class.active]="mode() === 'login'" (click)="switchMode('login')">Đăng nhập</button>
      <button type="button" [class.active]="mode() === 'register'" (click)="switchMode('register')">Đăng ký</button>
    </div>

    @if (error()) {
      <p class="alert-error">{{ error() }}</p>
    }

    @if (mode() === 'login') {
      <form [formGroup]="loginForm" (ngSubmit)="submitLogin()" class="form-stack">
        <label>
          <span>Email</span>
          <input type="email" formControlName="email" placeholder="example@orangebloom.vn" />
          @if (loginForm.controls.email.touched && loginForm.controls.email.invalid) {
            <small class="err">Vui lòng nhập email hợp lệ.</small>
          }
        </label>
        <label>
          <span>Mật khẩu</span>
          <input type="password" formControlName="password" placeholder="Ít nhất 6 ký tự" />
          @if (loginForm.controls.password.touched && loginForm.controls.password.invalid) {
            <small class="err">Mật khẩu phải có ít nhất 6 ký tự.</small>
          }
        </label>
        <button type="submit" class="btn-primary">Đăng nhập</button>
      </form>

      <div class="demo-box">
        <p>Tài khoản dùng thử nhanh:</p>
        <div class="demo-actions">
          <button type="button" class="btn-outline" (click)="fillDemo('khach@orangebloom.vn', '123456')">Khách hàng</button>
          <button type="button" class="btn-outline" (click)="fillDemo('admin@orangebloom.vn', '123456')">Quản trị (Admin)</button>
        </div>
      </div>
    } @else {
      <form [formGroup]="registerForm" (ngSubmit)="submitRegister()" class="form-stack">
        <label>
          <span>Họ và tên</span>
          <input type="text" formControlName="name" placeholder="Nguyễn Văn A" />
          @if (registerForm.controls.name.touched && registerForm.controls.name.invalid) {
            <small class="err">Vui lòng nhập họ tên (tối thiểu 2 ký tự).</small>
          }
        </label>
        <label>
          <span>Email</span>
          <input type="email" formControlName="email" placeholder="email@domain.com" />
          @if (registerForm.controls.email.touched && registerForm.controls.email.invalid) {
            <small class="err">Email không hợp lệ.</small>
          }
        </label>
        <label>
          <span>Số điện thoại</span>
          <input type="tel" formControlName="phone" placeholder="0901234567" />
        </label>
        <label>
          <span>Mật khẩu</span>
          <input type="password" formControlName="password" placeholder="Tối thiểu 6 ký tự" />
          @if (registerForm.controls.password.touched && registerForm.controls.password.invalid) {
            <small class="err">Mật khẩu tối thiểu 6 ký tự.</small>
          }
        </label>
        <button type="submit" class="btn-primary">Tạo tài khoản</button>
      </form>
    }
  </section>`
})
export class Login {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  mode = signal<'login' | 'register'>('login');
  error = signal('');

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  registerForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  switchMode(m: 'login' | 'register') {
    this.mode.set(m);
    this.error.set('');
  }

  fillDemo(email: string, password: string) {
    this.loginForm.setValue({ email, password });
    this.submitLogin();
  }

  submitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.getRawValue();
    const res = this.auth.login(email, password);
    if (!res.ok) {
      this.error.set(res.message || 'Đăng nhập thất bại.');
      return;
    }
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.router.navigateByUrl(returnUrl);
  }

  submitRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const res = this.auth.register(this.registerForm.getRawValue());
    if (!res.ok) {
      this.error.set(res.message || 'Đăng ký thất bại.');
      return;
    }
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
    this.router.navigateByUrl(returnUrl);
  }
}
