import { Page, Locator } from '@playwright/test';
export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  constructor(page: Page) {
    this.page = page;
    this.email = page.getByLabel('Email');
    this.password = page.getByLabel('Password');
    this.submit = page.getByRole('button', { name: 'Log in' });
  }
  async goto() { await this.page.goto('/login'); }
  async login(e: string, p: string) {
    await this.email.fill(e);
    await this.password.fill(p);
    await this.submit.click();
  }
}